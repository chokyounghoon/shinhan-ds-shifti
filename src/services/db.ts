import { 
  User, 
  DaySchedule, 
  AttendanceRequest, 
  WeeklyWorkStat, 
  ManpowerInputRecord, 
  PartFulfillmentSummary,
  VerificationStatus,
  AuditTrailLog,
  ServiceDeliveryInspection,
  LegalDefenseReport,
  ExceptionType
} from '../types';

// =========================================================================
// 1. 10인 PM 체제 파트 마스터 정의 (10-PM Partition Structure)
// =========================================================================

export interface PmPartMaster {
  partId: string;
  partName: string;
  pmEmpId: string;
  pmName: string;
  partnerCompany: string;
  contractedHeadcount: number; // 파트별 도급 인원 (최대 120인 규모)
}

export const PM_PART_LIST: PmPartMaster[] = [
  { partId: 'PART-01', partName: '상담',   pmEmpId: 'S18121020', pmName: '조경훈 PM (귀하)', partnerCompany: '유브갓', contractedHeadcount: 120 },
  { partId: 'PART-02', partName: '오토',   pmEmpId: 'S18121021', pmName: '강민우 PM',       partnerCompany: '오토시스', contractedHeadcount: 120 },
  { partId: 'PART-03', partName: '재무',   pmEmpId: 'S18121022', pmName: '송진호 PM',       partnerCompany: '파이낸스ITS', contractedHeadcount: 120 },
  { partId: 'PART-04', partName: '카드IS', pmEmpId: 'S18121023', pmName: '박성진 PM',       partnerCompany: '현대IT솔루션', contractedHeadcount: 120 },
  { partId: 'PART-05', partName: '결제망', pmEmpId: 'S18121024', pmName: '최동욱 PM',       partnerCompany: '페이먼트시스템즈', contractedHeadcount: 120 },
  { partId: 'PART-06', partName: '데이터', pmEmpId: 'S18121025', pmName: '윤태경 PM',       partnerCompany: '데이터인사이트', contractedHeadcount: 120 },
  { partId: 'PART-07', partName: 'FDS',    pmEmpId: 'S18121026', pmName: '한상훈 PM',       partnerCompany: '보안인텔리전스', contractedHeadcount: 120 },
  { partId: 'PART-08', partName: 'CRM',    pmEmpId: 'S18121027', pmName: '정재원 PM',       partnerCompany: '고객경험ITS', contractedHeadcount: 120 },
  { partId: 'PART-09', partName: '모바일', pmEmpId: 'S18121028', pmName: '임도현 PM',       partnerCompany: '스마트소프트', contractedHeadcount: 120 },
  { partId: 'PART-10', partName: '인프라', pmEmpId: 'S18121029', pmName: '고영진 PM',       partnerCompany: '클라우드네트웍스', contractedHeadcount: 120 },
];

export interface DbUser {
  employeeId: string;
  email: string;
  name: string;
  passwordHash: string;
  role: 'DS_PRINCIPAL_PM' | 'PARTNER_PART_LEADER' | 'PARTNER_WORKER';
  authProvider: string;
  company: string;
  phone: string;
  team: string;
  part: string;
  position: string;
  status: 'PRE_REGISTERED' | 'ACTIVE' | 'SUSPENDED';
  failedAttempts: number;
  lastLoginAt?: string;
  createdAt: string;
  isActive: boolean;
  isAdmin: number;
  deviceType: 'Android' | 'iOS';
  regId: string;
  regDt: string;
}

export interface DbOtpVerification {
  id: number;
  employeeId: string;
  email: string;
  otpCode: string;
  expiresAt: number;
  isVerified: boolean;
  verifiedAt?: string;
  attempts: number;
  ipAddress: string;
  regId: string;
  regDt: string;
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
  exceptionType?: ExceptionType;
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
  systemLabel: string; // "도급 계약 이행 확인"
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
// 2. 10인 PM 체제 Pure Database Engine
// =========================================================================

const DB_KEY_USERS = 'SGUARD_10PM_USERS';
const DB_KEY_OTP = 'SGUARD_10PM_OTP';
const DB_KEY_MANPOWER = 'SGUARD_10PM_MANPOWER';
const DB_KEY_AUDIT = 'SGUARD_10PM_AUDIT';
const DB_KEY_SLA = 'SGUARD_10PM_SLA';

export class PureDatabaseEngine {
  private users: DbUser[] = [];
  private otpVerifications: DbOtpVerification[] = [];
  private manpowerInputs: DbManpowerInput[] = [];
  private auditTrails: DbAuditTrail[] = [];
  private slaClarifications: DbSlaClarification[] = [];

