-- =========================================================================
-- Shinhan DS & Partner Attendance Compliance Database Schema (Cloudflare D1)
-- 노란봉투법 및 파견법(불법파견/위장도급) 방어 아키텍처 반영
-- =========================================================================

-- 1. 회사 마스터 (원청 vs 협력사 구분)
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    company_code TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    biz_number TEXT,
    company_type TEXT CHECK(company_type IN ('PRINCIPAL_SHINHAN_DS', 'PARTNER_CONTRACTOR')) NOT NULL,
    is_autonomous_employer INTEGER DEFAULT 1, -- 독자적 노무지휘권 보장 여부
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 협력사 현장대리인 지정 마스터 (파견법 제31조 준수)
-- 원청의 직접 지시를 차단하고 협력사 노무지휘권을 행사하는 법적 대리인
CREATE TABLE IF NOT EXISTS partner_site_representatives (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    rep_user_id TEXT NOT NULL,
    assigned_project_code TEXT NOT NULL,
    appointment_date TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 사용자 및 역할 (권한 3단계 분리)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    company_id TEXT NOT NULL REFERENCES companies(id),
    user_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT CHECK(role IN (
        'PARTNER_EMPLOYEE',      -- 1. 협력사 일반 직원 (근태 신청 주체)
        'PARTNER_SITE_MANAGER', -- 2. 협력사 현장대리인 (실질적 노무관리 및 결재 권한자)
        'PRINCIPAL_INSPECTOR'   -- 3. 원청(신한DS) 도급 검수자 (공수/용역 이행 검수만 가능)
    )) NOT NULL,
    position TEXT DEFAULT '팀원',
    dept_name TEXT DEFAULT '카드개발팀',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 협력사 독자 근태 결재 테이블 (원청 결재선 원천 차단)
CREATE TABLE IF NOT EXISTS partner_attendance_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL REFERENCES companies(id),
    -- 결재자는 반드시 협력사 소속 현장대리인이어야 함 (원청 결재선 차단)
    partner_approver_id TEXT NOT NULL REFERENCES users(id),
    request_type TEXT CHECK(request_type IN ('VACATION', 'OVERTIME', 'MISSED_PUNCH', 'WORK_SHIFT_CHANGE')) NOT NULL,
    target_date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    reason TEXT NOT NULL,
    status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED')) DEFAULT 'PENDING',
    approved_at DATETIME,
    approval_memo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. 출퇴근 실적 기록 (협력사 자체 보관 데이터)
CREATE TABLE IF NOT EXISTS partner_commute_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id TEXT NOT NULL REFERENCES companies(id),
    work_date TEXT NOT NULL,
    clock_in_time TEXT,
    clock_out_time TEXT,
    work_minutes INTEGER DEFAULT 0,
    status TEXT CHECK(status IN ('NORMAL', 'LATE', 'WORKING', 'VACATION', 'OVERTIME')) DEFAULT 'NORMAL',
    verified_by_rep INTEGER DEFAULT 0, -- 현장대리인 확인 여부
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 원청 도급 계약 공수 검수 테이블 (원청이 열람/검수하는 비개인화 집계 데이터)
-- 개인의 복무/근태 통제가 아닌 '계약상 용역 투입 공수(Man-Day / Man-Month)' 검수
CREATE TABLE IF NOT EXISTS service_delivery_inspections (
    id TEXT PRIMARY KEY,
    project_code TEXT NOT NULL,
    partner_company_id TEXT NOT NULL REFERENCES companies(id),
    principal_inspector_id TEXT NOT NULL REFERENCES users(id), -- 신한DS 검수관
    inspection_month TEXT NOT NULL, -- YYYY-MM
    contracted_man_months REAL NOT NULL, -- 계약 공수 (예: 12.0 M/M)
    actual_delivered_man_months REAL NOT NULL, -- 실제 이행 공수 (예: 11.8 M/M)
    partner_site_rep_id TEXT NOT NULL REFERENCES users(id), -- 제출한 협력사 현장대리인
    inspection_status TEXT CHECK(inspection_status IN ('SUBMITTED', 'INSPECTED_ACCEPTED', 'REVISION_REQUESTED')) DEFAULT 'SUBMITTED',
    inspection_notes TEXT,
    inspected_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. 물리적 보안 게이트 출입 기록 (시설안전보건법 준수용 - 노무관리와 법적 분리)
CREATE TABLE IF NOT EXISTS facility_security_gate_logs (
    id TEXT PRIMARY KEY,
    person_identifier TEXT NOT NULL,
    company_name TEXT NOT NULL,
    gate_location TEXT NOT NULL, -- 예: 신한DS 데이터센터 1F 중앙게이트
    access_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    purpose TEXT DEFAULT 'FACILITY_SAFETY_AND_SECURITY', -- 시설안전 및 재난대응 목적 명시
    is_labor_management_data INTEGER DEFAULT 0 -- 인사/근태 산정용 직접 사용 불가 플래그
);
