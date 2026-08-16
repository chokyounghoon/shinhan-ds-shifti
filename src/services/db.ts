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
// 1. s_guard_AI 표준 테이블 스키마 엔티티 정의 (Pure DB Entities)
// =========================================================================

export interface DbOrganization {
  id: number;
  name: string;
  code: string;
  parentId: number | null;
  depth: number;
  sortOrder: number;
  regId: string;
  regDt: string;
  modId?: string;
  modDt?: string;
}

export interface DbUser {
  employeeId: string;        // 사번 (PK, e.g. S18121020)
  email: string;             // OTP 인증용 퍼블릭 이메일
  name: string;              // 성명
  passwordHash: string;      // 비밀번호 해시
  role: 'DS_PRINCIPAL_PM' | 'PARTNER_PART_LEADER' | 'PARTNER_WORKER';
  authProvider: string;
  company: string;           // 소속사
  phone: string;             // 휴대전화번호
  team: string;              // 팀
  part: string;              // 파트
  position: string;          // 직책 (사원, 대리, 과장, 차장, 부장, 이사, 대표이사)
  status: 'PRE_REGISTERED' | 'ACTIVE' | 'SUSPENDED';
  failedAttempts: number;
  lastLoginAt?: string;
  createdAt: string;
  isActive: boolean;
  isAdmin: number;
  deviceType: 'Android' | 'iOS';
  regId: string;
  regDt: string;
  modId?: string;
  modDt?: string;
}

export interface DbOtpVerification {
  id: number;
  employeeId: string;
  email: string;
  otpCode: string;
  expiresAt: number;         // 만료 타임스탬프 (ms)
  isVerified: boolean;
  verifiedAt?: string;
  attempts: number;
  ipAddress: string;
  regId: string;
  regDt: string;
}

export interface DbLoginHistory {
  id: number;
  userId: string;
  email?: string;
  ipAddress: string;
  userAgent: string;
  status: 'SUCCESS' | 'FAILED';
  loginTime: string;
}

export interface DbManpowerInput {
  recordId: string;
  employeeId: string;
  workerName: string;
  partName: string;
  partnerCompany: string;
  workDate: string;
  contractedHours: number;
  actualInputHours: number;
  clockInTime: string;
  clockOutTime: string;
  taskSummary: string;
  varianceMinutes: number;
  isSlaBreach: boolean;
  gapReason?: string;
  partnerClarification?: string;
  verificationStatus: VerificationStatus;
  regId: string;
  regDt: string;
  modId?: string;
  modDt?: string;
}

export interface DbAuditTrail {
  id: number;
  recordId: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface DbSlaClarification {
  id: number;
  recordId: string;
  partName: string;
  partnerCompany: string;
  requesterId: string;
  officialTitle: string;
  messageContent: string;
  status: 'REQUESTED' | 'ANSWERED' | 'ACCEPTED';
  answerContent?: string;
  createdAt: string;
}

// =========================================================================
// 2. Pure Database Engine (샘플 데이터 0개, 100% 순수 DB 기반 영구 스토리지)
// =========================================================================

const DB_KEY_ORGANIZATIONS = 'SGUARD_DB_ORGANIZATIONS_V2';
const DB_KEY_USERS = 'SGUARD_DB_USERS_V2';
const DB_KEY_OTP = 'SGUARD_DB_OTP_VERIFICATIONS_V2';
const DB_KEY_LOGIN_HIST = 'SGUARD_DB_LOGIN_HISTORY_V2';
const DB_KEY_MANPOWER = 'SGUARD_DB_MANPOWER_INPUTS_V2';
const DB_KEY_AUDIT = 'SGUARD_DB_AUDIT_TRAILS_V2';
const DB_KEY_SLA = 'SGUARD_DB_SLA_CLARIFICATIONS_V2';

export class PureDatabaseEngine {
  private organizations: DbOrganization[] = [];
  private users: DbUser[] = [];
  private otpVerifications: DbOtpVerification[] = [];
  private loginHistories: DbLoginHistory[] = [];
  private manpowerInputs: DbManpowerInput[] = [];
  private auditTrails: DbAuditTrail[] = [];
  private slaClarifications: DbSlaClarification[] = [];

