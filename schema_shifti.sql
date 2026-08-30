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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM'
);

-- 2. 부서 및 조직 마스터 (Organizations)
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT '신한DS',
    team_name TEXT NOT NULL DEFAULT '카드개발',
    part_name TEXT NOT NULL,
    hierarchy_path TEXT NOT NULL,
    leader_name TEXT,
    location_name TEXT DEFAULT '파인에비뉴(카드)',
    member_count INTEGER DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM'
);

-- 3. 사용자 마스터 (Users) - seq AUTOINCREMENT 시퀀스 PK
CREATE TABLE IF NOT EXISTS users (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
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
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM'
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM'
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
    mod_dt DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM'
);

-- 6. 일별 출퇴근 타임로그 (Commute Logs)
CREATE TABLE IF NOT EXISTS commute_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
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
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM',
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
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM',
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM'
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM',
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM'
);

-- 11. 도급 인력 일별 투입 실적 (Manpower Inputs)
CREATE TABLE IF NOT EXISTS manpower_inputs (
    record_id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    part_name TEXT NOT NULL,
    partner_company TEXT NOT NULL,
    work_date TEXT NOT NULL,
    contracted_hours REAL DEFAULT 8.0,
    actual_input_hours REAL DEFAULT 8.0,
    clock_in_time TEXT,
    clock_out_time TEXT,
    task_summary TEXT,
    variance_minutes INTEGER DEFAULT 0,
    is_sla_breach INTEGER DEFAULT 0,
    exception_type TEXT,
    gap_reason TEXT,
    partner_clarification TEXT,
    verification_status TEXT CHECK(verification_status IN ('AUTO_SETTLED', 'PENDING_EXCEPTION_REVIEW', 'SETTLED_BY_PRINCIPAL', 'EXCLUDED_FROM_SLA')) DEFAULT 'AUTO_SETTLED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM',
    reg_id TEXT DEFAULT 'SYSTEM',
    reg_dt DATETIME DEFAULT CURRENT_TIMESTAMP,
    mod_id TEXT,
    mod_dt DATETIME,
    UNIQUE(employee_id, work_date)
);

-- 12. 전산 감사 및 계약 검수 추적 로그 (Audit Trails)
CREATE TABLE IF NOT EXISTS audit_trails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    system_label TEXT DEFAULT '도급 계약 이행 확인',
    details TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM'
);

-- 13. SLA 위반 소명 요청 및 공식 회신 (SLA Clarifications)
CREATE TABLE IF NOT EXISTS sla_clarifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id TEXT NOT NULL,
    part_name TEXT NOT NULL,
    partner_company TEXT NOT NULL,
    requester_id TEXT NOT NULL,
    official_title TEXT NOT NULL,
    message_content TEXT NOT NULL,
    status TEXT CHECK(status IN ('REQUESTED', 'ANSWERED', 'ACCEPTED')) DEFAULT 'REQUESTED',
    answer_content TEXT,
    answered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM'
);

-- 14. 사전 인력 결손 통보 (Pre Gap Notices)
CREATE TABLE IF NOT EXISTS pre_gap_notices (
    id TEXT PRIMARY KEY,
    partner_company TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    part_name TEXT NOT NULL,
    gap_period TEXT NOT NULL,
    gap_hours REAL DEFAULT 8.0,
    gap_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT CHECK(status IN ('DISPATCHED', 'ACKNOWLEDGED')) DEFAULT 'DISPATCHED',
    acknowledged_by TEXT,
    acknowledged_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'SYSTEM',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by TEXT DEFAULT 'SYSTEM'
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_users_emp ON users(employee_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_commute_emp_date ON commute_logs(employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_schedule_emp_date ON work_schedules(employee_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_requests_emp ON attendance_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_manpower_part_date ON manpower_inputs(part_name, work_date);
CREATE INDEX IF NOT EXISTS idx_manpower_emp_date ON manpower_inputs(employee_id, work_date);

-- 기본 사용자 시드 데이터 (조경훈, 송무준, 최영호, 정진우)
INSERT OR IGNORE INTO users 
(employee_id, name, email, phone, company, team, part, position, role, is_partner_manager, password_hash, status, is_active, is_admin, created_at, updated_at, created_by, updated_by)
VALUES
('S01832', '조경훈', 'khcho0421@gmail.com', '010-4421-8890', '신한DS', '카드개발팀', '카드IS (Part 1)', '부장', 'DS_PRINCIPAL_PM', 0, '508e0f015dfd0be0173f9467bd2c2759:0dd73955f29d16fd97b5655229a3c40dd5237be4b671b360a4beacefb8d419e5', 'ACTIVE', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM', 'SYSTEM'),
('UB0001', '송무준', 'moojun.song@ubgot.co.kr', '010-4732-8880', '유브갓', '상담운영팀', '상담', '선임', 'PARTNER_WORKER', 0, '••••••••', 'ACTIVE', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM', 'SYSTEM'),
('MGRUB1', '최영호', 'ceo.choi@ubgot.co.kr', '010-8888-9999', '유브갓', '영업총괄팀', '전사총괄', '대표', 'PARTNER_PART_LEADER', 1, '••••••••', 'ACTIVE', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM', 'SYSTEM'),
('MGRIT1', '정진우', 'jw.jung@partner-its.co.kr', '010-5555-1234', '(주)협력아이티에스', '영업총괄팀', '전사총괄', '부사장', 'PARTNER_PART_LEADER', 1, '••••••••', 'ACTIVE', 1, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM', 'SYSTEM');

-- 기본 조직 시드 데이터 (신한DS > 카드개발 > 상담)
INSERT OR REPLACE INTO organizations 
(id, company_name, team_name, part_name, hierarchy_path, leader_name, location_name, member_count, description, created_at, updated_at, created_by, updated_by)
VALUES
('org-counsel-01', '신한DS', '카드개발', '상담', '신한DS > 카드개발 > 상담', '조경훈', '파인에비뉴(카드)', 4, '상담 시스템 유지 관리', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM', 'SYSTEM');

