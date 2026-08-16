export type UserRole = 
  | 'PARTNER_EMPLOYEE'      // 협력사 일반 직원 (근태 신청 주체)
  | 'PARTNER_SITE_MANAGER'  // 협력사 현장대리인 (독자적 노무지휘권 행사 및 결재 승인자)
  | 'PRINCIPAL_INSPECTOR';  // 원청(신한DS) 도급 검수관 (공수 검수만 수행, 개별 지휘 불가)

export type WorkType = 'STANDARD_9TO6' | 'FLEXIBLE_TIME' | 'AUTONOMOUS' | 'SHIFT';
export type CommuteStatus = 'NORMAL' | 'LATE' | 'EARLY_LEAVE' | 'OVERTIME' | 'ABSENT' | 'MISSED' | 'WORKING' | 'OFF';
export type ScheduleType = 
  | 'NORMAL' 
  | 'FITNESS_LEAVE' 
  | 'ANNUAL_LEAVE' 
  | 'HALF_AM_LEAVE' 
  | 'HALF_PM_LEAVE' 
  | 'SPECIAL_LEAVE' 
  | 'HOLIDAY' 
  | 'OFF_DAY';

export interface Company {
  id: string;
  companyCode: string;
  companyName: string;
  bizNumber: string;
  companyType: 'PRINCIPAL_SHINHAN_DS' | 'PARTNER_CONTRACTOR';
  contactPerson: string;
  contactPhone: string;
}

export interface User {
  id: string;
  companyId: string;
  companyName: string;
  deptName: string;
  userCode: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
  timezone: string;
  role: UserRole;
  position: string;
  workType: WorkType;
  vacationBalance: {
    total: number;
    used: number;
    remaining: number;
    fitnessLeaveRemaining: number;
  };
}

export interface CommuteLog {
  id: string;
  userId: string;
  workDate: string;
  clockInTime?: string;
  clockOutTime?: string;
  clockInLocation?: string;
  clockOutLocation?: string;
  status: CommuteStatus;
  totalWorkMinutes: number;
  isManualCorrected: boolean;
}

export interface CommuteLogItem {
  id: string;
  userId: string;
  userName: string;
  deptName: string;
  position: string;
  workDate: string;
  dateLabel: string;
  clockInTime: string;
  clockOutTime: string;
  totalHoursLabel: string;
  isVerified: boolean;
}

export interface DayGroupedCommuteLogs {
  dateLabel: string;
  totalDailyHours: string;
  items: CommuteLogItem[];
}

export interface DaySchedule {
  date: string;
  dayOfWeek: string;
  isToday: boolean;
  scheduleType: ScheduleType;
  title: string;
  isVacation: boolean;
}

export type RequestType = 
  | 'OVERTIME' 
  | 'VACATION' 
  | 'MISSED_PUNCH' 
  | 'SCHEDULE_CHANGE' 
  | 'SCHEDULE'
  | 'SCHEDULE_CREATE'
  | 'CUSTOM'
  | 'BUSINESS_TRIP';

export interface AttendanceRequest {
  id: string;
  userId: string;
  userName: string;
  partnerApproverName: string; // 반드시 협력사 현장대리인으로 지정됨
  requestType: RequestType;
  targetDate: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  approvalMemo?: string;
}

export interface WeeklyWorkStat {
  weekRange: string;
  regularMinutes: number;
  overtimeMinutes: number;
  totalMinutes: number;
  maxLegalMinutes: number;
  standardMinutes: number;
}

// 원청 도급 계약 공수 검수 모델 (비개인화 M/M 검수)
export interface ServiceDeliveryInspection {
  id: string;
  projectCode: string;
  projectName: string;
  partnerCompanyName: string;
  partnerSiteRepName: string; // 제출한 협력사 현장대리인
  inspectionMonth: string; // 예: 2026-08
  contractedManMonths: number; // 계약 공수: 12.0 M/M
  actualDeliveredManMonths: number; // 실제 이행 공수: 11.9 M/M
  complianceRate: number; // 이행률: 99.2%
  status: 'SUBMITTED' | 'INSPECTED_ACCEPTED' | 'REVISION_REQUESTED';
  inspectionNotes?: string;
  inspectedAt?: string;
}
