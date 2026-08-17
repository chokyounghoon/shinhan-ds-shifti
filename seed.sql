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
