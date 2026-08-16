import { 
  User, 
  ManpowerInputRecord, 
  PartFulfillmentSummary, 
  AuditTrailLog, 
  VerificationStatus,
  DaySchedule, 
  AttendanceRequest, 
  WeeklyWorkStat, 
  ServiceDeliveryInspection,
  CommuteLogItem
} from '../types';

export const predefinedUsers: User[] = [
  {
    id: 'usr-ds-pm',
    name: '조경훈 (DS PM)',
    firstName: '경훈',
    lastName: '조',
    companyName: '(주)신한DS',
    partnerCompany: '(주)신한DS',
    deptName: 'ICT운영부문 도급관리본부',
    partName: '전체 총괄',
    role: 'DS_PRINCIPAL_PM',
    roleTitle: '신한DS 도급 총괄 PM (최종 검수권자)',
    location: '파인에비뉴(카드)',
    phone: '010-9988-7766',
    email: 'khcho.pm@shinhan.com',
    language: '한국어',
    timezone: 'Asia/Seoul (GMT+9)'
  },
  {
    id: 'usr-part-lead-1',
    name: '김협력 (파트장)',
    firstName: '협력',
    lastName: '김',
    companyName: '(주)협력아이티에스',
    partnerCompany: '(주)협력아이티에스',
    deptName: '카드IS 개발파트',
    partName: 'Part 1 (카드IS)',
    role: 'PARTNER_PART_LEADER',
    roleTitle: '협력사 현장대리인 / Part 1 파트장',
    location: '파인에비뉴(카드)',
    phone: '010-1234-5678',
    email: 'kim.partner@partnerits.co.kr',
    language: '한국어',
    timezone: 'Asia/Seoul (GMT+9)'
  },
  {
    id: 'usr-worker-01',
    name: '송무준 (투입인력)',
    firstName: '무준',
    lastName: '송',
    companyName: '(주)협력아이티에스',
    partnerCompany: '(주)협력아이티에스',
    deptName: '카드IS 개발파트',
    partName: 'Part 1 (카드IS)',
    role: 'PARTNER_WORKER',
    roleTitle: '협력사 도급 투입 엔지니어',
    location: '파인에비뉴(카드)',
    phone: '010-5555-1111',
    email: 'song.worker@partnerits.co.kr',
    language: '한국어',
    timezone: 'Asia/Seoul (GMT+9)'
  }
];

const initialPartSummaries: PartFulfillmentSummary[] = [
  {
    partId: 'part-1',
    partName: 'Part 1 (카드IS 개발운영)',
    leaderName: '김협력 파트장',
    targetHeadcount: 10,
    activeHeadcount: 9,
    fulfillmentRate: 90.0,
    targetManHours: 80.0,
    actualManHours: 72.0,
    slaBreachCount: 1,
    estimatedBillingDeduction: 42500
  },
  {
    partId: 'part-2',
    partName: 'Part 2 (코어뱅킹 고도화)',
    leaderName: '박파트 파트장',
    targetHeadcount: 10,
    activeHeadcount: 10,
    fulfillmentRate: 100.0,
    targetManHours: 80.0,
    actualManHours: 80.0,
    slaBreachCount: 0,
    estimatedBillingDeduction: 0
  },
  {
    partId: 'part-3',
    partName: 'Part 3 (데이터인프라 운영)',
    leaderName: '최파트 파트장',
    targetHeadcount: 10,
    activeHeadcount: 10,
    fulfillmentRate: 100.0,
    targetManHours: 80.0,
    actualManHours: 80.0,
    slaBreachCount: 0,
    estimatedBillingDeduction: 0
  }
];

