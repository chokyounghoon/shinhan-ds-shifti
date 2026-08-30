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
  answeredAt?: string;
  createdAt: string;
}

export interface DbPreGapNotice {
  id: string;
  partnerCompany: string;
  workerName: string;
  partName: string;
  gapPeriod: string;
  gapHours: number;
  gapType: string;
  reason: string;
  status: 'DISPATCHED' | 'ACKNOWLEDGED';
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  createdAt: string;
}

// =========================================================================
// 2. 10인 PM 체제 Pure Database Engine
// =========================================================================
// 2. 10인 PM 체제 Pure Database Engine (Cloudflare D1 Database 실시간 연동)
// =========================================================================

export class PureDatabaseEngine {
  private users: DbUser[] = [];
  private manpowerInputs: DbManpowerInput[] = [];
  private auditTrails: DbAuditTrail[] = [];
  private slaClarifications: DbSlaClarification[] = [];
  private preGapNotices: DbPreGapNotice[] = [];
  private inspections: ServiceDeliveryInspection[] = [];

  private currentUser: User | null = null;
  private activePmPart: string = '상담';
  private themeMode: 'ddangyo' | 'shinhan' = 'shinhan';
  private readonly API_BASE = '/api';

  constructor() {
    this.initDefaultPartnerRoster();
  }

  private initDefaultPartnerRoster(): void {
    const todayStr = new Date().toISOString().substring(0, 10);
    this.manpowerInputs = [
      { 
        recordId: 'rec-i-01', 
        employeeId: 'UB0001', 
        workerName: '송무준', 
        partName: '상담', 
        partnerCompany: '유브갓', 
        workDate: todayStr, 
        contractedHours: 8.0, 
        actualInputHours: 8.0, 
        clockInTime: '08:50', 
        clockOutTime: '18:00', 
        taskSummary: '상담 시스템 기간계 계정계 승인 코어 모듈 유지보수', 
        varianceMinutes: 0, 
        isSlaBreach: false, 
        verificationStatus: 'AUTO_SETTLED', 
        regId: 'SYSTEM', 
        regDt: `${todayStr} 08:50:00` 
      }
    ];

    this.auditTrails = [
      {
        id: 1,
        recordId: 'rec-i-01',
        actorId: 'SYSTEM',
        actorName: '도급 인력 투입 관제 엔진',
        actorRole: '시스템 자동화',
        action: '도급비 산정을 위한 투입 실적 확정 (시스템 자동 검수)',
        systemLabel: '도급 계약 이행 확인',
        details: `${todayStr} 송무준 (유브갓) 정상 투입 실적(8.0h) 계약 기준 자동 정산 확정`,
        createdAt: `${todayStr} 09:00:00`
      }
    ];

    this.preGapNotices = [
      {
        id: 'gap-01',
        partnerCompany: '유브갓',
        workerName: '송무준',
        partName: '상담',
        gapPeriod: `${todayStr} 09:00 ~ 13:00`,
        gapHours: 4.0,
        gapType: '오전반차 (협력사 자체 승인)',
        reason: '소속사(유브갓) 복무규정에 따른 하계 정기 연차 승인 건',
        status: 'DISPATCHED',
        createdAt: `${todayStr} 09:30:00`
      }
    ];
  }

  public clearAll(): void {
    this.users = [];
    this.manpowerInputs = [];
    this.auditTrails = [];
    this.slaClarifications = [];
    this.currentUser = null;
    this.initDefaultPartnerRoster();
  }

  // =========================================================================
  // 3. User & Auth Database Operations (D1 DB 동기화)
  // =========================================================================

  public findUserByEmpId(empId?: string): DbUser | undefined {
    if (!empId) return undefined;
    const cleanInput = String(empId).toLowerCase().trim();
    const cleanWithoutS = cleanInput.replace(/^s/i, '').replace(/^emp-/i, '').replace(/^pt-/i, '');

    return this.users.find(u => {
      const uEmp = (u.employeeId || '').toLowerCase().trim();
      const uEmail = (u.email || '').toLowerCase().trim();
      const uName = (u.name || '').toLowerCase().trim();
      const uWithoutS = uEmp.replace(/^s/i, '').replace(/^emp-/i, '').replace(/^pt-/i, '');

      return uEmp === cleanInput || 
             uEmail === cleanInput || 
             uName === cleanInput ||
             (cleanWithoutS && uWithoutS === cleanWithoutS);
    });
  }

  public findUserByEmail(email?: string): DbUser | undefined {
    if (!email) return undefined;
    const cleanEmail = String(email).toLowerCase().trim();
    return this.users.find(u => (u.email || '').toLowerCase().trim() === cleanEmail);
  }

