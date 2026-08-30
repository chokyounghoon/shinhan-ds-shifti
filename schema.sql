-- ==========================================================
-- Shinhan DS & Partner Attendance Management System (Cloudflare D1 SQLite Schema)
-- 한국 표준시(KST) 및 전 테이블 표준 감사(Audit) 컬럼 탑재
-- ==========================================================

-- 1. 협력사 및 소속 마스터 (Companies / Partners)
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    company_code TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    biz_number TEXT,
    company_type TEXT CHECK(company_type IN ('SHINHAN_DS', 'PARTNER', 'SUB_CONTRACTOR')) NOT NULL DEFAULT 'PARTNER',
    contact_person TEXT,
    contact_phone TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 등록일시 (KST)
    created_by TEXT DEFAULT 'SYSTEM',              -- 등록자 (사번/ID)
    updated_at DATETIME,                           -- 수정일시 (KST)
    updated_by TEXT DEFAULT 'SYSTEM'               -- 수정자 (사번/ID)
);

-- 2. 도급 공정 수행 조직 마스터 (Organizations) - 신한DS ➔ 팀 ➔ 파트 단일 체계
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL DEFAULT '신한DS',      -- 최상위 원청 조직
    team_name TEXT NOT NULL DEFAULT '카드개발',       -- 소속 팀명 (기본 고정)
    part_name TEXT NOT NULL,                         -- 소속 파트명 (e.g. 상담, 오토금융, 카드IS)
    hierarchy_path TEXT NOT NULL,                    -- 조직 계층 경로 (e.g. 신한DS > 카드개발 > 상담)
    leader_name TEXT,                                -- 담당 PM / 현장대리인 성명 (순수 이름)
    location_name TEXT DEFAULT '파인에비뉴(카드)',    -- 지정 근무지 위치
    member_count INTEGER DEFAULT 0,                  -- [협력사 투입 인원] (명)
    description TEXT,                                -- [도급 과업 개요 및 비고]
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME,                             -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM'                 -- [수정자] (사번/ID)
);

-- 3. 사용자/임직원/협력사 상주인력 마스터 (Users)
CREATE TABLE IF NOT EXISTS users (
    seq INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT UNIQUE NOT NULL,                -- 사번 (e.g. S01832, PT20260816)
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,                                      -- 010-XXXX-XXXX
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME,                             -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM'                 -- [수정자] (사번/ID)
);

-- 4. 일별 출퇴근 타임로그 (Commute Logs)
CREATE TABLE IF NOT EXISTS commute_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    work_date TEXT NOT NULL, -- YYYY-MM-DD
    clock_in_time TEXT,      -- HH:mm:ss
    clock_out_time TEXT,     -- HH:mm:ss
    clock_in_ip TEXT,
    clock_out_ip TEXT,
    clock_in_method TEXT CHECK(clock_in_method IN ('APP', 'QR_SCAN', 'GPS', 'MANUAL_REQUEST')) DEFAULT 'APP',
    status TEXT CHECK(status IN ('NORMAL', 'LATE', 'EARLY_LEAVE', 'OVERTIME', 'ABSENT', 'MISSED')) DEFAULT 'NORMAL',
    total_work_minutes INTEGER DEFAULT 0,
    is_manual_corrected INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME,                             -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM',                -- [수정자] (사번/ID)
    UNIQUE(employee_id, work_date)
);

-- 5. 주간/월간 근무 스케줄 및 휴가 배정 (Work Schedules)
CREATE TABLE IF NOT EXISTS work_schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    schedule_date TEXT NOT NULL, -- YYYY-MM-DD
    schedule_type TEXT CHECK(schedule_type IN (
        'NORMAL',           -- 정상근무
        'FITNESS_LEAVE',    -- 체력단련휴가
        'ANNUAL_LEAVE',     -- 연차
        'HALF_AM_LEAVE',    -- 오전반차
        'HALF_PM_LEAVE',    -- 오후반차
        'SPECIAL_LEAVE',    -- 특별휴가/경조
        'HOLIDAY',          -- 공휴일/휴일
        'OFF_DAY'           -- 무일정/주말
    )) DEFAULT 'NORMAL',
    title TEXT,
    is_vacation INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME,                             -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM',                -- [수정자] (사번/ID)
    UNIQUE(employee_id, schedule_date)
);

-- 6. 근태 소명, 누락신청, 연장근무 및 휴가 요청 (Attendance Requests)
CREATE TABLE IF NOT EXISTS attendance_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    employee_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    company_name TEXT NOT NULL,
    request_type TEXT CHECK(request_type IN (
        'MISSED_PUNCH',     -- 출퇴근 누락 기록 소명
        'OVERTIME',         -- 연장근로 신청
        'VACATION',         -- 휴가(연차/체력단련) 신청
        'SCHEDULE_CHANGE',  -- 근무시간 변경
        'BUSINESS_TRIP'     -- 출장/외근
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME,                             -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM'                 -- [수정자] (사번/ID)
);

-- 7. 주간 52시간 근태 통계 집계 테이블 (Weekly Work Stats)
CREATE TABLE IF NOT EXISTS weekly_work_stats (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    week_start_date TEXT NOT NULL, -- YYYY-MM-DD (월요일)
    week_end_date TEXT NOT NULL,   -- YYYY-MM-DD (일요일)
    regular_work_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    night_minutes INTEGER DEFAULT 0,
    holiday_minutes INTEGER DEFAULT 0,
    total_work_minutes INTEGER DEFAULT 0,
    remaining_limit_minutes INTEGER DEFAULT 3120, -- 52시간 = 3120분
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM',                -- [수정자] (사번/ID)
    UNIQUE(employee_id, week_start_date)
);

-- 8. 월별 도급 계약 이행 공수 검수 마스터 (Service Delivery Inspections)
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME,                             -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM'                 -- [수정자] (사번/ID)
);

