-- ============================================================
-- Shinhan DS 도급 인력 투입 및 공정 검수 시스템 (Contract Fulfillment DB)
-- Target DB: Cloudflare D1 (SQLite compatible) / PostgreSQL
-- ============================================================

-- 1. 사용자 마스터 (임직원 & 협력사 투입 인력)
CREATE TABLE IF NOT EXISTS TB_USER_MST (
  EMP_ID          TEXT    PRIMARY KEY,          -- 사번 (e.g. S18121020)
  USER_NM         TEXT    NOT NULL,             -- 성명
  PASSWORD_HASH   TEXT    NOT NULL,             -- 비밀번호 해시
  COMPANY_NM      TEXT    NOT NULL,             -- 소속사 ((주)신한DS, 유브갓, (주)협력아이티에스)
  TEAM_NM         TEXT    NOT NULL,             -- 팀명 (카드개발팀, 상담운영팀, 은행운영팀)
  PART_NM         TEXT    NOT NULL,             -- 파트명 (상담, 오토, 재무, 카드IS)
  POSITION_CD     TEXT    NOT NULL,             -- 직책 (사원, 대리, 과장, 차장, 부장, 이사, 대표이사)
  EMAIL_ADDR      TEXT    NOT NULL,             -- OTP 인증용 퍼블릭 이메일 (구글, 네이버 등)
  PHONE_NO        TEXT    NOT NULL,             -- 휴대전화번호
  ROLE_CD         TEXT    NOT NULL,             -- 역할 (DS_PRINCIPAL_PM, PARTNER_PART_LEADER, PARTNER_WORKER)
  DEVICE_TYPE     TEXT    NOT NULL DEFAULT 'Android', -- 기종 (Android / iOS)
  USE_YN          TEXT    NOT NULL DEFAULT 'Y' CHECK (USE_YN IN ('Y','N')),
  REG_DT          TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  MOD_DT          TEXT
);
CREATE INDEX IF NOT EXISTS IDX_USER_PART ON TB_USER_MST(PART_NM);
CREATE INDEX IF NOT EXISTS IDX_USER_ROLE ON TB_USER_MST(ROLE_CD);

