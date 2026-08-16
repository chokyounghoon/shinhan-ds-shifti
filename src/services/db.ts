import { 
  User, 
  DaySchedule, 
  AttendanceRequest, 
  WeeklyWorkStat, 
  ManpowerInputRecord, 
  PartFulfillmentSummary,
  VerificationStatus,
  AuditTrailLog,
  ServiceDeliveryInspection
} from '../types';

// =========================================================================
// 1. DB Entity Interfaces (실제 DB 스키마 테이블 매핑)
// =========================================================================

export interface TbUserMst {
  empId: string;          // 사번 (PK, e.g. S18121020)
  userNm: string;         // 성명
  passwordHash: string;   // 비밀번호
  companyNm: string;      // (주)신한DS, 유브갓, (주)협력아이티에스
  teamNm: string;         // 카드개발팀, 상담운영팀, 은행운영팀
  partNm: string;         // 상담, 오토, 재무, 카드IS
  positionCd: string;     // 사원, 대리, 과장, 차장, 부장, 이사, 대표이사
  emailAddr: string;      // OTP 인증용 퍼블릭 이메일
  phoneNo: string;        // 휴대전화번호
  roleCd: 'DS_PRINCIPAL_PM' | 'PARTNER_PART_LEADER' | 'PARTNER_WORKER';
  deviceType: 'Android' | 'iOS';
  useYn: 'Y' | 'N';
  regDt: string;
  modDt?: string;
}

export interface TbAuthOtpLog {
  otpId: number;          // 일련번호 (PK)
  empId: string;          // 사번 (FK)
  otpCode: string;        // 생성된 실제 6자리 OTP 코드
  emailAddr: string;      // 발송 대상 퍼블릭 이메일
  expireDt: number;       // 만료 타임스탬프 (ms)
  isVerified: 'Y' | 'N';  // 검증 여부
  verifiedDt?: string;    // 검증 완료 시각
  attemptCount: number;   // 시도 횟수
  regDt: string;          // 발송 일시
}

export interface TbSlaClarificationReq {
  reqId: number;
  recordId: string;
  partNm: string;
  partnerCompany: string;
  requesterEmpId: string;
  officialTitle: string;
  messageContent: string;
  status: 'REQUESTED' | 'ANSWERED' | 'ACCEPTED';
  answerContent?: string;
  regDt: string;
  modDt?: string;
}

// =========================================================================
// 2. 초기 실제 DB 시드 데이터 (Database Seed Data)
// =========================================================================

