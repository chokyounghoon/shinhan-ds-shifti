-- 1. work_schedules (2026년 8월 전체 스케줄 및 31일 오전반차 배정)
-- 대상자: S01832 (조경훈), S01831 (테스트상담)

-- 8/1 ~ 8/2 (주말)
INSERT OR REPLACE INTO work_schedules (id, user_id, employee_id, schedule_date, schedule_type, title, is_vacation, created_at, updated_at)
VALUES 
('sch-S01832-20260801', 'S01832', 'S01832', '2026-08-01', 'OFF_DAY', '주말 휴무', 0, '2026-08-01 09:00:00', '2026-08-01 09:00:00'),
('sch-S01832-20260802', 'S01832', 'S01832', '2026-08-02', 'OFF_DAY', '주말 휴무', 0, '2026-08-02 09:00:00', '2026-08-02 09:00:00');

-- 8/3 ~ 8/7 (정상근무 1.0 M/D)
INSERT OR REPLACE INTO work_schedules (id, user_id, employee_id, schedule_date, schedule_type, title, is_vacation, created_at, updated_at)
VALUES 
('sch-S01832-20260803', 'S01832', 'S01832', '2026-08-03', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-03 09:00:00', '2026-08-03 09:00:00'),
('sch-S01832-20260804', 'S01832', 'S01832', '2026-08-04', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-04 09:00:00', '2026-08-04 09:00:00'),
('sch-S01832-20260805', 'S01832', 'S01832', '2026-08-05', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-05 09:00:00', '2026-08-05 09:00:00'),
('sch-S01832-20260806', 'S01832', 'S01832', '2026-08-06', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-06 09:00:00', '2026-08-06 09:00:00'),
('sch-S01832-20260807', 'S01832', 'S01832', '2026-08-07', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-07 09:00:00', '2026-08-07 09:00:00');

-- 8/8 ~ 8/9 (주말)
INSERT OR REPLACE INTO work_schedules (id, user_id, employee_id, schedule_date, schedule_type, title, is_vacation, created_at, updated_at)
VALUES 
('sch-S01832-20260808', 'S01832', 'S01832', '2026-08-08', 'OFF_DAY', '주말 휴무', 0, '2026-08-08 09:00:00', '2026-08-08 09:00:00'),
('sch-S01832-20260809', 'S01832', 'S01832', '2026-08-09', 'OFF_DAY', '주말 휴무', 0, '2026-08-09 09:00:00', '2026-08-09 09:00:00');

-- 8/10 ~ 8/14 (정상근무 1.0 M/D)
INSERT OR REPLACE INTO work_schedules (id, user_id, employee_id, schedule_date, schedule_type, title, is_vacation, created_at, updated_at)
VALUES 
('sch-S01832-20260810', 'S01832', 'S01832', '2026-08-10', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-10 09:00:00', '2026-08-10 09:00:00'),
('sch-S01832-20260811', 'S01832', 'S01832', '2026-08-11', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-11 09:00:00', '2026-08-11 09:00:00'),
('sch-S01832-20260812', 'S01832', 'S01832', '2026-08-12', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-12 09:00:00', '2026-08-12 09:00:00'),
('sch-S01832-20260813', 'S01832', 'S01832', '2026-08-13', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-13 09:00:00', '2026-08-13 09:00:00'),
('sch-S01832-20260814', 'S01832', 'S01832', '2026-08-14', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-14 09:00:00', '2026-08-14 09:00:00');

-- 8/15 ~ 8/16 (광복절 및 주말)
INSERT OR REPLACE INTO work_schedules (id, user_id, employee_id, schedule_date, schedule_type, title, is_vacation, created_at, updated_at)
VALUES 
('sch-S01832-20260815', 'S01832', 'S01832', '2026-08-15', 'HOLIDAY', '광복절 공휴일', 1, '2026-08-15 09:00:00', '2026-08-15 09:00:00'),
('sch-S01832-20260816', 'S01832', 'S01832', '2026-08-16', 'OFF_DAY', '주말 휴무', 0, '2026-08-16 09:00:00', '2026-08-16 09:00:00');

-- 8/17 ~ 8/21 (정상근무 1.0 M/D)
INSERT OR REPLACE INTO work_schedules (id, user_id, employee_id, schedule_date, schedule_type, title, is_vacation, created_at, updated_at)
VALUES 
('sch-S01832-20260817', 'S01832', 'S01832', '2026-08-17', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-17 09:00:00', '2026-08-17 09:00:00'),
('sch-S01832-20260818', 'S01832', 'S01832', '2026-08-18', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-18 09:00:00', '2026-08-18 09:00:00'),
('sch-S01832-20260819', 'S01832', 'S01832', '2026-08-19', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-19 09:00:00', '2026-08-19 09:00:00'),
('sch-S01832-20260820', 'S01832', 'S01832', '2026-08-20', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-20 09:00:00', '2026-08-20 09:00:00'),
('sch-S01832-20260821', 'S01832', 'S01832', '2026-08-21', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-21 09:00:00', '2026-08-21 09:00:00');

-- 8/22 ~ 8/23 (주말)
INSERT OR REPLACE INTO work_schedules (id, user_id, employee_id, schedule_date, schedule_type, title, is_vacation, created_at, updated_at)
VALUES 
('sch-S01832-20260822', 'S01832', 'S01832', '2026-08-22', 'OFF_DAY', '주말 휴무', 0, '2026-08-22 09:00:00', '2026-08-22 09:00:00'),
('sch-S01832-20260823', 'S01832', 'S01832', '2026-08-23', 'OFF_DAY', '주말 휴무', 0, '2026-08-23 09:00:00', '2026-08-23 09:00:00');

-- 8/24 ~ 8/28 (정상근무 1.0 M/D)
INSERT OR REPLACE INTO work_schedules (id, user_id, employee_id, schedule_date, schedule_type, title, is_vacation, created_at, updated_at)
VALUES 
('sch-S01832-20260824', 'S01832', 'S01832', '2026-08-24', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-24 09:00:00', '2026-08-24 09:00:00'),
('sch-S01832-20260825', 'S01832', 'S01832', '2026-08-25', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-25 09:00:00', '2026-08-25 09:00:00'),
('sch-S01832-20260826', 'S01832', 'S01832', '2026-08-26', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-26 09:00:00', '2026-08-26 09:00:00'),
('sch-S01832-20260827', 'S01832', 'S01832', '2026-08-27', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-27 09:00:00', '2026-08-27 09:00:00'),
('sch-S01832-20260828', 'S01832', 'S01832', '2026-08-28', 'NORMAL', '정상근무 (1.0 M/D)', 0, '2026-08-28 09:00:00', '2026-08-28 09:00:00');

-- 8/29 (하계휴가 / 연차 1.0 M/D)
INSERT OR REPLACE INTO work_schedules (id, user_id, employee_id, schedule_date, schedule_type, title, is_vacation, created_at, updated_at)
VALUES 
('sch-S01832-20260829', 'S01832', 'S01832', '2026-08-29', 'ANNUAL_LEAVE', '여름휴가 (1.0 M/D 공수인정)', 1, '2026-08-29 09:00:00', '2026-08-29 09:00:00');

-- 8/30 (주말 휴무)
INSERT OR REPLACE INTO work_schedules (id, user_id, employee_id, schedule_date, schedule_type, title, is_vacation, created_at, updated_at)
VALUES 
('sch-S01832-20260830', 'S01832', 'S01832', '2026-08-30', 'OFF_DAY', '주말 휴무', 0, '2026-08-30 09:00:00', '2026-08-30 09:00:00');

-- 8/31 (오전반차 HALF_AM_LEAVE 0.5 M/D 인정)
INSERT OR REPLACE INTO work_schedules (id, user_id, employee_id, schedule_date, schedule_type, title, is_vacation, created_at, updated_at)
VALUES 
('sch-S01832-20260831', 'S01832', 'S01832', '2026-08-31', 'HALF_AM_LEAVE', '오전반차 (0.5 M/D 공수인정)', 1, '2026-08-30 17:19:20', '2026-08-30 17:29:17');


-- 2. weekly_work_stats (2026년 8월 주차별 근태 통계)
-- 대상자: S01832 (조경훈)

-- 8월 1주차 (8/3 ~ 8/9)
INSERT OR REPLACE INTO weekly_work_stats 
(id, employee_id, week_start_date, week_end_date, regular_work_minutes, overtime_minutes, night_minutes, holiday_minutes, total_work_minutes, remaining_limit_minutes, created_at, updated_at)
VALUES 
('stat-S01832-20260803', 'S01832', '2026-08-03', '2026-08-09', 2400, 0, 0, 0, 2400, 720, '2026-08-09 23:59:59', '2026-08-09 23:59:59');

-- 8월 2주차 (8/10 ~ 8/16)
INSERT OR REPLACE INTO weekly_work_stats 
(id, employee_id, week_start_date, week_end_date, regular_work_minutes, overtime_minutes, night_minutes, holiday_minutes, total_work_minutes, remaining_limit_minutes, created_at, updated_at)
VALUES 
('stat-S01832-20260810', 'S01832', '2026-08-10', '2026-08-16', 2400, 0, 0, 0, 2400, 720, '2026-08-16 23:59:59', '2026-08-16 23:59:59');

-- 8월 3주차 (8/17 ~ 8/23)
INSERT OR REPLACE INTO weekly_work_stats 
(id, employee_id, week_start_date, week_end_date, regular_work_minutes, overtime_minutes, night_minutes, holiday_minutes, total_work_minutes, remaining_limit_minutes, created_at, updated_at)
VALUES 
('stat-S01832-20260817', 'S01832', '2026-08-17', '2026-08-23', 2400, 0, 0, 0, 2400, 720, '2026-08-23 23:59:59', '2026-08-23 23:59:59');

-- 8월 4주차 (8/24 ~ 8/30) : 8/29 하계휴가 8h 인정 포함 40h 달성
INSERT OR REPLACE INTO weekly_work_stats 
(id, employee_id, week_start_date, week_end_date, regular_work_minutes, overtime_minutes, night_minutes, holiday_minutes, total_work_minutes, remaining_limit_minutes, created_at, updated_at)
VALUES 
('stat-S01832-20260824', 'S01832', '2026-08-24', '2026-08-30', 2400, 0, 0, 0, 2400, 720, '2026-08-30 23:59:59', '2026-08-30 23:59:59');

-- 8월 5주차 (8/31 ~ 9/6) : 8/31 오전반차 4h + 오후 4h 정상투입
INSERT OR REPLACE INTO weekly_work_stats 
(id, employee_id, week_start_date, week_end_date, regular_work_minutes, overtime_minutes, night_minutes, holiday_minutes, total_work_minutes, remaining_limit_minutes, created_at, updated_at)
VALUES 
('stat-S01832-20260831', 'S01832', '2026-08-31', '2026-09-06', 480, 0, 0, 0, 480, 2640, '2026-08-30 17:30:00', '2026-08-30 17:30:00');