  private currentUser: User | null = null;
  private activePmPart: string = '상담';
  private themeMode: 'ddangyo' | 'shinhan' = 'shinhan';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * 로컬 영구 스토리지(DB)로부터 테이블 데이터 로드
   */
  private loadFromStorage(): void {
    try {
      this.organizations = JSON.parse(localStorage.getItem(DB_KEY_ORGANIZATIONS) || '[]');
      this.users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '[]');
      this.otpVerifications = JSON.parse(localStorage.getItem(DB_KEY_OTP) || '[]');
      this.loginHistories = JSON.parse(localStorage.getItem(DB_KEY_LOGIN_HIST) || '[]');
      this.manpowerInputs = JSON.parse(localStorage.getItem(DB_KEY_MANPOWER) || '[]');
      this.auditTrails = JSON.parse(localStorage.getItem(DB_KEY_AUDIT) || '[]');
      this.slaClarifications = JSON.parse(localStorage.getItem(DB_KEY_SLA) || '[]');
    } catch (e) {
      console.warn('Database load warning', e);
      this.clearAll();
    }
  }

  /**
   * DB 변경사항을 영구 스토리지에 동기화
   */
  private sync(): void {
    try {
      localStorage.setItem(DB_KEY_ORGANIZATIONS, JSON.stringify(this.organizations));
      localStorage.setItem(DB_KEY_USERS, JSON.stringify(this.users));
      localStorage.setItem(DB_KEY_OTP, JSON.stringify(this.otpVerifications));
      localStorage.setItem(DB_KEY_LOGIN_HIST, JSON.stringify(this.loginHistories));
      localStorage.setItem(DB_KEY_MANPOWER, JSON.stringify(this.manpowerInputs));
      localStorage.setItem(DB_KEY_AUDIT, JSON.stringify(this.auditTrails));
      localStorage.setItem(DB_KEY_SLA, JSON.stringify(this.slaClarifications));
    } catch (e) {
      console.error('Database sync error', e);
    }
  }

  /**
   * DB 완전 초기화 (필요시)
   */
  public clearAll(): void {
    this.organizations = [];
    this.users = [];
    this.otpVerifications = [];
    this.loginHistories = [];
    this.manpowerInputs = [];
    this.auditTrails = [];
    this.slaClarifications = [];
    this.currentUser = null;
    this.sync();
  }

  // =========================================================================
  // 3. User & Auth Database Operations
  // =========================================================================

  public findUserByEmpId(empId: string): DbUser | undefined {
    return this.users.find(u => u.employeeId.toUpperCase() === empId.toUpperCase().trim());
  }