// 30인 투입 레코드 초기 데이터
const initialManpowerRecords: ManpowerInputRecord[] = [
  // Part 1: 10명 (1명 투입지연 소명 진행중)
  {
    id: 'rec-01',
    workerId: 'w-01',
    workerName: '송무준',
    partName: 'Part 1 (카드IS)',
    partnerCompany: '(주)협력아이티에스',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 7.15,
    clockInTime: '09:51',
    clockOutTime: '18:00',
    taskSummary: '신한카드 승인 인터페이스 암호화 모듈 핫픽스 적용',
    varianceMinutes: 51,
    isSlaBreach: true,
    partnerClarification: '협력사 내부 긴급 빌드서버 점검으로 인한 투입 시간 편차 발생 (파트장 확인 완료)',
    verificationStatus: 'SUBMITTED_TO_DS',
    auditTrails: [
      {
        id: 'aud-01',
        timestamp: '2026-08-16 09:51:20',
        actorName: '송무준 (근로자)',
        actorRole: '작업자',
        action: '투입 로그 기록',
        details: '09:51 게이트 태깅 및 작업 개시'
      },
      {
        id: 'aud-02',
        timestamp: '2026-08-16 10:15:00',
        actorName: '김협력 (파트장)',
        actorRole: '협력사 현장대리인',
        action: '1차 사실관계 소명 상신',
        details: '긴급 빌드서버 점검 사유 확인 및 도급 검수 상신'
      }
    ]
  },
  {
    id: 'rec-02',
    workerId: 'w-02',
    workerName: '김성훈',
    partName: 'Part 1 (카드IS)',
    partnerCompany: '(주)협력아이티에스',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:50',
    clockOutTime: '18:00',
    taskSummary: '카드 결제 승인 게이트웨이 배치 모니터링',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'VERIFIED_ACCEPTED',
    auditTrails: [
      {
        id: 'aud-03',
        timestamp: '2026-08-16 08:50:00',
        actorName: '김성훈',
        actorRole: '작업자',
        action: '투입 로그 기록',
        details: '정상 투입 완료'
      }
    ]
  },
  {
    id: 'rec-03',
    workerId: 'w-03',
    workerName: '이제성',
    partName: 'Part 1 (카드IS)',
    partnerCompany: '(주)협력아이티에스',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:55',
    clockOutTime: '18:00',
    taskSummary: '정산 배치 데이터 검증 작업',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'VERIFIED_ACCEPTED',
    auditTrails: []
  },
  {
    id: 'rec-04',
    workerId: 'w-04',
    workerName: '김흥섭',
    partName: 'Part 1 (카드IS)',
    partnerCompany: '(주)협력아이티에스',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:45',
    clockOutTime: '18:00',
    taskSummary: '가맹점 수수료율 변경 쿼리 검증',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'VERIFIED_ACCEPTED',
    auditTrails: []
  },
  {
    id: 'rec-05',
    workerId: 'w-05',
    workerName: '이동은',
    partName: 'Part 1 (카드IS)',
    partnerCompany: '(주)협력아이티에스',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:52',
    clockOutTime: '18:00',
    taskSummary: '모바일 결제 API 안정화 작업',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'VERIFIED_ACCEPTED',
    auditTrails: []
  },
  {
    id: 'rec-06',
    workerId: 'w-06',
    workerName: '명보민',
    partName: 'Part 1 (카드IS)',
    partnerCompany: '(주)협력아이티에스',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:40',
    clockOutTime: '18:00',
    taskSummary: '보안 취약점 조치 및 패치 반영',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'VERIFIED_ACCEPTED',
    auditTrails: []
  },
  {
    id: 'rec-07',
    workerId: 'w-07',
    workerName: '박선용',
    partName: 'Part 1 (카드IS)',
    partnerCompany: '(주)협력아이티에스',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:48',
    clockOutTime: '18:00',
    taskSummary: '대외 연계망 트래픽 부하 테스트',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'VERIFIED_ACCEPTED',
    auditTrails: []
  },
  {
    id: 'rec-08',
    workerId: 'w-08',
    workerName: '김연섭',
    partName: 'Part 1 (카드IS)',
    partnerCompany: '(주)협력아이티에스',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:50',
    clockOutTime: '18:00',
    taskSummary: '실시간 이상금융거래(FDS) 룰 엔진 점검',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'VERIFIED_ACCEPTED',
    auditTrails: []
  },
  {
    id: 'rec-09',
    workerId: 'w-09',
    workerName: '김종현',
    partName: 'Part 1 (카드IS)',
    partnerCompany: '(주)협력아이티에스',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:35',
    clockOutTime: '18:00',
    taskSummary: '메시징 큐 클러스터 가용성 점검',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'VERIFIED_ACCEPTED',
    auditTrails: []
  },
  {
    id: 'rec-10',
    workerId: 'w-10',
    workerName: '배경보',
    partName: 'Part 1 (카드IS)',
    partnerCompany: '(주)협력아이티에스',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:58',
    clockOutTime: '18:00',
    taskSummary: 'DB 인덱스 튜닝 및 쿼리 최적화',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'VERIFIED_ACCEPTED',
    auditTrails: []
  }
];

