import { User, DaySchedule, DayGroupedCommuteLogs, CommuteLog, AttendanceRequest, WeeklyWorkStat, ServiceDeliveryInspection } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER_ID: 'shinhan_ds_current_user_id',
  USERS: 'shinhan_ds_users',
  REQUESTS: 'shinhan_ds_requests',
  INSPECTIONS: 'shinhan_ds_inspections',
  THEME_MODE: 'shinhan_ds_theme_mode'
};

// 3가지 법적 역할 분리 계정
export const systemUsers: User[] = [
  {
    id: 'usr-001',
    companyId: 'comp-002',
    companyName: '땡겨요테크솔루션 (신한DS 협력사)',
    deptName: '카드개발팀',
    userCode: 'PT-20260816',
    name: '조경훈',
    firstName: 'kyounghoon',
    lastName: 'cho',
    email: 'khcho0421@gmail.com',
    phone: '01047328880',
    language: '한국어',
    timezone: 'Asia/Seoul',
    role: 'PARTNER_EMPLOYEE',
    position: '팀원',
    workType: 'STANDARD_9TO6',
    vacationBalance: {
      total: 15,
      used: 5,
      remaining: 10,
      fitnessLeaveRemaining: 2
    }
  },
  {
    id: 'usr-rep-001',
    companyId: 'comp-002',
    companyName: '땡겨요테크솔루션 (신한DS 협력사)',
    deptName: '상주개발사업부',
    userCode: 'PT-REP-01',
    name: '김협력 PM (현장대리인)',
    firstName: 'hyupryeok',
    lastName: 'kim',
    email: 'site.manager@partner-tech.com',
    phone: '01099887766',
    language: '한국어',
    timezone: 'Asia/Seoul',
    role: 'PARTNER_SITE_MANAGER',
    position: '현장대리인 / PM',
    workType: 'STANDARD_9TO6',
    vacationBalance: {
      total: 18,
      used: 2,
      remaining: 16,
      fitnessLeaveRemaining: 3
    }
  },
  {
    id: 'usr-ds-001',
    companyId: 'comp-001',
    companyName: '신한DS (발주사/원청)',
    deptName: '디지털플랫폼개발부',
    userCode: 'DS-2026-901',
    name: '박신한 수석 (도급검수관)',
    firstName: 'shinhan',
    lastName: 'park',
    email: 'inspector.park@shinhands.co.kr',
    phone: '01022334455',
    language: '한국어',
    timezone: 'Asia/Seoul',
    role: 'PRINCIPAL_INSPECTOR',
    position: '수석연구원 / 계약검수관',
    workType: 'STANDARD_9TO6',
    vacationBalance: {
      total: 20,
      used: 4,
      remaining: 16,
      fitnessLeaveRemaining: 5
    }
  }
];

export const initialRequests: AttendanceRequest[] = [
  {
    id: 'req-01',
    userId: 'usr-001',
    userName: '조경훈',
    partnerApproverName: '김협력 PM (협력사 현장대리인)',
    requestType: 'VACATION',
    targetDate: '2026-08-12 ~ 2026-08-14',
    reason: '하계 정기 연차 휴가 (소속사 복무규정 준수)',
    status: 'APPROVED',
    createdAt: '2026-08-01 09:30',
    approvalMemo: '소속사 현장대리인 김협력 승인 완료'
  },
  {
    id: 'req-02',
    userId: 'usr-001',
    userName: '조경훈',
    partnerApproverName: '김협력 PM (협력사 현장대리인)',
    requestType: 'OVERTIME',
    targetDate: '2026-08-17',
    startTime: '18:00',
    endTime: '20:30',
    reason: '땡겨요 결제 모듈 긴급 배포 준비',
    status: 'PENDING',
    createdAt: '2026-08-16 09:10'
  }
];

