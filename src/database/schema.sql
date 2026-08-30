-- ============================================================
-- S-GUARD AI & SHINHAN DS 도급 인력 투입 및 공정 검수 통합 DB DDL
-- Target DB : Cloudflare D1 / SQLite 3 Compatible
-- ============================================================

-- 1. 조직 체계 마스터 (Organizations)
CREATE TABLE IF NOT EXISTS organizations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,                         -- 조직명 (e.g. 카드개발팀, 상담운영부, 상담, 오토, 재무)
    code        TEXT UNIQUE NOT NULL,                  -- 조직 코드 (e.g. ORG_COUNSEL_PART, ORG_AUTO_PART)
    parent_id   INTEGER,                               -- 상위 조직 ID (팀 -> 파트)
    depth       INTEGER DEFAULT 1,                     -- 깊이 (1: 본부/팀, 2: 파트)
    sort_order  INTEGER DEFAULT 0,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by  TEXT DEFAULT 'SYSTEM',
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by  TEXT DEFAULT 'SYSTEM',
    reg_id      TEXT DEFAULT 'SYSTEM',
    reg_dt      DATETIME DEFAULT CURRENT_TIMESTAMP,
    mod_id      TEXT DEFAULT 'SYSTEM',
    mod_dt      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(parent_id) REFERENCES organizations(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_org_parent ON organizations(parent_id);

-- 2. 사용자 마스터 (Users)
CREATE TABLE IF NOT EXISTS users (
    employee_id     TEXT PRIMARY KEY,                  -- 사번 (e.g. S18121020, S20240012, S20260031)
    email           TEXT UNIQUE NOT NULL,              -- OTP 인증용 퍼블릭 이메일 (구글, 네이버 등)
    name            TEXT NOT NULL,                     -- 성명
    password_hash   TEXT,                              -- 비밀번호 해시
    role            TEXT DEFAULT 'PARTNER_WORKER',     -- DS_PRINCIPAL_PM / PARTNER_PART_LEADER / PARTNER_WORKER
    auth_provider   TEXT DEFAULT 'local',
    company         TEXT NOT NULL,                     -- 소속사 ((주)신한DS, 유브갓, 오토시스, 파이낸스ITS)
    phone           TEXT NOT NULL,                     -- 휴대전화번호
    team            TEXT NOT NULL,                     -- 팀명 (카드개발팀, 상담운영팀, 은행운영팀)
    part            TEXT NOT NULL,                     -- 파트명 (상담, 오토, 재무, 카드IS)
    position        TEXT DEFAULT '사원',               -- 직책 (사원, 대리, 과장, 차장, 부장, 이사, 대표이사)
    token           TEXT,
    status          TEXT DEFAULT 'ACTIVE' CHECK (status IN ('PRE_REGISTERED', 'ACTIVE', 'SUSPENDED')),
    failed_attempts INTEGER DEFAULT 0,
    last_login_at   DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by      TEXT DEFAULT 'SYSTEM',
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by      TEXT DEFAULT 'SYSTEM',
    is_active       BOOLEAN DEFAULT 1,
    is_admin        INTEGER DEFAULT 0,
    device_type     TEXT DEFAULT 'Android',            -- Android / iOS
    reg_id          TEXT DEFAULT 'SYSTEM',
    reg_dt          DATETIME DEFAULT CURRENT_TIMESTAMP,
    mod_id          TEXT DEFAULT 'SYSTEM',
    mod_dt          DATETIME DEFAULT CURRENT_TIMESTAMP,
    profile_picture TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_part ON users(part);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. OTP 인증 및 발송 이력 (OTP Verifications)
CREATE TABLE IF NOT EXISTS otp_verifications (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id     TEXT NOT NULL,
    email           TEXT NOT NULL,
    otp_code        TEXT NOT NULL,                     -- 6자리 암호학적 생성 난수
    expires_at      DATETIME NOT NULL,                 -- 만료 일시 (3분)
    is_verified     BOOLEAN DEFAULT 0,                 -- 검증 완료 여부
    verified_at     DATETIME,
    attempts        INTEGER DEFAULT 0,
    ip_address      TEXT DEFAULT '127.0.0.1',
    user_agent      TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by      TEXT DEFAULT 'SYSTEM',
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by      TEXT DEFAULT 'SYSTEM',
    reg_id          TEXT DEFAULT 'SYSTEM',
    reg_dt          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(employee_id) REFERENCES users(employee_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_otp_emp ON otp_verifications(employee_id, is_verified);

-- 4. 로그인 접속 이력 (Login History)
CREATE TABLE IF NOT EXISTS login_history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         TEXT NOT NULL,
    email           TEXT,
    ip_address      TEXT,
    user_agent      TEXT,
    status          TEXT NOT NULL,                     -- SUCCESS / FAILED
    login_time      DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by      TEXT DEFAULT 'SYSTEM',
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by      TEXT DEFAULT 'SYSTEM',
    reg_id          TEXT DEFAULT 'SYSTEM',
    reg_dt          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(employee_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_login_hist_user ON login_history(user_id, login_time DESC);

-- 5. 일일 도급 인력 투입 및 공수 정산 테이블 (Manpower Inputs)
CREATE TABLE IF NOT EXISTS manpower_inputs (
    record_id             TEXT PRIMARY KEY,            -- 레코드 ID (e.g. REC-COUNSEL-01)
    employee_id           TEXT NOT NULL,               -- 근로자 사번
    worker_name           TEXT NOT NULL,               -- 근로자 성명
    part_name             TEXT NOT NULL,               -- 담당 파트 (상담, 오토, 재무)
    partner_company       TEXT NOT NULL,               -- 협력사명 (유브갓 등)
    work_date             TEXT NOT NULL,               -- 투입 일자 (YYYY-MM-DD)
    contracted_hours      REAL NOT NULL DEFAULT 8.0,   -- 약정 공수 (8.0h)
    actual_input_hours    REAL NOT NULL,               -- 실 투입 공수 (8.0h, 7.15h 등)
    clock_in_time         TEXT NOT NULL,               -- 출근 투입 시각 (HH:mm)
    clock_out_time        TEXT NOT NULL,               -- 퇴근 투입 시각 (HH:mm)
    task_summary          TEXT NOT NULL,               -- 작업 수행 내역
    variance_minutes      INTEGER NOT NULL DEFAULT 0,  -- 투입 편차 (분)
    is_sla_breach         BOOLEAN DEFAULT 0,           -- 투입 공백 발생 여부 (0/1)
    gap_reason            TEXT,                        -- 공백 사유
    partner_clarification TEXT,                        -- 협력사 1차 소명 내용
    verification_status   TEXT NOT NULL DEFAULT 'UNVERIFIED' CHECK (verification_status IN ('UNVERIFIED', 'PARTNER_CONFIRMED', 'SETTLED', 'VARIANCE_GAP')),
    created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by            TEXT DEFAULT 'SYSTEM',
    updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by            TEXT DEFAULT 'SYSTEM',
    reg_id                TEXT DEFAULT 'SYSTEM',
    reg_dt                DATETIME DEFAULT CURRENT_TIMESTAMP,
    mod_id                TEXT DEFAULT 'SYSTEM',
    mod_dt                DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(employee_id) REFERENCES users(employee_id)
);
CREATE INDEX IF NOT EXISTS idx_manpower_part_dt ON manpower_inputs(part_name, work_date);
CREATE INDEX IF NOT EXISTS idx_manpower_status ON manpower_inputs(verification_status);

-- 6. 검수 및 정산 감사 이력 테이블 (Audit Trails)
CREATE TABLE IF NOT EXISTS audit_trails (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id       TEXT NOT NULL,
    actor_id        TEXT NOT NULL,
    actor_name      TEXT NOT NULL,
    actor_role      TEXT NOT NULL,                     -- 신한DS 현장관리인(PM) / 협력업체 관리자 / 작업자
    action          TEXT NOT NULL,                     -- 1차 사실확인 / 정산확정 / 소명요구 등
    details         TEXT NOT NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by      TEXT DEFAULT 'SYSTEM',
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by      TEXT DEFAULT 'SYSTEM',
    reg_id          TEXT DEFAULT 'SYSTEM',
    reg_dt          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(record_id) REFERENCES manpower_inputs(record_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_trails(record_id);

-- 7. SLA 개선 요청 및 소명 요구 공문 테이블 (SLA Clarifications)
CREATE TABLE IF NOT EXISTS sla_clarifications (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id       TEXT NOT NULL,
    part_name       TEXT NOT NULL,
    partner_company TEXT NOT NULL,
    requester_id    TEXT NOT NULL,
    official_title  TEXT NOT NULL,
    message_content TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'ANSWERED', 'ACCEPTED')),
    answer_content  TEXT,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by      TEXT DEFAULT 'SYSTEM',
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_by      TEXT DEFAULT 'SYSTEM',
    reg_id          TEXT DEFAULT 'SYSTEM',
    reg_dt          DATETIME DEFAULT CURRENT_TIMESTAMP,
    mod_id          TEXT DEFAULT 'SYSTEM',
    mod_dt          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(record_id) REFERENCES manpower_inputs(record_id) ON DELETE CASCADE
);

-- ============================================================
-- 초기 마스터 시드 데이터 (Organizations & Users)
-- ============================================================

INSERT OR REPLACE INTO organizations (id, name, code, parent_id, depth, sort_order, created_at, updated_at, created_by, updated_by) VALUES
(1, '상담운영팀', 'TEAM_COUNSEL', NULL, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM', 'SYSTEM'),
(2, '오토금융팀', 'TEAM_AUTO',    NULL, 1, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM', 'SYSTEM'),
(3, '재무정산팀', 'TEAM_FINANCE', NULL, 1, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM', 'SYSTEM'),
(4, '상담',       'PART_COUNSEL', 1,    2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM', 'SYSTEM'),
(5, '오토',       'PART_AUTO',    2,    2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM', 'SYSTEM'),
(6, '재무',       'PART_FINANCE', 3,    2, 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'SYSTEM', 'SYSTEM');


INSERT OR REPLACE INTO users (
    employee_id, email, name, password_hash, role, company, phone, team, part, position, status, is_active, is_admin, device_type
) VALUES
('S18121020', 'khcho.pm@gmail.com',  '조경훈', 'hashed_pw_admin',   'DS_PRINCIPAL_PM',     '(주)신한DS', '010-9988-7766', '상담운영팀', '상담', '과장', 'ACTIVE', 1, 1, 'Android'),
('S20240012', 'kim.partner@naver.com', '유관리', 'hashed_pw_partner', 'PARTNER_PART_LEADER', '유브갓',     '010-1234-5678', '상담운영팀', '상담', '차장', 'ACTIVE', 1, 0, 'Android'),
('S20260031', 'worker.song@gmail.com', '송무준', 'hashed_pw_worker',  'PARTNER_WORKER',      '유브갓',     '010-4321-8765', '상담운영팀', '상담', '사원', 'ACTIVE', 1, 0, 'Android'),
('S20260032', 'bae.gb@gmail.com',    '배경보', 'hashed_pw_worker',  'PARTNER_WORKER',      '유브갓',     '010-2222-3333', '상담운영팀', '상담', '대리', 'ACTIVE', 1, 0, 'iOS'),
('S20260033', 'lee.jy@naver.com',    '이재연', 'hashed_pw_worker',  'PARTNER_WORKER',      '유브갓',     '010-3333-4444', '상담운영팀', '상담', '사원', 'ACTIVE', 1, 0, 'Android'),
('S20260034', 'kim.sh@gmail.com',    '김성훈', 'hashed_pw_worker',  'PARTNER_WORKER',      '유브갓',     '010-4444-5555', '상담운영팀', '상담', '대리', 'ACTIVE', 1, 0, 'Android'),
('S20260035', 'lee.js@naver.com',    '이제성', 'hashed_pw_worker',  'PARTNER_WORKER',      '유브갓',     '010-5555-6666', '상담운영팀', '상담', '과장', 'ACTIVE', 1, 0, 'Android'),
('S20260036', 'kim.hs@gmail.com',    '김흥섭', 'hashed_pw_worker',  'PARTNER_WORKER',      '유브갓',     '010-6666-7777', '상담운영팀', '상담', '대리', 'ACTIVE', 1, 0, 'Android'),
('S20260037', 'lee.de@naver.com',    '이동은', 'hashed_pw_worker',  'PARTNER_WORKER',      '유브갓',     '010-7777-8888', '상담운영팀', '상담', '사원', 'ACTIVE', 1, 0, 'Android'),
('S20260038', 'myung.bm@gmail.com',  '명보민', 'hashed_pw_worker',  'PARTNER_WORKER',      '유브갓',     '010-8888-9999', '상담운영팀', '상담', '사원', 'ACTIVE', 1, 0, 'Android'),
('S20260039', 'park.sy@naver.com',   '박선용', 'hashed_pw_worker',  'PARTNER_WORKER',      '유브갓',     '010-9999-0000', '상담운영팀', '상담', '대리', 'ACTIVE', 1, 0, 'Android'),
('S20260040', 'kim.jh@gmail.com',    '김종현', 'hashed_pw_worker',  'PARTNER_WORKER',      '유브갓',     '010-1010-2020', '상담운영팀', '상담', '사원', 'ACTIVE', 1, 0, 'Android');