class AttendanceDBService {
  private currentUser: User;
  private themeMode: 'ddangyo' | 'shinhan';
  private manpowerRecords: ManpowerInputRecord[];
  private partSummaries: PartFulfillmentSummary[];
  private requests: AttendanceRequest[];

  constructor() {
    this.currentUser = predefinedUsers[0]; // 기본 DS 총괄 PM
    this.themeMode = 'shinhan';
    this.manpowerRecords = initialManpowerRecords;
    this.partSummaries = initialPartSummaries;
    this.requests = [
      {
        id: 'req-01',
        userId: 'usr-worker-01',
        userName: '송무준',
        userDept: '카드IS 개발파트',
        partnerApproverName: '김협력 파트장',
        requestType: 'SCHEDULE_CHANGE',
        targetDate: '2026-08-16',
        startTime: '09:51',
        endTime: '18:00',
        reason: '긴급 빌드서버 점검으로 인한 투입 시간 소명',
        status: 'PENDING',
        createdAt: '2026-08-16 09:55'
      }
    ];
  }

  getCurrentUser(): User {
    return this.currentUser;
  }

  switchUserRole(userId: string): User {
    const found = predefinedUsers.find(u => u.id === userId || (userId === 'usr-001' && u.id === 'usr-worker-01') || (userId === 'usr-rep-001' && u.id === 'usr-part-lead-1') || (userId === 'usr-ds-001' && u.id === 'usr-ds-pm'));
    if (found) {
      this.currentUser = found;
    }
    return this.currentUser;
  }

  updateUser(updates: Partial<User>): User {
    this.currentUser = { ...this.currentUser, ...updates };
    return this.currentUser;
  }

  getThemeMode(): 'ddangyo' | 'shinhan' {
    return this.themeMode;
  }

  setThemeMode(mode: 'ddangyo' | 'shinhan') {
    this.themeMode = mode;
  }

  // 1. 도급 파트별 투입 현황 요약
  getPartFulfillmentSummaries(): PartFulfillmentSummary[] {
    return this.partSummaries;
  }

  // 2. 인력 투입 및 작업 수행 레코드 조회
  getManpowerRecords(partFilter?: string): ManpowerInputRecord[] {
    if (partFilter && partFilter !== 'ALL') {
      return this.manpowerRecords.filter(r => r.partName.includes(partFilter));
    }
    return this.manpowerRecords;
  }

  // 3. 협력사 파트장의 1차 사실관계 소명 입력
  submitPartnerClarification(recordId: string, clarification: string): ManpowerInputRecord | null {
    const rec = this.manpowerRecords.find(r => r.id === recordId);
    if (rec) {
      rec.partnerClarification = clarification;
      rec.verificationStatus = 'SUBMITTED_TO_DS';
      rec.auditTrails.push({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actorName: this.currentUser.name,
        actorRole: '협력사 현장대리인(파트장)',
        action: '1차 소명 등록 및 검수 상신',
        details: clarification
      });
      return rec;
    }
    return null;
  }