  public async fetchUsersFromD1(): Promise<DbUser[]> {
    try {
      const res = await fetch(`${this.API_BASE}/users`);
      const json = await safeFetchJson(res);
      if (json && json.data && Array.isArray(json.data)) {
        this.users = json.data.map((u: any) => ({
          employeeId: u.employee_id || u.employeeId,
          email: u.email,
          name: u.name,
          passwordHash: u.password_hash || u.passwordHash || '••••••••',
          role: u.role || 'PARTNER_WORKER',
          authProvider: u.auth_provider || 'local',
          company: u.company || '신한DS',
          phone: u.phone || '',
          team: u.team || '',
          part: u.part || '상담',
          position: u.position || '사원',
          status: u.status || 'ACTIVE',
          failedAttempts: u.failed_attempts || 0,
          lastLoginAt: u.last_login_at,
          createdAt: u.created_at,
          isActive: Boolean(u.is_active),
          isAdmin: u.is_admin ? 1 : 0,
          deviceType: u.device_type || 'Android',
          regId: u.created_by || 'SYSTEM',
          regDt: u.created_at
        }));
        return [...this.users];
      }
    } catch (e) {
      console.warn('[D1 Users Fetch Error]:', e);
    }
    return [...this.users];
  }

  public async insertUser(userDto: any): Promise<{
    success: boolean;
    message: string;
    user?: DbUser;
  }> {
    try {
      const res = await fetch(`${this.API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDto)
      });
      const json = await safeFetchJson(res);
      if (res.ok && json?.success) {
        await this.fetchUsersFromD1();
        return { success: true, message: json.message || '등록되었습니다.' };
      }
      return { success: false, message: json?.detail || json?.message || '등록 실패' };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }

  public async updatePassword(empId: string, newPasswordHash: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, newPassword: newPasswordHash })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  public async verifyPasswordInDb(empId: string, plainPw: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, password: plainPw })
      });
      const json = await safeFetchJson(res);
      return Boolean(res && res.ok && json?.success);
    } catch (e) {
      return false;
    }
  }

  public async updateUserPassword(empId: string, newPw: string): Promise<boolean> {
    return await this.updatePassword(empId, newPw);
  }

  public async createOtp(empId: string): Promise<{
    success: boolean;
    otpCode: string;
    maskedEmail: string;
    expiresAt: number;
    error?: string;
  }> {
    try {
      const res = await fetch(`${this.API_BASE}/auth/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId })
      });
      const json = await safeFetchJson(res);
      if (res && res.ok && json?.success) {
        return {
          success: true,
          otpCode: json.devOtp || '',
          maskedEmail: json.maskedEmail || json.masked_email || '',
          expiresAt: Date.now() + 180000
        };
      }
      return { 
        success: false, 
        otpCode: '', 
        maskedEmail: '', 
        expiresAt: 0, 
        error: json?.detail || json?.message || 'D1 DB 사번 조회 및 OTP 발송에 실패하였습니다.' 
      };
    } catch (e: any) {
      return { success: false, otpCode: '', maskedEmail: '', expiresAt: 0, error: e.message };
    }
  }

  public async verifyOtp(empId: string, inputOtp: string): Promise<{
    success: boolean;
    user?: User;
    error?: string;
  }> {
    try {
      const res = await fetch(`${this.API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: empId, otp: inputOtp })
      });
      const json = await safeFetchJson(res);
      if (res && res.ok && (json?.success || json?.code === 'OTP_VERIFIED')) {
        if (json.user) {
          this.currentUser = json.user;
          this.activePmPart = json.user.partName || '상담';
        }
        return { success: true, user: json.user };
      }
      return { 
        success: false, 
        error: json?.detail || json?.message || 'D1 DB OTP 인증에 실패하였습니다.' 
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // =========================================================================
  // 4. Cloudflare D1 도급 인력 투입 실적 (Manpower Inputs) API 연동
  // =========================================================================

  public async fetchManpowerFromD1(partName?: string, workDate?: string, company?: string): Promise<ManpowerInputRecord[]> {
    try {
      const targetPart = partName || this.activePmPart;
      let url = `${this.API_BASE}/manpower?part=${encodeURIComponent(targetPart)}`;
      if (workDate) url += `&work_date=${encodeURIComponent(workDate)}`;
      if (company && company !== 'ALL') url += `&company=${encodeURIComponent(company)}`;

      const res = await fetch(url);
      const json = await safeFetchJson(res);
      if (json && json.data && Array.isArray(json.data)) {
        this.manpowerInputs = json.data.map((r: any) => ({
          recordId: r.record_id || r.recordId,
          employeeId: r.employee_id || r.employeeId,
          workerName: r.worker_name || r.workerName,
          partName: r.part_name || r.partName,
          partnerCompany: r.partner_company || r.partnerCompany,
          workDate: r.work_date || r.workDate,
          contractedHours: Number(r.contracted_hours ?? r.contractedHours ?? 8.0),
          actualInputHours: Number(r.actual_input_hours ?? r.actualInputHours ?? 8.0),
          clockInTime: r.clock_in_time || r.clockInTime || '08:50',
          clockOutTime: r.clock_out_time || r.clockOutTime || '18:00',
          taskSummary: r.task_summary || r.taskSummary || '',
          varianceMinutes: Number(r.variance_minutes ?? r.varianceMinutes ?? 0),
          isSlaBreach: Boolean(r.is_sla_breach ?? r.isSlaBreach),
          exceptionType: r.exception_type || r.exceptionType,
          gapReason: r.gap_reason || r.gapReason,
          partnerClarification: r.partner_clarification || r.partnerClarification,
          verificationStatus: (r.verification_status || r.verificationStatus || 'AUTO_SETTLED') as VerificationStatus,
          regId: r.reg_id || r.regId || 'SYSTEM',
          regDt: r.reg_dt || r.regDt || ''
        }));

        return this.manpowerInputs.map(r => this.mapToManpowerRecord(r));
      }
    } catch (e) {
      console.warn('[D1 Manpower Fetch Error]:', e);
    }
    return this.manpowerInputs.map(r => this.mapToManpowerRecord(r));
  }

  public async insertManpowerRecord(recordDto: Omit<DbManpowerInput, 'regDt' | 'regId'>): Promise<{
    success: boolean;
    record?: ManpowerInputRecord;
  }> {
    try {
      const res = await fetch(`${this.API_BASE}/manpower`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...recordDto,
          regId: this.currentUser?.id || 'SYSTEM'
        })
      });
      if (res.ok) {
        await this.fetchManpowerFromD1(recordDto.partName, recordDto.workDate);
        const added = this.manpowerInputs.find(r => r.recordId === recordDto.recordId);
        return { success: true, record: added ? this.mapToManpowerRecord(added) : undefined };
      }
    } catch (e) {
      console.warn('[D1 Insert Manpower Error]:', e);
    }
    return { success: false };
  }

  public getManpowerInputs(): DbManpowerInput[] {
    return [...this.manpowerInputs];
  }

  public getManpowerRecordsByPart(partName?: string): ManpowerInputRecord[] {
    const targetPart = partName || this.activePmPart;
    const dbRows = this.manpowerInputs.filter(r => r.partName === targetPart);
    return dbRows.map(r => this.mapToManpowerRecord(r));
  }

  public getExceptionRecordsByPart(partName?: string): ManpowerInputRecord[] {
    const targetPart = partName || this.activePmPart;
    const dbRows = this.manpowerInputs.filter(r => r.partName === targetPart && (r.isSlaBreach || r.verificationStatus === 'VARIANCE_GAP' || r.verificationStatus === 'PENDING_EXCEPTION_REVIEW'));
    return dbRows.map(r => this.mapToManpowerRecord(r));
  }

  public getPartSummary(partName?: string): PartFulfillmentSummary {
    const targetPart = partName || this.activePmPart;
    const partMaster = PM_PART_LIST.find(p => p.partName === targetPart) || PM_PART_LIST[0];
    const records = this.getManpowerRecordsByPart(targetPart);

    const targetHeadcount = records.length > 0 ? records.length : partMaster.contractedHeadcount;
    const activeHeadcount = records.filter(r => r.verificationStatus === 'AUTO_SETTLED' || r.verificationStatus === 'SETTLED' || r.verificationStatus === 'SETTLED_BY_PRINCIPAL' || r.verificationStatus === 'DELAY_REASON_ACCEPTED').length;
    const exceptionCount = records.filter(r => r.isSlaBreach && (r.verificationStatus === 'VARIANCE_GAP' || r.verificationStatus === 'PENDING_EXCEPTION_REVIEW')).length;
    const excludedCount = records.filter(r => r.verificationStatus === 'EXCLUDED_FROM_BILLING' || r.verificationStatus === 'EXCLUDED_FROM_SLA').length;

    const targetManHours = targetHeadcount * 8.0;
    const actualManHours = records.reduce((acc, cur) => acc + (cur.verificationStatus === 'EXCLUDED_FROM_BILLING' || cur.verificationStatus === 'EXCLUDED_FROM_SLA' ? 0 : cur.actualInputHours), 0);
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

  public async resolveExceptionExclude(recordId: string, dsPmMemo: string = '계약 불이행에 따른 공수 정산 제외'): Promise<boolean> {
    try {
      const res = await fetch(`${this.API_BASE}/manpower/${recordId}/exception`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'EXCLUDE', memo: dsPmMemo })
      });
      if (res.ok) {
        await this.fetchManpowerFromD1(this.activePmPart);
        return true;
      }
    } catch (e) {}
    return false;
  }

  public async resolveExceptionAccept(recordId: string, dsPmMemo: string = '소명 사유 검토 완료에 따른 공정 지연 인정'): Promise<boolean> {
    try {
      const res = await fetch(`${this.API_BASE}/manpower/${recordId}/exception`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACCEPT', memo: dsPmMemo })
      });
      if (res.ok) {
        await this.fetchManpowerFromD1(this.activePmPart);
        return true;
      }
    } catch (e) {}
    return false;
  }

  public generateLegalDefenseReport(partName?: string, periodRange: string = '2026-08-10 ~ 2026-08-16'): LegalDefenseReport {
    const targetPart = partName || this.activePmPart;
    const summary = this.getPartSummary(targetPart);
    const records = this.getManpowerRecordsByPart(targetPart);

    const autoSettledCount = records.filter(r => r.verificationStatus === 'AUTO_SETTLED').length;
    const exceptionResolvedCount = records.filter(r => r.verificationStatus === 'EXCLUDED_FROM_BILLING' || r.verificationStatus === 'EXCLUDED_FROM_SLA' || r.verificationStatus === 'DELAY_REASON_ACCEPTED' || r.verificationStatus === 'SETTLED' || r.verificationStatus === 'SETTLED_BY_PRINCIPAL').length;

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

  public async settlePrincipalVerification(recordIds: string[], dsPmName: string = '신한DS 현장관리인'): Promise<boolean> {
    try {
      const res = await fetch(`${this.API_BASE}/manpower/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordIds, pmName: dsPmName })
      });
      if (res.ok) {
        await this.fetchManpowerFromD1(this.activePmPart);
        return true;
      }
    } catch (e) {}
    return false;
  }

  // =========================================================================
  // 5. Cloudflare D1 감사 로그 & SLA 소명 & 사전 결손 통보 연동
  // =========================================================================

  public async fetchAuditTrailsFromD1(recordId?: string): Promise<DbAuditTrail[]> {
    try {
      let url = `${this.API_BASE}/audit-trails`;
      if (recordId) url += `?record_id=${encodeURIComponent(recordId)}`;
      const res = await fetch(url);
      const json = await safeFetchJson(res);
      if (json && json.data && Array.isArray(json.data)) {
        this.auditTrails = json.data.map((a: any) => ({
          id: a.id,
          recordId: a.record_id || a.recordId,
          actorId: a.actor_id || a.actorId,
          actorName: a.actor_name || a.actorName,
          actorRole: a.actor_role || a.actorRole,
          action: a.action,
          systemLabel: a.system_label || a.systemLabel || '도급 계약 이행 확인',
          details: a.details,
          createdAt: a.created_at || a.createdAt
        }));
        return [...this.auditTrails];
      }
    } catch (e) {}
    return [...this.auditTrails];
  }

  public async fetchSlaClarificationsFromD1(partName?: string): Promise<DbSlaClarification[]> {
    try {
      const targetPart = partName || this.activePmPart;
      const res = await fetch(`${this.API_BASE}/sla-clarifications?part=${encodeURIComponent(targetPart)}`);
      const json = await safeFetchJson(res);
      if (json && json.data && Array.isArray(json.data)) {
        this.slaClarifications = json.data.map((c: any) => ({
          id: c.id,
          recordId: c.record_id || c.recordId,
          partName: c.part_name || c.partName,
          partnerCompany: c.partner_company || c.partnerCompany,
          requesterId: c.requester_id || c.requesterId,
          officialTitle: c.official_title || c.officialTitle,
          messageContent: c.message_content || c.messageContent,
          status: c.status,
          answerContent: c.answer_content || c.answerContent,
          answeredAt: c.answered_at || c.answeredAt,
          createdAt: c.created_at || c.createdAt
        }));
        return [...this.slaClarifications];
      }
    } catch (e) {}
    return [...this.slaClarifications];
  }

  public getSlaClarifications(): DbSlaClarification[] {
    return [...this.slaClarifications];
  }

  public async sendClarificationRequest(recordId: string, message: string): Promise<boolean> {
    try {
      const record = this.manpowerInputs.find(r => r.recordId === recordId);
      const res = await fetch(`${this.API_BASE}/sla-clarifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          partName: record?.partName || this.activePmPart,
          partnerCompany: record?.partnerCompany || '유브갓',
          requesterId: this.currentUser?.id || 'PM',
          officialTitle: `[SLA 소명 요구] ${record?.workDate || ''} ${record?.workerName || ''} 공백 건`,
          messageContent: message
        })
      });
      if (res.ok) {
        await this.fetchSlaClarificationsFromD1(this.activePmPart);
        return true;
      }
    } catch (e) {}
    return false;
  }

  public async answerClarification(id: number, answer: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.API_BASE}/sla-clarifications/${id}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerContent: answer })
      });
      if (res.ok) {
        await this.fetchSlaClarificationsFromD1(this.activePmPart);
        await this.fetchManpowerFromD1(this.activePmPart);
        return true;
      }
    } catch (e) {}
    return false;
  }

  public async fetchGapNoticesFromD1(partName?: string): Promise<DbPreGapNotice[]> {
    try {
      const targetPart = partName || this.activePmPart;
      const res = await fetch(`${this.API_BASE}/gap-notices?part=${encodeURIComponent(targetPart)}`);
      const json = await safeFetchJson(res);
      if (json && json.data && Array.isArray(json.data)) {
        this.preGapNotices = json.data.map((n: any) => ({
          id: n.id,
          partnerCompany: n.partner_company || n.partnerCompany,
          workerName: n.worker_name || n.workerName,
          partName: n.part_name || n.partName,
          gapPeriod: n.gap_period || n.gapPeriod,
          gapHours: Number(n.gap_hours ?? n.gapHours ?? 8.0),
          gapType: n.gap_type || n.gapType,
          reason: n.reason,
          status: n.status,
          acknowledgedBy: n.acknowledged_by || n.acknowledgedBy,
          acknowledgedAt: n.acknowledged_at || n.acknowledgedAt,
          createdAt: n.created_at || n.createdAt
        }));
        return [...this.preGapNotices];
      }
    } catch (e) {}
    return [...this.preGapNotices];
  }

  public getPreGapNotices(partName?: string): DbPreGapNotice[] {
    if (!partName) return [...this.preGapNotices];
    return this.preGapNotices.filter(n => n.partName === partName);
  }

  public async dispatchPreGapNotice(notice: Omit<DbPreGapNotice, 'id' | 'status' | 'createdAt'>): Promise<boolean> {
    try {
      const res = await fetch(`${this.API_BASE}/gap-notices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notice)
      });
      if (res.ok) {
        await this.fetchGapNoticesFromD1(notice.partName);
        return true;
      }
    } catch (e) {}
    return false;
  }

  public async acknowledgePreGapNotice(noticeId: string, dsPmName: string = '신한DS 현장관리인'): Promise<boolean> {
    try {
      const res = await fetch(`${this.API_BASE}/gap-notices/${noticeId}/acknowledge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy: dsPmName })
      });
      if (res.ok) {
        await this.fetchGapNoticesFromD1(this.activePmPart);
        return true;
      }
    } catch (e) {}
    return false;
  }

  // =========================================================================
  // 6. 도급 공수 검수 (Service Delivery Inspections) D1 연동
  // =========================================================================
  public async fetchInspectionsFromD1(): Promise<ServiceDeliveryInspection[]> {
    try {
      const res = await fetch(`${this.API_BASE}/inspections`);
      const json = await safeFetchJson(res);
      if (json && json.data && Array.isArray(json.data)) {
        this.inspections = json.data.map((i: any) => ({
          id: i.id,
          projectCode: i.project_code || i.projectCode,
          partnerCompany: i.partner_company || i.partnerCompany,
          inspectorId: i.inspector_id || i.inspectorId,
          inspectorName: i.inspector_name || i.inspectorName,
          inspectionMonth: i.inspection_month || i.inspectionMonth,
          contractedManDays: Number(i.contracted_man_days ?? i.contractedManDays ?? 0),
          actualDeliveredManDays: Number(i.actual_delivered_man_days ?? i.actualDeliveredManDays ?? 0),
          inspectionStatus: i.inspection_status || i.inspectionStatus,
          inspectionNotes: i.inspection_notes || i.inspectionNotes,
          inspectedAt: i.inspected_at || i.inspectedAt,
          createdAt: i.created_at || i.createdAt
        }));
        return [...this.inspections];
      }
    } catch (e) {}
    return [...this.inspections];
  }

  public getInspections(): ServiceDeliveryInspection[] {
    return [...this.inspections];
  }

  public async acceptContractInspection(id: string, memo?: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.API_BASE}/inspections/${id}/accept`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memo: memo || '신한DS 도급 검수 완료: SLA 공수 정산 및 도급 대금 지급 승인' })
      });
      if (res.ok) {
        await this.fetchInspectionsFromD1();
        return true;
      }
    } catch (e) {}
    return false;
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
  // 7. State & Accessors
  // =========================================================================

  public getCurrentUser(): User {
    if (this.currentUser) return this.currentUser;
    return {
      id: 'S01832',
      name: '조경훈 (DS PM)',
      firstName: '경훈',
      lastName: '조',
      companyName: '신한DS',
      partnerCompany: '신한DS',
      deptName: '카드개발팀',
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

  public updateUser(updatedFields: Partial<User>): User {
    if (!this.currentUser) {
      this.currentUser = this.getCurrentUser();
    }

    this.currentUser = {
      ...this.currentUser,
      ...updatedFields
    };

    if (updatedFields.partName) {
      this.activePmPart = updatedFields.partName;
    }

    return this.currentUser;
  }

  public getActivePmPart(): string { return this.activePmPart; }
  public setActivePmPart(part: string): void { this.activePmPart = part; }
  public getThemeMode(): 'ddangyo' | 'shinhan' { return this.themeMode; }
  public setThemeMode(mode: 'ddangyo' | 'shinhan'): void { this.themeMode = mode; }

  public getWeeklySchedules(): DaySchedule[] {
    const today = new Date();
    const currentDay = today.getDay(); // 0(Sun) ~ 6(Sat)
    // Calculate Monday of current week
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const dayNames = ['월', '화', '수', '목', '금', '토', '일'];
    const list: DaySchedule[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === today.toDateString();
      const month = d.getMonth() + 1;
      const date = d.getDate();
      const isWeekend = i >= 5;

      list.push({
        dayOfWeek: isToday ? '오늘' : dayNames[i],
        dateStr: `${month}/${date}`,
        fullDate: `${d.getFullYear()}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`,
        statusType: isWeekend ? 'OFF' : 'WORK',
        statusLabel: isWeekend ? '휴무' : '도급 1 M/D',
        timeRange: isWeekend ? '-' : '08:50 ~ 18:00',
        isToday,
        isVacation: false,
        title: isWeekend ? '주말 휴무' : '도급 1 M/D (8.0h)'
      });
    }
    return list;
  }

  private requests: AttendanceRequest[] = [
    {
      id: 'req-01',
      userId: 'usr-001',
      userName: '조경훈',
      userDept: '카드개발팀',
      partnerApproverName: '최영호 (유브갓 현장대리인)',
      requestType: 'VACATION',
      targetDate: '2026-08-12 ~ 2026-08-14',
      timeRange: '전일',
      hours: 24,
      reason: '하계 정기 연차 휴가 (소속사 복무규정 준수)',
      status: 'APPROVED',
      createdAt: '2026-08-01 09:30',
      approvalMemo: '소속사 현장대리인 승인 완료'
    }
  ];

  public getRequests(): AttendanceRequest[] {
    return [...this.requests];
  }

  public addRequest(req: any): void {
    const fullReq: AttendanceRequest = {
      id: req.id || `req-${Date.now()}`,
      userId: req.userId || 'usr-default',
      userName: req.userName || '신청자',
      userDept: req.userDept || '소속팀',
      partnerApproverName: req.partnerApproverName || '현장관리인',
      requestType: req.requestType || 'VACATION',
      targetDate: req.targetDate || '2026-08-30',
      timeRange: req.timeRange || '전일',
      hours: Number(req.hours) || 8,
      reason: req.reason || '근태 신청',
      status: req.status || 'PENDING',
      createdAt: req.createdAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
      approvalMemo: req.approvalMemo
    };
    this.requests.unshift(fullReq);
  }

  public updateRequestStatus(id: string, status: 'PENDING' | 'PENDING_DS' | 'APPROVED' | 'REJECTED', memo?: string): void {
    const idx = this.requests.findIndex(r => r.id === id);
    if (idx >= 0) {
      this.requests[idx] = {
        ...this.requests[idx],
        status,
        approvalMemo: memo || this.requests[idx].approvalMemo
      };
    }
  }

  public deleteRequest(id: string): void {
    this.requests = this.requests.filter(r => r.id !== id);
  }

  public getWeeklyStats(): WeeklyWorkStat {
    return {
      approvedHours: 40.0,
      totalCapHours: 52.0,
      workedDays: 5,
      totalDays: 7,
      remainingHours: 12.0,
      overtimeHours: 0.0,
      lateCount: 0,
      earlyLeaveCount: 0
    };
  }
  public clockIn(loc: string): boolean { return true; }
  
  // =========================================================================
  // 8. Cloudflare D1 실시간 출근 및 투입 기록 API
  // =========================================================================
  public async recordCommutePunchInD1(data: {
    employeeId: string;
    workDate: string;
    clockInTime: string;
    locationName: string;
    distanceMeters?: number;
    status?: string;
  }): Promise<any> {
    try {
      const res = await fetch(`${this.API_BASE}/commute/punch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: data.employeeId,
          user_id: data.employeeId,
          work_date: data.workDate,
          clock_in_time: data.clockInTime,
          location_name: data.locationName,
          distance_meters: data.distanceMeters || 25,
          status: data.status || 'NORMAL'
        })
      });
      return await safeFetchJson(res);
    } catch (e) {
      console.warn('[D1 Commute Punch Error]:', e);
    }
    return null;
  }

  public async fetchCommuteLogsFromD1(empId?: string, workDate?: string): Promise<any[]> {
    try {
      let url = `${this.API_BASE}/commute/logs`;
      const queryParams: string[] = [];
      if (empId) queryParams.push(`employee_id=${encodeURIComponent(empId)}`);
      if (workDate) queryParams.push(`work_date=${encodeURIComponent(workDate)}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;

      const res = await fetch(url);
      const json = await safeFetchJson(res);
      if (json && json.data && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {
      console.warn('[D1 Commute Logs Fetch Error]:', e);
    }
    return [];
  }

  public async submitAttendanceRequestInD1(req: {
    id?: string;
    employeeId: string;
    requestType: string;
    vacationType?: string;
    targetDate: string;
    startDate?: string;
    endDate?: string;
    hours?: number;
    reason: string;
    partnerCompany?: string;
    approverName?: string;
    status?: string;
  }): Promise<any> {
    try {
      const res = await fetch(`${this.API_BASE}/attendance/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: req.id || `req-${Date.now()}`,
          employee_id: req.employeeId,
          user_id: req.employeeId,
          request_type: req.requestType,
          vacation_type: req.vacationType || (req.requestType === 'VACATION' ? '연차' : req.requestType),
          target_date: req.targetDate,
          start_date: req.startDate || req.targetDate.split('~')[0].trim(),
          end_date: req.endDate || req.targetDate.split('~')[1]?.trim() || req.targetDate,
          hours: req.hours || 8,
          reason: req.reason,
          status: req.status || 'APPROVED',
          partner_company: req.partnerCompany || '유브갓',
          approver_name: req.approverName || `${req.partnerCompany || '유브갓'} 현장관리인`
        })
      });
      return await safeFetchJson(res);
    } catch (e) {
      console.warn('[D1 Attendance Request Error]:', e);
    }
    return null;
  }

  public async fetchAttendanceRequestsFromD1(empId?: string): Promise<any[]> {
    try {
      let url = `${this.API_BASE}/attendance/requests`;
      if (empId) url += `?employee_id=${encodeURIComponent(empId)}`;
      const res = await fetch(url);
      const json = await safeFetchJson(res);
      if (json && json.data && Array.isArray(json.data)) {
        return json.data;
      }
    } catch (e) {
      console.warn('[D1 Attendance Requests Fetch Error]:', e);
    }
    return [];
  }

  public addCommuteLog(type: string, loc: string): void {}
  public approvePartnerRequest(reqId: string, memo?: string): boolean { return true; }
  public rejectPartnerRequest(reqId: string, memo?: string): boolean { return true; }

  // =========================================================================
  // 9. 실시간 알림 & 메시지 센터 (Cloudflare D1 Database 연동)
  // =========================================================================
  private notifications: DbAppNotification[] = [];
  private messages: DbAppMessage[] = [];

  public async fetchNotificationsFromD1(userRole?: string, partName?: string): Promise<DbAppNotification[]> {
    try {
      let url = `${this.API_BASE}/notifications`;
      const queryParams: string[] = [];
      if (userRole) queryParams.push(`role=${encodeURIComponent(userRole)}`);
      if (partName) queryParams.push(`part=${encodeURIComponent(partName)}`);
      if (queryParams.length > 0) url += `?${queryParams.join('&')}`;

      const res = await fetch(url);
      const json = await safeFetchJson(res);
      if (json && json.data && Array.isArray(json.data)) {
        const d1Notis: DbAppNotification[] = json.data.map((row: any) => ({
          id: row.id,
          type: row.type,
          title: row.title,
          content: row.content,
          targetRole: row.target_role,
          partName: row.part_name,
          isRead: Boolean(row.is_read),
          createdAt: row.created_at,
          linkUrl: row.link_url
        }));

        // D1 알림 데이터로 실시간 동기화 (역할별 격리 보장)
        this.notifications = d1Notis;
        return [...this.notifications];
      }
    } catch (err) {
      console.warn('[D1 Notifications Fetch Error]:', err);
    }
    return [...this.notifications];
  }

  public getNotifications(userRole?: string, partName?: string): DbAppNotification[] {
    return [...this.notifications];
  }

  public getUnreadNotificationCount(userRole?: string, partName?: string): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  public addNotification(noti: {
    type?: string;
    title: string;
    content: string;
    targetRole?: string;
    partName?: string;
    linkUrl?: string;
  }): DbAppNotification {
    const newNoti: DbAppNotification = {
      id: `noti_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      type: noti.type || 'APPROVAL_REQUEST',
      title: noti.title,
      content: noti.content,
      targetRole: noti.targetRole || 'ALL',
      partName: noti.partName || '카드개발팀',
      isRead: false,
      createdAt: new Date().toISOString(),
      linkUrl: noti.linkUrl
    };
    this.notifications.unshift(newNoti);

    // 서버로도 전송 시도
    fetch(`${this.API_BASE}/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: newNoti.type,
        title: newNoti.title,
        content: newNoti.content,
        target_role: newNoti.targetRole,
        part_name: newNoti.partName,
        link_url: newNoti.linkUrl
      })
    }).catch(() => {});

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification_updated'));
    }

    return newNoti;
  }

  public async markNotificationAsRead(id: string): Promise<void> {
    const item = this.notifications.find(n => n.id === id);
    if (item) {
      item.isRead = true;
    }
    try {
      await fetch(`${this.API_BASE}/notifications/${id}/read`, { method: 'PUT' });
    } catch (e) {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification_updated'));
    }
  }

  public async markAllNotificationsAsRead(): Promise<void> {
    this.notifications.forEach(n => { n.isRead = true; });
    try {
      await fetch(`${this.API_BASE}/notifications/read-all`, { method: 'PUT' });
    } catch (e) {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('notification_updated'));
    }
  }

  public async fetchMessagesFromD1(userRole?: string, partName?: string): Promise<DbAppMessage[]> {
    try {
      let url = `${this.API_BASE}/messages`;
      if (partName) url += `?part=${encodeURIComponent(partName)}`;

      const res = await fetch(url);
      const json = await safeFetchJson(res);
      if (json && json.data && Array.isArray(json.data)) {
        this.messages = json.data.map((row: any) => ({
          id: row.id,
          senderName: row.sender_name,
          senderRole: row.sender_role,
          partName: row.part_name,
          title: row.title,
          content: row.content,
          isRead: Boolean(row.is_read),
          replyStatus: row.reply_status,
          replyContent: row.reply_content,
          repliedAt: row.replied_at,
          createdAt: row.created_at
        }));
        return [...this.messages];
      }
    } catch (err) {
      console.warn('[D1 Messages Fetch Error]:', err);
    }
    return [...this.messages];
  }

  public getMessages(userRole?: string, partName?: string): DbAppMessage[] {
    return [...this.messages];
  }

  public getUnreadMessageCount(userRole?: string, partName?: string): number {
    return this.messages.filter(m => !m.isRead).length;
  }

  public async markMessageAsRead(id: string): Promise<void> {
    const item = this.messages.find(m => m.id === id);
    if (item) {
      item.isRead = true;
    }
    try {
      await fetch(`${this.API_BASE}/messages/${id}/read`, { method: 'PUT' });
    } catch (e) {}
  }

  public async sendReplyInD1(id: string, replyContent: string): Promise<void> {
    const item = this.messages.find(m => m.id === id);
    if (item) {
      item.isRead = true;
      item.replyStatus = 'COMPLETED';
      item.replyContent = replyContent;
      item.repliedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }
    try {
      await fetch(`${this.API_BASE}/messages/${id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyContent })
      });
    } catch (e) {}
  }

  public async markAllMessagesAsRead(): Promise<void> {
    this.messages.forEach(m => { m.isRead = true; });
    try {
      await fetch(`${this.API_BASE}/messages/read-all`, { method: 'PUT' });
    } catch (e) {}
  }

  public getUserByEmpId(empId: string) { return this.findUserByEmpId(empId); }
  public registerUser(dto: any) { return this.insertUser(dto); }
  public resetPassword(empId: string, pw: string) { return this.updatePassword(empId, pw); }
  public generateAndStoreOtp(empId: string) { return this.createOtp(empId); }
  public verifyOtpInDb(empId: string, otp: string) { return this.verifyOtp(empId, otp); }
}

export interface DbAppNotification {
  id: string;
  type: 'SLA_ALERT' | 'GAP_NOTICE' | 'CONTRACT_SETTLE' | 'GENERAL' | 'APPROVAL_REQUEST' | 'INSPECTION_REQUEST' | 'APPROVAL_COMPLETED' | 'REJECTION' | string;
  title: string;
  content: string;
  targetRole: string;
  partName: string;
  isRead: boolean;
  createdAt: string;
  linkUrl?: string;
}

export interface DbAppMessage {
  id: string;
  senderName: string;
  senderRole: string;
  partName: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  replyStatus?: 'PENDING' | 'COMPLETED';
  replyContent?: string;
  repliedAt?: string;
}

// Safe JSON parser helper to prevent HTML/SPA fallback from throwing SyntaxError
export async function safeFetchJson<T = any>(res: Response | null | undefined): Promise<T | null> {
  if (!res || !res.ok) return null;
  try {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

export const dbService = new PureDatabaseEngine();
export const predefinedUsers: User[] = [];