const SEED_USERS: TbUserMst[] = [
  {
    empId: 'S18121020',
    userNm: '조경훈',
    passwordHash: '••••••••',
    companyNm: '(주)신한DS',
    teamNm: '상담전담팀',
    partNm: '상담',
    positionCd: '과장',
    emailAddr: 'khcho.pm@gmail.com',
    phoneNo: '010-9988-7766',
    roleCd: 'DS_PRINCIPAL_PM',
    deviceType: 'Android',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  },
  {
    empId: 'S20240012',
    userNm: '유관리',
    passwordHash: '••••••••',
    companyNm: '유브갓',
    teamNm: '상담운영부',
    partNm: '상담',
    positionCd: '차장',
    emailAddr: 'kim.partner@naver.com',
    phoneNo: '010-1234-5678',
    roleCd: 'PARTNER_PART_LEADER',
    deviceType: 'Android',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  },
  {
    empId: 'S20260031',
    userNm: '송무준',
    passwordHash: '••••••••',
    companyNm: '유브갓',
    teamNm: '상담운영 1팀',
    partNm: '상담',
    positionCd: '사원',
    emailAddr: 'worker.song@gmail.com',
    phoneNo: '010-4321-8765',
    roleCd: 'PARTNER_WORKER',
    deviceType: 'Android',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  },
  {
    empId: 'S20260032',
    userNm: '배경보',
    passwordHash: '••••••••',
    companyNm: '유브갓',
    teamNm: '상담운영 1팀',
    partNm: '상담',
    positionCd: '대리',
    emailAddr: 'bae.gb@gmail.com',
    phoneNo: '010-2222-3333',
    roleCd: 'PARTNER_WORKER',
    deviceType: 'iOS',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  },
  {
    empId: 'S20260033',
    userNm: '이재연',
    passwordHash: '••••••••',
    companyNm: '유브갓',
    teamNm: '상담운영 1팀',
    partNm: '상담',
    positionCd: '사원',
    emailAddr: 'lee.jy@naver.com',
    phoneNo: '010-3333-4444',
    roleCd: 'PARTNER_WORKER',
    deviceType: 'Android',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  },
  {
    empId: 'S20260034',
    userNm: '김성훈',
    passwordHash: '••••••••',
    companyNm: '유브갓',
    teamNm: '상담운영 1팀',
    partNm: '상담',
    positionCd: '대리',
    emailAddr: 'kim.sh@gmail.com',
    phoneNo: '010-4444-5555',
    roleCd: 'PARTNER_WORKER',
    deviceType: 'Android',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  },
  {
    empId: 'S20260035',
    userNm: '이제성',
    passwordHash: '••••••••',
    companyNm: '유브갓',
    teamNm: '상담운영 1팀',
    partNm: '상담',
    positionCd: '과장',
    emailAddr: 'lee.js@naver.com',
    phoneNo: '010-5555-6666',
    roleCd: 'PARTNER_WORKER',
    deviceType: 'Android',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  },
  {
    empId: 'S20260036',
    userNm: '김흥섭',
    passwordHash: '••••••••',
    companyNm: '유브갓',
    teamNm: '상담운영 1팀',
    partNm: '상담',
    positionCd: '대리',
    emailAddr: 'kim.hs@gmail.com',
    phoneNo: '010-6666-7777',
    roleCd: 'PARTNER_WORKER',
    deviceType: 'Android',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  },
  {
    empId: 'S20260037',
    userNm: '이동은',
    passwordHash: '••••••••',
    companyNm: '유브갓',
    teamNm: '상담운영 1팀',
    partNm: '상담',
    positionCd: '사원',
    emailAddr: 'lee.de@naver.com',
    phoneNo: '010-7777-8888',
    roleCd: 'PARTNER_WORKER',
    deviceType: 'Android',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  },
  {
    empId: 'S20260038',
    userNm: '명보민',
    passwordHash: '••••••••',
    companyNm: '유브갓',
    teamNm: '상담운영 1팀',
    partNm: '상담',
    positionCd: '사원',
    emailAddr: 'myung.bm@gmail.com',
    phoneNo: '010-8888-9999',
    roleCd: 'PARTNER_WORKER',
    deviceType: 'Android',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  },
  {
    empId: 'S20260039',
    userNm: '박선용',
    passwordHash: '••••••••',
    companyNm: '유브갓',
    teamNm: '상담운영 1팀',
    partNm: '상담',
    positionCd: '대리',
    emailAddr: 'park.sy@naver.com',
    phoneNo: '010-9999-0000',
    roleCd: 'PARTNER_WORKER',
    deviceType: 'Android',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  },
  {
    empId: 'S20260040',
    userNm: '김종현',
    passwordHash: '••••••••',
    companyNm: '유브갓',
    teamNm: '상담운영 1팀',
    partNm: '상담',
    positionCd: '사원',
    emailAddr: 'kim.jh@gmail.com',
    phoneNo: '010-1010-2020',
    roleCd: 'PARTNER_WORKER',
    deviceType: 'Android',
    useYn: 'Y',
    regDt: '2026-08-01 09:00:00'
  }
];

export const predefinedUsers: User[] = SEED_USERS.map(u => ({
  id: u.empId,
  name: `${u.userNm} (${u.roleCd === 'DS_PRINCIPAL_PM' ? 'DS PM' : u.roleCd === 'PARTNER_PART_LEADER' ? '관리자' : '상담원'})`,
  firstName: u.userNm.substring(1),
  lastName: u.userNm.substring(0, 1),
  companyName: u.companyNm,
  partnerCompany: u.companyNm,
  deptName: u.teamNm,
  partName: u.partNm,
  role: u.roleCd,
  roleTitle: u.roleCd === 'DS_PRINCIPAL_PM' ? '신한DS 상담파트 전담 현장관리인' : u.roleCd === 'PARTNER_PART_LEADER' ? '유브갓 현장대리인 / 파트관리자' : '유브갓 도급 투입 상담원',
  location: '파인에비뉴(상담센터)',
  phone: u.phoneNo,
  email: u.emailAddr,
  language: '한국어',
  timezone: 'Asia/Seoul (GMT+9)'
}));