  // 4. 신한DS 관리인의 [계약 투입 검수 완료] 확정
  verifyAndConfirmContractFulfillment(recordId: string, notes?: string): ManpowerInputRecord | null {
    const rec = this.manpowerRecords.find(r => r.id === recordId);
    if (rec) {
      rec.verificationStatus = 'VERIFIED_ACCEPTED';
      rec.auditTrails.push({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actorName: this.currentUser.name,
        actorRole: '신한DS 도급 총괄 PM',
        action: '계약 투입 검수 완료',
        details: notes || '도급 계약 기준에 따른 투입 공수 최종 확인'
      });
      return rec;
    }
    return null;
  }

  // 레거시 호환 메서드들
  clockIn(locationName: string): boolean {
    return true;
  }

  addCommuteLog(type: string, locationName?: string): boolean {
    return true;
  }

  approvePartnerRequest(reqId: string, memo: string) {
    const req = this.requests.find(r => r.id === reqId);
    if (req) {
      req.status = 'APPROVED';
      req.approvalMemo = memo;
    }
  }

  rejectPartnerRequest(reqId: string, memo: string) {
    const req = this.requests.find(r => r.id === reqId);
    if (req) {
      req.status = 'REJECTED';
      req.approvalMemo = memo;
    }
  }

  getWeeklySchedules(): DaySchedule[] {
    return [
      { date: '2026-08-10', dayOfWeek: '월', isToday: false, isWeekend: false, scheduleName: '09~18', title: '09~18', timeRange: '09:00 - 18:00', isVacation: true },
      { date: '2026-08-11', dayOfWeek: '화', isToday: false, isWeekend: false, scheduleName: '09~18', title: '09~18', timeRange: '09:00 - 18:00', isVacation: true },
      { date: '2026-08-12', dayOfWeek: '수', isToday: false, isWeekend: false, scheduleName: '09~18', title: '09~18', timeRange: '09:00 - 18:00', isVacation: true },
      { date: '2026-08-13', dayOfWeek: '목', isToday: false, isWeekend: false, scheduleName: '09~18', title: '09~18', timeRange: '09:00 - 18:00', isVacation: true },
      { date: '2026-08-14', dayOfWeek: '금', isToday: false, isWeekend: false, scheduleName: '09~18', title: '09~18', timeRange: '09:00 - 18:00', isVacation: true },
      { date: '2026-08-15', dayOfWeek: '토', isToday: false, isWeekend: true, scheduleName: '광복절', title: '광복절', timeRange: '휴무' },
      { date: '2026-08-16', dayOfWeek: '일', isToday: true, isWeekend: true, scheduleName: '주휴일', title: '주휴일', timeRange: '휴무' }
    ];
  }

  getRequests(): AttendanceRequest[] {
    return this.requests;
  }

  addRequest(req: Partial<AttendanceRequest>): AttendanceRequest {
    const newReq: AttendanceRequest = {
      id: `req-${Date.now()}`,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userDept: this.currentUser.deptName,
      partnerApproverName: '김협력 파트장',
      requestType: req.requestType || 'SCHEDULE_CHANGE',
      targetDate: req.targetDate || '2026-08-16',
      startTime: req.startTime,
      endTime: req.endTime,
      reason: req.reason || '도급 투입 일정 소명',
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    this.requests.unshift(newReq);
    return newReq;
  }

  getWeeklyStats(): WeeklyWorkStat {
    return {
      totalWorkHours: '40.0',
      regularWorkHours: '40.0',
      overtimeHours: '0.0',
      nightWorkHours: '0.0',
      holidayWorkHours: '0.0',
      remainingOvertimeCap: '12.0'
    };
  }

  getInspections(): ServiceDeliveryInspection[] {
    return [
      {
        id: 'insp-01',
        projectName: '신한 카드IS 개발운영 (총 30인 중 Part 1)',
        partnerCompanyName: '(주)협력아이티에스',
        partnerSiteRepName: '김협력 파트장',
        inspectionMonth: '2026년 8월',
        contractedManMonths: 10.0,
        actualDeliveredManMonths: 9.85,
        complianceRate: 98.5,
        status: 'SUBMITTED',
        submittedAt: '2026-08-16 10:00'
      }
    ];
  }

  acceptContractInspection(id: string, notes: string) {
    // accept inspection
  }
}

export const dbService = new AttendanceDBService();
