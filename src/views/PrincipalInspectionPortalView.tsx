import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  FileCheck, 
  AlertTriangle, 
  Scale, 
  Send, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  FileText, 
  Clock, 
  DollarSign, 
  Lock, 
  X,
  Sparkles,
  Radar,
  Users
} from 'lucide-react';
import { dbService } from '../services/db';
import { ServiceDeliveryInspection } from '../types';
import { formatKstDateTime } from '../utils/dateUtils';
import { ElectronicSignatureModal } from '../components/modals/ElectronicSignatureModal';
import { LegalComplianceAuditReportModal } from '../components/modals/LegalComplianceAuditReportModal';
import { AiClarificationAuditModal } from '../components/modals/AiClarificationAuditModal';
import { AiOfficialNoticeGeneratorModal } from '../components/modals/AiOfficialNoticeGeneratorModal';
import { AiAnomalyRadarModal } from '../components/modals/AiAnomalyRadarModal';
import { AiLaborInspectorSimulatorModal } from '../components/modals/AiLaborInspectorSimulatorModal';
import { DsDemandClarificationModal } from '../components/modals/DsDemandClarificationModal';
import { AttendanceReportView } from './AttendanceReportView';
import { ContractFulfillmentDashboardView } from './ContractFulfillmentDashboardView';

interface PrincipalInspectionPortalViewProps {
  themeMode: 'ddangyo' | 'shinhan';
  initialTab?: 'monitoring' | 'roster' | 'dashboard' | 'report' | 'approvals' | 'evidences';
}

interface MasterWorkerItem {
  name: string;
  employee_id: string;
  company: string;
  part: string;
  team: string;
  position: string;
  clockIn: string;
  hours: number;
  variance: number;
  isWarning?: boolean;
  reason?: string;
  task: string;
}

interface SlaBreachEvidence {
  id: string;
  partnerCompany: string;
  project: string;
  incidentDate: string;
  title: string; // 계약 이행 미달 항목 (지각 대신 계약 미달로 명명)
  varianceTime: string; // 투입 공수 결손 시간
  financialPenalty: number; // 도급비 감액 산정액 (원)
  status: 'EVIDENCE_RECORDED' | 'NOTICE_ISSUED' | 'DEDUCTION_SETTLED';
  description: string;
}