export const initialInspections: ServiceDeliveryInspection[] = [
  {
    id: 'insp-01',
    projectCode: 'DDANGYO-CORE-V2',
    projectName: '땡겨요 가맹점/배달 코어 시스템 고도화',
    partnerCompanyName: '땡겨요테크솔루션 (협력사)',
    partnerSiteRepName: '김협력 PM (현장대리인)',
    inspectionMonth: '2026년 08월 (2주차 집계)',
    contractedManMonths: 12.0,
    actualDeliveredManMonths: 11.9,
    complianceRate: 99.2,
    status: 'SUBMITTED',
    inspectionNotes: '주 52시간 근로기준법 준수 및 용역 계약상 요구 공수 100% 정상 투입됨'
  },
  {
    id: 'insp-02',
    projectCode: 'CARD-DEV-2026',
    projectName: '신한카드 모바일 앱 프론트 연동 용역',
    partnerCompanyName: '땡겨요테크솔루션 (협력사)',
    partnerSiteRepName: '김협력 PM (현장대리인)',
    inspectionMonth: '2026년 07월 정산',
    contractedManMonths: 12.0,
    actualDeliveredManMonths: 12.0,
    complianceRate: 100.0,
    status: 'INSPECTED_ACCEPTED',
    inspectionNotes: '도급 검수 합격: 용역비 지급 승인 완료',
    inspectedAt: '2026-08-05 14:00'
  }
];

export const myCommuteLogsGrouped: DayGroupedCommuteLogs[] = [
  {
    dateLabel: '2026년 8월 3일, 월',
    totalDailyHours: '8시간 9분',
    items: [
      {
        id: 'log-01',
        userId: 'usr-001',
        userName: '조경훈',
        deptName: '카드개발팀',
        position: '팀원',
        workDate: '2026-08-03',
        dateLabel: '2026년 8월 3일, 월',
        clockInTime: '09:51',
        clockOutTime: '19:00',
        totalHoursLabel: '8시간 9분',
        isVerified: true
      }
    ]
  },
  {
    dateLabel: '2026년 8월 4일, 화',
    totalDailyHours: '8시간 32분',
    items: [
      {
        id: 'log-02',
        userId: 'usr-001',
        userName: '조경훈',
        deptName: '카드개발팀',
        position: '팀원',
        workDate: '2026-08-04',
        dateLabel: '2026년 8월 4일, 화',
        clockInTime: '08:41',
        clockOutTime: '18:13',
        totalHoursLabel: '8시간 32분',
        isVerified: true
      }
    ]
  },
  {
    dateLabel: '2026년 8월 5일, 수',
    totalDailyHours: '8시간 45분',
    items: [
      {
        id: 'log-03',
        userId: 'usr-001',
        userName: '조경훈',
        deptName: '카드개발팀',
        position: '팀원',
        workDate: '2026-08-05',
        dateLabel: '2026년 8월 5일, 수',
        clockInTime: '08:15',
        clockOutTime: '18:00',
        totalHoursLabel: '8시간 45분',
        isVerified: true
      }
    ]
  },
  {
    dateLabel: '2026년 8월 6일, 목',
    totalDailyHours: '8시간 17분',
    items: [
      {
        id: 'log-04',
        userId: 'usr-001',
        userName: '조경훈',
        deptName: '카드개발팀',
        position: '팀원',
        workDate: '2026-08-06',
        dateLabel: '2026년 8월 6일, 목',
        clockInTime: '08:43',
        clockOutTime: '18:00',
        totalHoursLabel: '8시간 17분',
        isVerified: true
      }
    ]
  },
  {
    dateLabel: '2026년 8월 7일, 금',
    totalDailyHours: '8시간 53분',
    items: [
      {
        id: 'log-05',
        userId: 'usr-001',
        userName: '조경훈',
        deptName: '카드개발팀',
        position: '팀원',
        workDate: '2026-08-07',
        dateLabel: '2026년 8월 7일, 금',
        clockInTime: '08:22',
        clockOutTime: '18:15',
        totalHoursLabel: '8시간 53분',
        isVerified: true
      }
    ]
  }
];