  private currentUser: User | null = null;
  private activePmPart: string = '상담';
  private themeMode: 'ddangyo' | 'shinhan' = 'shinhan';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      this.users = JSON.parse(localStorage.getItem(DB_KEY_USERS) || '[]');
      this.otpVerifications = JSON.parse(localStorage.getItem(DB_KEY_OTP) || '[]');
      this.manpowerInputs = JSON.parse(localStorage.getItem(DB_KEY_MANPOWER) || '[]');
      this.auditTrails = JSON.parse(localStorage.getItem(DB_KEY_AUDIT) || '[]');
      this.slaClarifications = JSON.parse(localStorage.getItem(DB_KEY_SLA) || '[]');
    } catch (e) {
      console.warn('Database load fallback', e);
      this.clearAll();
    }
  }

  private sync(): void {
    try {
      localStorage.setItem(DB_KEY_USERS, JSON.stringify(this.users));
      localStorage.setItem(DB_KEY_OTP, JSON.stringify(this.otpVerifications));
      localStorage.setItem(DB_KEY_MANPOWER, JSON.stringify(this.manpowerInputs));
      localStorage.setItem(DB_KEY_AUDIT, JSON.stringify(this.auditTrails));
      localStorage.setItem(DB_KEY_SLA, JSON.stringify(this.slaClarifications));
    } catch (e) {
      console.error('Database sync error', e);
    }
  }

  public clearAll(): void {
    this.users = [];
    this.otpVerifications = [];
    this.manpowerInputs = [];
    this.auditTrails = [];
    this.slaClarifications = [];
    this.currentUser = null;
    this.sync();
  }

  // =========================================================================
  // 3. User & Auth Database Operations
  // =========================================================================

  public findUserByEmpId(empId?: string): DbUser | undefined {
    if (!empId) return undefined;
    const cleanId = String(empId).toUpperCase().trim();
    return this.users.find(u => (u.employeeId || '').toUpperCase().trim() === cleanId);
  }

  public findUserByEmail(email?: string): DbUser | undefined {
    if (!email) return undefined;
    const cleanEmail = String(email).toLowerCase().trim();
    return this.users.find(u => (u.email || '').toLowerCase().trim() === cleanEmail);
  }

  public insertUser(userDto: any): {
    success: boolean;
    message: string;
    user?: DbUser;
  } {
    const rawEmpId = userDto.employeeId || userDto.empNo || userDto.empId;
    const rawEmail = userDto.email || userDto.emailAddr;
    const rawName = userDto.name || userDto.userNm;

    if (!rawEmpId || !rawName || !rawEmail) {
      return { success: false, message: '사번, 성명, 이메일은 필수 입력 항목입니다.' };
    }

    const existingEmp = this.findUserByEmpId(rawEmpId);
    if (existingEmp) {
      return { success: false, message: `이미 등록된 사번(${rawEmpId})입니다.` };
    }

    const existingEmail = this.findUserByEmail(rawEmail);
    if (existingEmail) {
      return { success: false, message: `이미 등록된 이메일(${rawEmail})입니다.` };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const normalizedUser: DbUser = {
      employeeId: String(rawEmpId).trim(),
      email: String(rawEmail).trim(),
      name: String(rawName).trim(),
      passwordHash: userDto.passwordHash || userDto.pw || '••••••••',
      role: userDto.role || (userDto.company === '신한DS' ? 'DS_PRINCIPAL_PM' : 'PARTNER_WORKER'),
      authProvider: 'local',
      company: userDto.company || userDto.companyNm || '신한DS',
      phone: userDto.phone || userDto.phoneNo || '',
      team: userDto.team || userDto.teamNm || '상담팀',
      part: userDto.part || userDto.partNm || '상담',
      position: userDto.position || userDto.positionCd || '사원',
      status: 'ACTIVE',
      failedAttempts: 0,
      createdAt: nowStr,
      isActive: true,
      isAdmin: userDto.company === '신한DS' ? 1 : 0,
      deviceType: userDto.deviceType || 'Android',
      regId: String(rawEmpId).trim(),
      regDt: nowStr
    };

    this.users.push(normalizedUser);
    this.sync();
    return { success: true, message: '사용자 계정이 DB에 성공적으로 등록되었습니다.', user: normalizedUser };
  }

  public updatePassword(empId: string, newPasswordHash: string): boolean {
    const user = this.findUserByEmpId(empId);
    if (!user) return false;

    user.passwordHash = newPasswordHash;
    this.sync();
    return true;
  }

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
    const expiresAt = Date.now() + 180000;
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
    if (!latest) return { success: false, error: '발송된 OTP 기록이 없습니다.' };

    latest.attempts += 1;
    if (Date.now() > latest.expiresAt) {
      this.sync();
      return { success: false, error: 'OTP 인증 유효시간(3분)이 만료되었습니다.' };
    }

    if (latest.otpCode !== inputOtp.trim()) {
      this.sync();
      return { success: false, error: '입력하신 OTP 인증번호가 일치하지 않습니다.' };
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
      roleTitle: user.role === 'DS_PRINCIPAL_PM' ? `신한DS ${user.part}파트 전담 현장관리인` : '협력사 파트관리자',
      location: '파인에비뉴(상담센터)',
      phone: user.phone,
      email: user.email,
      language: '한국어',
      timezone: 'Asia/Seoul (GMT+9)'
    };

    this.currentUser = mappedUser;
    this.activePmPart = user.part;
    return { success: true, user: mappedUser };
  }

  // =========================================================================
  // 4. 10인 PM 파트별 데이터 격리 & Exception Management CRUD
  // =========================================================================

  /**
   * 신규 도급 인력 투입 실적 등록
   * - 정상 투입(8h, 지각X) ➔ 시스템 자동 정산 확정 (AUTO_SETTLED, PM 일일 승인 불필요)
   * - 공백/지각/누락 ➔ 예외 큐 (VARIANCE_GAP) 등록되어 PM의 사유 확인 대기
   */
  public insertManpowerRecord(recordDto: Omit<DbManpowerInput, 'regDt' | 'regId'>): {
    success: boolean;
    record?: ManpowerInputRecord;
  } {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const isAutoSettled = !recordDto.isSlaBreach && recordDto.actualInputHours >= recordDto.contractedHours;
    const initialStatus: VerificationStatus = isAutoSettled ? 'AUTO_SETTLED' : 'VARIANCE_GAP';

    const newRecord: DbManpowerInput = {
      ...recordDto,
      verificationStatus: initialStatus,
      regId: this.currentUser?.id || 'SYSTEM',
      regDt: nowStr
    };

    this.manpowerInputs.push(newRecord);

    // 감사 로그: [도급 계약 이행 확인] 시스템 라벨 자동 부착
    this.auditTrails.push({
      id: Date.now(),
      recordId: newRecord.recordId,
      actorId: 'SYSTEM',
      actorName: '시스템 자동 검수 엔진',
      actorRole: '도급 검수 자동화',
      action: isAutoSettled 
        ? '도급비 산정을 위한 투입 실적 확정 (시스템 자동 검수)' 
        : '도급 투입 실적 등록 (예외 발생 - PM 검수 대기)',
      systemLabel: '도급 계약 이행 확인',
      details: isAutoSettled 
        ? `${newRecord.workDate} 정상 투입 실적(${newRecord.actualInputHours}h) 계약 기준 자동 정산 확정` 
        : `${newRecord.workDate} 편차 ${newRecord.varianceMinutes}분 발생에 따른 예외 큐 등록`,
      createdAt: nowStr
    });

    this.sync();
    return { success: true, record: this.mapToManpowerRecord(newRecord) };
  }

  /**
   * 1. 파트별 데이터 격리: 로그인한 PM 파트의 인원만 노출
   */
  public getManpowerRecordsByPart(partName?: string): ManpowerInputRecord[] {
    const targetPart = partName || this.activePmPart;
    const dbRows = this.manpowerInputs.filter(r => r.partName === targetPart);
    return dbRows.map(r => this.mapToManpowerRecord(r));
  }

  /**
   * 3. Exception Management: 파트 내 '지각/누락/휴가/공백' 예외 인원만 필터링
   */
  public getExceptionRecordsByPart(partName?: string): ManpowerInputRecord[] {
    const targetPart = partName || this.activePmPart;
    const dbRows = this.manpowerInputs.filter(r => r.partName === targetPart && r.isSlaBreach && r.verificationStatus === 'VARIANCE_GAP');
    return dbRows.map(r => this.mapToManpowerRecord(r));
  }

  public getPartSummary(partName?: string): PartFulfillmentSummary {
    const targetPart = partName || this.activePmPart;
    const partMaster = PM_PART_LIST.find(p => p.partName === targetPart) || PM_PART_LIST[0];
    const records = this.getManpowerRecordsByPart(targetPart);

    const targetHeadcount = records.length > 0 ? records.length : partMaster.contractedHeadcount;
    const activeHeadcount = records.filter(r => r.verificationStatus === 'AUTO_SETTLED' || r.verificationStatus === 'SETTLED' || r.verificationStatus === 'DELAY_REASON_ACCEPTED').length;
    const exceptionCount = records.filter(r => r.isSlaBreach && r.verificationStatus === 'VARIANCE_GAP').length;
    const excludedCount = records.filter(r => r.verificationStatus === 'EXCLUDED_FROM_BILLING').length;

    const targetManHours = targetHeadcount * 8.0;
    const actualManHours = records.reduce((acc, cur) => acc + (cur.verificationStatus === 'EXCLUDED_FROM_BILLING' ? 0 : cur.actualInputHours), 0);
    const fulfillmentRate = targetManHours > 0 ? (actualManHours / targetManHours) * 100 : 0;

    return {
      partId: partMaster.partId,
      partName: targetPart,
      partnerCompany: partMaster.partnerCompany,
      pmName: partMaster.pmName,
      targetHeadcount,
      activeHeadcount,
      exceptionCount,
      fulfillmentRate,
      targetManHours,
      actualManHours,
      slaBreachCount: exceptionCount + excludedCount,
      estimatedBillingDeduction: excludedCount * 65000 + exceptionCount * 32000
    };
  }

  /**
   * 예외 검수 액션 1: [계약상 투입 제외] (도급비 정산 감액 확정)
   */
  public resolveExceptionExclude(recordId: string, dsPmMemo: string = '계약 불이행에 따른 공수 정산 제외'): boolean {
    const record = this.manpowerInputs.find(r => r.recordId === recordId);
    if (!record) return false;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    record.verificationStatus = 'EXCLUDED_FROM_BILLING';
    record.modDt = nowStr;

    this.auditTrails.push({
      id: Date.now(),
      recordId,
      actorId: this.currentUser?.id || 'DS_PM',
      actorName: this.currentUser?.name || '신한DS 현장관리인',
      actorRole: '신한DS 현장관리인 (PM)',
      action: '도급비 산정을 위한 투입 실적 확정 - [계약상 투입 제외]',
      systemLabel: '도급 계약 이행 확인',
      details: `도급 계약 SLA 미달(${record.varianceMinutes}분 공백)에 따라 당일 투입 공수 정산에서 제외 확정 (메모: ${dsPmMemo})`,
      createdAt: nowStr
    });

    this.sync();
    return true;
  }

  /**
   * 예외 검수 액션 2: [공정 지연 사유 확정] (소명 인정 / 정산 유지)
   */
  public resolveExceptionAccept(recordId: string, dsPmMemo: string = '소명 사유 검토 완료에 따른 공정 지연 인정'): boolean {
    const record = this.manpowerInputs.find(r => r.recordId === recordId);
    if (!record) return false;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    record.verificationStatus = 'DELAY_REASON_ACCEPTED';
    record.modDt = nowStr;

    this.auditTrails.push({
      id: Date.now(),
      recordId,
      actorId: this.currentUser?.id || 'DS_PM',
      actorName: this.currentUser?.name || '신한DS 현장관리인',
      actorRole: '신한DS 현장관리인 (PM)',
      action: '도급비 산정을 위한 투입 실적 확정 - [공정 지연 사유 확정]',
      systemLabel: '도급 계약 이행 확인',
      details: `협력업체 1차 소명 사유 검토 결과 계약상 공정 지연 사유로 공식 인정 및 투입 실적 반영 (메모: ${dsPmMemo})`,
      createdAt: nowStr
    });

    this.sync();
    return true;
  }

  /**
   * 4. 법적 방어 리포트 자동 생성기 (노동청 조사 대응용)
   */
  public generateLegalDefenseReport(partName?: string, periodRange: string = '2026-08-10 ~ 2026-08-16'): LegalDefenseReport {
    const targetPart = partName || this.activePmPart;
    const summary = this.getPartSummary(targetPart);
    const records = this.getManpowerRecordsByPart(targetPart);

    const autoSettledCount = records.filter(r => r.verificationStatus === 'AUTO_SETTLED').length;
    const exceptionResolvedCount = records.filter(r => r.verificationStatus === 'EXCLUDED_FROM_BILLING' || r.verificationStatus === 'DELAY_REASON_ACCEPTED' || r.verificationStatus === 'SETTLED').length;

    return {
      reportId: `REP-DEFENSE-${targetPart}-${Date.now().toString().substring(6)}`,
      generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      periodRange,
      partName: targetPart,
      partnerCompany: summary.partnerCompany,
      principalPmName: this.currentUser?.name || summary.pmName,
      totalWorkersCount: summary.targetHeadcount,
      totalTargetManHours: summary.targetManHours,
      totalDeliveredManHours: summary.actualManHours,
      overallFulfillmentRate: summary.fulfillmentRate,
      autoSettledCount,
      exceptionResolvedCount,
      billingDeductionTotal: summary.estimatedBillingDeduction,
      legalStatement: '【법적 고지 및 증빙 목적】 본 문서는 파견법 및 노란봉투법 상 원청의 개별 하청 근로자에 대한 지휘·명령 또는 인사관리 내역이 아니며, 원·하청간 체결된 도급 계약서 기준에 따라 완성물 공정 및 투입 공수를 검수(Service Delivery Verification)하여 월간 도급비를 산정하기 위한 객관적 증빙 자료입니다.',
      records
    };
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
          action: '도급비 산정을 위한 투입 실적 확정',
          systemLabel: '도급 계약 이행 확인',
          details: '도급 계약 기준 투입 공수 및 SLA 검수 완료 (정산 확정 자료 반영)',
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
      action: '도급 계약 이행 확인 - 개선 요청(소명 요구) 발송',
      systemLabel: '도급 계약 이행 확인',
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
        systemLabel: a.systemLabel || '도급 계약 이행 확인',
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
      exceptionType: dbRow.exceptionType,
      gapReason: dbRow.gapReason,
      partnerClarification: dbRow.partnerClarification,
      verificationStatus: dbRow.verificationStatus,
      auditTrails: trails
    };
  }

  // =========================================================================
  // 5. State & Accessors
  // =========================================================================

  public getCurrentUser(): User {
    if (this.currentUser) return this.currentUser;
    return {
      id: 'S18121020',
      name: '조경훈 (DS PM)',
      firstName: '경훈',
      lastName: '조',
      companyName: '신한DS',
      partnerCompany: '신한DS',
      deptName: '상담팀',
      partName: '상담',
      role: 'DS_PRINCIPAL_PM',
      roleTitle: '신한DS 상담파트 전담 현장관리인',
      location: '파인에비뉴(상담센터)',
      phone: '010-4421-8890',
      email: 'khcho0421@gmail.com',
      language: '한국어',
      timezone: 'Asia/Seoul (GMT+9)'
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
        roleTitle: dbUser.role === 'DS_PRINCIPAL_PM' ? `신한DS ${dbUser.part}파트 전담 현장관리인` : '협력사 파트관리자',
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

  public getUserByEmpId(empId: string) { return this.findUserByEmpId(empId); }
  public registerUser(dto: any) { return this.insertUser(dto); }
  public resetPassword(empId: string, pw: string) { return this.updatePassword(empId, pw); }
  public generateAndStoreOtp(empId: string) { return this.createOtp(empId); }
  public verifyOtpInDb(empId: string, otp: string) { return this.verifyOtp(empId, otp); }
}

export const dbService = new PureDatabaseEngine();
export const predefinedUsers: User[] = [];
