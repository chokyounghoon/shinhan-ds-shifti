import { 
  User, 
  DaySchedule, 
  AttendanceRequest, 
  WeeklyWorkStat, 
  ManpowerInputRecord, 
  PartFulfillmentSummary,
  VerificationStatus,
  AuditTrailLog
} from '../types';

export const predefinedUsers: User[] = [
  {
    id: 'usr-ds-pm',
    name: '조경훈 (DS PM)',
    firstName: '경훈',
    lastName: '조',
    companyName: '(주)신한DS',
    partnerCompany: '(주)신한DS',
    deptName: '상담파트 전담팀',
    partName: '상담',
    role: 'DS_PRINCIPAL_PM',
    roleTitle: '신한DS 상담파트 전담 현장관리인',
    location: '파인에비뉴(상담센터)',
    phone: '010-9988-7766',
    email: 'khcho.pm@gmail.com',
    language: '한국어',
    timezone: 'Asia/Seoul (GMT+9)'
  },
  {
    id: 'usr-part-lead-1',
    name: '유관리 (협력사 관리자)',
    firstName: '관리',
    lastName: '유',
    companyName: '유브갓',
    partnerCompany: '유브갓',
    deptName: '상담운영부',
    partName: '상담',
    role: 'PARTNER_PART_LEADER',
    roleTitle: '유브갓 현장대리인 / 상담파트 관리자',
    location: '파인에비뉴(상담센터)',
    phone: '010-1234-5678',
    email: 'kim.partner@naver.com',
    language: '한국어',
    timezone: 'Asia/Seoul (GMT+9)'
  },
  {
    id: 'usr-worker-01',
    name: '송무준 (상담원)',
    firstName: '무준',
    lastName: '송',
    companyName: '유브갓',
    partnerCompany: '유브갓',
    deptName: '상담운영 1팀',
    partName: '상담',
    role: 'PARTNER_WORKER',
    roleTitle: '유브갓 도급 투입 상담원',
    location: '파인에비뉴(상담센터)',
    phone: '010-4321-8765',
    email: 'worker.song@gmail.com',
    language: '한국어',
    timezone: 'Asia/Seoul (GMT+9)'
  }
];

const initialPartSummaries: PartFulfillmentSummary[] = [
  {
    partId: 'part-counsel',
    partName: '상담',
    partnerCompany: '유브갓',
    leaderName: '유관리 관리자',
    targetHeadcount: 10,
    activeHeadcount: 9,
    fulfillmentRate: 90.0,
    targetManHours: 80.0,
    actualManHours: 72.0,
    slaBreachCount: 1, // 투입 공백 발생 1명
    estimatedBillingDeduction: 42500
  },
  {
    partId: 'part-auto',
    partName: '오토',
    partnerCompany: '오토시스',
    leaderName: '박오토 관리자',
    targetHeadcount: 10,
    activeHeadcount: 10,
    fulfillmentRate: 100.0,
    targetManHours: 80.0,
    actualManHours: 80.0,
    slaBreachCount: 0,
    estimatedBillingDeduction: 0
  },
  {
    partId: 'part-finance',
    partName: '재무',
    partnerCompany: '파이낸스ITS',
    leaderName: '최재무 관리자',
    targetHeadcount: 10,
    activeHeadcount: 10,
    fulfillmentRate: 100.0,
    targetManHours: 80.0,
    actualManHours: 80.0,
    slaBreachCount: 0,
    estimatedBillingDeduction: 0
  }
];

