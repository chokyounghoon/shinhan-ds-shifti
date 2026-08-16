-- Seed Data for Shinhan DS & Partner Attendance
INSERT OR REPLACE INTO companies (id, company_code, company_name, biz_number, company_type, contact_person, contact_phone)
VALUES 
('comp-001', 'SHINHAN_DS', '신한DS', '110-81-12345', 'SHINHAN_DS', '인사총무부', '02-3770-0000'),
('comp-002', 'PARTNER_TECH', '땡겨요테크솔루션 (협력사)', '220-88-67890', 'PARTNER', '김협력 PM', '010-9876-5432');

INSERT OR REPLACE INTO departments (id, company_id, dept_name, project_code, work_location)
VALUES
('dept-001', 'comp-001', '디지털플랫폼개발부', 'SHINHAN-BANK-APP', '신한DS 죽전데이터센터 3F'),
('dept-002', 'comp-002', '땡겨요 서비스운영 1팀', 'DDANGYO-CORE-V2', '신한DS 본사 상주개발실');

INSERT OR REPLACE INTO users (id, company_id, dept_id, user_code, name, email, role, position, work_type)
VALUES
('usr-001', 'comp-002', 'dept-002', 'PT20260816', '김신한', 'shinhan.kim@partner.shinhan.com', 'EMPLOYEE', '책임연구원', 'STANDARD_9TO6'),
('usr-002', 'comp-001', 'dept-001', 'DS10092', '박관리 PM', 'manager.park@shinhands.co.kr', 'MANAGER', '수석연구원', 'STANDARD_9TO6');

-- 이번주 근무 스케줄 (2026-08-10 ~ 2026-08-16) - 스크린샷과 정확히 일치
INSERT OR REPLACE INTO work_schedules (id, user_id, schedule_date, schedule_type, title, is_vacation)
VALUES
('sch-01', 'usr-001', '2026-08-10', 'FITNESS_LEAVE', '체력단련휴가', 1),
('sch-02', 'usr-001', '2026-08-11', 'FITNESS_LEAVE', '체력단련휴가', 1),
('sch-03', 'usr-001', '2026-08-12', 'ANNUAL_LEAVE', '연차', 1),
('sch-04', 'usr-001', '2026-08-13', 'ANNUAL_LEAVE', '연차', 1),
('sch-05', 'usr-001', '2026-08-14', 'ANNUAL_LEAVE', '연차', 1),
('sch-06', 'usr-001', '2026-08-15', 'OFF_DAY', '일정 없음', 0),
('sch-07', 'usr-001', '2026-08-16', 'OFF_DAY', '일정 없음', 0);

-- 주간 근태 통계
INSERT OR REPLACE INTO weekly_work_stats (id, user_id, week_start_date, week_end_date, regular_work_minutes, overtime_minutes, night_minutes, holiday_minutes, total_work_minutes, remaining_limit_minutes)
VALUES
('stat-01', 'usr-001', '2026-08-10', '2026-08-16', 0, 0, 0, 0, 0, 3120);