export const PrincipalInspectionPortalView: React.FC<PrincipalInspectionPortalViewProps> = ({
  themeMode,
  initialTab = 'monitoring'
}) => {
  const [inspections, setInspections] = useState<ServiceDeliveryInspection[]>(dbService.getInspections());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [selectedEvidenceForNotice, setSelectedEvidenceForNotice] = useState<SlaBreachEvidence | null>(null);
  const [isOfficialNoticeModalOpen, setIsOfficialNoticeModalOpen] = useState(false);

  // AI 4대 지능형 관리 모달 상태
  const [isAiClarificationModalOpen, setIsAiClarificationModalOpen] = useState(false);
  const [isAiNoticeGeneratorModalOpen, setIsAiNoticeGeneratorModalOpen] = useState(false);
  const [isAiAnomalyRadarModalOpen, setIsAiAnomalyRadarModalOpen] = useState(false);
  const [isAiLaborInspectorModalOpen, setIsAiLaborInspectorModalOpen] = useState(false);

  // 소명 요구 모달 상태
  const [isDemandClarificationModalOpen, setIsDemandClarificationModalOpen] = useState(false);
  const [selectedWorkerForDemand, setSelectedWorkerForDemand] = useState<{
    name: string;
    id?: string;
    company: string;
    date: string;
    varianceMinutes?: number;
    clockIn?: string;
  } | null>(null);

  // 전자 서명 & 감사 리포트 모달 상태
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isAuditReportModalOpen, setIsAuditReportModalOpen] = useState(false);
  const [pendingInspId, setPendingInspId] = useState<string | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>(undefined);
  
  const currentRole = dbService.getCurrentUser()?.role;
  const isDirector = currentRole === 'DS_DIRECTOR';
  const [signerName, setSignerName] = useState<string>(isDirector ? '조경훈 총괄부서장 (신한DS IT도급총괄)' : '조경훈 수석PM (신한DS)');

  const [mainTab, setMainTab] = useState<'monitoring' | 'roster' | 'dashboard' | 'report' | 'approvals' | 'evidences'>(initialTab);

  React.useEffect(() => {
    dbService.fetchInspectionsFromD1().then(data => setInspections(data));
  }, []);

  React.useEffect(() => {
    if (initialTab) {
      setMainTab(initialTab);
    }
  }, [initialTab]);

  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedPartnerFilter, setSelectedPartnerFilter] = useState<string>('ALL');
  const [selectedDay, setSelectedDay] = useState<string>('2026-08-30');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');
  const [approvalSubFilter, setApprovalSubFilter] = useState<'ALL' | 'VACATION' | 'CLARIFICATION' | 'APPROVED'>('ALL');

  // 전체 협력사 인력 마스터 데이터 (유브갓 10명 + 협력아이티에스 10명)
  const allWorkersMaster: MasterWorkerItem[] = useMemo(() => [
    // 유브갓 소속 (10명)
    { name: '송무준', employee_id: 'UB0001', company: '유브갓', part: '상담', team: '고객상담팀', position: '선임', clockIn: '08:50', hours: 8.0, variance: 0, task: '상담 공정 (인바운드)' },
    { name: '김철수', employee_id: 'UB0002', company: '유브갓', part: '상담', team: '고객상담팀', position: '사원', clockIn: '08:55', hours: 8.0, variance: 0, task: '상담 공정 (VIP전담)' },
    { name: '이영희', employee_id: 'UB0003', company: '유브갓', part: '상담', team: '고객상담팀', position: '책임', clockIn: '08:45', hours: 8.0, variance: 0, task: '상담 공정 (품질관리)' },
    { name: '박민수', employee_id: 'UB0004', company: '유브갓', part: '상담', team: '고객상담팀', position: '사원', clockIn: '08:58', hours: 8.0, variance: 0, task: '상담 공정 (VOC접수)' },
    { name: '정다은', employee_id: 'UB0005', company: '유브갓', part: '상담', team: '고객상담팀', position: '선임', clockIn: '08:50', hours: 8.0, variance: 0, task: '상담 공정 (야간대응)' },
    { name: '최현우', employee_id: 'UB0006', company: '유브갓', part: '상담', team: '고객상담팀', position: '사원', clockIn: '08:52', hours: 8.0, variance: 0, task: '상담 공정 (모니터링)' },
    { name: '강지혜', employee_id: 'UB0007', company: '유브갓', part: '상담', team: '고객상담팀', position: '선임', clockIn: '08:48', hours: 8.0, variance: 0, task: '상담 공정 (스크립트)' },
    { name: '윤서준', employee_id: 'UB0008', company: '유브갓', part: '상담', team: '고객상담팀', position: '사원', clockIn: '09:15', hours: 7.75, variance: 15, isWarning: true, reason: '지하철 2호선 지연 소명 접수', task: '상담 공정 (일반)' },
    { name: '임채원', employee_id: 'UB0009', company: '유브갓', part: '상담', team: '고객상담팀', position: '사원', clockIn: '08:50', hours: 8.0, variance: 0, task: '상담 공정 (해피콜)' },
    { name: '한도윤', employee_id: 'UB0010', company: '유브갓', part: '상담', team: '고객상담팀', position: '선임', clockIn: '08:40', hours: 8.0, variance: 0, task: '상담 공정 (운영지원)' },
    // (주)협력아이티에스 소속 (10명)
    { name: '김태호', employee_id: 'ITS001', company: '(주)협력아이티에스', part: '국제', team: '해외금융팀', position: '수석', clockIn: '08:45', hours: 8.0, variance: 0, task: '외환 전문 처리' },
    { name: '박수진', employee_id: 'ITS002', company: '(주)협력아이티에스', part: '국제', team: '해외금융팀', position: '책임', clockIn: '08:50', hours: 8.0, variance: 0, task: 'SWIFT 송금 공정' },
    { name: '이동욱', employee_id: 'ITS003', company: '(주)협력아이티에스', part: '국제', team: '해외금융팀', position: '선임', clockIn: '08:52', hours: 8.0, variance: 0, task: '해외승인 결제' },
    { name: '최은지', employee_id: 'ITS004', company: '(주)협력아이티에스', part: '국제', team: '해외금융팀', position: '사원', clockIn: '08:55', hours: 8.0, variance: 0, task: '환율 모니터링' },
    { name: '정승우', employee_id: 'ITS005', company: '(주)협력아이티에스', part: '국제', team: '해외금융팀', position: '선임', clockIn: '08:48', hours: 8.0, variance: 0, task: 'FDS 외환 이상감지' },
    { name: '오세훈', employee_id: 'ITS006', company: '(주)협력아이티에스', part: '오토', team: '오토금융팀', position: '책임', clockIn: '08:40', hours: 8.0, variance: 0, task: '오토리스 심사 도급' },
    { name: '배서현', employee_id: 'ITS007', company: '(주)협력아이티에스', part: '오토', team: '오토금융팀', position: '선임', clockIn: '08:50', hours: 8.0, variance: 0, task: '중고차 금융 정산' },
    { name: '신재원', employee_id: 'ITS008', company: '(주)협력아이티에스', part: '오토', team: '오토금융팀', position: '사원', clockIn: '08:53', hours: 8.0, variance: 0, task: '채권 서류 검수' },
    { name: '유하나', employee_id: 'ITS009', company: '(주)협력아이티에스', part: '오토', team: '오토금융팀', position: '선임', clockIn: '08:50', hours: 8.0, variance: 0, task: '제휴사 대사 업무' },
    { name: '조민기', employee_id: 'ITS010', company: '(주)협력아이티에스', part: '오토', team: '오토금융팀', position: '사원', clockIn: '08:58', hours: 8.0, variance: 0, task: '데이터 등록 공정' }
  ], []);

  // 전체 협력사 인력 마스터 데이터 (D1 실시간 연동 + Fallback)
  const [rosterWorkers, setRosterWorkers] = useState<MasterWorkerItem[]>(allWorkersMaster);
  const [isD1Connected, setIsD1Connected] = useState<boolean>(false);

  // DS 현장대리인 최종 승인 대기 소명 목록 (D1)
  const [pendingDsClarifications, setPendingDsClarifications] = useState<any[]>([]);
  // [3단계] 협력사 1차 결재 완료된 투입 인력 공백 사전 통보 목록 (D1 + dbService)
  const [pendingDsVacations, setPendingDsVacations] = useState<any[]>([]);
  const [dsToastMsg, setDsToastMsg] = useState<string | null>(null);

  // 1. D1 DB manpower_inputs 테이블에서 전체 협력사 투입 현황 실시간 조회
  const fetchD1Roster = async () => {
    try {
      const res = await fetch('/api/manpower');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && Array.isArray(json.data) && json.data.length > 0) {
          const d1Workers: MasterWorkerItem[] = json.data.map((row: any) => ({
            name: row.worker_name || row.name,
            employee_id: row.employee_id,
            company: row.partner_company || '유브갓',
            part: row.part_name || '상담',
            team: row.team_name || (row.partner_company === '유브갓' ? '고객상담팀' : '해외금융팀'),
            position: row.position_title || '사원',
            clockIn: row.clock_in_time || '08:50',
            hours: Number(row.actual_work_hours || 8.0),
            variance: Number(row.variance_minutes || 0),
            isWarning: Boolean(row.is_warning || row.variance_minutes > 0),
            reason: row.warning_reason,
            task: row.assigned_task || '도급 공정 수행'
          }));
          setRosterWorkers(d1Workers);
          setIsD1Connected(true);
          return;
        }
      }
    } catch (e) {
      console.warn('D1 Manpower fetch warn:', e);
    }
    // Fallback
    setRosterWorkers(allWorkersMaster);
  };

  // 2. D1 DB service_delivery_inspections 실시간 조회
  const fetchD1Inspections = async () => {
    try {
      const inspData = await dbService.fetchInspectionsFromD1();
      if (inspData && inspData.length > 0) {
        setInspections(inspData);
      }
    } catch (e) {
      console.warn('D1 Inspections fetch warn:', e);
    }
  };

  // 날짜/시간 포맷 헬퍼 (한국 표준시 KST YYYY-MM-DD HH:mm:ss)
  const formatDateTimeSec = (dateStr?: string | null): string => {
    return formatKstDateTime(dateStr);
  };

  const fetchPendingDsClarifications = async () => {
    try {
      // 🛡️ DS_PRINCIPAL_PM 역할로 조회: API 서버에서 PENDING_DS 상태만 필터링하여 반환
      const res = await fetch('/api/clarification-requests?role=DS_PRINCIPAL_PM');
      if (res.ok) {
        const json = await res.json();
        const all = json.data || [];
        // 🕒 신청일시(created_at) 기준 최신순(내림차순) 정렬
        const sorted = all
          .filter((c: any) => c.status === 'PENDING_DS')
          .sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
        setPendingDsClarifications(sorted);
      }
    } catch (e) {
      console.warn('DS 소명 조회 실패:', e);
    }
  };

  const fetchPendingDsVacations = async () => {
    try {
      // 🛡️ DS_PRINCIPAL_PM 역할로 조회: API 서버에서 PENDING_DS 상태만 필터링하여 반환
      const res = await fetch('/api/attendance/requests?role=DS_PRINCIPAL_PM');
      let d1Vacations: any[] = [];
      if (res.ok) {
        const json = await res.json();
        const all = json.data || [];
        d1Vacations = all.filter((r: any) => 
          (r.request_type === 'VACATION' || r.requestType === 'VACATION') && 
          r.status === 'PENDING_DS' // API에서 이미 필터링되지만 이중 방어
        );
      }

      // dbService 로컬 PENDING_DS 건도 병합
      const localPendingDs = dbService.getRequests()
        .filter(r => r.requestType === 'VACATION' && r.status === 'PENDING_DS')
        .map(r => ({
          id: r.id,
          employee_id: r.userId,
          user_name: r.userName,
          company_name: '유브갓',
          request_type: 'VACATION',
          vacation_type: r.reason?.includes('여름') ? '여름휴가' : r.reason?.includes('기타') ? '기타' : '연차',
          target_date: r.targetDate,
          hours: r.hours || 8,
          reason: r.reason,
          status: 'PENDING_DS',
          approver_name: r.partnerApproverName || '유브갓 현장대리인',
          created_at: (r as any).createdAt || '2026-08-30 09:00:00'
        }));

      const combined = [...d1Vacations];
      localPendingDs.forEach(l => {
        if (!combined.some(c => c.id === l.id)) {
          combined.unshift(l);
        }
      });

      // 🕒 신청일시(created_at) 기준 최신순(내림차순) 정렬 후 동일 인력+동일 일자 최종 1건만 유지
      const sorted = combined.sort((a, b) => (b.created_at || b.target_date || '').localeCompare(a.created_at || a.target_date || ''));
      const seenVacDates = new Set<string>();
      const deduplicatedVacations = sorted.filter(item => {
        const key = `${(item.user_name || item.employee_id || '').trim()}_${(item.target_date || '').trim()}`;
        if (seenVacDates.has(key)) return false;
        seenVacDates.add(key);
        return true;
      });

      setPendingDsVacations(deduplicatedVacations);
    } catch (e) {
      console.warn('DS 공백 사전통보 조회 실패:', e);
    }
  };

  const assignedPart = dbService.getCurrentUser()?.partName || '상담';

  // 🌟 DS총괄관리자는 전사 모든 데이터, DS현장대리인은 본인 파트 데이터만 추출
  const effectiveRosterWorkers = useMemo(() => {
    if (isDirector) return rosterWorkers;
    return rosterWorkers.filter(w => w.part === assignedPart || (assignedPart === '상담' && (w.part === '상담' || w.part === '고객상담' || w.company === '유브갓')));
  }, [isDirector, rosterWorkers, assignedPart]);

  const effectivePendingDsVacations = useMemo(() => {
    if (isDirector) return pendingDsVacations;
    return pendingDsVacations.filter(v => !v.part_name || v.part_name === assignedPart || (assignedPart === '상담' && (v.company_name === '유브갓' || v.company === '유브갓')));
  }, [isDirector, pendingDsVacations, assignedPart]);

  const effectivePendingDsClarifications = useMemo(() => {
    if (isDirector) return pendingDsClarifications;
    return pendingDsClarifications.filter(c => !c.part_name || c.part_name === assignedPart || (assignedPart === '상담' && (c.company_name === '유브갓' || c.company === '유브갓')));
  }, [isDirector, pendingDsClarifications, assignedPart]);

  const effectiveInspections = useMemo(() => {
    if (isDirector) return inspections;
    return inspections.filter(i => 
      !i.serviceCategory || 
      i.serviceCategory.includes(assignedPart) || 
      (i.projectName && i.projectName.includes(assignedPart)) || 
      (assignedPart === '상담' && (i.partnerCompany === '유브갓' || i.serviceCategory.includes('상담')))
    );
  }, [isDirector, inspections, assignedPart]);

  useEffect(() => {
    fetchD1Roster();
    fetchD1Inspections();
    fetchPendingDsClarifications();
    fetchPendingDsVacations();

    const handleUpdate = () => {
      fetchD1Roster();
      fetchD1Inspections();
      fetchPendingDsClarifications();
      fetchPendingDsVacations();
    };

    window.addEventListener('attendance_request_updated', handleUpdate);
    window.addEventListener('notification_updated', handleUpdate);

    // 15초마다 D1 DB 자동 동기화 유지
    const timer = setInterval(handleUpdate, 15000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('attendance_request_updated', handleUpdate);
      window.removeEventListener('notification_updated', handleUpdate);
    };
  }, []);

  const handleDsApprove = async (clarId: string) => {
    const memo = window.prompt('최종 승인 메모 (생략 가능):', '소명 내용 검토 완료. 해당 공수를 정상 인정 처리합니다.') ?? '';
    try {
      const res = await fetch(`/api/clarification-requests/${clarId}/ds-approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_id: 'S01832',
          approver_name: '조경훈 수석PM (신한DS)',
          memo
        })
      });
      const json = await res.json();
      setDsToastMsg(`✅ ${json.message}`);
      setTimeout(() => setDsToastMsg(null), 3500);

      // 🔔 알림센터 푸시
      dbService.addNotification({
        type: 'APPROVAL_COMPLETED',
        title: `✅ [SLA 소명 승인] 공수 정상 인정`,
        content: `신한DS 현장대리인(PM)이 소명서를 최종 승인하여 공수를 정상 인정하였습니다.`,
        targetRole: 'ALL'
      });

      fetchPendingDsClarifications();
    } catch (e) {
      alert('최종 승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handleDsReject = async (clarId: string) => {
    const memo = window.prompt('최종 반려 사유 (필수):', 'DS 최종 검토 결과 소명 불인정. 해당 공수 결손 처리됩니다.');
    if (!memo) return;
    try {
      const res = await fetch(`/api/clarification-requests/${clarId}/ds-reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_id: 'S01832',
          approver_name: '조경훈 수석PM (신한DS)',
          memo
        })
      });
      const json = await res.json();
      setDsToastMsg(`❌ ${json.message}`);
      setTimeout(() => setDsToastMsg(null), 3500);

      // 🔔 알림센터 푸시
      dbService.addNotification({
        type: 'REJECTION',
        title: `⚠️ [SLA 소명 반려] 결손 확정`,
        content: `신한DS 현장대리인(PM)이 소명서를 반려(불인정)하여 공수 결손이 확정되었습니다: ${memo}`,
        targetRole: 'ALL'
      });

      fetchPendingDsClarifications();
    } catch (e) {
      alert('최종 반려 처리 중 오류가 발생했습니다.');
    }
  };

  const handleDsApproveClarification = handleDsApprove;
  const handleDsRejectClarification = handleDsReject;

  // [3단계] 협력사 공백 사전 통보 최종 승인 (PM 도급 검수 - 원클릭 즉시 처리)
  const handleDsApproveVacation = async (reqId: string) => {
    const targetVac = pendingDsVacations.find(v => v.id === reqId);
    const targetName = targetVac?.user_name || '협력사 직원';
    const targetType = targetVac?.vacation_type || '휴가';
    const defaultMemo = '협력사 투입 공백 사전통보 확인 및 도급 공정 검수 승인 완료';

    setPendingDsVacations(prev => prev.filter(v => v.id !== reqId));
    dbService.updateRequestStatus(reqId, 'APPROVED', defaultMemo);
    setDsToastMsg('✅ [공정 검수 최종 승인 완료] 해당 인력의 공백이 도급 공정으로 정상 확정 승인되었습니다.');
    setTimeout(() => setDsToastMsg(null), 3500);

    // 🔔 알림센터 푸시
    dbService.addNotification({
      type: 'APPROVAL_COMPLETED',
      title: `✅ [최종 승인 완료] ${targetName}님 ${targetType} 승인`,
      content: `신한DS 현장대리인(PM)이 ${targetName}님의 투입 공백 건을 최종 검수 및 승인 완료하였습니다. (공수 정산 반영)`,
      targetRole: 'ALL'
    });

    try {
      await fetch(`/api/attendance/requests/${reqId}/ds-approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_name: '조경훈 수석PM (신한DS)',
          memo: defaultMemo
        })
      });
      fetchPendingDsVacations();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendance_request_updated'));
      }
    } catch (e) {
      console.warn('DS approve error:', e);
    }
  };

  const handleDsRejectVacation = async (reqId: string) => {
    const defaultRejectMemo = '공정 배포 일정 상 해당 일자 공백 불가 (대체인력 투입 협의 요망)';
    setPendingDsVacations(prev => prev.filter(v => v.id !== reqId));
    dbService.updateRequestStatus(reqId, 'REJECTED', defaultRejectMemo);
    setDsToastMsg('❌ [공정 검수 반려 완료] 공백 통보 건이 반려 처리되었습니다.');
    setTimeout(() => setDsToastMsg(null), 3500);

    // 🔔 알림센터 푸시
    dbService.addNotification({
      type: 'REJECTION',
      title: `⚠️ [공정 검수 반려] 투입 공백 반려 처리`,
      content: `신한DS 현장대리인(PM)이 공백 통보 건을 반려 처리하였습니다: ${defaultRejectMemo}`,
      targetRole: 'ALL'
    });

    try {
      await fetch(`/api/attendance/requests/${reqId}/ds-reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_name: '조경훈 수석PM (신한DS)',
          memo: defaultRejectMemo
        })
      });
      fetchPendingDsVacations();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendance_request_updated'));
      }
    } catch (e) {
      console.warn('DS reject error:', e);
    }
  };

  // 법적 방어형 SLA 계약 불이행 증거 아카이브 (Evidence Vault)
  const [evidences, setEvidences] = useState<SlaBreachEvidence[]>([
    {
      id: 'ev-01',
      partnerCompany: '(주)협력아이티에스',
      project: '신한 카드IS 개발운영',
      incidentDate: '2026-08-03',
      title: '계약 업무 개시시간(09:00) 투입 인력 공수 미달',
      varianceTime: '51분 결손 (0.85 Man-Hour)',
      financialPenalty: 42500,
      status: 'NOTICE_ISSUED',
      description: '계약서 제12조(업무 수행 시간)에 명시된 필수 상주 인력 투입 지연 발생 건 (협력사 자체 보정 승인 확인 완료)'
    },
    {
      id: 'ev-02',
      partnerCompany: '(주)협력아이티에스',
      project: '신한 카드IS 개발운영',
      incidentDate: '2026-08-10',
      title: '코어 정기 배포 시간대 계약 인력 배치 편차',
      varianceTime: '1시간 결손 (1.0 Man-Hour)',
      financialPenalty: 50000,
      status: 'EVIDENCE_RECORDED',
      description: '도급 계약 SLA 제5조에 따른 야간 이행 공수 결손에 대한 도급비 감액 청구 대상'
    }
  ]);

  const handleStartInspectionSign = (inspId: string) => {
    setPendingInspId(inspId);
    setIsSignatureModalOpen(true);
  };

  const handleSaveSignature = async (sigData: string, name: string) => {
    setSignatureDataUrl(sigData);
    setSignerName(name);
    if (pendingInspId) {
      await dbService.acceptContractInspection(pendingInspId, `신한DS 도급 검수 완료 (전자 서명자: ${name}): SLA 공수 정산 및 도급 대금 지급 승인`);
      const updated = await dbService.fetchInspectionsFromD1();
      setInspections(updated);
      setToastMsg(`🎉 [${name}] 전자 서명이 날인되어 도급 기성 검수가 확정되었습니다.`);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };


  const handleOpenNoticeModal = (ev: SlaBreachEvidence) => {
    setSelectedEvidenceForNotice(ev);
    setIsOfficialNoticeModalOpen(true);
  };

  const handleSendOfficialNotice = () => {
    if (!selectedEvidenceForNotice) return;

    setEvidences(evidences.map(e => 
      e.id === selectedEvidenceForNotice.id ? { ...e, status: 'NOTICE_ISSUED' } : e
    ));

    setIsOfficialNoticeModalOpen(false);
    setToastMsg(`📜 협력사 대표 및 현장대리인 앞으로 [계약 이행 미달(SLA) 시정 요구 및 용역비 감액 통지 공문]이 정식 발송되었습니다.`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '90px' }}>

      {/* 🌟 1. 신한DS 포털 5대 상단 메뉴 탭 바 (투입현황 / 검수포털 / 실적리포트 / 승인관리 / 법적증빙) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '0 4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        {/* 메뉴 1: 🚨 도급 공정 파트 관제 (기존 3개 파트 관제 시스템 - 국제/상담/오토금융) */}
        <button
          type="button"
          onClick={() => setMainTab('monitoring')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: mainTab === 'monitoring' ? '3px solid #0046FF' : '3px solid transparent',
            color: mainTab === 'monitoring' ? '#0046FF' : '#64748B',
            fontSize: '12px',
            fontWeight: mainTab === 'monitoring' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer'
          }}
        >
          <Radar size={13} />
          <span>파트관제</span>
        </button>

        {/* 메뉴 2: 🌟 소속 인력 투입 현황 (일별 / 주별 / 월별) */}
        <button
          type="button"
          onClick={() => setMainTab('roster')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: mainTab === 'roster' ? '3px solid #0046FF' : '3px solid transparent',
            color: mainTab === 'roster' ? '#0046FF' : '#64748B',
            fontSize: '12px',
            fontWeight: mainTab === 'roster' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer'
          }}
        >
          <TrendingUp size={13} />
          <span>투입현황</span>
        </button>

        {/* 메뉴 3: 도급 검수 대시보드 */}
        <button
          type="button"
          onClick={() => setMainTab('dashboard')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: mainTab === 'dashboard' ? '3px solid #0046FF' : '3px solid transparent',
            color: mainTab === 'dashboard' ? '#0046FF' : '#64748B',
            fontSize: '12px',
            fontWeight: mainTab === 'dashboard' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer'
          }}
        >
          <ShieldCheck size={13} />
          <span>검수포털</span>
        </button>

        {/* 메뉴 3: 🌟 도급 투입 실적 리포트 (목록 / 차트 / 엑셀 다운로드) */}
        <button
          type="button"
          onClick={() => setMainTab('report')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: mainTab === 'report' ? '3px solid #0046FF' : '3px solid transparent',
            color: mainTab === 'report' ? '#0046FF' : '#64748B',
            fontSize: '12px',
            fontWeight: mainTab === 'report' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer'
          }}
        >
          <FileText size={13} />
          <span>실적리포트</span>
        </button>

        {/* 메뉴 4: 🌟 승인관리 (협력사 1차 결재 건 최종 검수 승인/반려) */}
        <button
          type="button"
          onClick={() => setMainTab('approvals')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: mainTab === 'approvals' ? '3px solid #0046FF' : '3px solid transparent',
            color: mainTab === 'approvals' ? '#0046FF' : '#64748B',
            fontSize: '12px',
            fontWeight: mainTab === 'approvals' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <FileCheck size={13} />
          <span>승인관리</span>
          {(effectivePendingDsVacations.length + effectivePendingDsClarifications.length) > 0 && (
            <span style={{
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '10px'
            }}>
              {effectivePendingDsVacations.length + effectivePendingDsClarifications.length}
            </span>
          )}
        </button>

        {/* 메뉴 5: 법적 방어 아카이브 */}
        <button
          type="button"
          onClick={() => setMainTab('evidences')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: mainTab === 'evidences' ? '3px solid #0046FF' : '3px solid transparent',
            color: mainTab === 'evidences' ? '#0046FF' : '#64748B',
            fontSize: '12px',
            fontWeight: mainTab === 'evidences' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer'
          }}
        >
          <Scale size={13} />
          <span>법적증빙</span>
        </button>
      </div>

      {dsToastMsg && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '8px',
          background: dsToastMsg.startsWith('✅') ? '#ECFDF5' : '#FEF2F2',
          border: `1px solid ${dsToastMsg.startsWith('✅') ? '#6EE7B7' : '#FCA5A5'}`,
          fontSize: '13px',
          fontWeight: 700,
          color: dsToastMsg.startsWith('✅') ? '#065F46' : '#991B1B'
        }}>
          {dsToastMsg}
        </div>
      )}

      {/* 🌟 권한 기반 파트 관제 범위 안내 바 */}
      <div style={{
        background: isDirector ? '#FAF5FF' : '#EFF6FF',
        border: `1px solid ${isDirector ? '#E9D5FF' : '#BFDBFE'}`,
        borderRadius: '10px',
        padding: '8px 12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={15} color={isDirector ? '#9333EA' : '#0046FF'} />
          <span style={{ fontWeight: 800, color: isDirector ? '#6B21A8' : '#1E40AF' }}>
            {isDirector 
              ? '👑 [DS총괄담당자] 전사 모든 파트 및 전체 인력 통합 관제 권한' 
              : `🛡️ [DS현장대리인] ${assignedPart} 파트 전담 관제 (소속 인력 ${effectiveRosterWorkers.length}명)`}
          </span>
        </div>
        <span style={{ fontSize: '11px', color: isDirector ? '#A855F7' : '#2563EB', fontWeight: 700 }}>
          {isDirector ? '전체 파트 조회 가능' : '전담 파트 전용'}
        </span>
      </div>

      {/* ========================================================================= */}
      {/* 탭 0 전용 화면: 🚨 파트관제 (기존 3개 도급 공정 파트 관제 시스템 - 국제/상담/오토금융) */}
      {/* ========================================================================= */}
      {mainTab === 'monitoring' && (
        <ContractFulfillmentDashboardView
          currentUser={dbService.getCurrentUser()}
          themeMode={themeMode}
        />
      )}

      {/* ========================================================================= */}
      {/* 탭 1 전용 화면: 🌟 투입현황 (일별 / 주별 / 월별 전사 도급 인력 관제 - D1 DB 실시간) */}
      {/* ========================================================================= */}
      {mainTab === 'roster' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* D1 DB 연결 상태 및 실시간 안내 배지 */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: isD1Connected ? '#ECFDF5' : '#F8FAFC',
            border: `1px solid ${isD1Connected ? '#A7F3D0' : '#E2E8F0'}`,
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '11.5px',
            color: isD1Connected ? '#065F46' : '#64748B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <span style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                background: isD1Connected ? '#10B981' : '#3B82F6',
                display: 'inline-block'
              }} />
              <span>{isD1Connected ? 'Cloudflare D1 DB 실시간 동기화 가동 중 (manpower_inputs)' : 'Cloudflare D1 DB 인력 마스터 연동 가동 중'}</span>
            </div>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>15초 자동 갱신</span>
          </div>

          {/* 1. 협력사 선택 필터 칩 */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '2px' }}>
            {[
              { key: 'ALL', label: `전체 대상 (${effectiveRosterWorkers.length}명)` },
              { key: '유브갓', label: `유브갓 (${effectiveRosterWorkers.filter((w: MasterWorkerItem) => w.company === '유브갓').length}명)` },
              { key: '(주)협력아이티에스', label: `협력ITS (${effectiveRosterWorkers.filter((w: MasterWorkerItem) => w.company === '(주)협력아이티에스').length}명)` }
            ].map(chip => (
              <button
                key={chip.key}
                type="button"
                onClick={() => setSelectedPartnerFilter(chip.key)}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: selectedPartnerFilter === chip.key ? '1.5px solid #0046FF' : '1px solid #CBD5E1',
                  background: selectedPartnerFilter === chip.key ? '#EFF6FF' : '#FFFFFF',
                  color: selectedPartnerFilter === chip.key ? '#0046FF' : '#475569',
                  fontSize: '12px',
                  fontWeight: selectedPartnerFilter === chip.key ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* 2. 상단 기간 뷰 세그먼트 컨트롤러 (일별 / 주별 / 월별) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            background: '#F1F5F9',
            borderRadius: '10px',
            padding: '3px',
            gap: '3px'
          }}>
            <button
              type="button"
              onClick={() => setTimeFrame('daily')}
              style={{
                padding: '8px 0',
                borderRadius: '8px',
                border: 'none',
                background: timeFrame === 'daily' ? '#FFFFFF' : 'transparent',
                color: timeFrame === 'daily' ? '#0046FF' : '#64748B',
                fontWeight: timeFrame === 'daily' ? 800 : 600,
                fontSize: '12px',
                boxShadow: timeFrame === 'daily' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              📅 일별 투입
            </button>
            <button
              type="button"
              onClick={() => setTimeFrame('weekly')}
              style={{
                padding: '8px 0',
                borderRadius: '8px',
                border: 'none',
                background: timeFrame === 'weekly' ? '#FFFFFF' : 'transparent',
                color: timeFrame === 'weekly' ? '#0046FF' : '#64748B',
                fontWeight: timeFrame === 'weekly' ? 800 : 600,
                fontSize: '12px',
                boxShadow: timeFrame === 'weekly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              🗓️ 주별 (40h)
            </button>
            <button
              type="button"
              onClick={() => setTimeFrame('monthly')}
              style={{
                padding: '8px 0',
                borderRadius: '8px',
                border: 'none',
                background: timeFrame === 'monthly' ? '#FFFFFF' : 'transparent',
                color: timeFrame === 'monthly' ? '#0046FF' : '#64748B',
                fontWeight: timeFrame === 'monthly' ? 800 : 600,
                fontSize: '12px',
                boxShadow: timeFrame === 'monthly' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer'
              }}
            >
              📊 월별 (M/M)
            </button>
          </div>

          {/* 3. 기간 네비게이터 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#FFFFFF',
            borderRadius: '10px',
            padding: '8px 14px',
            border: '1px solid #E2E8F0',
            fontSize: '13px',
            fontWeight: 800,
            color: '#1E293B'
          }}>
            <button type="button" style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '15px' }}>◀</button>
            <span>
              {timeFrame === 'daily' && '2026년 8월 30일 (오늘)'}
              {timeFrame === 'weekly' && '2026년 8월 4주차 (08.24 ~ 08.30)'}
              {timeFrame === 'monthly' && '2026년 8월 계약 정산 (08.01 ~ 08.31)'}
            </span>
            <button type="button" style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: '15px' }}>▶</button>
          </div>

          {/* 4. 모드별 지능형 도급 KPI 대시보드 */}
          {timeFrame === 'daily' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={kpiBoxStyle}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>총 도급 인력</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                  {effectiveRosterWorkers.filter((w: MasterWorkerItem) => selectedPartnerFilter === 'ALL' || w.company === selectedPartnerFilter).length}명
                </div>
              </div>
              <div style={kpiBoxStyle}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>정상 투입</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
                  {effectiveRosterWorkers.filter((w: MasterWorkerItem) => (selectedPartnerFilter === 'ALL' || w.company === selectedPartnerFilter) && !w.isWarning).length}명
                </div>
              </div>
              <div style={kpiBoxStyle}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>소명/지연 관리</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>
                  {effectiveRosterWorkers.filter((w: MasterWorkerItem) => (selectedPartnerFilter === 'ALL' || w.company === selectedPartnerFilter) && w.isWarning).length}건
                </div>
              </div>
            </div>
          )}

          {timeFrame === 'weekly' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={kpiBoxStyle}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>주간 총 투입 공수</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0046FF', marginTop: '2px' }}>
                  {isDirector ? (selectedPartnerFilter === 'ALL' ? '798.5h' : '398.5h') : '398.5h'}
                </div>
              </div>
              <div style={kpiBoxStyle}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>주간 SLA 준수율</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>99.8%</div>
              </div>
              <div style={kpiBoxStyle}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>52시간 초과 위험</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#10B981', marginTop: '2px' }}>0명 (안전)</div>
              </div>
            </div>
          )}

          {timeFrame === 'monthly' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={kpiBoxStyle}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>총 약정 인력</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0046FF', marginTop: '2px' }}>
                  {isDirector ? (selectedPartnerFilter === 'ALL' ? '20.0 M/M' : '10.0 M/M') : `${effectiveRosterWorkers.length}.0 M/M`}
                </div>
              </div>
              <div style={kpiBoxStyle}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>실투입 실적</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
                  {isDirector ? (selectedPartnerFilter === 'ALL' ? '19.98 M/M' : '9.98 M/M') : `${(effectiveRosterWorkers.length * 0.998).toFixed(2)} M/M`}
                </div>
              </div>
              <div style={kpiBoxStyle}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>계약 이행률</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>99.9%</div>
              </div>
            </div>
          )}

          {/* 5. 소속 인력별 투입 상세 카드 리스트 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {effectiveRosterWorkers
              .filter((w: MasterWorkerItem) => selectedPartnerFilter === 'ALL' || w.company === selectedPartnerFilter)
              .map((worker: MasterWorkerItem) => (
                <div
                  key={worker.employee_id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '14px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: worker.company === '유브갓' ? '#EFF6FF' : '#F0FDF4',
                        color: worker.company === '유브갓' ? '#0052FF' : '#16A34A'
                      }}>
                        {worker.company}
                      </span>
                      <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A' }}>
                        {worker.name}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {worker.position} · {worker.part}파트
                      </span>
                    </div>

                    {/* 모드별 상태 배지 */}
                    {timeFrame === 'daily' && (
                      worker.isWarning ? (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#D97706',
                          background: '#FEF3C7',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          지연 소명
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#16A34A',
                          background: '#DCFCE7',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          정상 투입
                        </span>
                      )
                    )}

                    {timeFrame === 'weekly' && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#0046FF',
                        background: '#EFF6FF',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {worker.isWarning ? '38.5h (준수)' : '40.0h (완료)'}
                      </span>
                    )}

                    {timeFrame === 'monthly' && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#16A34A',
                        background: '#DCFCE7',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        1.0 M/M (100%)
                      </span>
                    )}
                  </div>

                  {/* 1) 일별 상세 */}
                  {timeFrame === 'daily' && (
                    <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span>🕒 출근: <strong>{worker.clockIn} ~ 18:00</strong></span>
                      <span>실적: <strong>1 M/D ({worker.hours}h)</strong> / 약정 8.0h</span>
                      {worker.variance > 0 && (
                        <span style={{ color: '#D97706', fontWeight: 700 }}>
                          (지연 +{worker.variance}분)
                        </span>
                      )}
                    </div>
                  )}

                  {/* 2) 주별 상세 */}
                  {timeFrame === 'weekly' && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                      <span style={{ fontSize: '12px', color: '#475569' }}>
                        주간 실적: <strong>{worker.isWarning ? '38.5h' : '40.0h'} (5 M/D)</strong>
                      </span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['월', '화', '수', '목', '금'].map((d, i) => (
                          <div key={d} style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '8px',
                            background: (worker.isWarning && i === 3) ? '#FEF3C7' : '#DCFCE7',
                            color: (worker.isWarning && i === 3) ? '#D97706' : '#16A34A',
                            fontSize: '8.5px',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3) 월별 상세 */}
                  {timeFrame === 'monthly' && (
                    <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                      <span>월간 누적: <strong>{worker.isWarning ? '20.8 M/D (166.5h)' : '21.0 M/D (168h)'}</strong></span>
                      <span style={{ color: '#0046FF', fontWeight: 800 }}>약정: 1.0 M/M</span>
                    </div>
                  )}

                  <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>공정: {worker.task} · {worker.team}</span>
                    
                    {/* 편차/지연 발생 시 원청 DS PM이 협력사 관리인 앞 공식 소명 요구 발송 버튼 */}
                    {(worker.isWarning || worker.variance > 0) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedWorkerForDemand({
                            name: worker.name,
                            id: worker.employee_id,
                            company: worker.company,
                            date: selectedDay,
                            varianceMinutes: worker.variance || 15,
                            clockIn: worker.clockIn
                          });
                          setIsDemandClarificationModalOpen(true);
                        }}
                        style={{
                          background: '#FEF2F2',
                          color: '#DC2626',
                          border: '1px solid #FECACA',
                          borderRadius: '6px',
                          padding: '3px 8px',
                          fontSize: '10.5px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <AlertTriangle size={11} />
                        <span>협력사 앞 소명 요구</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 탭 4 전용 화면: 🌟 승인관리 (협력사 1차 결재 완료된 건 최종 검수 승인/반려) */}
      {/* ========================================================================= */}
      {mainTab === 'approvals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 승인관리 상단 KPI 요약 & 일괄 승인 바 */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck size={18} color="#0046FF" />
                <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                  협력사 1차 승인 건 원청 최종 검수
                </span>
              </div>
              
              {(pendingDsVacations.length + pendingDsClarifications.length) > 0 && (
                <button
                  onClick={async () => {
                    const totalPending = pendingDsVacations.length + pendingDsClarifications.length;
                    // 전체 일괄 승인 실행
                    for (const v of pendingDsVacations) {
                      await handleDsApproveVacation(v.id);
                    }
                    for (const c of pendingDsClarifications) {
                      await handleDsApproveClarification(c.id);
                    }
                    setDsToastMsg(`🎉 [일괄 승인 완료] ${totalPending}건의 협력사 승인 요청이 모두 원청 최종 검수 승인되었습니다.`);
                    setTimeout(() => setDsToastMsg(null), 4000);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #0046FF 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 6px rgba(0, 70, 255, 0.25)'
                  }}
                >
                  <Sparkles size={13} />
                  <span>전체 {effectivePendingDsVacations.length + effectivePendingDsClarifications.length}건 일괄 승인</span>
                </button>
              )}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              textAlign: 'center',
              background: '#F8FAFC',
              padding: '10px',
              borderRadius: '10px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>총 결재 대기</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#DC2626', marginTop: '2px' }}>
                  {effectivePendingDsVacations.length + effectivePendingDsClarifications.length}건
                </div>
              </div>
              <div style={{ borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>휴가·공백 통보</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0046FF', marginTop: '2px' }}>
                  {effectivePendingDsVacations.length}건
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>SLA 소명서</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>
                  {effectivePendingDsClarifications.length}건
                </div>
              </div>
            </div>
          </div>

          {/* 승인관리 서브 탭 필터 바 */}
          <div style={{
            display: 'flex',
            background: '#F1F5F9',
            padding: '3px',
            borderRadius: '10px',
            gap: '3px'
          }}>
            <button
              onClick={() => setApprovalSubFilter('ALL')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '8px',
                border: 'none',
                background: approvalSubFilter === 'ALL' ? '#FFFFFF' : 'transparent',
                color: approvalSubFilter === 'ALL' ? '#0F172A' : '#64748B',
                fontWeight: approvalSubFilter === 'ALL' ? 800 : 600,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: approvalSubFilter === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              전체 ({effectivePendingDsVacations.length + effectivePendingDsClarifications.length})
            </button>
            <button
              onClick={() => setApprovalSubFilter('VACATION')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '8px',
                border: 'none',
                background: approvalSubFilter === 'VACATION' ? '#FFFFFF' : 'transparent',
                color: approvalSubFilter === 'VACATION' ? '#0046FF' : '#64748B',
                fontWeight: approvalSubFilter === 'VACATION' ? 800 : 600,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: approvalSubFilter === 'VACATION' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              🏖️ 휴가·공백 ({effectivePendingDsVacations.length})
            </button>
            <button
              onClick={() => setApprovalSubFilter('CLARIFICATION')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: '8px',
                border: 'none',
                background: approvalSubFilter === 'CLARIFICATION' ? '#FFFFFF' : 'transparent',
                color: approvalSubFilter === 'CLARIFICATION' ? '#D97706' : '#64748B',
                fontWeight: approvalSubFilter === 'CLARIFICATION' ? 800 : 600,
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: approvalSubFilter === 'CLARIFICATION' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              📝 SLA 소명 ({effectivePendingDsClarifications.length})
            </button>
          </div>

          {/* 3단계 도급 법적 방어 안내 박스 */}
          <div style={{
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '10px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#1E40AF',
            lineHeight: 1.5
          }}>
            🛡️ <strong>3단계 도급 공정 최종 검수 (원청 DS PM 승인)</strong><br />
            협력사 관리인이 1차 승인한 건에 대해 신한DS 현장대리인(PM)이 도급 공정 영향도를 검수하여 당월 도급 기성 공수에 반영합니다.
          </div>

          {/* 1. 협력사 투입 공백 사전 통보 (휴가 등) 목록 */}
          {(approvalSubFilter === 'ALL' || approvalSubFilter === 'VACATION') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} color="#0046FF" />
                <span>협력사 투입 공백 사전 통보 ({effectivePendingDsVacations.length}건)</span>
              </div>

              {effectivePendingDsVacations.length === 0 ? (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B'
                }}>
                  <CheckCircle2 size={28} color="#10B981" style={{ margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    대기 중인 협력사 공백 통보 건이 없습니다.
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                    협력사 관리인이 1차 승인한 건이 실시간 연동되어 이곳에 표시됩니다.
                  </div>
                </div>
              ) : (
                effectivePendingDsVacations.map((vac) => (
                  <div
                    key={vac.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '14px',
                      padding: '16px',
                      border: '1.5px solid #0052FF',
                      boxShadow: '0 2px 8px rgba(0, 82, 255, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '5px',
                          background: '#EFF6FF',
                          color: '#0052FF'
                        }}>
                          {vac.vacation_type || '휴가'}
                        </span>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                          {vac.user_name || '소속 직원'}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          ({vac.company_name || '유브갓'})
                        </span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#0284C7',
                        background: '#E0F2FE',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        📢 협력사 1차 승인 완료 (검수 대기)
                      </span>
                    </div>

                    {/* 3단계 진행 바 */}
                    <div style={{
                      background: '#F8FAFC',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px'
                    }}>
                      <span style={{ color: '#16A34A', fontWeight: 800 }}>① 협력사 승인 완료 ✓</span>
                      <span style={{ color: '#94A3B8' }}>➔</span>
                      <span style={{ color: '#0046FF', fontWeight: 900 }}>② 원청DS 공정검수 중 ⏳</span>
                      <span style={{ color: '#94A3B8' }}>➔</span>
                      <span style={{ color: '#94A3B8', fontWeight: 600 }}>③ 최종 정산 확정</span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <div>📅 공백 기간: <strong>{vac.target_date}</strong> • 공백 공수: <strong>{vac.hours || 8}시간 (1 M/D)</strong></div>
                      <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={12} color="#8B95A1" />
                        <span>신청 일시: <strong style={{ color: '#1E293B' }}>{formatDateTimeSec(vac.created_at)}</strong></span>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: '#475569',
                      background: '#F8FAFC',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid #F1F5F9'
                    }}>
                      <strong>사유:</strong> {vac.reason || '소속사 휴가 사용'}
                    </div>

                    {vac.approver_name && (
                      <div style={{
                        fontSize: '11.5px',
                        color: '#059669',
                        background: '#ECFDF5',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #D1FAE5',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>🏢 1차 결재자: <strong>{vac.approver_name}</strong></span>
                        {vac.partner_approved_at && (
                          <span style={{ fontSize: '11px', color: '#047857' }}>
                            1차 승인: {formatDateTimeSec(vac.partner_approved_at)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* DS PM 최종 승인 / 반려 액션 버튼 */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleDsApproveVacation(vac.id)}
                        style={{
                          flex: 1,
                          height: '42px',
                          background: '#0052FF',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 800,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(0, 82, 255, 0.3)'
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>공정 검수 완료 및 공수 인정</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDsRejectVacation(vac.id)}
                        style={{
                          padding: '0 16px',
                          height: '42px',
                          background: '#FEF2F2',
                          color: '#DC2626',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 800,
                          border: '1px solid #FCA5A5',
                          cursor: 'pointer'
                        }}
                      >
                        반려
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* 2. 협력사 SLA 소명서 검수 목록 */}
          {(approvalSubFilter === 'ALL' || approvalSubFilter === 'CLARIFICATION') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#991B1B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={15} color="#DC2626" />
                <span>SLA 공수 결손 소명서 검수 ({effectivePendingDsClarifications.length}건)</span>
              </div>

              {effectivePendingDsClarifications.length === 0 ? (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B'
                }}>
                  <CheckCircle2 size={28} color="#10B981" style={{ margin: '0 auto 6px auto' }} />
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    대기 중인 SLA 소명서가 없습니다.
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                    지각 또는 출근 누락 소명 건이 1차 승인되면 이곳에 표시됩니다.
                  </div>
                </div>
              ) : (
                effectivePendingDsClarifications.map(clar => (
                  <div key={clar.id} style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '16px',
                    border: '1px solid #FECACA',
                    boxShadow: '0 2px 8px rgba(220, 38, 38, 0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                        {clar.incident_type === 'LATE' ? '⏰ 지각 투입 소명' : '📋 출근 누락 소명'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#2563EB', background: '#EFF6FF', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        협력사 1차 승인완료
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      {clar.employee_name} · {clar.company_name} · {clar.incident_date}
                    </div>

                    <div style={{ fontSize: '12px', color: '#374151', background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px' }}>
                      <strong>소명 사유:</strong> {clar.reason_text}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleDsApproveClarification(clar.id)}
                        style={{
                          flex: 1,
                          height: '40px',
                          background: '#16A34A',
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 800,
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ 소명 수용 (도급비 감액 면제)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDsRejectClarification(clar.id)}
                        style={{
                          padding: '0 16px',
                          height: '40px',
                          background: '#FEF2F2',
                          color: '#DC2626',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 800,
                          border: '1px solid #FCA5A5',
                          cursor: 'pointer'
                        }}
                      >
                        소명 기각
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* 탭 2: 🛡️ 검수포털 (도급 계약 이행 M/M 검수, AI 감사 시뮬레이터, 전자서명) */}
      {/* ========================================================================= */}
      {mainTab === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 1. 상단 법적 컴플라이언스 보호막 안내 배너 */}
          <div style={{
        background: '#EDF3FF',
        border: '1.5px solid #ADC6FF',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#002C8C', fontSize: '14px', fontWeight: 800 }}>
          <ShieldCheck size={20} color="#0046FF" />
          <span>신한DS 도급 계약 검수 포털 (Contract Performance & SLA)</span>
        </div>
        <p style={{ fontSize: '12px', color: '#1D39C4', lineHeight: 1.5, margin: 0 }}>
          ⚖️ <strong>노란봉투법 & 파견법 세이프가드 가동 중</strong><br />
          신한DS(원청)는 하청 근로자 개인에 대한 인사권(지각 판단, 징계, 근태 수정)을 행사하지 않으며, 
          <strong>'협력사별 총 투입 인력(Man-Power) 준수율'</strong> 및 <strong>'도급 계약상 SLA 이행 검수'</strong>를 통해 용역비 감액/손해배상 청구 근거를 적법하게 확보합니다.
        </p>
      </div>

      {/* 1-2. 🤖 Google Gemini AI 3대 지능형 관리 무기 툴바 */}
      <div style={{
        background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
        borderRadius: '14px',
        padding: '14px 16px',
        color: '#FFFFFF',
        boxShadow: '0 4px 14px rgba(30, 27, 75, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#A5B4FC" />
            <span style={{ fontSize: '13.5px', fontWeight: 900, letterSpacing: '0.3px', color: '#FFFFFF' }}>
              Google Gemini AI 지능형 도급 관리 4대 솔루션
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#C7D2FE', fontWeight: 700, background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '12px' }}>
            SLA 엔진 가동중
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {/* AI 무기 1: 소명 사유 자동 판독 */}
          <button
            type="button"
            onClick={() => setIsAiClarificationModalOpen(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(165, 180, 252, 0.3)',
              borderRadius: '8px',
              padding: '8px 4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              transition: 'all 0.15s ease'
            }}
          >
            <Scale size={15} color="#A5B4FC" />
            <span style={{ fontSize: '11px', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap' }}>
              1. 소명 판독
            </span>
            <span style={{ fontSize: '9px', color: '#C7D2FE', textAlign: 'center' }}>
              SLA 자동 태깅
            </span>
          </button>

          {/* AI 무기 2: 월말 감액 공문 작성 */}
          <button
            type="button"
            onClick={() => setIsAiNoticeGeneratorModalOpen(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(165, 180, 252, 0.3)',
              borderRadius: '8px',
              padding: '8px 4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={15} color="#38BDF8" />
            <span style={{ fontSize: '11px', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap' }}>
              2. 공문 생성
            </span>
            <span style={{ fontSize: '9px', color: '#C7D2FE', textAlign: 'center' }}>
              정산 감액 공문
            </span>
          </button>

          {/* AI 무기 3: 꼼수 패턴 레이더 */}
          <button
            type="button"
            onClick={() => setIsAiAnomalyRadarModalOpen(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(253, 164, 175, 0.3)',
              borderRadius: '8px',
              padding: '8px 4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              transition: 'all 0.15s ease'
            }}
          >
            <Radar size={15} color="#FDA4AF" />
            <span style={{ fontSize: '11px', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap' }}>
              3. 패턴 탐지
            </span>
            <span style={{ fontSize: '9px', color: '#FECDD3', textAlign: 'center' }}>
              이상 징후 레이더
            </span>
          </button>

          {/* AI 무기 4: 🕵️‍♂️ 모의 노동청 감사 시뮬레이터 */}
          <button
            type="button"
            onClick={() => setIsAiLaborInspectorModalOpen(true)}
            style={{
              background: 'rgba(251, 191, 36, 0.15)',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              borderRadius: '8px',
              padding: '8px 4px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              transition: 'all 0.15s ease'
            }}
          >
            <ShieldCheck size={15} color="#FDE047" />
            <span style={{ fontSize: '11px', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap', color: '#FEF08A' }}>
              4. 노동청 감사
            </span>
            <span style={{ fontSize: '9px', color: '#FEF08A', textAlign: 'center' }}>
              근로감독관 역추적
            </span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div style={{
          background: '#191F28',
          color: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toastMsg}
        </div>
      )}

      {/* 2. 총 투입 공수(Man-Power) 및 SLA 준수율 KPI 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>총 도급 SM 운영 파트</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#191F28', marginTop: '4px' }}>2개</div>
        </div>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>총 약정 공수</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0046FF', marginTop: '4px' }}>24.0 M/M</div>
        </div>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>평균 SLA 준수율</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#12B76A', marginTop: '4px' }}>99.6%</div>
        </div>
      </div>

      {/* 2-2. 📢 [3단계 결재] 협력사 1차 결재 완료된 투입 인력 공백 사전 통보 및 도급 공정 검수 대기 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={18} color="#0052FF" />
            <span>협력사 투입 공백 사전 통보 및 공정 검수 ({pendingDsVacations.length}건 대기)</span>
          </div>
          <span style={{ fontSize: '11.5px', color: '#0052FF', fontWeight: 700, background: '#EFF6FF', padding: '2px 8px', borderRadius: '12px' }}>
            3단계 원청 최종 검수
          </span>
        </div>

        {pendingDsVacations.length === 0 ? (
          <div style={{
            background: '#FFFFFF',
            borderRadius: '12px',
            padding: '24px 16px',
            textAlign: 'center',
            border: '1px solid #ECEFF2',
            color: '#8B95A1',
            fontSize: '13px'
          }}>
            현재 신한DS PM의 검수 승인을 대기 중인 협력사 공백 통보 내역이 없습니다.
          </div>
        ) : (
          pendingDsVacations.map((vac) => (
            <div
              key={vac.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '16px',
                border: '1.5px solid #BFDBFE',
                boxShadow: '0 2px 8px rgba(0, 82, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#DBEAFE',
                      color: '#1D4ED8'
                    }}>
                      {vac.company_name || vac.partner_company || '협력사'}
                    </span>
                    <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#191F28' }}>
                      {vac.user_name || '투입 인력'} ({vac.vacation_type || '휴가/공백'})
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7684', marginTop: '4px' }}>
                    📅 공백 일정: <strong>{vac.target_date}</strong> (공수: {vac.hours || 8}시간)
                  </div>
                </div>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#D97706',
                  background: '#FEF3C7',
                  padding: '3px 8px',
                  borderRadius: '6px'
                }}>
                  협력사 1차 결재 완료 (PM 검수 대기)
                </span>
              </div>

              <div style={{
                background: '#F8FAFC',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#334155',
                border: '1px solid #F1F5F9'
              }}>
                <div><strong>사유:</strong> {vac.reason}</div>
                {vac.approver_name && (
                  <div style={{ marginTop: '3px', fontSize: '11.5px', color: '#64748B' }}>
                    • 1차 결재자: {vac.approver_name} ({vac.review_comment || '통보 완료'})
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleDsApproveVacation(vac.id)}
                  style={{
                    flex: 1,
                    height: '38px',
                    background: '#0052FF',
                    color: '#FFFFFF',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0, 82, 255, 0.25)'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>공정 투입 공백 최종 승인 및 검수 완료</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDsRejectVacation(vac.id)}
                  style={{
                    padding: '0 16px',
                    height: '38px',
                    background: '#F1F5F9',
                    color: '#EF4444',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer'
                  }}
                >
                  반려
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 3. 섹션: 협력사별 총 투입 인력(Man-Power) 이행 검수 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileCheck size={18} color="#4E5968" />
            <span>협력사별 월간 투입 공수(M/M) 정산 검수</span>
          </div>

          <button
            onClick={() => setIsAuditReportModalOpen(true)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.2)'
            }}
          >
            <FileText size={14} color="#38BDF8" />
            <span>📄 노동청 감사 리포트 출력</span>
          </button>
        </div>

        {inspections.map(insp => (
          <div
            key={insp.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #ECEFF2',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#191F28' }}>
                {insp.projectName}
              </span>
              <span style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: insp.status === 'INSPECTED_ACCEPTED' ? '#12B76A' : '#FF9500',
                background: insp.status === 'INSPECTED_ACCEPTED' ? '#E8F8F0' : '#FFF9E6',
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                {insp.status === 'INSPECTED_ACCEPTED' ? '검수 완료 (전자서명 날인됨)' : '검수 대기중'}
              </span>
            </div>

            <div style={{ fontSize: '12.5px', color: '#6B7684', marginBottom: '12px', lineHeight: 1.4 }}>
              • 도급 수급인: <strong>{insp.partnerCompanyName}</strong> (현장대리인: {insp.partnerSiteRepName})<br />
              • 검수 정산 주기: {insp.inspectionMonth}
            </div>

            {/* 투입 인력 M/M 준수율 게이지 */}
            <div style={{ background: '#F8F9FA', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: '#4E5968' }}>약정 인력: <strong>{insp.contractedManMonths} M/M</strong></span>
                <span style={{ color: '#0046FF', fontWeight: 800 }}>실투입 인력: {insp.actualDeliveredManMonths} M/M ({insp.complianceRate}%)</span>
              </div>
              <div style={{ height: '7px', background: '#E5E8EB', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${insp.complianceRate}%`, height: '100%', background: '#0046FF', borderRadius: '4px' }} />
              </div>
            </div>

            {insp.inspectionNotes && (
              <div style={{ fontSize: '12px', color: '#4E5968', marginBottom: '12px', background: '#FAFAFA', padding: '8px 10px', borderRadius: '6px' }}>
                ℹ️ {insp.inspectionNotes}
              </div>
            )}

            {insp.status === 'SUBMITTED' && (
              <button
                onClick={() => handleStartInspectionSign(insp.id)}
                style={{
                  width: '100%',
                  height: '42px',
                  background: '#0046FF',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={16} />
                <span>전자 서명 날인 및 도급 공수 이행 검수 확정</span>
              </button>
            )}
          </div>
        ))}
      </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 탭 3: 📑 실적리포트 (도급 투입 실적 리포트 - 목록 / 차트 / 엑셀 다운로드) */}
      {/* ========================================================================= */}
      {mainTab === 'report' && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <AttendanceReportView 
            themeMode={themeMode} 
            currentUser={dbService.getCurrentUser()} 
            hideBackBtn={true} 
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 탭 5: ⚖️ 법적증빙 (계약 이행 미달 SLA 증거 아카이브 & 감액 공문) */}
      {/* ========================================================================= */}
      {mainTab === 'evidences' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 섹션: 계약 이행 미달(SLA 미준수) 증거 아카이브 (Evidence Vault) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Scale size={18} color="#D9480F" />
                <span>계약 이행 미달(SLA) 증거 및 도급비 감액 산출 내역</span>
              </div>
              <span style={{ fontSize: '11.5px', color: '#8B95A1' }}>징계 ❌ / 계약 패널티 ⭕</span>
            </div>

            {evidences.map(ev => (
              <div
                key={ev.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #ECEFF2',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#8B95A1' }}>
                      {ev.incidentDate} · {ev.partnerCompany}
                    </span>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#191F28', marginTop: '2px' }}>
                      {ev.title}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: ev.status === 'NOTICE_ISSUED' ? '#0066FF' : '#D9480F',
                    background: ev.status === 'NOTICE_ISSUED' ? '#EDF3FF' : '#FFF4E6',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {ev.status === 'NOTICE_ISSUED' ? '공문 발송완료' : '증거 기록됨'}
                  </span>
                </div>

                <p style={{ fontSize: '12.5px', color: '#4E5968', lineHeight: 1.4, margin: 0 }}>
                  {ev.description}
                </p>

                <div style={{
                  background: '#FFF9F5',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #FFE8D6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#8B95A1' }}>투입 결손 편차</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#191F28' }}>{ev.varianceTime}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11.5px', color: '#8B95A1' }}>도급 용역비 감액 산정액</span>
                    <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#D9480F' }}>
                      -₩{ev.financialPenalty.toLocaleString()}원
                    </div>
                  </div>
                </div>

                {ev.status === 'EVIDENCE_RECORDED' && (
                  <button
                    onClick={() => handleOpenNoticeModal(ev)}
                    style={{
                      height: '38px',
                      background: '#191F28',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    <Send size={15} />
                    <span>협력사에 공식 시정 요구 및 감액 통지 공문 발행</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* 물리 보안 출입로그 정책 (산안법 & 보안 목적) */}
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #ECEFF2',
            borderRadius: '12px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 800, color: '#191F28' }}>
              <Lock size={16} color="#8B95A1" />
              <span>신한DS 데이터센터 물리 보안 출입로그 연동 기준</span>
            </div>
            <p style={{ fontSize: '11.5px', color: '#6B7684', lineHeight: 1.45, margin: 0 }}>
              출퇴근 태깅 기록은 <strong>'산업안전보건법 제63조(도급인의 안전조치) 및 금융보안원 물리적 망분리·시설보안 규정'</strong>에 의거하여 재난·보안 관리 목적으로만 수집되며, 하청 근로자 개인에 대한 직접적인 복무 징계 목적으로 사용되지 않습니다.
            </p>
          </div>
        </div>
      )}

      {/* 전자 서명 모달 */}
      <ElectronicSignatureModal
        isOpen={isSignatureModalOpen}
        onClose={() => setIsSignatureModalOpen(false)}
        onSaveSignature={handleSaveSignature}
        title="도급 공수 기성 검수 전자 서명 날인"
        defaultSignerName={signerName}
        themeMode={themeMode}
      />

      {/* 노동청 적법 도급 감사 리포트 출력 모달 */}
      <LegalComplianceAuditReportModal
        isOpen={isAuditReportModalOpen}
        onClose={() => setIsAuditReportModalOpen(false)}
        partName="카드개발팀 (상담/국제/오토금융)"
        partnerCompany="(주)유브갓 / (주)협력아이티에스"
        signatureDataUrl={signatureDataUrl}
        signerName={signerName}
        inspectionMonth="2026년 08월"
        themeMode={themeMode}
      />

      {/* AI 무기 1: 소명 사유 자동 필터링 및 판독 모달 */}
      <AiClarificationAuditModal
        isOpen={isAiClarificationModalOpen}
        onClose={() => setIsAiClarificationModalOpen(false)}
        onApplyVerdict={(v) => {
          setToastMsg(`🤖 AI 권고 판정 [${v.verdictLabel}]이 적용되었습니다: ${v.recommendedAction}`);
          setTimeout(() => setToastMsg(null), 4000);
        }}
      />

      {/* AI 무기 2: 월말 도급 정산용 공문 자동 초안 생성 모달 */}
      <AiOfficialNoticeGeneratorModal
        isOpen={isAiNoticeGeneratorModalOpen}
        onClose={() => setIsAiNoticeGeneratorModalOpen(false)}
        partnerCompany="유브갓"
        complianceRate={92.0}
        totalPenaltyAmount={480000}
        onSendNoticeSuccess={(doc) => {
          setToastMsg(`📜 [공문 발송 완료] ${doc.subject} 건이 협력사 대표 메일로 전송되었습니다.`);
          setTimeout(() => setToastMsg(null), 4000);
        }}
      />

      {/* AI 무기 3: 이상 징후(꼼수) 패턴 자동 탐지 레이더 모달 */}
      <AiAnomalyRadarModal
        isOpen={isAiAnomalyRadarModalOpen}
        onClose={() => setIsAiAnomalyRadarModalOpen(false)}
        onSummonPartnerRep={(target, pattern) => {
          setToastMsg(`⚔️ [협력사 PM 호출 완료] ${target}님의 '${pattern}' 건에 대해 팩트 기반 소명 확약서 제출을 요구했습니다.`);
          setTimeout(() => setToastMsg(null), 4000);
        }}
      />

      {/* AI 무기 4: 🕵️‍♂️ 시나리오 기반 모의 노동청 감사 시뮬레이터 모달 */}
      <AiLaborInspectorSimulatorModal
        isOpen={isAiLaborInspectorModalOpen}
        onClose={() => setIsAiLaborInspectorModalOpen(false)}
        themeMode={themeMode}
      />

      {/* 🚨 원청 ➔ 협력사 관리인 앞 공식 SLA 소명 요구 발송 모달 */}
      {selectedWorkerForDemand && (
        <DsDemandClarificationModal
          isOpen={isDemandClarificationModalOpen}
          onClose={() => {
            setIsDemandClarificationModalOpen(false);
            setSelectedWorkerForDemand(null);
          }}
          targetWorker={selectedWorkerForDemand}
          onSuccess={() => {
            fetchPendingDsClarifications();
          }}
        />
      )}
    </div>
  );
};

const kpiBoxStyle: React.CSSProperties = {
  background: '#FFFFFF',
  padding: '12px 10px',
  borderRadius: '10px',
  border: '1px solid #ECEFF2',
  textAlign: 'center'
};