// 30인 투입 데이터 (파트별 10인 데이터 격리)
const initialManpowerRecords: ManpowerInputRecord[] = [
  // 1. [상담 파트 - 협력사: 유브갓 (10인)]
  {
    id: 'rec-counsel-01',
    workerId: 'w-c-01',
    workerName: '송무준',
    partName: '상담',
    partnerCompany: '유브갓',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 7.15,
    clockInTime: '09:51',
    clockOutTime: '18:00',
    taskSummary: '카드 분실 및 긴급 재발급 VIP 상담 창구 운영',
    varianceMinutes: 51,
    isSlaBreach: true,
    gapReason: '09:51 투입 (51분 투입 공백 발생)',
    partnerClarification: '유브갓 사내 VPN 서버 교체 작업으로 1차 지연 (유브갓 관리자 확인 완료)',
    verificationStatus: 'PARTNER_CONFIRMED', // 협력사 1차 확인 완료 -> DS PM 검수 대기 상태
    auditTrails: [
      {
        id: 'aud-01',
        timestamp: '2026-08-16 09:51:20',
        actorName: '송무준 (근로자)',
        actorRole: '작업자',
        action: '투입 로그 기록',
        details: '09:51 출입 태깅 및 CTI 시스템 연결'
      },
      {
        id: 'aud-02',
        timestamp: '2026-08-16 10:15:00',
        actorName: '유관리 (협력사 관리자)',
        actorRole: '협력업체 관리자',
        action: '1차 투입 사실 확인 및 소명 상신',
        details: 'VPN 교체 이슈에 따른 51분 공백 사실확인 및 소명 접수'
      }
    ]
  },
  {
    id: 'rec-counsel-02',
    workerId: 'w-c-02',
    workerName: '배경보',
    partName: '상담',
    partnerCompany: '유브갓',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:55',
    clockOutTime: '18:00',
    taskSummary: '해외 결제 이상금융거래(FDS) 긴급 상담 120건 처리',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'PARTNER_CONFIRMED',
    auditTrails: [
      {
        id: 'aud-03',
        timestamp: '2026-08-16 08:55:00',
        actorName: '배경보',
        actorRole: '작업자',
        action: '투입 로그 기록',
        details: '08:55 투입'
      },
      {
        id: 'aud-04',
        timestamp: '2026-08-16 09:10:00',
        actorName: '유관리 (협력사 관리자)',
        actorRole: '협력업체 관리자',
        action: '1차 투입 사실 확인 완료',
        details: '정상 투입 확인'
      }
    ]
  },
  {
    id: 'rec-counsel-03',
    workerId: 'w-c-03',
    workerName: '이재연',
    partName: '상담',
    partnerCompany: '유브갓',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:50',
    clockOutTime: '18:00',
    taskSummary: '가맹점 대금 정산 문의 및 챗봇 연계 상담',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'PARTNER_CONFIRMED',
    auditTrails: []
  },
  {
    id: 'rec-counsel-04',
    workerId: 'w-c-04',
    workerName: '김성훈',
    partName: '상담',
    partnerCompany: '유브갓',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:48',
    clockOutTime: '18:00',
    taskSummary: '마이데이터 동의 철회 및 개인정보 파기 요청 접수',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'PARTNER_CONFIRMED',
    auditTrails: []
  },
  {
    id: 'rec-counsel-05',
    workerId: 'w-c-05',
    workerName: '이제성',
    partName: '상담',
    partnerCompany: '유브갓',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:52',
    clockOutTime: '18:00',
    taskSummary: '법인카드 한도증액 및 서류 검증 업무',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'PARTNER_CONFIRMED',
    auditTrails: []
  },
  {
    id: 'rec-counsel-06',
    workerId: 'w-c-06',
    workerName: '김흥섭',
    partName: '상담',
    partnerCompany: '유브갓',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:40',
    clockOutTime: '18:00',
    taskSummary: '신규 발급 프로모션 포인트 지급 안내',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'PARTNER_CONFIRMED',
    auditTrails: []
  },
  {
    id: 'rec-counsel-07',
    workerId: 'w-c-07',
    workerName: '이동은',
    partName: '상담',
    partnerCompany: '유브갓',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:58',
    clockOutTime: '18:00',
    taskSummary: '카드론 및 대출 상환 스케줄 유선 안내',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'PARTNER_CONFIRMED',
    auditTrails: []
  },
  {
    id: 'rec-counsel-08',
    workerId: 'w-c-08',
    workerName: '명보민',
    partName: '상담',
    partnerCompany: '유브갓',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:51',
    clockOutTime: '18:00',
    taskSummary: '앱 장애 접수 및 IT 헬프데스크 1차 이첩',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'PARTNER_CONFIRMED',
    auditTrails: []
  },
  {
    id: 'rec-counsel-09',
    workerId: 'w-c-09',
    workerName: '박선용',
    partName: '상담',
    partnerCompany: '유브갓',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:45',
    clockOutTime: '18:00',
    taskSummary: '모바일 단독카드 본인확인 절차 지원',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'PARTNER_CONFIRMED',
    auditTrails: []
  },
  {
    id: 'rec-counsel-10',
    workerId: 'w-c-10',
    workerName: '김종현',
    partName: '상담',
    partnerCompany: '유브갓',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:53',
    clockOutTime: '18:00',
    taskSummary: '야간 긴급상담 인수인계 및 품질 점검',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'PARTNER_CONFIRMED',
    auditTrails: []
  },

  // 2. [오토 파트 - 협력사: 오토시스 (10인)]
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `rec-auto-${i + 1}`,
    workerId: `w-a-${i + 1}`,
    workerName: ['강오토', '조오토', '윤오토', '임오토', '한오토', '오오토', '서오토', '신오토', '권오토', '황오토'][i],
    partName: '오토',
    partnerCompany: '오토시스',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:50',
    clockOutTime: '18:00',
    taskSummary: '신한 MyCar 오토리스 다이렉트 심사 및 모바일 한도 산출',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'SETTLED' as VerificationStatus,
    auditTrails: []
  })),

  // 3. [재무 파트 - 협력사: 파이낸스ITS (10인)]
  ...Array.from({ length: 10 }).map((_, i) => ({
    id: `rec-fin-${i + 1}`,
    workerId: `w-f-${i + 1}`,
    workerName: ['정재무', '안재무', '송재무', '유재무', '홍재무', '전재무', '고재무', '문재무', '양재무', '손재무'][i],
    partName: '재무',
    partnerCompany: '파이낸스ITS',
    workDate: '2026-08-16',
    contractedHours: 8.0,
    actualInputHours: 8.0,
    clockInTime: '08:45',
    clockOutTime: '18:00',
    taskSummary: '일일 카드 결제 대금 대사회계 및 은행간 결제망 정산 대사',
    varianceMinutes: 0,
    isSlaBreach: false,
    verificationStatus: 'SETTLED' as VerificationStatus,
    auditTrails: []
  }))
];