export const teamCommuteLogsGrouped: DayGroupedCommuteLogs[] = [
  {
    dateLabel: '2026년 8월 1일, 토',
    totalDailyHours: '2시간 9분',
    items: [
      {
        id: 'team-00',
        userId: 'usr-team-00',
        userName: '송무준',
        deptName: '카드개발팀',
        position: '팀원',
        workDate: '2026-08-01',
        dateLabel: '2026년 8월 1일, 토',
        clockInTime: '23:51',
        clockOutTime: '02:00',
        totalHoursLabel: '2시간 9분',
        isVerified: true
      }
    ]
  },
  {
    dateLabel: '2026년 8월 3일, 월',
    totalDailyHours: '317시간 7분',
    items: [
      {
        id: 'team-01',
        userId: 'usr-team-01',
        userName: '김성훈',
        deptName: '카드개발팀',
        position: '팀원',
        workDate: '2026-08-03',
        dateLabel: '2026년 8월 3일, 월',
        clockInTime: '06:35',
        clockOutTime: '18:31',
        totalHoursLabel: '10시간 56분',
        isVerified: true
      },
      {
        id: 'team-02',
        userId: 'usr-team-02',
        userName: '이제성',
        deptName: '카드개발팀',
        position: '팀원',
        workDate: '2026-08-03',
        dateLabel: '2026년 8월 3일, 월',
        clockInTime: '07:14',
        clockOutTime: '17:07',
        totalHoursLabel: '8시간 53분',
        isVerified: true
      },
      {
        id: 'team-03',
        userId: 'usr-team-03',
        userName: '김흥섭',
        deptName: '카드개발팀',
        position: '팀원',
        workDate: '2026-08-03',
        dateLabel: '2026년 8월 3일, 월',
        clockInTime: '07:52',
        clockOutTime: '18:00',
        totalHoursLabel: '9시간 8분',
        isVerified: true
      }
    ]
  }
];

export const initialWeeklySchedules: DaySchedule[] = [
  { date: '2026-08-10', dayOfWeek: '월', isToday: false, scheduleType: 'FITNESS_LEAVE', title: '체력단련휴.', isVacation: true },
  { date: '2026-08-11', dayOfWeek: '화', isToday: false, scheduleType: 'FITNESS_LEAVE', title: '체력단련휴.', isVacation: true },
  { date: '2026-08-12', dayOfWeek: '수', isToday: false, scheduleType: 'ANNUAL_LEAVE', title: '연차', isVacation: true },
  { date: '2026-08-13', dayOfWeek: '목', isToday: false, scheduleType: 'ANNUAL_LEAVE', title: '연차', isVacation: true },
  { date: '2026-08-14', dayOfWeek: '금', isToday: false, scheduleType: 'ANNUAL_LEAVE', title: '연차', isVacation: true },
  { date: '2026-08-15', dayOfWeek: '토', isToday: false, scheduleType: 'OFF_DAY', title: '일정 없음', isVacation: false },
  { date: '2026-08-16', dayOfWeek: '오늘', isToday: true, scheduleType: 'OFF_DAY', title: '일정 없음', isVacation: false }
];

