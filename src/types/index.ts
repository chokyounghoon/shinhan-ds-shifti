export type UserRole = 
  | 'DS_PRINCIPAL_PM'       // 신한DS 파트 전담 현장관리인 (도급 PM / 최종 검수)
  | 'PARTNER_PART_LEADER'   // 협력사 관리자 (유브갓 등 / 1차 투입 사실 확인 및 소명)
  | 'PARTNER_WORKER'        // 협력사 근로자 (작업자 / 본인 투입 입력)
  | 'PARTNER_EMPLOYEE'      // alias
  | 'PARTNER_SITE_MANAGER'  // alias
  | 'PRINCIPAL_INSPECTOR';  // alias

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  partnerCompany?: string; // e.g. 유브갓, (주)협력아이티에스, 신한DS
  deptName: string;       // e.g. 상담팀, 오토팀, 재무팀
  partName?: string;       // e.g. 상담, 오토, 재무
  role: UserRole;
  roleTitle?: string;      // e.g. 신한DS 상담파트 전담 PM (현장관리인), 협력사 파트관리자
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

// 3단계 워크플로우 상태 (미검증 -> 협력사 1차확인/검수대기 -> DS PM 정산확정)
export type VerificationStatus = 
  | 'UNVERIFIED'            // 1) 근로자 입력값 (미검증 - 협력업체 확인 전)
  | 'PARTNER_CONFIRMED'     // 2) 협력업체 관리자(유브갓 등) 1차 사실확인 완료 (DS PM 검수 대기)
  | 'SETTLED'               // 3) DS PM [일일 투입 공수 검수] 완료 (정산 확정)
  | 'VARIANCE_GAP'          // 투입 공백 발생 인원 (지각/미투입 -> 소명요구 대상)
  | 'PENDING_PARTNER_CHECK' // alias
  | 'SUBMITTED_TO_DS'       // alias
  | 'VERIFIED_ACCEPTED'     // alias
  | 'VARIANCE_REJECTED';    // alias

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
  partName: string;         // e.g. 상담, 오토, 재무
  partnerCompany: string;   // e.g. 유브갓, (주)협력아이티에스
  workDate: string;
  contractedHours: number;  // 약정 투입 시간 (e.g. 8.0h)
  actualInputHours: number; // 실제 투입 시간 (e.g. 8.0h, 7.15h)
  clockInTime: string;
  clockOutTime: string;
  taskSummary: string;      // 작업 수행 내역
  varianceMinutes: number;  // 투입 편차 (분)
  isSlaBreach: boolean;     // 투입 공백 발생 여부
  gapReason?: string;       // 공백 사유
  partnerClarification?: string; // 협력업체 관리자(유브갓 등) 1차 사실확인 및 소명 내용
  verificationStatus: VerificationStatus;
  auditTrails: AuditTrailLog[];
}

export interface PartFulfillmentSummary {
  partId: string;
  partName: string;         // e.g. 상담, 오토, 재무
  partnerCompany: string;   // e.g. 유브갓
  leaderName: string;
  targetHeadcount: number;  // 목표 투입 인원 (e.g. 10명)
  activeHeadcount: number;  // 실 투입 인원
  fulfillmentRate: number;  // 가동률 / 투입률 (%)
  targetManHours: number;   // 약정 공수 (시간)
  actualManHours: number;   // 실 투입 공수 (시간)
  slaBreachCount: number;   // 투입 공백 발생 인원 수
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
  timeRange: string;
  startTime?: string;
  endTime?: string;
  hours: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  category?: string;
  approvalMemo?: string;
}

export interface DaySchedule {
  dayOfWeek: string;
  dateStr: string;
  fullDate: string;
  statusType: 'WORK' | 'OFF' | 'VACATION' | 'CUSTOM';
  statusLabel: string;
  timeRange: string;
  workTypeBadge?: string;
  note?: string;
  date?: string;
  title?: string;
  isToday?: boolean;
  isVacation?: boolean;
}

export interface WeeklyWorkStat {
  approvedHours: number;
  totalCapHours: number;
  workedDays: number;
  totalDays: number;
  remainingHours: number;
  overtimeHours: number;
  lateCount: number;
  earlyLeaveCount: number;
}

export interface CommuteLogItem {
  id: string;
  workerName: string;
  partnerCompany: string;
  partName: string;
  clockInTime: string;
  clockOutTime: string;
  totalHours: string;
  locationName: string;
  isSlaBreach?: boolean;
}

export interface DayGroupedCommuteLogs {
  dateKey: string;
  dayLabel: string;
  totalDailyHours: string;
  items: CommuteLogItem[];
}

export interface ServiceDeliveryInspection {
  id: string;
  projectName?: string;
  partnerCompany: string;
  partnerCompanyName?: string;
  partnerSiteRepName?: string;
  serviceCategory: string;
  inspectionMonth: string;
  agreedHeadcount?: number;
  actualHeadcount?: number;
  contractedManMonths?: number;
  deliveredManMonths?: number;
  actualDeliveredManMonths?: number;
  contractFulfillmentRate?: number;
  complianceRate?: number;
  slaMetric?: string;
  slaTarget?: string;
  slaActual?: string;
  slaPassed?: boolean;
  varianceMinutes?: number;
  partnerSelfReview?: string;
  partnerClarification?: string;
  status?: 'SUBMITTED' | 'INSPECTED_ACCEPTED' | 'REJECTED';
  principalDecision?: 'PENDING_INSPECTION' | 'INSPECTION_ACCEPTED' | 'CONTRACT_PENALTY_APPLIED';
  principalMemo?: string;
  inspectionNotes?: string;
  inspectionEvidenceDocUrl?: string;
}