export class DatabaseService {
  private currentUser: User = predefinedUsers[0]; // 기본: 조경훈 DS PM (상담파트 전담)
  private themeMode: 'ddangyo' | 'shinhan' = 'shinhan';
  private manpowerRecords: ManpowerInputRecord[] = [...initialManpowerRecords];
  private partSummaries: PartFulfillmentSummary[] = [...initialPartSummaries];

  // 담당 파트 (기본: '상담')
  private activePmPart: string = '상담';

  public getActivePmPart(): string {
    return this.activePmPart;
  }

  public setActivePmPart(part: string): void {
    this.activePmPart = part;
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public switchUserRole(userId: string): User {
    const found = predefinedUsers.find(u => u.id === userId);
    if (found) {
      this.currentUser = { ...found };
      if (found.partName) {
        this.activePmPart = found.partName;
      }
    }
    return this.currentUser;
  }

  public updateUser(partial: Partial<User>): User {
    this.currentUser = { ...this.currentUser, ...partial };
    return this.currentUser;
  }

  public getThemeMode(): 'ddangyo' | 'shinhan' {
    return this.themeMode;
  }

  public setThemeMode(mode: 'ddangyo' | 'shinhan'): void {
    this.themeMode = mode;
  }

  // 1. 파트별 데이터 격리 (PM 담당 파트 데이터만 반환)
  public getManpowerRecordsByPart(partName?: string): ManpowerInputRecord[] {
    const targetPart = partName || this.activePmPart;
    return this.manpowerRecords.filter(r => r.partName === targetPart);
  }

  public getAllManpowerRecords(): ManpowerInputRecord[] {
    return this.manpowerRecords;
  }

  public getPartSummary(partName?: string): PartFulfillmentSummary {
    const targetPart = partName || this.activePmPart;
    const found = this.partSummaries.find(p => p.partName === targetPart);
    if (found) return found;

    // 실시간 계산
    const records = this.getManpowerRecordsByPart(targetPart);
    const targetHeadcount = records.length || 10;
    const activeHeadcount = records.filter(r => !r.isSlaBreach).length;
    const fulfillmentRate = (activeHeadcount / targetHeadcount) * 100;
    const breachCount = records.filter(r => r.isSlaBreach).length;

    return {
      partId: `part-${targetPart}`,
      partName: targetPart,
      partnerCompany: records[0]?.partnerCompany || '유브갓',
      leaderName: '유관리 관리자',
      targetHeadcount,
      activeHeadcount,
      fulfillmentRate,
      targetManHours: targetHeadcount * 8.0,
      actualManHours: records.reduce((acc, cur) => acc + cur.actualInputHours, 0),
      slaBreachCount: breachCount,
      estimatedBillingDeduction: breachCount * 42500
    };
  }

  public getAllPartSummaries(): PartFulfillmentSummary[] {
    return this.partSummaries;
  }

  // 2. 협력업체 관리자 1차 '투입 사실 확인' (UNVERIFIED -> PARTNER_CONFIRMED)
  public confirmPartnerVerification(recordId: string, clarification?: string): boolean {
    const idx = this.manpowerRecords.findIndex(r => r.id === recordId);
    if (idx >= 0) {
      this.manpowerRecords[idx].verificationStatus = 'PARTNER_CONFIRMED';
      if (clarification) {
        this.manpowerRecords[idx].partnerClarification = clarification;
      }
      this.manpowerRecords[idx].auditTrails.push({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actorName: '유관리 (협력사 관리자)',
        actorRole: '협력업체 관리자',
        action: '1차 투입 사실 확인 완료',
        details: clarification || '협력사 파트 관리자 사실확인 완료'
      });
      return true;
    }
    return false;
  }

  // 3. DS 현장관리인 [일일 투입 공수 검수] 최종 정산 확정 (PARTNER_CONFIRMED -> SETTLED)
  public settlePrincipalVerification(recordIds: string[], dsPmName: string = '조경훈 (DS PM)'): boolean {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.manpowerRecords = this.manpowerRecords.map(r => {
      if (recordIds.includes(r.id)) {
        return {
          ...r,
          verificationStatus: 'SETTLED',
          auditTrails: [
            ...r.auditTrails,
            {
              id: `aud-${Date.now()}-${r.id}`,
              timestamp: nowStr,
              actorName: dsPmName,
              actorRole: '신한DS 현장관리인 (PM)',
              action: '일일 투입 공수 검수 완료 (정산 확정)',
              details: '도급 계약 기준 투입 공수 및 SLA 검수 완료 (정산 확정 자료 반영)'
            }
          ]
        };
      }
      return r;
    });
    return true;
  }

  // 4. 위반 사례 리포트: '투입 공백 발생 인원' 대상 개선 요청(소명 요구) 메시지 발송
  public sendClarificationRequest(recordId: string, message: string): boolean {
    const idx = this.manpowerRecords.findIndex(r => r.id === recordId);
    if (idx >= 0) {
      this.manpowerRecords[idx].auditTrails.push({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actorName: this.currentUser.name,
        actorRole: '신한DS 현장관리인',
        action: '공식 개선 요청(소명 요구) 발송',
        details: `수신: ${this.manpowerRecords[idx].partnerCompany} 관리자 앞 - 내용: "${message}"`
      });
      return true;
    }
    return false;
  }

  // 레거시 더미 데이터 호환
  public getWeeklySchedules(): DaySchedule[] {
    return [
      { dayOfWeek: '일', dateStr: '8/2', fullDate: '2026-08-02', statusType: 'WORK', statusLabel: '투입 완료', timeRange: '08:51 - 18:00 (8h)' },
      { dayOfWeek: '월', dateStr: '8/3', fullDate: '2026-08-03', statusType: 'WORK', statusLabel: '투입 완료', timeRange: '08:45 - 18:00 (8h)' },
      { dayOfWeek: '화', dateStr: '8/4', fullDate: '2026-08-04', statusType: 'WORK', statusLabel: '투입 완료', timeRange: '08:50 - 18:00 (8h)' },
      { dayOfWeek: '수', dateStr: '8/5', fullDate: '2026-08-05', statusType: 'WORK', statusLabel: '투입 완료', timeRange: '08:55 - 18:00 (8h)' },
      { dayOfWeek: '목', dateStr: '8/6', fullDate: '2026-08-06', statusType: 'WORK', statusLabel: '투입 완료', timeRange: '08:48 - 18:00 (8h)' },
      { dayOfWeek: '금', dateStr: '8/7', fullDate: '2026-08-07', statusType: 'WORK', statusLabel: '투입 완료', timeRange: '08:52 - 18:00 (8h)' },
      { dayOfWeek: '토', dateStr: '8/8', fullDate: '2026-08-08', statusType: 'OFF', statusLabel: '약정휴무', timeRange: '-' }
    ];
  }

  public getRequests(): AttendanceRequest[] {
    return [
      {
        id: 'req-01',
        userId: 'usr-worker-01',
        userName: '송무준',
        userDept: '상담파트',
        partnerApproverName: '유관리 관리자',
        requestType: 'MISSED_PUNCH',
        targetDate: '2026-08-16',
        timeRange: '09:51 - 18:00',
        hours: 7.15,
        reason: 'CTI 전산 지연에 따른 51분 투입 편차 소명',
        status: 'PENDING',
        createdAt: '2026-08-16 10:15'
      }
    ];
  }

  public getWeeklyStats(): WeeklyWorkStat {
    return {
      approvedHours: 40.0,
      totalCapHours: 52.0,
      workedDays: 5,
      totalDays: 5,
      remainingHours: 12.0,
      overtimeHours: 0,
      lateCount: 0,
      earlyLeaveCount: 0
    };
  }

  public clockIn(loc: string): boolean {
    return true;
  }

  public addCommuteLog(type: string, loc: string): void {
    // dummy logger
  }

  public addRequest(req: any): void {
    // dummy request
  }

  public approvePartnerRequest(reqId: string, memo?: string): boolean {
    return true;
  }

  public rejectPartnerRequest(reqId: string, memo?: string): boolean {
    return true;
  }

  public getInspections(): any[] {
    return [];
  }

  public acceptContractInspection(id: string, memo?: string): boolean {
    return true;
  }
}

export const dbService = new DatabaseService();
