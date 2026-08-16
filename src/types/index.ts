export type UserRole = 
  | 'DS_PRINCIPAL_PM'       // 신한DS 총괄 현장대리인 (도급 사업 총괄 PM / 최종 검수)
  | 'PARTNER_PART_LEADER'   // 협력사 현장대리인 (파트장 / 10인 1차 검증 및 소명)
  | 'PARTNER_WORKER'        // 협력사 근로자 (작업자 / 본인 투입 입력 및 조회)
  | 'PARTNER_EMPLOYEE'      // alias
  | 'PARTNER_SITE_MANAGER'  // alias
  | 'PRINCIPAL_INSPECTOR';  // alias

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  partnerCompany?: string; // e.g. (주)협력아이티에스, 신한DS
  deptName: string;       // e.g. 카드IS개발파트, 코어뱅킹파트, 데이터인프라파트
  partName?: string;       // Part 1, Part 2, Part 3
  role: UserRole;
  roleTitle?: string;      // e.g. 신한DS 도급총괄 PM, 협력사 파트장(현장대리인), 협력사 투입인력
  location: string;
  phone: string;
  email: string;
  language?: string;
  timezone?: string;
  isJoined?: boolean;
}

export type InputRequestType = 
  | 'MANPOWER_INPUT'       // 투입 공수 보정
  | 'INPUT_TIME_CHANGE'     // 투입 시간 변경
  | 'EXEMPTION_LEAVE'      // 법정/약정 휴무 소명
  | 'MISSED_INPUT'         // 투입 로그 보정
  | 'OVERTIME_INPUT';      // 계약외 추가 투입

export type VerificationStatus = 
  | 'PENDING_PARTNER_CHECK'  // 근로자 입력 -> 협력사 파트장 소명/1차 검증 대기
  | 'SUBMITTED_TO_DS'       // 협력사 파트장 소명 완료 -> 신한DS 최종 투입 검수 대기
  | 'VERIFIED_ACCEPTED'     // 신한DS 최종 계약 투입 검수 완료 (도급 공수 확정)
  | 'VARIANCE_REJECTED';    // 계약 기준 미달에 따른 정산 감액

export interface AuditTrailLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
}

export interface ManpowerInputRecord {
  id: string;
  workerId: string;
  workerName: string;
  partName: string;         // Part 1: 카드IS, Part 2: 코어뱅킹, Part 3: 데이터인프라
  partnerCompany: string;
  workDate: string;
  contractedHours: number;  // 약정 투입 시간 (e.g. 8.0h)
  actualInputHours: number; // 실제 투입 시간 (e.g. 8.0h, 7.15h)
  clockInTime: string;
  clockOutTime: string;
  taskSummary: string;      // 작업 수행 내역
  varianceMinutes: number;  // 투입 편차 (분)
  isSlaBreach: boolean;     // SLA 기준 미달 여부
  partnerClarification?: string; // 파트장 1차 사실확인 및 소명 내용
  verificationStatus: VerificationStatus;
  auditTrails: AuditTrailLog[];
}

export interface PartFulfillmentSummary {
  partId: string;
  partName: string;
  leaderName: string;
  targetHeadcount: number;  // 목표 인원 10명
  activeHeadcount: number;  // 실 투입 인원
  fulfillmentRate: number;  // 투입률 (%)
  targetManHours: number;   // 약정 공수 (시간)
  actualManHours: number;   // 실 투입 공수 (시간)
  slaBreachCount: number;   // SLA 미준수 건수
  estimatedBillingDeduction: number; // 도급비 정산 감액 산정액 (원)
}

// 레거시 호환용 타입 매핑
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
  userDept: string;
  partnerApproverName: string;
  requestType: RequestType;
  targetDate: string;
  startTime?: string;
  endTime?: string;
  vacationDays?: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvalMemo?: string;
  createdAt: string;
}

export interface DaySchedule {
  date: string;
  dayOfWeek: string;
  isToday: boolean;
  isWeekend: boolean;
  title?: string;
  scheduleName: string;
  timeRange: string;
  isCustom?: boolean;
  isVacation?: boolean;
}

export interface WeeklyWorkStat {
  totalWorkHours: string;
  regularWorkHours: string;
  overtimeHours: string;
  nightWorkHours: string;
  holidayWorkHours: string;
  remainingOvertimeCap: string;
}

export interface CommuteLogItem {
  id: string;
  userId: string;
  userName: string;
  deptName: string;
  workDate: string;
  clockInTime?: string;
  clockOutTime?: string;
  status: 'NORMAL' | 'LATE' | 'EARLY_LEAVE' | 'VACATION';
}

export interface DayGroupedCommuteLogs {
  date: string;
  dayOfWeek: string;
  totalWorkedMinutes: number;
  logs: CommuteLogItem[];
}

export interface ServiceDeliveryInspection {
  id: string;
  projectName: string;
  partnerCompanyName: string;
  partnerSiteRepName: string;
  inspectionMonth: string;
  contractedManMonths: number;
  actualDeliveredManMonths: number;
  complianceRate: number;
  status: 'SUBMITTED' | 'INSPECTED_ACCEPTED' | 'REJECTED';
  submittedAt: string;
  inspectedAt?: string;
  inspectionNotes?: string;
}