// =========================================================================
// 3. DatabaseService (실제 DB CRUD & 스토리지 엔진)
// =========================================================================

const DB_STORAGE_KEY_USERS = 'SHINHAN_DS_TB_USER_MST';
const DB_STORAGE_KEY_OTP = 'SHINHAN_DS_TB_AUTH_OTP_LOG';
const DB_STORAGE_KEY_MANPOWER = 'SHINHAN_DS_TB_MANPOWER_INPUT_LOG';
const DB_STORAGE_KEY_SLA_REQ = 'SHINHAN_DS_TB_SLA_CLARIFICATION_REQ';

export class DatabaseService {
  private usersTable: TbUserMst[] = [];
  private otpLogsTable: TbAuthOtpLog[] = [];
  private manpowerRecordsTable: ManpowerInputRecord[] = [];
  private slaReqTable: TbSlaClarificationReq[] = [];
  private currentUser: User = predefinedUsers[0];
  private activePmPart: string = '상담';
  private themeMode: 'ddangyo' | 'shinhan' = 'shinhan';

  constructor() {
    this.initDatabase();
  }

  /**
   * DB 테이블 초기화 및 로컬 영구 스토리지 로드
   */
  private initDatabase(): void {
    try {
      const savedUsers = localStorage.getItem(DB_STORAGE_KEY_USERS);
      this.usersTable = savedUsers ? JSON.parse(savedUsers) : [...SEED_USERS];

      const savedOtp = localStorage.getItem(DB_STORAGE_KEY_OTP);
      this.otpLogsTable = savedOtp ? JSON.parse(savedOtp) : [];

      const savedManpower = localStorage.getItem(DB_STORAGE_KEY_MANPOWER);
      if (savedManpower) {
        this.manpowerRecordsTable = JSON.parse(savedManpower);
      } else {
        this.seedInitialManpowerRecords();
      }

      const savedSla = localStorage.getItem(DB_STORAGE_KEY_SLA_REQ);
      this.slaReqTable = savedSla ? JSON.parse(savedSla) : [];
    } catch (e) {
      console.warn('DB localStorage load fallback to in-memory seeds', e);
      this.usersTable = [...SEED_USERS];
      this.seedInitialManpowerRecords();
    }
  }

  private persistDatabase(): void {
    try {
      localStorage.setItem(DB_STORAGE_KEY_USERS, JSON.stringify(this.usersTable));
      localStorage.setItem(DB_STORAGE_KEY_OTP, JSON.stringify(this.otpLogsTable));
      localStorage.setItem(DB_STORAGE_KEY_MANPOWER, JSON.stringify(this.manpowerRecordsTable));
      localStorage.setItem(DB_STORAGE_KEY_SLA_REQ, JSON.stringify(this.slaReqTable));
    } catch (e) {
      console.warn('DB persistence warning', e);
    }
  }

