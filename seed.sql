-- ==========================================================
-- Shinhan DS & Partner Attendance Management System (Seed Data)
-- 한국 표준시(KST) 및 감사(Audit) 컬럼 반영
-- ==========================================================

-- 1. 협력사 및 소속 마스터 시드
INSERT OR REPLACE INTO companies 
(id, company_code, company_name, biz_number, company_type, contact_person, contact_phone, created_at, created_by, updated_at, updated_by)
VALUES 
('comp-001', 'SHINHAN_DS', '신한DS', '110-81-12345', 'SHINHAN_DS', '인사총무부', '02-3770-0000', '2026-08-17 10:00:00', 'SYSTEM', '2026-08-17 10:00:00', 'SYSTEM'),
('comp-002', 'UBGOT', '유브갓', '220-88-67890', 'PARTNER', '최영호 대표', '010-8888-9999', '2026-08-17 10:00:00', 'SYSTEM', '2026-08-17 10:00:00', 'SYSTEM'),
('comp-003', 'PARTNER_ITS', '(주)협력아이티에스', '101-86-54321', 'PARTNER', '정진우 부사장', '010-5555-1234', '2026-08-17 10:00:00', 'SYSTEM', '2026-08-17 10:00:00', 'SYSTEM');

-- 2. 도급 공정 수행 조직 마스터 시드 (organizations)
INSERT OR REPLACE INTO organizations 
(id, company_name, team_name, part_name, hierarchy_path, leader_name, location_name, member_count, description, created_at, created_by, updated_at, updated_by)
VALUES
('org-counsel-01', '신한DS', '카드개발', '상담', '신한DS > 카드개발 > 상담', '조경훈', '파인에비뉴(카드)', 4, '상담 시스템 유지 관리', '2026-08-17 10:49:34', 'SYSTEM', '2026-08-17 10:52:54', 'S01832');

-- 3. 사용자 마스터 시드 (users)
INSERT OR REPLACE INTO users 
(employee_id, name, email, phone, company, team, part, position, role, is_partner_manager, password_hash, status, is_active, is_admin, created_at, created_by, updated_at, updated_by)
VALUES
('S01832', '조경훈', 'khcho@shinhands.co.kr', '010-4732-8880', '신한DS', '카드개발팀', '카드IS', '수석', 'DS_PRINCIPAL_PM', 1, '••••••••', 'ACTIVE', 1, 1, '2026-08-17 10:00:00', 'SYSTEM', '2026-08-17 10:00:00', 'SYSTEM'),
('S181210', '박성진', 'sungjin.park@shinhands.co.kr', '010-1234-5678', '신한DS', '카드개발팀', '카드IS', '책임', 'DS_PRINCIPAL_PM', 1, '••••••••', 'ACTIVE', 1, 1, '2026-08-17 10:00:00', 'SYSTEM', '2026-08-17 10:00:00', 'SYSTEM'),
('PT20260816', '김신한', 'shinhan.kim@partner.shinhan.com', '010-9876-5432', '신한DS', '카드개발팀', '카드IS', '연구원', 'PARTNER_WORKER', 0, '••••••••', 'ACTIVE', 1, 0, '2026-08-17 10:00:00', 'SYSTEM', '2026-08-17 10:00:00', 'SYSTEM');

-- 4. 실시간 알림 센터 시드 (app_notifications)
INSERT OR REPLACE INTO app_notifications (id, type, title, content, target_role, part_name, is_read, link_url, created_at) VALUES 
('noti-01', 'SLA_ALERT', '도급 인력 투입 지연 발생', '상담 파트 이하은(유브갓) 45분 지각 - 소명서 접수 대기 중', 'DS_PRINCIPAL_PM', '상담', 0, 'principal_portal', '2026-08-17 06:15:00'),
('noti-02', 'GAP_NOTICE', '투입 공백 사전 통보 접수', '유브갓(상담 파트) 김성훈 8/18 1일 연차 공백 대체인력 투입 통보', 'DS_PRINCIPAL_PM', '상담', 0, 'principal_portal', '2026-08-17 06:15:00'),
('noti-03', 'CONTRACT_SETTLE', '일일 도급 공정 검수 완료', '카드개발팀 상담 파트 8명 전원 투입 확인 및 공정 정산 승인 완료', 'ALL', '상담', 1, 'principal_portal', '2026-08-16 18:30:00');

-- 5. 도급 소통 및 소명 메시지함 시드 (app_messages)
INSERT OR REPLACE INTO app_messages (id, sender_name, sender_role, part_name, title, content, is_read, reply_status, created_at) VALUES 
('msg-01', '유브갓 파트관리자', '협력사 현장관리인', '상담', '이하은 45분 지각 관련 대중교통 지연 소명서 제출', '안녕하세요 PM님, 금일 오전 지하철 2호선 고장으로 인한 45분 지각 소명서 및 지연증명서를 첨부 제출하였습니다. 검토 부탁드립니다.', 0, 'PENDING', '2026-08-17 06:15:00'),
('msg-02', '현대IT솔루션 담당', '협력사 현장대리인', '상담', '8월 도급 투입인력 보안 교육 이수 확인서 발송', '상담 파트 투입인력 5인 대상 정보보호 및 클라우드 보안 컴플라이언스 이수증을 등록 완료하였습니다.', 0, 'COMPLETED', '2026-08-16 14:20:00');