class AttendanceDBService {
  private getStorage<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setStorage<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error('Storage error', e);
    }
  }

  getCurrentUser(): User {
    const currentUserId = this.getStorage<string>(STORAGE_KEYS.CURRENT_USER_ID, 'usr-001');
    const users = this.getStorage<User[]>(STORAGE_KEYS.USERS, systemUsers);
    return users.find(u => u.id === currentUserId) || users[0];
  }

  switchUserRole(userId: string): User {
    this.setStorage(STORAGE_KEYS.CURRENT_USER_ID, userId);
    return this.getCurrentUser();
  }

  getAllUsers(): User[] {
    return this.getStorage<User[]>(STORAGE_KEYS.USERS, systemUsers);
  }

  updateUser(user: User): void {
    const users = this.getAllUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    this.setStorage(STORAGE_KEYS.USERS, users);
  }

  getWeeklySchedules(): DaySchedule[] {
    return initialWeeklySchedules;
  }

  getMyCommuteLogs(): DayGroupedCommuteLogs[] {
    return myCommuteLogsGrouped;
  }

  getTeamCommuteLogs(): DayGroupedCommuteLogs[] {
    return teamCommuteLogsGrouped;
  }

  getCommuteLogs(): CommuteLog[] {
    return [
      {
        id: 'log-01',
        userId: 'usr-001',
        workDate: '2026-08-07',
        clockInTime: '08:22:10',
        clockOutTime: '18:15:30',
        clockInLocation: '신한DS 죽전데이터센터',
        clockOutLocation: '신한DS 죽전데이터센터',
        status: 'NORMAL',
        totalWorkMinutes: 492,
        isManualCorrected: false
      }
    ];
  }

  getTodayLog(dateStr: string = '2026-08-16'): CommuteLog | undefined {
    return this.getCommuteLogs().find(l => l.workDate === dateStr);
  }

  clockIn(location: string = '신한DS 본사 (땡겨요 스마트오피스)'): CommuteLog {
    return {
      id: `log-${Date.now()}`,
      userId: 'usr-001',
      workDate: '2026-08-16',
      clockInTime: '09:00:00',
      clockInLocation: location,
      status: 'WORKING',
      totalWorkMinutes: 0,
      isManualCorrected: false
    };
  }

  clockOut(location: string = '신한DS 본사 (땡겨요 스마트오피스)'): CommuteLog {
    return {
      id: `log-${Date.now()}`,
      userId: 'usr-001',
      workDate: '2026-08-16',
      clockInTime: '09:00:00',
      clockOutTime: '18:00:00',
      clockOutLocation: location,
      status: 'NORMAL',
      totalWorkMinutes: 480,
      isManualCorrected: false
    };
  }

  addCommuteLog(type: '출근' | '퇴근', timeStr: string, location: string = '신한DS 본사'): void {
    if (type === '출근') {
      this.clockIn(location);
    } else {
      this.clockOut(location);
    }
  }



  getRequests(): AttendanceRequest[] {
    return this.getStorage<AttendanceRequest[]>(STORAGE_KEYS.REQUESTS, initialRequests);
  }

  addRequest(req: Omit<AttendanceRequest, 'id' | 'createdAt' | 'status' | 'userId' | 'userName' | 'partnerApproverName'>): AttendanceRequest {
    const requests = this.getRequests();
    const user = this.getCurrentUser();
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // 결재자는 원청이 아닌 '협력사 현장대리인'으로 강제 바인딩 (노란봉투법/파견법 방어)
    const newRequest: AttendanceRequest = {
      id: `req-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      partnerApproverName: '김협력 PM (협력사 현장대리인)',
      ...req,
      status: 'PENDING',
      createdAt: dateStr
    };

    requests.unshift(newRequest);
    this.setStorage(STORAGE_KEYS.REQUESTS, requests);
    return newRequest;
  }

  // 협력사 현장대리인의 독립적 결재 승인 처리
  approvePartnerRequest(requestId: string, memo: string = '현장대리인 검토 승인 완료'): void {
    const requests = this.getRequests();
    const target = requests.find(r => r.id === requestId);
    if (target) {
      target.status = 'APPROVED';
      target.approvalMemo = memo;
      this.setStorage(STORAGE_KEYS.REQUESTS, requests);
    }
  }

  // 협력사 현장대리인의 독립적 결재 반려 처리
  rejectPartnerRequest(requestId: string, memo: string): void {
    const requests = this.getRequests();
    const target = requests.find(r => r.id === requestId);
    if (target) {
      target.status = 'REJECTED';
      target.approvalMemo = memo;
      this.setStorage(STORAGE_KEYS.REQUESTS, requests);
    }
  }

  // 도급 계약 검수 목록 (원청 신한DS용)
  getInspections(): ServiceDeliveryInspection[] {
    return this.getStorage<ServiceDeliveryInspection[]>(STORAGE_KEYS.INSPECTIONS, initialInspections);
  }

  // 원청의 도급 검수 합격 처리 (공수 확인)
  acceptContractInspection(inspectionId: string, notes: string = '도급 검수 합격: 용역비 지급 승인'): void {
    const inspections = this.getInspections();
    const target = inspections.find(i => i.id === inspectionId);
    if (target) {
      const now = new Date();
      target.status = 'INSPECTED_ACCEPTED';
      target.inspectionNotes = notes;
      target.inspectedAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      this.setStorage(STORAGE_KEYS.INSPECTIONS, inspections);
    }
  }

  getWeeklyStats(): WeeklyWorkStat {
    return {
      weekRange: '08.10 ~ 08.16',
      regularMinutes: 0,
      overtimeMinutes: 0,
      totalMinutes: 2400,
      maxLegalMinutes: 3120,
      standardMinutes: 2400
    };
  }

  getThemeMode(): 'ddangyo' | 'shinhan' {
    return (localStorage.getItem(STORAGE_KEYS.THEME_MODE) as 'ddangyo' | 'shinhan') || 'ddangyo';
  }

  setThemeMode(mode: 'ddangyo' | 'shinhan'): void {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  }
}

export const dbService = new AttendanceDBService();
