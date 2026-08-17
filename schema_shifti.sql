-- =========================================================================
-- SHINHAN DS SHIFTI DEDICATED D1 DATABASE SCHEMA
-- Database Name: shifti-db (8d165000-c599-473b-ab48-cff47cb58370)
-- =========================================================================

-- 1. 회사 마스터 (Companies)
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    company_code TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    biz_number TEXT,
    company_type TEXT CHECK(company_type IN ('SHINHAN_DS', 'PARTNER', 'SUB_CONTRACTOR')) NOT NULL DEFAULT 'PARTNER',
    contact_person TEXT,
    contact_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 부서 및 조직 마스터 (Organizations)
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    category TEXT CHECK(category IN ('PARTNER_WORKER', 'PARTNER_MANAGER', 'DS_PM')) NOT NULL DEFAULT 'PARTNER_WORKER',
    company_name TEXT NOT NULL,
    team_name TEXT NOT NULL,
    part_name TEXT NOT NULL,
    hierarchy_path TEXT NOT NULL,
    leader_name TEXT,
    location_name TEXT DEFAULT '파인에비뉴(카드)',
    member_count INTEGER DEFAULT 120,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 사용자 마스터 (Users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    company TEXT NOT NULL DEFAULT '신한DS',
    team TEXT DEFAULT '카드개발팀',
    part TEXT DEFAULT '카드IS',
    position TEXT DEFAULT '연구원',
    role TEXT CHECK(role IN ('DS_PRINCIPAL_PM', 'PARTNER_PART_LEADER', 'PARTNER_WORKER', 'admin', 'user')) NOT NULL DEFAULT 'PARTNER_WORKER',
    is_partner_manager INTEGER DEFAULT 0,
    password_hash TEXT DEFAULT '••••••••',
    status TEXT CHECK(status IN ('ACTIVE', 'PRE_REGISTERED', 'SUSPENDED', 'DELETED')) DEFAULT 'ACTIVE',
    failed_attempts INTEGER DEFAULT 0,
    last_login_at DATETIME,
    auth_provider TEXT DEFAULT 'local',
    is_active INTEGER DEFAULT 1,
    is_admin INTEGER DEFAULT 0,
    device_type TEXT DEFAULT 'Android',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 2FA 이메일 OTP 인증 테이블 (OTP Verifications)
CREATE TABLE IF NOT EXISTS otp_verifications (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    is_verified INTEGER DEFAULT 0,
    verified_at DATETIME,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. 로그인 이력 및 감사 로그 (Login History)
CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT CHECK(status IN ('SUCCESS', 'FAILURE')) NOT NULL,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    reg_dt DATETIME DEFAULT CURRENT_TIMESTAMP,
    mod_dt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. 일별 출퇴근 타임로그 (Commute Logs)
CREATE TABLE IF NOT EXISTS commute_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id TEXT NOT NULL,
    work_date TEXT NOT NULL,
    clock_in_time TEXT,
    clock_out_time TEXT,
    clock_in_ip TEXT,
    clock_out_ip TEXT,
    clock_in_method TEXT CHECK(clock_in_method IN ('APP', 'QR_SCAN', 'GPS', 'MANUAL_REQUEST')) DEFAULT 'APP',
    status TEXT CHECK(status IN ('NORMAL', 'LATE', 'EARLY_LEAVE', 'OVERTIME', 'ABSENT', 'MISSED')) DEFAULT 'NORMAL',
    total_work_minutes INTEGER DEFAULT 0,
    is_manual_corrected INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, work_date)
);

-- 7. 주간/월간 근무 스케줄 배정 (Work Schedules)
CREATE TABLE IF NOT EXISTS work_schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    schedule_date TEXT NOT NULL,
    schedule_type TEXT CHECK(schedule_type IN (
        'NORMAL', 'FITNESS_LEAVE', 'ANNUAL_LEAVE', 'HALF_AM_LEAVE', 
        'HALF_PM_LEAVE', 'SPECIAL_LEAVE', 'HOLIDAY', 'OFF_DAY'
    )) DEFAULT 'NORMAL',
    title TEXT,
    is_vacation INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, schedule_date)
);

-- 8. 근태 소명 및 휴가/연장 신청 (Attendance Requests)
CREATE TABLE IF NOT EXISTS attendance_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    request_type TEXT CHECK(request_type IN (
        'MISSED_PUNCH', 'OVERTIME', 'VACATION', 'SCHEDULE_CHANGE', 'BUSINESS_TRIP'
    )) NOT NULL,
    target_date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    reason TEXT NOT NULL,
    proof_attachment_url TEXT,
    status TEXT CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')) DEFAULT 'PENDING',
    approver_id TEXT,
    approver_name TEXT,
    review_comment TEXT,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. 주간 52시간 근태 통계 (Weekly Work Stats)
CREATE TABLE IF NOT EXISTS weekly_work_stats (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    week_start_date TEXT NOT NULL,
    week_end_date TEXT NOT NULL,
    regular_work_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    night_minutes INTEGER DEFAULT 0,
    holiday_minutes INTEGER DEFAULT 0,
    total_work_minutes INTEGER DEFAULT 0,
    remaining_limit_minutes INTEGER DEFAULT 3120,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, week_start_date)
);