-- 2. OTP 인증 발송 및 검증 이력 테이블 (실제 DB 관리)
CREATE TABLE IF NOT EXISTS TB_AUTH_OTP_LOG (
  OTP_ID          INTEGER PRIMARY KEY AUTOINCREMENT,
  EMP_ID          TEXT    NOT NULL REFERENCES TB_USER_MST(EMP_ID),
  OTP_CODE        TEXT    NOT NULL,             -- 6자리 생성 OTP 번호
  EMAIL_ADDR      TEXT    NOT NULL,             -- 수신 퍼블릭 메일 주소
  EXPIRE_DT       TEXT    NOT NULL,             -- 만료 일시 (발송 + 3분)
  IS_VERIFIED     TEXT    NOT NULL DEFAULT 'N' CHECK (IS_VERIFIED IN ('Y','N')),
  VERIFIED_DT     TEXT,                         -- 검증 완료 일시
  ATTEMPT_COUNT   INTEGER NOT NULL DEFAULT 0,   -- 검증 시도 횟수
  REG_DT          TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS IDX_OTP_EMP ON TB_AUTH_OTP_LOG(EMP_ID, IS_VERIFIED);

-- 3. 일일 도급 인력 투입 및 공수 정산 테이블
CREATE TABLE IF NOT EXISTS TB_MANPOWER_INPUT_LOG (
  RECORD_ID            TEXT    PRIMARY KEY,     -- 레코드 ID (e.g. REC-20260816-001)
  WORKER_EMP_ID        TEXT    NOT NULL REFERENCES TB_USER_MST(EMP_ID),
  WORKER_NM            TEXT    NOT NULL,
  PART_NM              TEXT    NOT NULL,        -- 담당 파트 (상담, 오토, 재무)
  PARTNER_COMPANY      TEXT    NOT NULL,        -- 협력사명 (유브갓 등)
  WORK_DT              TEXT    NOT NULL,        -- 투입 일자 (YYYY-MM-DD)
  CONTRACTED_HOURS     REAL    NOT NULL DEFAULT 8.0, -- 약정 공수 (시간)
  ACTUAL_INPUT_HOURS   REAL    NOT NULL,        -- 실 투입 공수 (시간)
  CLOCK_IN_TM          TEXT    NOT NULL,        -- 출근 투입 시각 (HH:mm)
  CLOCK_OUT_TM         TEXT    NOT NULL,        -- 퇴근 투입 시각 (HH:mm)
  TASK_SUMMARY         TEXT    NOT NULL,        -- 작업 수행 내역
  VARIANCE_MINUTES     INTEGER NOT NULL DEFAULT 0, -- 투입 편차 (분)
  IS_SLA_BREACH        TEXT    NOT NULL DEFAULT 'N' CHECK (IS_SLA_BREACH IN ('Y','N')),
  GAP_REASON           TEXT,                    -- 공백 사유
  PARTNER_CLARIFICATION TEXT,                   -- 협력사 1차 소명 내용
  VERIFICATION_STATUS  TEXT    NOT NULL DEFAULT 'UNVERIFIED', -- UNVERIFIED / PARTNER_CONFIRMED / SETTLED / VARIANCE_GAP
  REG_DT               TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  MOD_DT               TEXT
);
CREATE INDEX IF NOT EXISTS IDX_MANPOWER_PART_DT ON TB_MANPOWER_INPUT_LOG(PART_NM, WORK_DT);
CREATE INDEX IF NOT EXISTS IDX_MANPOWER_STATUS  ON TB_MANPOWER_INPUT_LOG(VERIFICATION_STATUS);

-- 4. 검수 및 정산 확정 감사 이력 (Audit Trail)
CREATE TABLE IF NOT EXISTS TB_AUDIT_TRAIL_LOG (
  LOG_ID          INTEGER PRIMARY KEY AUTOINCREMENT,
  RECORD_ID       TEXT    NOT NULL REFERENCES TB_MANPOWER_INPUT_LOG(RECORD_ID),
  ACTOR_EMP_ID    TEXT    NOT NULL,
  ACTOR_NM        TEXT    NOT NULL,
  ACTOR_ROLE      TEXT    NOT NULL,
  ACTION_TYPE     TEXT    NOT NULL,             -- 투입등록 / 1차사실확인 / 정산확정 / 소명요구
  DETAILS         TEXT    NOT NULL,
  REG_DT          TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);
CREATE INDEX IF NOT EXISTS IDX_AUDIT_RECORD ON TB_AUDIT_TRAIL_LOG(RECORD_ID);

-- 5. 협력업체 개선 요청 및 소명 요구 공문 테이블
CREATE TABLE IF NOT EXISTS TB_SLA_CLARIFICATION_REQ (
  REQ_ID          INTEGER PRIMARY KEY AUTOINCREMENT,
  RECORD_ID       TEXT    NOT NULL REFERENCES TB_MANPOWER_INPUT_LOG(RECORD_ID),
  PART_NM         TEXT    NOT NULL,
  PARTNER_COMPANY TEXT    NOT NULL,
  REQUESTER_EMP_ID TEXT   NOT NULL,
  OFFICIAL_TITLE  TEXT    NOT NULL,
  MESSAGE_CONTENT TEXT    NOT NULL,
  STATUS          TEXT    NOT NULL DEFAULT 'REQUESTED', -- REQUESTED / ANSWERED / ACCEPTED
  ANSWER_CONTENT  TEXT,
  REG_DT          TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  MOD_DT          TEXT
);

-- ============================================================
-- 초기 데이터 적재 (Master & Initial Records)
-- ============================================================

INSERT OR REPLACE INTO TB_USER_MST
  (EMP_ID, USER_NM, PASSWORD_HASH, COMPANY_NM, TEAM_NM, PART_NM, POSITION_CD, EMAIL_ADDR, PHONE_NO, ROLE_CD)
VALUES
  ('S18121020', '조경훈', 'hashed_pw_admin', '(주)신한DS', '상담전담팀', '상담', '과장', 'khcho.pm@gmail.com', '010-9988-7766', 'DS_PRINCIPAL_PM'),
  ('S20240012', '유관리', 'hashed_pw_partner', '유브갓', '상담운영부', '상담', '차장', 'kim.partner@naver.com', '010-1234-5678', 'PARTNER_PART_LEADER'),
  ('S20260031', '송무준', 'hashed_pw_worker', '유브갓', '상담운영 1팀', '상담', '사원', 'worker.song@gmail.com', '010-4321-8765', 'PARTNER_WORKER'),
  ('S20260032', '배경보', 'hashed_pw_worker', '유브갓', '상담운영 1팀', '상담', '대리', 'bae.gb@gmail.com', '010-2222-3333', 'PARTNER_WORKER'),
  ('S20260033', '이재연', 'hashed_pw_worker', '유브갓', '상담운영 1팀', '상담', '사원', 'lee.jy@naver.com', '010-3333-4444', 'PARTNER_WORKER'),
  ('S20260034', '김성훈', 'hashed_pw_worker', '유브갓', '상담운영 1팀', '상담', '대리', 'kim.sh@gmail.com', '010-4444-5555', 'PARTNER_WORKER'),
  ('S20260035', '이제성', 'hashed_pw_worker', '유브갓', '상담운영 1팀', '상담', '과장', 'lee.js@naver.com', '010-5555-6666', 'PARTNER_WORKER'),
  ('S20260036', '김흥섭', 'hashed_pw_worker', '유브갓', '상담운영 1팀', '상담', '대리', 'kim.hs@gmail.com', '010-6666-7777', 'PARTNER_WORKER'),
  ('S20260037', '이동은', 'hashed_pw_worker', '유브갓', '상담운영 1팀', '상담', '사원', 'lee.de@naver.com', '010-7777-8888', 'PARTNER_WORKER'),
  ('S20260038', '명보민', 'hashed_pw_worker', '유브갓', '상담운영 1팀', '상담', '사원', 'myung.bm@gmail.com', '010-8888-9999', 'PARTNER_WORKER'),
  ('S20260039', '박선용', 'hashed_pw_worker', '유브갓', '상담운영 1팀', '상담', '대리', 'park.sy@naver.com', '010-9999-0000', 'PARTNER_WORKER'),
  ('S20260040', '김종현', 'hashed_pw_worker', '유브갓', '상담운영 1팀', '상담', '사원', 'kim.jh@gmail.com', '010-1010-2020', 'PARTNER_WORKER');