-- 9. 휴대폰 SMS 본인인증 (OTP Verifications)
CREATE TABLE IF NOT EXISTS otp_verifications (
    id TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    is_verified INTEGER DEFAULT 0,
    verified_at DATETIME,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME,                             -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM'                 -- [수정자] (사번/ID)
);

-- 10. 로그인 보안 감사 로그 (Login History)
CREATE TABLE IF NOT EXISTS login_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT CHECK(status IN ('SUCCESS', 'FAILURE', 'SIGNUP_SUCCESS')) NOT NULL,
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    reg_dt DATETIME DEFAULT CURRENT_TIMESTAMP,
    mod_dt DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME,                             -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM'                 -- [수정자] (사번/ID)
);

-- 15. 실시간 알림 센터 (App Notifications)
CREATE TABLE IF NOT EXISTS app_notifications (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,                             -- SLA_ALERT, GAP_NOTICE, CONTRACT_SETTLE, GENERAL
    title TEXT NOT NULL,                            -- 알림 제목
    content TEXT NOT NULL,                          -- 알림 상세 내용
    target_role TEXT DEFAULT 'ALL',                 -- 대상 권한 (DS_PRINCIPAL_PM, PARTNER_PART_LEADER, ALL)
    part_name TEXT DEFAULT '상담',                  -- 도급 파트명
    is_read INTEGER DEFAULT 0,                      -- 0: 미확인, 1: 읽음
    link_url TEXT,                                  -- 이동할 페이지 URL/뷰 ID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 등록일시 (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',               -- 등록자 (사번/ID)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 수정일시 (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM'                -- 수정자 (사번/ID)
);

-- 16. 도급 소통 및 소명 메시지함 (App Messages)
CREATE TABLE IF NOT EXISTS app_messages (
    id TEXT PRIMARY KEY,
    sender_name TEXT NOT NULL,                      -- 발신자 성명
    sender_role TEXT NOT NULL,                      -- 발신자 직책/역할 (e.g. 협력사 현장관리인)
    part_name TEXT DEFAULT '상담',                  -- 도급 파트명
    title TEXT NOT NULL,                            -- 메시지 제목
    content TEXT NOT NULL,                          -- 메시지 본문
    is_read INTEGER DEFAULT 0,                      -- 0: 미확인, 1: 읽음
    reply_status TEXT DEFAULT 'PENDING',            -- PENDING, COMPLETED
    reply_content TEXT,                             -- PM 회신 내용
    replied_at DATETIME,                            -- 회신 일시
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 등록일시 (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',               -- 등록자 (사번/ID)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 수정일시 (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM'                -- 수정자 (사번/ID)
);

-- 17. 도급 인력 투입 실적 (Manpower Inputs)
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
    verification_status TEXT DEFAULT 'AUTO_SETTLED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM',                -- [수정자] (사번/ID)
    UNIQUE(employee_id, work_date)
);

-- 18. 도급 감사 추적 로그 (Audit Trails)
CREATE TABLE IF NOT EXISTS audit_trails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    system_label TEXT DEFAULT '도급 계약 이행 확인',
    details TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM'                 -- [수정자] (사번/ID)
);

-- 19. 협력사 SLA 소명 요청 (SLA Clarifications)
CREATE TABLE IF NOT EXISTS sla_clarifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id TEXT NOT NULL,
    part_name TEXT NOT NULL,
    partner_company TEXT NOT NULL,
    requester_id TEXT NOT NULL,
    official_title TEXT NOT NULL,
    message_content TEXT NOT NULL,
    status TEXT DEFAULT 'REQUESTED',
    answer_content TEXT,
    answered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM'                 -- [수정자] (사번/ID)
);

-- 20. 사전 공백 통보 (Pre Gap Notices)
CREATE TABLE IF NOT EXISTS pre_gap_notices (
    id TEXT PRIMARY KEY,
    partner_company TEXT NOT NULL,
    worker_name TEXT NOT NULL,
    part_name TEXT NOT NULL,
    gap_period TEXT NOT NULL,
    gap_hours REAL DEFAULT 8.0,
    gap_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'DISPATCHED',
    acknowledged_by TEXT,
    acknowledged_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [등록일시] (KST 한국시간)
    created_by TEXT DEFAULT 'SYSTEM',                -- [등록자] (사번/ID)
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,   -- [수정일시] (KST 한국시간)
    updated_by TEXT DEFAULT 'SYSTEM'                 -- [수정자] (사번/ID)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_commute_emp_date ON commute_logs(employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_schedule_emp_date ON work_schedules(employee_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_requests_emp ON attendance_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_org_hierarchy ON organizations(hierarchy_path);