  public findUserByEmail(email: string): DbUser | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public insertUser(userDto: Omit<DbUser, 'createdAt' | 'isActive' | 'isAdmin' | 'failedAttempts' | 'regId' | 'regDt'>): {
    success: boolean;
    message: string;
    user?: DbUser;
  } {
    const existingEmp = this.findUserByEmpId(userDto.employeeId);
    if (existingEmp) {
      return { success: false, message: `이미 등록된 사번(${userDto.employeeId})입니다.` };
    }

    const existingEmail = this.findUserByEmail(userDto.email);
    if (existingEmail) {
      return { success: false, message: `이미 등록된 이메일(${userDto.email})입니다.` };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newUser: DbUser = {
      ...userDto,
      createdAt: nowStr,
      isActive: true,
      isAdmin: userDto.role === 'DS_PRINCIPAL_PM' ? 1 : 0,
      failedAttempts: 0,
      regId: userDto.employeeId,
      regDt: nowStr
    };

    this.users.push(newUser);
    this.sync();
    return { success: true, message: '사용자 계정이 DB에 성공적으로 등록되었습니다.', user: newUser };
  }

  public updatePassword(empId: string, newPasswordHash: string): boolean {
    const user = this.findUserByEmpId(empId);
    if (!user) return false;

    user.passwordHash = newPasswordHash;
    user.modDt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.sync();
    return true;
  }

  public recordLogin(empId: string, status: 'SUCCESS' | 'FAILED'): void {
    const user = this.findUserByEmpId(empId);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (user && status === 'SUCCESS') {
      user.lastLoginAt = nowStr;
      user.failedAttempts = 0;
    } else if (user && status === 'FAILED') {
      user.failedAttempts += 1;
    }

    this.loginHistories.push({
      id: Date.now(),
      userId: empId,
      email: user?.email,
      ipAddress: '127.0.0.1',
      userAgent: navigator.userAgent,
      status,
      loginTime: nowStr
    });
    this.sync();
  }

  // =========================================================================
  // 4. OTP Verification Database Operations
  // =========================================================================

  public createOtp(empId: string): {
    success: boolean;
    otpCode: string;
    maskedEmail: string;
    expiresAt: number;
    error?: string;
  } {
    const user = this.findUserByEmpId(empId);
    if (!user) {
      return {
        success: false,
        otpCode: '',
        maskedEmail: '',
        expiresAt: 0,
        error: `DB에 등록되지 않은 사번(${empId})입니다. 먼저 회원가입을 진행해 주세요.`
      };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 180000; // 3분
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const otpEntity: DbOtpVerification = {
      id: Date.now(),
      employeeId: user.employeeId,
      email: user.email,
      otpCode: code,
      expiresAt,
      isVerified: false,
      attempts: 0,
      ipAddress: '127.0.0.1',
      regId: user.employeeId,
      regDt: nowStr
    };

    this.otpVerifications.push(otpEntity);
    this.sync();

    // 이메일 마스킹
    const parts = user.email.split('@');
    const maskedUser = parts[0].length > 2 
      ? `${parts[0].substring(0, 2)}***` 
      : `${parts[0]}*`;
    const maskedEmail = `${maskedUser}@${parts[1] || 'gmail.com'}`;

    return {
      success: true,
      otpCode: code,
      maskedEmail,
      expiresAt
    };
  }

  public verifyOtp(empId: string, inputOtp: string): {
    success: boolean;
    user?: User;
    error?: string;
  } {
    const user = this.findUserByEmpId(empId);
    if (!user) return { success: false, error: '존재하지 않는 사용자입니다.' };

    const records = this.otpVerifications
      .filter(o => o.employeeId.toUpperCase() === empId.toUpperCase().trim())
      .sort((a, b) => b.id - a.id);

    const latest = records[0];
    if (!latest) {
      return { success: false, error: '발송된 OTP 기록이 DB에 없습니다. OTP를 먼저 요청하세요.' };
    }

    latest.attempts += 1;

    if (Date.now() > latest.expiresAt) {
      this.sync();
      return { success: false, error: 'OTP 인증 유효시간(3분)이 만료되었습니다. 재발송을 요청해주세요.' };
    }

    if (latest.otpCode !== inputOtp.trim()) {
      this.sync();
      return { success: false, error: '입력하신 OTP 인증번호가 DB에 저장된 코드와 일치하지 않습니다.' };
    }

    latest.isVerified = true;
    latest.verifiedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.sync();

    const mappedUser: User = {
      id: user.employeeId,
      name: `${user.name} (${user.role === 'DS_PRINCIPAL_PM' ? 'DS PM' : user.role === 'PARTNER_PART_LEADER' ? '관리자' : '상담원'})`,
      firstName: user.name.substring(1),
      lastName: user.name.substring(0, 1),
      companyName: user.company,
      partnerCompany: user.company,
      deptName: user.team,
      partName: user.part,
      role: user.role,
      roleTitle: user.role === 'DS_PRINCIPAL_PM' ? '신한DS 파트 전담 현장관리인' : '협력사 파트관리자',
      location: '파인에비뉴(상담센터)',
      phone: user.phone,
      email: user.email,
      language: '한국어',
      timezone: 'Asia/Seoul (GMT+9)'
    };

    this.currentUser = mappedUser;
    this.activePmPart = user.part;
    this.recordLogin(empId, 'SUCCESS');
    return { success: true, user: mappedUser };
  }

  // =========================================================================
  // 5. Manpower Inputs & Audit Trails Database Operations
  // =========================================================================

  public insertManpowerRecord(recordDto: Omit<DbManpowerInput, 'regDt' | 'regId'>): {
    success: boolean;
    record?: ManpowerInputRecord;
  } {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newRecord: DbManpowerInput = {
      ...recordDto,
      regId: this.currentUser?.id || 'SYSTEM',
      regDt: nowStr
    };

    this.manpowerInputs.push(newRecord);

    // 감사 로그 자동 생성
    this.auditTrails.push({
      id: Date.now(),
      recordId: newRecord.recordId,
      actorId: this.currentUser?.id || 'SYSTEM',
      actorName: this.currentUser?.name || '시스템',
      actorRole: this.currentUser?.roleTitle || '등록자',
      action: '일일 도급 투입 실적 등록',
      details: `${newRecord.workDate} 실투입 ${newRecord.actualInputHours}h (${newRecord.clockInTime} ~ ${newRecord.clockOutTime}) 등록`,
      createdAt: nowStr
    });

    this.sync();
    return { success: true, record: this.mapToManpowerRecord(newRecord) };
  }

  public getManpowerRecordsByPart(partName?: string): ManpowerInputRecord[] {
    const targetPart = partName || this.activePmPart;
    const dbRows = this.manpowerInputs.filter(r => r.partName === targetPart);
    return dbRows.map(r => this.mapToManpowerRecord(r));
  }

  public getPartSummary(partName?: string): PartFulfillmentSummary {
    const targetPart = partName || this.activePmPart;
    const records = this.getManpowerRecordsByPart(targetPart);
    const targetHeadcount = records.length;
    const activeHeadcount = records.filter(r => !r.isSlaBreach).length;
    const fulfillmentRate = targetHeadcount > 0 ? (activeHeadcount / targetHeadcount) * 100 : 0;
    const breachCount = records.filter(r => r.isSlaBreach).length;

    return {
      partId: `part-${targetPart}`,
      partName: targetPart,
      partnerCompany: records[0]?.partnerCompany || (targetPart === '상담' ? '유브갓' : targetPart === '오토' ? '오토시스' : '파이낸스ITS'),
      leaderName: '현장 파트 관리자',
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
    const record = this.manpowerInputs.find(r => r.recordId === recordId);
    if (!record) return false;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    record.verificationStatus = 'PARTNER_CONFIRMED';
    if (clarification) record.partnerClarification = clarification;
    record.modDt = nowStr;

    this.auditTrails.push({
      id: Date.now(),
      recordId,
      actorId: this.currentUser?.id || 'PARTNER_ADMIN',
      actorName: this.currentUser?.name || '협력업체 관리자',
      actorRole: '협력업체 관리자',
      action: '1차 투입 사실 확인 완료',
      details: clarification || '협력사 파트 관리자 1차 사실확인 완료',
      createdAt: nowStr
    });

    this.sync();
    return true;
  }

  public settlePrincipalVerification(recordIds: string[], dsPmName: string = '신한DS 현장관리인'): boolean {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.manpowerInputs = this.manpowerInputs.map(r => {
      if (recordIds.includes(r.recordId)) {
        r.verificationStatus = 'SETTLED';
        r.modDt = nowStr;

        this.auditTrails.push({
          id: Date.now() + Math.floor(Math.random() * 1000),
          recordId: r.recordId,
          actorId: this.currentUser?.id || 'DS_PM',
          actorName: dsPmName,
          actorRole: '신한DS 현장관리인 (PM)',
          action: '일일 투입 공수 검수 완료 (정산 확정)',
          details: '도급 계약 기준 투입 공수 및 SLA 검수 완료 (도급비 정산 확정 자료 반영)',
          createdAt: nowStr
        });
      }
      return r;
    });

    this.sync();
    return true;
  }

  public sendClarificationRequest(recordId: string, message: string): boolean {
    const record = this.manpowerInputs.find(r => r.recordId === recordId);
    if (!record) return false;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    this.slaClarifications.push({
      id: Date.now(),
      recordId,
      partName: record.partName,
      partnerCompany: record.partnerCompany,
      requesterId: this.currentUser?.id || 'DS_PM',
      officialTitle: `[SLA 소명 요구] ${record.workDate} ${record.workerName} 공백 건`,
      messageContent: message,
      status: 'REQUESTED',
      createdAt: nowStr
    });

    this.auditTrails.push({
      id: Date.now(),
      recordId,
      actorId: this.currentUser?.id || 'DS_PM',
      actorName: this.currentUser?.name || '신한DS 현장관리인',
      actorRole: '신한DS 현장관리인',
      action: '공식 개선 요청(소명 요구) 발송',
      details: `수신: ${record.partnerCompany} 관리자 앞 - "${message}"`,
      createdAt: nowStr
    });

    this.sync();
    return true;
  }

  private mapToManpowerRecord(dbRow: DbManpowerInput): ManpowerInputRecord {
    const trails = this.auditTrails
      .filter(a => a.recordId === dbRow.recordId)
      .map(a => ({
        id: `aud-${a.id}`,
        timestamp: a.createdAt,
        actorName: a.actorName,
        actorRole: a.actorRole,
        action: a.action,
        details: a.details
      }));

    return {
      id: dbRow.recordId,
      workerId: dbRow.employeeId,
      workerName: dbRow.workerName,
      partName: dbRow.partName,
      partnerCompany: dbRow.partnerCompany,
      workDate: dbRow.workDate,
      contractedHours: dbRow.contractedHours,
      actualInputHours: dbRow.actualInputHours,
      clockInTime: dbRow.clockInTime,
      clockOutTime: dbRow.clockOutTime,
      taskSummary: dbRow.taskSummary,
      varianceMinutes: dbRow.varianceMinutes,
      isSlaBreach: dbRow.isSlaBreach,
      gapReason: dbRow.gapReason,
      partnerClarification: dbRow.partnerClarification,
      verificationStatus: dbRow.verificationStatus,
      auditTrails: trails
    };
  }

  // =========================================================================
  // 6. State & Environment Accessors
  // =========================================================================

  public getCurrentUser(): User {
    if (this.currentUser) return this.currentUser;

    // Fallback if not logged in yet
    return {
      id: 'GUEST',
      name: '로그인 필요',
      companyName: '신한DS',
      deptName: '상담팀',
      partName: '상담',
      role: 'PARTNER_WORKER',
      location: '파인에비뉴',
      phone: '',
      email: ''
    };
  }

  public setCurrentUser(user: User): void {
    this.currentUser = user;
    if (user.partName) this.activePmPart = user.partName;
  }

  public switchUserRole(empId: string): User {
    const dbUser = this.findUserByEmpId(empId);
    if (dbUser) {
      this.currentUser = {
        id: dbUser.employeeId,
        name: `${dbUser.name} (${dbUser.role === 'DS_PRINCIPAL_PM' ? 'DS PM' : dbUser.role === 'PARTNER_PART_LEADER' ? '관리자' : '상담원'})`,
        firstName: dbUser.name.substring(1),
        lastName: dbUser.name.substring(0, 1),
        companyName: dbUser.company,
        partnerCompany: dbUser.company,
        deptName: dbUser.team,
        partName: dbUser.part,
        role: dbUser.role,
        roleTitle: dbUser.role === 'DS_PRINCIPAL_PM' ? '신한DS 상담파트 전담 현장관리인' : '협력사 파트관리자',
        location: '파인에비뉴(상담센터)',
        phone: dbUser.phone,
        email: dbUser.email
      };
      this.activePmPart = dbUser.part;
      return this.currentUser;
    }
    return this.getCurrentUser();
  }

  public getActivePmPart(): string { return this.activePmPart; }
  public setActivePmPart(part: string): void { this.activePmPart = part; }
  public getThemeMode(): 'ddangyo' | 'shinhan' { return this.themeMode; }
  public setThemeMode(mode: 'ddangyo' | 'shinhan'): void { this.themeMode = mode; }

  // Legacy compat
  public getWeeklySchedules(): DaySchedule[] { return []; }
  public getRequests(): AttendanceRequest[] { return []; }
  public getWeeklyStats(): WeeklyWorkStat {
    return {
      approvedHours: 0,
      totalCapHours: 52,
      workedDays: 0,
      totalDays: 0,
      remainingHours: 52,
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
  public updateUser(partial: Partial<User>): User {
    if (this.currentUser) {
      this.currentUser = { ...this.currentUser, ...partial };
      const u = this.findUserByEmpId(this.currentUser.id);
      if (u) {
        if (partial.name) u.name = partial.name;
        if (partial.phone) u.phone = partial.phone;
        this.sync();
      }
    }
    return this.getCurrentUser();
  }

  // Alias methods for compatibility
  public getUserByEmpId(empId: string) { return this.findUserByEmpId(empId); }
  public registerUser(dto: any) { return this.insertUser(dto); }
  public resetPassword(empId: string, pw: string) { return this.updatePassword(empId, pw); }
  public generateAndStoreOtp(empId: string) { return this.createOtp(empId); }
  public verifyOtpInDb(empId: string, otp: string) { return this.verifyOtp(empId, otp); }
}

export const dbService = new PureDatabaseEngine();
export const predefinedUsers: User[] = [];
