export type UserRole = 
  | 'DS_PRINCIPAL_PM'       // 신한DS 파트 전담 현장관리인 (10인 PM 체제 도급 PM / 최종 검수)
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
  partName?: string;       // e.g. 상담, 오토, 재무, 카드IS, 결제망, 데이터, FDS, CRM, 모바일, 인프라 (10개 파트)
  role: UserRole;
  roleTitle?: string;      // e.g. 신한DS 상담파트 전담 현장관리인
  location: string;
  phone: string;
  email: string;
  language?: string;
  timezone?: string;
  isJoined?: boolean;
  isPartnerManager?: boolean;
  position?: string;
}

export type InputRequestType = 
  | 'MANPOWER_INPUT'       // 투입 공수 보정
  | 'INPUT_TIME_CHANGE'     // 투입 시간 변경
  | 'EXEMPTION_LEAVE'      // 법정/약정 휴무 소명
  | 'MISSED_INPUT'         // 투입 로그 보정
  | 'OVERTIME_INPUT';      // 계약외 추가 투입

// 3단계 워크플로우 상태 (미검증 -> 협력사 1차확인 -> PM 정산확정 or 시스템 자동확정 or 예외처리)
export type VerificationStatus = 
  | 'UNVERIFIED'            // 1) 근로자 입력값 (미검증 - 협력업체 확인 전)
  | 'PARTNER_CONFIRMED'     // 2) 협력업체 관리자(유브갓 등) 1차 사실확인 완료 (DS PM 검수 대기)
  | 'SETTLED'               // 3) DS PM [도급비 산정을 위한 투입 실적 확정] 완료 (정산 확정)
  | 'AUTO_SETTLED'          // 4) 정상 투입(8h) 시스템 자동 정산 확정 (PM 일일 승인 불필요)
  | 'EXCLUDED_FROM_BILLING' // 5) [계약상 투입 제외] (도급비 정산 감액 확정)
  | 'DELAY_REASON_ACCEPTED' // 6) [공정 지연 사유 확정] (소명 인정 / 정산 유지)
  | 'VARIANCE_GAP';         // 투입 공백 발생 인원 (지각/미투입 -> 소명요구 대상)

export type ExceptionType = 
  | 'LATE_ARRIVAL'         // 지각 (투입 시간 지연)
  | 'EARLY_DEPARTURE'      // 조기 퇴근
  | 'MISSED_PUNCH'         // 투입 게이트 태깅 누락
  | 'UNAUTHORIZED_GAP'     // 비인가 투입 공백
  | 'VACATION_LEAVE';      // 휴가/공가 소명

export interface AuditTrailLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;          // e.g. "도급 계약 이행 확인 - 투입 실적 확정"
  systemLabel?: string;    // e.g. "도급 계약 이행 확인" (법적 방어용 자동 부착 라벨)
  details: string;
}

export interface ManpowerInputRecord {
  id: string;
  workerId: string;
  workerName: string;
  partName: string;         // 10개 파트 (상담, 오토, 재무, 카드IS, 결제망, 데이터, FDS, CRM, 모바일, 인프라)
  partnerCompany: string;   // e.g. 유브갓, (주)협력아이티에스, 오토시스, 파이낸스ITS
  workDate: string;
  contractedHours: number;  // 약정 투입 시간 (8.0h)
  actualInputHours: number; // 실제 투입 시간 (8.0h, 7.15h 등)
  clockInTime: string;
  clockOutTime: string;
  taskSummary: string;      // 작업 수행 내역
  varianceMinutes: number;  // 투입 편차 (분)
  isSlaBreach: boolean;     // 예외 발생 여부
  exceptionType?: ExceptionType; // 예외 유형
  gapReason?: string;       // 공백 사유
  partnerClarification?: string; // 협력업체 관리자 1차 소명
  verificationStatus: VerificationStatus;
  auditTrails: AuditTrailLog[];
}

export interface PartFulfillmentSummary {
  partId: string;
  partName: string;         // e.g. 상담, 오토, 재무 등
  partnerCompany: string;   // e.g. 유브갓
  pmName: string;           // 10인 PM 중 담당 PM 성명
  targetHeadcount: number;  // 파트별 약정 인원 (최대 120인 규모)
  activeHeadcount: number;  // 정상 실투입 인원 (자동 정산 완료)
  exceptionCount: number;   // 예외 관리 대상 인원 수 (지각/누락/공백 등)
  fulfillmentRate: number;  // 가동률 / 공수 달성률 (%)
  targetManHours: number;   // 약정 공수 (시간)
  actualManHours: number;   // 실 투입 공수 (시간)
  slaBreachCount: number;   // 투입 공백 발생 인원 수
  estimatedBillingDeduction: number; // 도급비 정산 감액 산정액 (원)
}

// 4. 법적 방어 리포트 엔티티 (노동청 조사 대응용 도급 검수 증빙서)
export interface LegalDefenseReport {
  reportId: string;
  generatedAt: string;
  periodRange: string;      // e.g. 2026-08-10 ~ 2026-08-16
  partName: string;
  partnerCompany: string;
  principalPmName: string;  // 신한DS 현장관리인
  totalWorkersCount: number;// 관리 도급 인원 (120인)
  totalTargetManHours: number;
  totalDeliveredManHours: number;
  overallFulfillmentRate: number;
  autoSettledCount: number; // 시스템 자동 검수 완료 건수
  exceptionResolvedCount: number; // PM 계약 검수 완료 건수
  billingDeductionTotal: number;  // 정산 감액 합계
  legalStatement: string;   // "본 문서는 원청의 인사 지휘/감독이 아닌, 도급 계약에 따른 완성물/공수 이행 검수 증빙 자료입니다."
  records: ManpowerInputRecord[];
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