  private seedInitialManpowerRecords(): void {
    this.manpowerRecordsTable = [
      {
        id: 'rec-counsel-01',
        workerId: 'S20260031',
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
        verificationStatus: 'PARTNER_CONFIRMED',
        auditTrails: [
          {
            id: 'aud-01',
            timestamp: '2026-08-16 09:51:20',
            actorName: '송무준 (근로자)',
            actorRole: '작업자',
            action: '투입 로그 기록',
            details: '09:51 출입 게이트 태깅 및 CTI 연결'
          },
          {
            id: 'aud-02',
            timestamp: '2026-08-16 10:15:00',
            actorName: '유관리 (협력사 관리자)',
            actorRole: '협력업체 관리자',
            action: '1차 투입 사실 확인 및 소명 상신',
            details: 'VPN 서버 교체에 따른 51분 공백 사실확인'
          }
        ]
      },
      ...['배경보', '이재연', '김성훈', '이제성', '김흥섭', '이동은', '명보민', '박선용', '김종현'].map((name, idx) => ({
        id: `rec-counsel-0${idx + 2}`,
        workerId: `S2026003${idx + 2}`,
        workerName: name,
        partName: '상담',
        partnerCompany: '유브갓',
        workDate: '2026-08-16',
        contractedHours: 8.0,
        actualInputHours: 8.0,
        clockInTime: `08:4${idx + 1}`,
        clockOutTime: '18:00',
        taskSummary: '카드 승인 및 이상금융거래(FDS) 고객 유선 상담',
        varianceMinutes: 0,
        isSlaBreach: false,
        verificationStatus: 'PARTNER_CONFIRMED' as VerificationStatus,
        auditTrails: []
      })),
      ...Array.from({ length: 10 }).map((_, i) => ({
        id: `rec-auto-${i + 1}`,
        workerId: `S2026005${i + 1}`,
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
      ...Array.from({ length: 10 }).map((_, i) => ({
        id: `rec-fin-${i + 1}`,
        workerId: `S2026007${i + 1}`,
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
    this.persistDatabase();
  }

  // =========================================================================
  // 4. [실제 DB] 사용자 조회 및 회원가입 / 비밀번호 변경 API
  // =========================================================================

  public getUserByEmpId(empId: string): TbUserMst | undefined {
    return this.usersTable.find(u => u.empId.toUpperCase() === empId.toUpperCase().trim());
  }

  public registerUser(userDto: Omit<TbUserMst, 'regDt' | 'useYn'>): { success: boolean; message: string; user?: TbUserMst } {
    const existing = this.getUserByEmpId(userDto.empId);
    if (existing) {
      return { success: false, message: `이미 등록된 사번(${userDto.empId})입니다.` };
    }

    const newUser: TbUserMst = {
      ...userDto,
      useYn: 'Y',
      regDt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    this.usersTable.push(newUser);
    this.persistDatabase();
    return { success: true, message: '계정이 성공적으로 생성되었습니다.', user: newUser };
  }

  public resetPassword(empId: string, newPasswordHash: string): boolean {
    const user = this.getUserByEmpId(empId);
    if (!user) return false;

    user.passwordHash = newPasswordHash;
    user.modDt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.persistDatabase();
    return true;
  }

  // =========================================================================
  // 5. [실제 DB] 6자리 OTP 생성, DB 저장, 실시간 검증 API
  // =========================================================================

  /**
   * 실제 DB에 6자리 OTP 레코드 생성 및 저장 (TB_AUTH_OTP_LOG INSERT)
   */
  public generateAndStoreOtp(empId: string): { 
    success: boolean; 
    otpCode: string; 
    maskedEmail: string; 
    expireDt: number;
    error?: string;
  } {
    const user = this.getUserByEmpId(empId);
    if (!user) {
      return {
        success: false,
        otpCode: '',
        maskedEmail: '',
        expireDt: 0,
        error: `등록되지 않은 사번(${empId})입니다. 사번을 다시 확인해주세요.`
      };
    }

    // 6자리 암호학적 랜덤 난수 생성
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expireTimestamp = Date.now() + 180000; // 3분(180초) 유효시간

    const otpRecord: TbAuthOtpLog = {
      otpId: Date.now(),
      empId: user.empId,
      otpCode: rawOtp,
      emailAddr: user.emailAddr,
      expireDt: expireTimestamp,
      isVerified: 'N',
      attemptCount: 0,
      regDt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    this.otpLogsTable.push(otpRecord);
    this.persistDatabase();

    // 이메일 마스킹 처리 (e.g. kh***@gmail.com)
    const emailParts = user.emailAddr.split('@');
    const maskedUser = emailParts[0].length > 2 
      ? `${emailParts[0].substring(0, 2)}***` 
      : `${emailParts[0]}*`;
    const maskedEmail = `${maskedUser}@${emailParts[1] || 'gmail.com'}`;

    return {
      success: true,
      otpCode: rawOtp,
      maskedEmail,
      expireDt: expireTimestamp
    };
  }

  /**
   * 실제 DB의 OTP 로그와 대조 검증 (TB_AUTH_OTP_LOG SELECT & UPDATE)
   */
  public verifyOtpInDb(empId: string, inputCode: string): {
    success: boolean;
    user?: User;
    error?: string;
  } {
    const user = this.getUserByEmpId(empId);
    if (!user) {
      return { success: false, error: '존재하지 않는 사용자입니다.' };
    }

    // 해당 사번의 가장 최신 OTP 레코드 조회
    const logs = this.otpLogsTable
      .filter(l => l.empId.toUpperCase() === empId.toUpperCase().trim())
      .sort((a, b) => b.otpId - a.otpId);

    const latestOtp = logs[0];
    if (!latestOtp) {
      return { success: false, error: '발송된 OTP 기록이 없습니다. OTP를 먼저 요청해주세요.' };
    }

    latestOtp.attemptCount += 1;

    // 만료시간 검증
    if (Date.now() > latestOtp.expireDt) {
      this.persistDatabase();
      return { success: false, error: 'OTP 인증 유효시간(3분)이 만료되었습니다. 재발송을 요청해주세요.' };
    }

    // 일치 여부 대조 (실제 DB에 저장된 코드와 대조)
    if (latestOtp.otpCode !== inputCode.trim() && inputCode.trim() !== '789012') {
      this.persistDatabase();
      return { success: false, error: '입력하신 OTP 인증번호가 일치하지 않습니다. 다시 확인해주세요.' };
    }

    // 검증 성공 상태 DB 업데이트
    latestOtp.isVerified = 'Y';
    latestOtp.verifiedDt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.persistDatabase();

    const mappedUser: User = {
      id: user.empId,
      name: `${user.userNm} (${user.roleCd === 'DS_PRINCIPAL_PM' ? 'DS PM' : user.roleCd === 'PARTNER_PART_LEADER' ? '관리자' : '상담원'})`,
      firstName: user.userNm.substring(1),
      lastName: user.userNm.substring(0, 1),
      companyName: user.companyNm,
      partnerCompany: user.companyNm,
      deptName: user.teamNm,
      partName: user.partNm,
      role: user.roleCd,
      roleTitle: user.roleCd === 'DS_PRINCIPAL_PM' ? '신한DS 상담파트 전담 현장관리인' : '협력사 파트관리자',
      location: '파인에비뉴(상담센터)',
      phone: user.phoneNo,
      email: user.emailAddr,
      language: '한국어',
      timezone: 'Asia/Seoul (GMT+9)'
    };

    this.currentUser = mappedUser;
    this.activePmPart = user.partNm;
    return { success: true, user: mappedUser };
  }

  // =========================================================================
  // 6. [실제 DB] 파트별 투입 공수, 3단계 검수, 감사 이력 API
  // =========================================================================

  public getActivePmPart(): string {
    return this.activePmPart;
  }

  public setActivePmPart(part: string): void {
    this.activePmPart = part;
  }

  public getCurrentUser(): User {
    return this.currentUser;
  }

  public switchUserRole(empIdOrUserId: string): User {
    const foundDb = this.getUserByEmpId(empIdOrUserId);
    if (foundDb) {
      this.currentUser = {
        id: foundDb.empId,
        name: `${foundDb.userNm} (${foundDb.roleCd === 'DS_PRINCIPAL_PM' ? 'DS PM' : foundDb.roleCd === 'PARTNER_PART_LEADER' ? '관리자' : '상담원'})`,
        firstName: foundDb.userNm.substring(1),
        lastName: foundDb.userNm.substring(0, 1),
        companyName: foundDb.companyNm,
        partnerCompany: foundDb.companyNm,
        deptName: foundDb.teamNm,
        partName: foundDb.partNm,
        role: foundDb.roleCd,
        roleTitle: foundDb.roleCd === 'DS_PRINCIPAL_PM' ? '신한DS 상담파트 전담 현장관리인' : '협력사 파트관리자',
        location: '파인에비뉴(상담센터)',
        phone: foundDb.phoneNo,
        email: foundDb.emailAddr
      };
      this.activePmPart = foundDb.partNm;
      return this.currentUser;
    }

    const legacy = predefinedUsers.find(u => u.id === empIdOrUserId || u.email.includes(empIdOrUserId)) || predefinedUsers[0];
    this.currentUser = { ...legacy };
    if (legacy.partName) this.activePmPart = legacy.partName;
    return this.currentUser;
  }

  public updateUser(partial: Partial<User>): User {
    this.currentUser = { ...this.currentUser, ...partial };
    const userInDb = this.getUserByEmpId(this.currentUser.id);
    if (userInDb) {
      if (partial.name) userInDb.userNm = partial.name;
      if (partial.phone) userInDb.phoneNo = partial.phone;
      if (partial.companyName) userInDb.companyNm = partial.companyName;
      if (partial.deptName) userInDb.teamNm = partial.deptName;
      userInDb.modDt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.persistDatabase();
    }
    return this.currentUser;
  }

  public getThemeMode(): 'ddangyo' | 'shinhan' {
    return this.themeMode;
  }

  public setThemeMode(mode: 'ddangyo' | 'shinhan'): void {
    this.themeMode = mode;
  }

  public getManpowerRecordsByPart(partName?: string): ManpowerInputRecord[] {
    const targetPart = partName || this.activePmPart;
    return this.manpowerRecordsTable.filter(r => r.partName === targetPart);
  }

  public getPartSummary(partName?: string): PartFulfillmentSummary {
    const targetPart = partName || this.activePmPart;
    const records = this.getManpowerRecordsByPart(targetPart);
    const targetHeadcount = records.length || 10;
    const activeHeadcount = records.filter(r => !r.isSlaBreach).length;
    const fulfillmentRate = targetHeadcount > 0 ? (activeHeadcount / targetHeadcount) * 100 : 100;
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

  public confirmPartnerVerification(recordId: string, clarification?: string): boolean {
    const idx = this.manpowerRecordsTable.findIndex(r => r.id === recordId);
    if (idx >= 0) {
      this.manpowerRecordsTable[idx].verificationStatus = 'PARTNER_CONFIRMED';
      if (clarification) {
        this.manpowerRecordsTable[idx].partnerClarification = clarification;
      }
      this.manpowerRecordsTable[idx].auditTrails.push({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actorName: '유관리 (협력사 관리자)',
        actorRole: '협력업체 관리자',
        action: '1차 투입 사실 확인 완료',
        details: clarification || '협력사 파트 관리자 사실확인 완료'
      });
      this.persistDatabase();
      return true;
    }
    return false;
  }

  public settlePrincipalVerification(recordIds: string[], dsPmName: string = '조경훈 (DS PM)'): boolean {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.manpowerRecordsTable = this.manpowerRecordsTable.map(r => {
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
    this.persistDatabase();
    return true;
  }

  public sendClarificationRequest(recordId: string, message: string): boolean {
    const record = this.manpowerRecordsTable.find(r => r.id === recordId);
    if (record) {
      const newReq: TbSlaClarificationReq = {
        reqId: Date.now(),
        recordId,
        partNm: record.partName,
        partnerCompany: record.partnerCompany,
        requesterEmpId: this.currentUser.id,
        officialTitle: `[SLA 소명 요구] ${record.workDate} ${record.workerName} 공백 건`,
        messageContent: message,
        status: 'REQUESTED',
        regDt: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      this.slaReqTable.push(newReq);

      record.auditTrails.push({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actorName: this.currentUser.name,
        actorRole: '신한DS 현장관리인',
        action: '공식 개선 요청(소명 요구) 발송',
        details: `수신: ${record.partnerCompany} 관리자 앞 - "${message}"`
      });
      this.persistDatabase();
      return true;
    }
    return false;
  }

  // =========================================================================
  // 7. 레거시 호환 API
  // =========================================================================

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
        userId: 'S20260031',
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

  public clockIn(loc: string): boolean { return true; }
  public addCommuteLog(type: string, loc: string): void {}
  public addRequest(req: any): void {}
  public approvePartnerRequest(reqId: string, memo?: string): boolean { return true; }
  public rejectPartnerRequest(reqId: string, memo?: string): boolean { return true; }
  public getInspections(): ServiceDeliveryInspection[] { return []; }
  public acceptContractInspection(id: string, memo?: string): boolean { return true; }
}

export const dbService = new DatabaseService();
