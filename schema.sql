-- ==========================================================
-- Shinhan DS & Partner Attendance Management System (D1 SQLite Schema)
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 부서 및 상주 프로젝트 조직 (Departments / Projects)
CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id) ON DELETE CASCADE,
    dept_name TEXT NOT NULL,
    project_code TEXT,
    work_location TEXT DEFAULT '신한DS 죽전데이터센터',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. 사용자/임직원/협력사 상주인력 (Users)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES companies(id) ON DELETE RESTRICT,
    dept_id TEXT REFERENCES departments(id) ON DELETE SET NULL,
    user_code TEXT UNIQUE NOT NULL, -- 사번 / 협력사인력코드
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT CHECK(role IN ('ADMIN', 'MANAGER', 'PARTNER_ADMIN', 'EMPLOYEE')) DEFAULT 'EMPLOYEE',
    position TEXT DEFAULT '연구원',
    work_type TEXT CHECK(work_type IN ('STANDARD_9TO6', 'FLEXIBLE_TIME', 'AUTONOMOUS', 'SHIFT')) DEFAULT 'STANDARD_9TO6',
    profile_image TEXT,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. 일별 출퇴근 타임로그 (Commute Logs)
CREATE TABLE IF NOT EXISTS commute_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    work_date TEXT NOT NULL, -- YYYY-MM-DD
    clock_in_time TEXT,      -- HH:mm:ss
    clock_out_time TEXT,     -- HH:mm:ss
    clock_in_ip TEXT,
    clock_out_ip TEXT,
    clock_in_method TEXT CHECK(clock_in_method IN ('APP', 'QR_SCAN', 'GPS', 'MANUAL_REQUEST')) DEFAULT 'APP',
    status TEXT CHECK(status IN ('NORMAL', 'LATE', 'EARLY_LEAVE', 'OVERTIME', 'ABSENT', 'MISSED')) DEFAULT 'NORMAL',
    total_work_minutes INTEGER DEFAULT 0,
    is_manual_corrected INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, work_date)
);

-- 5. 주간/월간 근무 스케줄 및 휴가 배정 (Work Schedules)
CREATE TABLE IF NOT EXISTS work_schedules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, schedule_date)
);

-- 6. 근태 소명, 누락신청, 연장근무 및 휴가 요청 (Attendance Requests)
CREATE TABLE IF NOT EXISTS attendance_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    approver_id TEXT REFERENCES users(id) ON DELETE SET NULL,
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
    review_comment TEXT,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. 주간 52시간 근태 통계 집계 테이블 (Weekly Work Stats)
CREATE TABLE IF NOT EXISTS weekly_work_stats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start_date TEXT NOT NULL, -- YYYY-MM-DD (월요일)
    week_end_date TEXT NOT NULL,   -- YYYY-MM-DD (일요일)
    regular_work_minutes INTEGER DEFAULT 0,
    overtime_minutes INTEGER DEFAULT 0,
    night_minutes INTEGER DEFAULT 0,
    holiday_minutes INTEGER DEFAULT 0,
    total_work_minutes INTEGER DEFAULT 0,
    remaining_limit_minutes INTEGER DEFAULT 3120, -- 52시간 = 3120분
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start_date)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_commute_user_date ON commute_logs(user_id, work_date);
CREATE INDEX IF NOT EXISTS idx_schedule_user_date ON work_schedules(user_id, schedule_date);
CREATE INDEX IF NOT EXISTS idx_requests_user ON attendance_requests(user_id, status);