-- 10. 도급 공정 검수 및 공수 이행 검수 (Service Delivery Inspections)
CREATE TABLE IF NOT EXISTS service_delivery_inspections (
    id TEXT PRIMARY KEY,
    project_code TEXT NOT NULL,
    partner_company TEXT NOT NULL,
    inspector_id TEXT NOT NULL,
    inspector_name TEXT NOT NULL,
    inspection_month TEXT NOT NULL,
    contracted_man_days REAL NOT NULL,
    actual_delivered_man_days REAL NOT NULL,
    inspection_status TEXT CHECK(inspection_status IN ('SUBMITTED', 'INSPECTED_ACCEPTED', 'REVISION_REQUESTED')) DEFAULT 'SUBMITTED',
    inspection_notes TEXT,
    inspected_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_users_emp ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_commute_emp_date ON commute_logs(employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_schedule_emp_date ON work_schedules(employee_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_requests_emp ON attendance_requests(employee_id, status);

-- 기본 사용자 시드 데이터 (조경훈, 송무준, 박영업, 최영호 등)
INSERT OR REPLACE INTO users 
(id, employee_id, name, email, phone, company, team, part, position, role, is_partner_manager, password_hash, status, is_active, is_admin)
VALUES
('usr-s01832', 'S01832', '조경훈', 'khcho0421@gmail.com', '010-4421-8890', '신한DS', '카드개발팀', '카드IS (Part 1)', '부장', 'DS_PRINCIPAL_PM', 0, '508e0f015dfd0be0173f9467bd2c2759:0dd73955f29d16fd97b5655229a3c40dd5237be4b671b360a4beacefb8d419e5', 'ACTIVE', 1, 1),
('usr-01832', '01832', '조경훈', 'khcho0421@gmail.com', '010-4421-8890', '신한DS', '카드개발팀', '카드IS (Part 1)', '부장', 'DS_PRINCIPAL_PM', 0, '508e0f015dfd0be0173f9467bd2c2759:0dd73955f29d16fd97b5655229a3c40dd5237be4b671b360a4beacefb8d419e5', 'ACTIVE', 1, 1),
('usr-ubgot-001', 'UB-001', '송무준', 'moojun.song@ubgot.co.kr', '010-4732-8880', '유브갓', '상담팀', '상담파트', '선임', 'PARTNER_WORKER', 0, '••••••••', 'ACTIVE', 1, 0),
('usr-ubgot-mgr', 'UB-M01', '최영호', 'ceo.choi@ubgot.co.kr', '010-8888-9999', '유브갓', '고객서비스사업본부', '영업총괄팀', '대표', 'PARTNER_PART_LEADER', 1, '••••••••', 'ACTIVE', 1, 0),
('usr-its-mgr', 'ITS-M01', '정진우', 'jw.jung@partner-its.co.kr', '010-5555-1234', '(주)협력아이티에스', 'SI사업부문', '코어개발본부', '부사장', 'PARTNER_PART_LEADER', 1, '••••••••', 'ACTIVE', 1, 0);

-- 기본 조직 시드 데이터
INSERT OR REPLACE INTO organizations 
(id, category, company_name, team_name, part_name, hierarchy_path, leader_name, location_name, member_count, description)
VALUES
('org-pw-01', 'PARTNER_WORKER', '신한DS', '카드개발팀', '카드IS파트', '신한DS > 카드개발팀 > 카드IS파트', '박성진 PM (신한DS)', '파인에비뉴(카드)', 120, '신한카드 기간계 계정계 및 승인 코어 시스템 도급 투입'),
('org-pw-02', 'PARTNER_WORKER', '신한DS', '상담운영팀', '상담파트', '신한DS > 상담운영팀 > 상담파트', '조경훈 PM (신한DS)', '파인에비뉴(상담센터)', 120, '신한카드 고객 인바운드/VIP 전문 상담 도급 투입'),
('org-pw-03', 'PARTNER_WORKER', '신한DS', '금융개발팀', '오토파트', '신한DS > 금융개발팀 > 오토파트', '강민우 PM (신한DS)', '여의도 금융센터', 120, '오토금융 다이렉트 할부 및 리스/렌터카 정산'),
('org-pm-01', 'PARTNER_MANAGER', '유브갓', '고객서비스사업본부', '영업총괄팀', '유브갓 > 고객서비스사업본부 > 영업총괄팀', '최영호 대표', '유브갓 본사 (파인에비뉴)', 120, '상담/운영 부문 공식 수급 협력사 총괄 관리'),
('org-pm-02', 'PARTNER_MANAGER', '(주)협력아이티에스', 'SI사업부문', '코어개발본부', '(주)협력아이티에스 > SI사업부문 > 코어개발본부', '정진우 부사장', '파인에비뉴(카드)', 85, '신한카드 코어 및 금융 CTI 솔루션 파견 협력사'),
('org-ds-01', 'DS_PM', '신한DS', '카드개발팀', '카드IS 관제파트', '신한DS > 카드개발팀 > 카드IS 관제파트', '조경훈 부장 (전담 PM)', '파인에비뉴(카드)', 8, '카드 기간계 도급 계약 이행 및 공정 검수 총괄 PM'),
('org-ds-02', 'DS_PM', '신한DS', '상담운영팀', '상담 관제파트', '신한DS > 상담운영팀 > 상담 관제파트', '조경훈 PM (총괄)', '파인에비뉴(상담센터)', 6, '상담 부문 120인 도급 공정 검수 및 SLA 관제 PM');
