import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  FileText, 
  ChevronRight,
  ChevronLeft,
  Calendar,
  CalendarDays,
  BarChart3,
  Layers,
  MessageSquare,
  Sparkles,
  Megaphone,
  PlusCircle,
  UserCheck
} from 'lucide-react';
import { dbService, DbSlaClarification, DbPreGapNotice } from '../services/db';
import { aiAnalyticsService } from '../services/aiAnalyticsService';
import { User } from '../types';
import { VacationRegistrationModal } from '../components/modals/VacationRegistrationModal';

interface PartnerManagerPortalViewProps {
  themeMode: 'ddangyo' | 'shinhan';
  currentUser?: User;
  onRequestUpdated?: () => void;
  initialTab?: 'roster' | 'approvals' | 'clarifications' | 'gap_notices';
}

export const PartnerManagerPortalView: React.FC<PartnerManagerPortalViewProps> = ({
  themeMode,
  currentUser = dbService.getCurrentUser(),
  initialTab = 'roster'
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'approvals' | 'clarifications' | 'gap_notices'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [approvalFilter, setApprovalFilter] = useState<'ALL' | 'PENDING' | 'PENDING_DS' | 'APPROVED' | 'REJECTED'>('ALL');
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDay, setSelectedDay] = useState<string>('2026-08-30');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08');

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrgs, setAllOrgs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [allClarifications, setAllClarifications] = useState<DbSlaClarification[]>([]);
  const [allGapNotices, setAllGapNotices] = useState<DbPreGapNotice[]>([]);
  const [allAttendanceRequests, setAllAttendanceRequests] = useState<any[]>([]);

  // 1. Cloudflare D1 users 및 organizations, SLA 소명, 사전통보, 휴가신청 실시간 조회
  const fetchRemoteData = async () => {
    setIsLoading(true);
    try {
      const [userRes, orgRes, reqRes, clars, gaps] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/organizations'),
        fetch('/api/attendance/requests'),
        dbService.fetchSlaClarificationsFromD1('ALL'),
        dbService.fetchGapNoticesFromD1('ALL')
      ]);

      if (userRes.ok) {
        const userJson = await userRes.json();
        if (userJson.success && Array.isArray(userJson.data)) {
          setAllUsers(userJson.data);
        }
      }

      if (orgRes.ok) {
        const orgJson = await orgRes.json();
        if (orgJson.success && Array.isArray(orgJson.data)) {
          setAllOrgs(orgJson.data);
        }
      }

      if (reqRes.ok) {
        const reqJson = await reqRes.json();
        if (reqJson.success && Array.isArray(reqJson.data)) {
          setAllAttendanceRequests(reqJson.data);
        }
      }

      setAllClarifications(clars);
      setAllGapNotices(gaps);
    } catch (err) {
      console.warn('Failed to load portal data from D1:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. DB 기준 협력사 목록 동적 추출 (신한DS 제외, 하드코딩 완전 배제)
  const partnerCompanies = useMemo(() => {
    const fromUsers = allUsers
      .map(u => (u.company || '').trim())
      .filter(c => c && c !== '신한DS');
    const set = new Set(fromUsers);
    return Array.from(set);
  }, [allUsers]);

  const [selectedPartnerState, setSelectedPartnerState] = useState<string>('');

  // 현재 선택된 협력사 (기본값: 로그인 사용자의 협력사 또는 첫 번째 DB 협력사)
  const selectedPartner = useMemo(() => {
    if (selectedPartnerState && partnerCompanies.includes(selectedPartnerState)) {
      return selectedPartnerState;
    }
    if (currentUser.partnerCompany && partnerCompanies.includes(currentUser.partnerCompany)) {
      return currentUser.partnerCompany;
    }
    return partnerCompanies.length > 0 ? partnerCompanies[0] : '유브갓';
  }, [selectedPartnerState, partnerCompanies, currentUser.partnerCompany]);

  useEffect(() => {
    fetchRemoteData();
    const handleUpdate = () => {
      fetchRemoteData();
    };
    window.addEventListener('attendance_request_updated', handleUpdate);
    return () => {
      window.removeEventListener('attendance_request_updated', handleUpdate);
    };
  }, [selectedPartner, activeTab]);

  // 3. 해당 협력사의 현장관리인(영업대표) 성명 동적 조회
  const currentManager = useMemo(() => {
    const mgr = allUsers.find(u => 
      u.company === selectedPartner && 
      (u.is_partner_manager === 1 || u.role === 'PARTNER_PART_LEADER' || u.role === 'PARTNER_MANAGER')
    );
    return mgr ? `${mgr.name} ${mgr.position || '대표'}` : `${currentUser.name.split(' ')[0]} 관리자`;
  }, [allUsers, selectedPartner, currentUser.name]);

  // 4. 해당 협력사 소속 투입 인력(작업자) 마스터 및 실시간 D1 연동 풀
  const myWorkers = useMemo(() => {
    const partnerMasterRoster: Record<string, Array<{ name: string; employee_id: string; company: string; part: string; team: string; position: string; clockIn: string; hours: number; variance: number; isWarning?: boolean; reason?: string; task: string; phone?: string }>> = {
      '유브갓': [
        { name: '송무준', employee_id: 'UB0001', company: '유브갓', part: '상담', team: '고객상담팀', position: '선임', clockIn: '08:50', hours: 8.0, variance: 0, task: '상담 공정 (인바운드)' },
        { name: '김성훈', employee_id: 'PT20260818', company: '유브갓', part: '상담', team: '금융분실팀', position: '주임', clockIn: '08:45', hours: 8.0, variance: 0, task: '상담 공정 (분실/도난)' },
        { name: '김신한', employee_id: 'PT20260816', company: '유브갓', part: '상담', team: '수신제신고팀', position: '대리', clockIn: '08:50', hours: 8.0, variance: 0, task: '상담 공정 (수신/제신고)' },
        { name: '이하은', employee_id: 'PT20260817', company: '유브갓', part: '상담', team: '모바일운영팀', position: '사원', clockIn: '09:15', hours: 7.5, variance: 15, isWarning: true, reason: '지하철 2호선 신호 장애 지연 소명서 작성 필요', task: '상담 공정 (모바일배정)' },
        { name: '김흥섭', employee_id: 'UB0002', company: '유브갓', part: '상담', team: '심사지원팀', position: '선임', clockIn: '08:50', hours: 8.0, variance: 0, task: '상담 공정 (한도심사)' },
        { name: '최진영', employee_id: 'UB0003', company: '유브갓', part: '상담', team: '해외승인팀', position: '주임', clockIn: '08:52', hours: 8.0, variance: 0, task: '상담 공정 (해외승인)' },
        { name: '강동현', employee_id: 'UB0004', company: '유브갓', part: '상담', team: '가맹점정산팀', position: '대리', clockIn: '08:40', hours: 8.0, variance: 0, task: '상담 공정 (가맹점정산)' },
        { name: '윤서아', employee_id: 'UB0005', company: '유브갓', part: '상담', team: '발급심사팀', position: '주임', clockIn: '08:55', hours: 8.0, variance: 0, task: '상담 공정 (발급심사)' },
        { name: '배지훈', employee_id: 'UB0006', company: '유브갓', part: '상담', team: 'VIP케어팀', position: '수석', clockIn: '08:50', hours: 8.0, variance: 0, task: '상담 공정 (VIP상담)' },
        { name: '김글로벌', employee_id: 'UB0010', company: '유브갓', part: '국제', team: '글로벌결제팀', position: '차장', clockIn: '08:50', hours: 8.0, variance: 0, task: '글로벌 결제 네트워크 관리' }
      ],
      '(주)협력아이티에스': [
        { name: '박민지', employee_id: 'PT20260819', company: '(주)협력아이티에스', part: '상담', team: 'CTI운영팀', position: '선임', clockIn: '08:48', hours: 8.0, variance: 0, task: 'CTI 연동/분배' },
        { name: '이제성', employee_id: 'ITS001', company: '(주)협력아이티에스', part: '오토금융', team: '오토시스템팀', position: '책임', clockIn: '08:50', hours: 8.0, variance: 0, task: '오토론 기간계 연동' },
        { name: '정재호', employee_id: 'ITS002', company: '(주)협력아이티에스', part: '오토금융', team: '가맹데스크팀', position: '선임', clockIn: '08:45', hours: 8.0, variance: 0, task: '오토금융 가맹점 데스크' }
      ],
      '현대IT솔루션': [
        { name: '박민우', employee_id: 'HD001', company: '현대IT솔루션', part: '오토금융', team: '인증보안팀', position: '선임', clockIn: '08:50', hours: 8.0, variance: 0, task: '오토심사 비대면 인증' },
        { name: '한동훈', employee_id: 'HD002', company: '현대IT솔루션', part: '오토금융', team: '정산배치팀', position: '책임', clockIn: '08:55', hours: 8.0, variance: 0, task: '오토리스 정산 배치' }
      ]
    };

    const d1List = allUsers.filter(u => 
      u.company === selectedPartner && 
      u.role === 'PARTNER_WORKER' && 
      !u.is_partner_manager
    );

    const masterList = partnerMasterRoster[selectedPartner] || [];
    const merged = [...masterList];

    d1List.forEach(u => {
      const exists = merged.some(m => m.name === u.name || m.employee_id === u.employee_id);
      if (!exists) {
        merged.push({
          name: u.name,
          employee_id: u.employee_id || `EMP-${Date.now()}`,
          company: selectedPartner,
          part: u.part || '상담',
          team: u.team || '도급운영팀',
          position: u.position || '사원',
          clockIn: '08:50',
          hours: 8.0,
          variance: 0,
          task: `${u.part || '상담'} 공정 도급 업무 수행`
        });
      }
    });

    return merged;
  }, [allUsers, selectedPartner]);

  // 소명 및 공백 통보 상태
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [selectedClarification, setSelectedClarification] = useState<DbSlaClarification | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);

  // D1 기반 직원 소명 요청 목록 (1차 승인 대기 건)
  const [d1Clarifications, setD1Clarifications] = useState<any[]>([]);
  const [clarToastMsg, setClarToastMsg] = useState<string | null>(null);

  const fetchD1Clarifications = async () => {
    try {
      const company = currentUser.partnerCompany || selectedPartner || '유브갓';
      const res = await fetch(`/api/clarification-requests?role=PARTNER_SITE_MANAGER&company_name=${encodeURIComponent(company)}`);
      if (res.ok) {
        const json = await res.json();
        setD1Clarifications(json.data || []);
      }
    } catch (e) {
      console.warn('소명 D1 조회 실패:', e);
    }
  };

  useEffect(() => {
    fetchD1Clarifications();
  }, [selectedPartner, currentUser.partnerCompany]);

  const handlePartnerApprove = async (clarId: string) => {
    const memo = window.prompt('1차 승인 메모 (생략 가능):', '협력사 현장대리인 1차 검토 완료. 소명 사유 타당하여 DS 최종 승인 상신합니다.') ?? '';
    try {
      const res = await fetch(`/api/clarification-requests/${clarId}/partner-approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_id: currentUser.employeeId || currentUser.id,
          approver_name: currentUser.name,
          memo
        })
      });
      const json = await res.json();
      setClarToastMsg(`✅ ${json.message || '1차 승인 완료'}`);
      setTimeout(() => setClarToastMsg(null), 3000);

      // 🔔 DS 현장대리인 앞 알림 푸시
      dbService.addNotification({
        type: 'INSPECTION_REQUEST',
        title: `🛡️ [SLA 소명 검수] 협력사 1차 승인 완료`,
        content: `${selectedPartner} 현장대리인이 소명서를 1차 승인하고 신한DS 최종 결재를 요청했습니다.`,
        targetRole: 'DS_PRINCIPAL_PM'
      });

      fetchD1Clarifications();
    } catch (e) {
      alert('승인 처리 중 오류가 발생했습니다.');
    }
  };

  const handlePartnerReject = async (clarId: string) => {
    const memo = window.prompt('반려 사유 입력 (필수):', '소명 사유 불충분. 증빙 자료 보완 후 재상신 바랍니다.');
    if (!memo) return;
    try {
      const res = await fetch(`/api/clarification-requests/${clarId}/partner-reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_id: currentUser.employeeId || currentUser.id,
          approver_name: currentUser.name,
          memo
        })
      });
      const json = await res.json();
      setClarToastMsg(`❌ ${json.message || '반려 처리 완료'}`);
      setTimeout(() => setClarToastMsg(null), 3000);

      // 🔔 반려 알림 푸시
      dbService.addNotification({
        type: 'REJECTION',
        title: `❌ [소명서 반려] 협력사 검수 반려`,
        content: `소명서가 협력사 현장대리인에 의해 반려되었습니다: ${memo}`,
        targetRole: 'ALL'
      });

      fetchD1Clarifications();
    } catch (e) {
      alert('반려 처리 중 오류가 발생했습니다.');
    }
  };

  // [2단계] 협력사 관리자 휴가 1차 결재 및 원청 통보 핸들러 (원클릭 즉시 처리)
  const handlePartnerApproveVacation = async (reqId: string) => {
    const targetReq = allAttendanceRequests.find(r => r.id === reqId);
    const targetName = targetReq?.user_name || '소속 직원';
    const targetType = targetReq?.vacation_type || '휴가';
    const defaultMemo = '소속사 1차 결재 완료. 신한DS 현장대리인(PM) 앞 공정 공백 공식 통보 상신';

    // 1) 로컬 상태 즉시 갱신
    dbService.updateRequestStatus(reqId, 'PENDING_DS', defaultMemo);
    setAllAttendanceRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'PENDING_DS' } : r));

    // 2) 토스트 즉시 안내
    setClarToastMsg('✅ [1차 결재 승인 완료] 신한DS 현장대리인(PM) 앞 투입 공백 통보가 상신되었습니다.');
    setTimeout(() => setClarToastMsg(null), 3500);

    // 3) 🔔 알림센터에 미확인 알림 푸시 (신한DS 현장대리인 앞 공정 검수 요청)
    dbService.addNotification({
      type: 'INSPECTION_REQUEST',
      title: `🛡️ [공정 검수 요청] ${targetName}님 투입 공백 통보`,
      content: `${selectedPartner} 현장대리인이 ${targetName}님의 ${targetType} 신청을 1차 승인하고 원청 공정 검수를 상신하였습니다. (최종 승인 대기)`,
      targetRole: 'DS_PRINCIPAL_PM',
      partName: currentUser.partName || '카드개발팀'
    });

    // 4) 백엔드 D1 API 비동기 동기화
    try {
      await fetch(`/api/attendance/requests/${reqId}/partner-approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_name: currentManager,
          memo: defaultMemo
        })
      });
      fetchRemoteData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendance_request_updated'));
      }
    } catch (e) {
      console.warn('API sync warn:', e);
    }
  };

  const handlePartnerRejectVacation = async (reqId: string) => {
    const targetReq = allAttendanceRequests.find(r => r.id === reqId);
    const targetName = targetReq?.user_name || '소속 직원';
    const rejectMemo = '소속사 공정 일정 상 휴가 일정 조정 요망 (1차 반려)';

    // 1) 로컬 상태 즉시 갱신
    dbService.updateRequestStatus(reqId, 'REJECTED', rejectMemo);
    setAllAttendanceRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'REJECTED' } : r));

    // 2) 토스트 즉시 안내
    setClarToastMsg('❌ [반려 처리 완료] 해당 휴가 신청이 반려 처리되었습니다.');
    setTimeout(() => setClarToastMsg(null), 3500);

    // 3) 🔔 알림센터에 미확인 알림 푸시 (신청자 앞 반려 통보)
    dbService.addNotification({
      type: 'REJECTION',
      title: `❌ [휴가 반려] ${targetName}님 휴가 신청 반려`,
      content: `협력사 현장대리인이 ${targetName}님의 휴가 신청을 반려하였습니다: ${rejectMemo}`,
      targetRole: 'ALL',
      partName: currentUser.partName || '카드개발팀'
    });

    // 4) 백엔드 D1 API 비동기 동기화
    try {
      await fetch(`/api/attendance/requests/${reqId}/partner-reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_name: currentManager,
          memo: rejectMemo
        })
      });
      fetchRemoteData();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendance_request_updated'));
      }
    } catch (e) {
      console.warn('API sync warn:', e);
    }
  };

  const pendingClarifications = allClarifications.filter(c => 
    c.partnerCompany === selectedPartner && c.status === 'REQUESTED'
  );

  // 선택된 협력사 소속 인력들의 휴가/공백 신청 실시간 통합 목록 (D1 attendance_requests + pre_gap_notices + dbService)
  const myGapNotices = useMemo(() => {
    // 1) D1 attendance_requests (VACATION)
    const fromAttendance = allAttendanceRequests
      .filter(r => {
        const isVac = r.request_type === 'VACATION' || r.requestType === 'VACATION';
        if (!isVac) return false;
        const comp = r.company_name || r.companyName || r.partner_company || r.partnerCompany;
        if (comp && (comp.includes(selectedPartner) || selectedPartner.includes(comp))) return true;
        const isWorkerInPartner = myWorkers.some(w => w.employee_id === r.employee_id || w.name === r.user_name);
        if (isWorkerInPartner) return true;
        // fallback: 소속사 정보가 매칭되거나 유브갓인 경우 포함
        return !comp || comp === '유브갓' || comp.includes('협력');
      })
      .map(r => ({
        id: r.id,
        partnerCompany: selectedPartner,
        workerName: r.user_name || r.userName || '소속 직원',
        gapType: r.vacation_type || (r.reason?.includes('체력단련') ? '체력단련휴가' : '연차휴가'),
        gapPeriod: r.target_date || r.targetDate || '2026-08-30',
        gapHours: Number(r.hours) || 8,
        reason: r.reason || '소속사 휴가 신청',
        status: r.status || 'PENDING', // PENDING, PENDING_DS, APPROVED, REJECTED
        source: 'ATTENDANCE_REQUEST'
      }));

    // 2) D1 pre_gap_notices
    const fromNotices = allGapNotices
      .filter(n => n.partnerCompany === selectedPartner)
      .map(n => ({
        id: n.id,
        partnerCompany: n.partnerCompany,
        workerName: n.workerName,
        gapType: n.gapType,
        gapPeriod: n.gapPeriod,
        gapHours: n.gapHours,
        reason: n.reason,
        status: n.status === 'ACKNOWLEDGED' ? 'APPROVED' : 'PENDING_DS',
        source: 'GAP_NOTICE'
      }));

    // 3) dbService local requests fallback
    const localVacations = dbService.getRequests()
      .filter(r => r.requestType === 'VACATION')
      .map(r => ({
        id: r.id,
        partnerCompany: selectedPartner,
        workerName: r.userName,
        gapType: r.reason?.includes('체력단련') ? '체력단련휴가' : '연차휴가',
        gapPeriod: r.targetDate,
        gapHours: r.hours || 8,
        reason: r.reason,
        status: r.status || 'PENDING',
        source: 'LOCAL'
      }));

    const combined = [...fromAttendance];
    fromNotices.forEach(n => {
      if (!combined.some(c => c.id === n.id)) combined.push(n);
    });
    localVacations.forEach(l => {
      const existingIdx = combined.findIndex(c => c.id === l.id);
      if (existingIdx >= 0) {
        combined[existingIdx] = { ...combined[existingIdx], ...l };
      } else {
        combined.unshift(l);
      }
    });

    return combined;
  }, [allAttendanceRequests, allGapNotices, selectedPartner, myWorkers]);

  // D1 소명 상태 레이블
  const getClarStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_PARTNER': return { label: '1차 검수 대기', color: '#D97706', bg: '#FEF3C7' };
      case 'PENDING_DS': return { label: 'DS 최종 승인 대기', color: '#2563EB', bg: '#EFF6FF' };
      case 'APPROVED': return { label: '최종 승인 완료', color: '#059669', bg: '#ECFDF5' };
      case 'REJECTED': return { label: '반려됨', color: '#DC2626', bg: '#FEF2F2' };
      default: return { label: '검토 중', color: '#64748B', bg: '#F8FAFC' };
    }
  };

  const handleOpenAnswerModal = (item: DbSlaClarification) => {
    setSelectedClarification(item);
    setAnswerText('대중교통 지연으로 인한 45분 지각 소명서 접수 완료 (당일 집중 공정 대체 투입 이행 계획 제출)');
    setIsAnswerModalOpen(true);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedClarification || !answerText.trim()) return;
    await dbService.answerClarification(selectedClarification.id, answerText);
    alert(`📨 [${selectedPartner}] 원청(신한DS PM) 앞으로 공식 소명서가 성공적으로 제출되었습니다.\n\n🛡️ [도급 검수 합법 절차 완료]\n원청 PM의 승인 대기 큐로 전송되었습니다.`);
    setIsAnswerModalOpen(false);
    await fetchRemoteData();
  };


  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '90px' }}>
      
      {/* 1. 협력사 관리인 상단 포털 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
        padding: '20px 18px 16px 18px',
        color: '#FFFFFF',
        borderBottom: '1px solid #334155'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38BDF8',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              marginBottom: '4px'
            }}>
              <ShieldCheck size={12} />
              <span>협력사 관리인 전용 관제 포털</span>
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              [{selectedPartner}] 도급 사업 관리 포털
            </h1>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '6px 10px',
            borderRadius: '8px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '10px', color: '#94A3B8' }}>영업대표/관리자</div>
            <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#38BDF8' }}>
              {currentManager}
            </div>
          </div>
        </div>

        {/* 🇰🇷 DB 기준 협력사 전환 칩 (하드코딩 배제) */}
        {partnerCompanies.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingTop: '8px',
            scrollbarWidth: 'none'
          }}>
            {partnerCompanies.map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => setSelectedPartnerState(comp)}
                style={{
                  flexShrink: 0,
                  padding: '4px 10px',
                  borderRadius: '14px',
                  border: selectedPartner === comp ? '1.5px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.15)',
                  background: selectedPartner === comp ? '#0284C7' : 'rgba(255, 255, 255, 0.05)',
                  color: selectedPartner === comp ? '#FFFFFF' : '#94A3B8',
                  fontSize: '11px',
                  fontWeight: selectedPartner === comp ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                {comp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. 핵심 4개 메뉴 탭 바 (투입현황 / 승인관리 / 소명관리 / 공백통보) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 8px'
      }}>
        {/* 메뉴 1: 소속 인력 투입 현황 */}
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'roster' ? '3px solid #0052FF' : '3px solid transparent',
            color: activeTab === 'roster' ? '#0052FF' : '#64748B',
            fontSize: '12.5px',
            fontWeight: activeTab === 'roster' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer'
          }}
        >
          <Users size={15} />
          <span>투입현황</span>
        </button>

        {/* 메뉴 2: 🌟 승인관리 (개인 결재 요청 승인/반려) */}
        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'approvals' ? '3px solid #0052FF' : '3px solid transparent',
            color: activeTab === 'approvals' ? '#0052FF' : '#64748B',
            fontSize: '12.5px',
            fontWeight: activeTab === 'approvals' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <UserCheck size={15} />
          <span>승인관리</span>
          {myGapNotices.filter(n => n.status === 'PENDING').length > 0 && (
            <span style={{
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '10px'
            }}>
              {myGapNotices.filter(n => n.status === 'PENDING').length}
            </span>
          )}
        </button>

        {/* 메뉴 3: 원청 소명 접수 및 처리 */}
        <button
          type="button"
          onClick={() => setActiveTab('clarifications')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'clarifications' ? '3px solid #0052FF' : '3px solid transparent',
            color: activeTab === 'clarifications' ? '#0052FF' : '#64748B',
            fontSize: '12.5px',
            fontWeight: activeTab === 'clarifications' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <Send size={14} />
          <span>소명관리</span>
          {(pendingClarifications.length + d1Clarifications.filter(c => c.status === 'PENDING_PARTNER').length) > 0 && (
            <span style={{
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '10px'
            }}>
              {pendingClarifications.length + d1Clarifications.filter(c => c.status === 'PENDING_PARTNER').length}
            </span>
          )}
        </button>

        {/* 메뉴 4: 투입 공백 사전 통보 */}
        <button
          type="button"
          onClick={() => setActiveTab('gap_notices')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'gap_notices' ? '3px solid #0052FF' : '3px solid transparent',
            color: activeTab === 'gap_notices' ? '#0052FF' : '#64748B',
            fontSize: '12.5px',
            fontWeight: activeTab === 'gap_notices' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer'
          }}
        >
          <Megaphone size={14} />
          <span>공백통보</span>
        </button>
      </div>

      {/* 3. 탭별 컨텐츠 영역 */}
      <div style={{ padding: '16px' }}>

        {/* ========================================================================= */}
        {/* 탭 1: 소속 인력 투입 현황 (일별 / 주별 / 월별 전면 고도화) */}
        {/* ========================================================================= */}
        {activeTab === 'roster' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* 1. 일별 / 주별 / 월별 세그먼트 컨트롤러 */}
            <div style={{
              background: '#F1F5F9',
              borderRadius: '10px',
              padding: '3px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => setTimeFrame('daily')}
                style={{
                  padding: '7px 0',
                  borderRadius: '7px',
                  border: 'none',
                  background: timeFrame === 'daily' ? '#FFFFFF' : 'transparent',
                  color: timeFrame === 'daily' ? '#0052FF' : '#64748B',
                  fontSize: '12.5px',
                  fontWeight: timeFrame === 'daily' ? 800 : 600,
                  cursor: 'pointer',
                  boxShadow: timeFrame === 'daily' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Calendar size={14} />
                <span>일별 투입</span>
              </button>

              <button
                type="button"
                onClick={() => setTimeFrame('weekly')}
                style={{
                  padding: '7px 0',
                  borderRadius: '7px',
                  border: 'none',
                  background: timeFrame === 'weekly' ? '#FFFFFF' : 'transparent',
                  color: timeFrame === 'weekly' ? '#0052FF' : '#64748B',
                  fontSize: '12.5px',
                  fontWeight: timeFrame === 'weekly' ? 800 : 600,
                  cursor: 'pointer',
                  boxShadow: timeFrame === 'weekly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <CalendarDays size={14} />
                <span>주별 (40h)</span>
              </button>

              <button
                type="button"
                onClick={() => setTimeFrame('monthly')}
                style={{
                  padding: '7px 0',
                  borderRadius: '7px',
                  border: 'none',
                  background: timeFrame === 'monthly' ? '#FFFFFF' : 'transparent',
                  color: timeFrame === 'monthly' ? '#0052FF' : '#64748B',
                  fontSize: '12.5px',
                  fontWeight: timeFrame === 'monthly' ? 800 : 600,
                  cursor: 'pointer',
                  boxShadow: timeFrame === 'monthly' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <BarChart3 size={14} />
                <span>월별 (M/M)</span>
              </button>
            </div>

            {/* 2. 날짜 / 주차 / 월 네비게이터 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '10px',
              padding: '10px 14px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                type="button"
                onClick={() => {
                  if (timeFrame === 'daily') setSelectedDay('2026-08-29');
                }}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronLeft size={14} />
              </button>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                  {timeFrame === 'daily' && '2026년 8월 30일 (오늘)'}
                  {timeFrame === 'weekly' && '2026년 8월 4주차 (08.24 ~ 08.30)'}
                  {timeFrame === 'monthly' && '2026년 8월 정산 주기 (08.01 ~ 08.31)'}
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  {timeFrame === 'daily' && '일일 투입 공수(M/D) 실시간 집계'}
                  {timeFrame === 'weekly' && '주 40h 법정 근로시간 및 공정 투입 준수율'}
                  {timeFrame === 'monthly' && '월간 도급 약정 M/M 계약 이행률'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (timeFrame === 'daily') setSelectedDay('2026-08-30');
                }}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* 3. 모드별 핵심 KPI 요약 카드 */}
            {timeFrame === 'daily' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '14px 16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>총 소속 인원</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                    {myWorkers.length}명
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>정상 투입</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
                    {myWorkers.filter(w => !w.isWarning).length}명
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>소명/지연 관리</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: myWorkers.some(w => w.isWarning) ? '#F59E0B' : '#64748B', marginTop: '2px' }}>
                    {myWorkers.filter(w => w.isWarning).length}건
                  </div>
                </div>
              </div>
            )}

            {timeFrame === 'weekly' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '14px 16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>주간 총 투입 공수</div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#0052FF', marginTop: '2px' }}>
                    398.5h <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>/ 400h</span>
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>주간 SLA 준수율</div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
                    99.6%
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>52시간 초과위험</div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
                    0명 (안전)
                  </div>
                </div>
              </div>
            )}

            {timeFrame === 'monthly' && (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '14px 16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>월간 약정 인력</div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                    10.0 M/M
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>월간 실투입 실적</div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#0052FF', marginTop: '2px' }}>
                    9.98 M/M
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>계약 이행률</div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
                    99.8%
                  </div>
                </div>
              </div>
            )}

            {/* 4. 인력별 투입 카드 리스트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '2px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>
                  [{selectedPartner}] 소속 인력 {timeFrame === 'daily' ? '일일' : timeFrame === 'weekly' ? '주간' : '월간'} 투입 현황 ({myWorkers.length}명)
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  ※ 실시간 D1 도급 공수 집계
                </span>
              </div>

              {isLoading ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#0052FF', fontSize: '13px', fontWeight: 600 }}>
                  데이터베이스에서 투입 인력을 불러오는 중입니다...
                </div>
              ) : myWorkers.length === 0 ? (
                <div style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B',
                  fontSize: '13px'
                }}>
                  [{selectedPartner}]에 등록된 협력사 투입 인력이 없습니다.
                </div>
              ) : (
                myWorkers.map((worker) => (
                  <div
                    key={worker.employee_id || (worker as any).seq}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '14px',
                      border: worker.isWarning ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    {/* 인원 아바타 이니셜 */}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '20px',
                      background: worker.isWarning 
                        ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
                        : 'linear-gradient(135deg, #0052FF 0%, #3B82F6 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '15px',
                      fontWeight: 900,
                      color: '#FFFFFF',
                      flexShrink: 0
                    }}>
                      {worker.name[0]}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                            {worker.name}
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            {worker.position}
                          </span>
                          {worker.part && (
                            <span style={{ fontSize: '10.5px', color: '#0284C7', background: '#E0F2FE', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                              {worker.part.endsWith('파트') ? worker.part : `${worker.part} 파트`}
                            </span>
                          )}
                        </div>

                        {/* 모드별 상태 배지 */}
                        {timeFrame === 'daily' && (
                          worker.isWarning ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedClarification({
                                  id: Date.now(),
                                  recordId: `rec-${worker.employee_id}`,
                                  partName: worker.part || '상담',
                                  partnerCompany: selectedPartner,
                                  requesterId: 'S01832',
                                  officialTitle: `[도급 SLA 공수 결손 소명 요청] ${worker.name} 사원 지연 발생 건`,
                                  messageContent: `${worker.name} 사원의 8월 29일 출근 지연(+15분)에 대한 도급 공정 대체 투입 계획 및 사유 소명 요청`,
                                  status: 'REQUESTED',
                                  createdAt: '2026-08-29 09:30'
                                });
                                setAnswerText(`${worker.name} 직원의 지하철 2호선 지연 소명서 접수 완료. 당일 집중 공정 정상 투입 완료.`);
                                setIsAnswerModalOpen(true);
                              }}
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                color: '#D97706',
                                background: '#FEF3C7',
                                border: '1px solid #F59E0B',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <AlertTriangle size={12} />
                              <span>소명서 작성</span>
                            </button>
                          ) : (
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#16A34A',
                              background: '#DCFCE7',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px'
                            }}>
                              <CheckCircle2 size={12} />
                              <span>정상 투입</span>
                            </span>
                          )
                        )}

                        {timeFrame === 'weekly' && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#0052FF',
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

                      {/* 1) 일별 상세 뷰 */}
                      {timeFrame === 'daily' && (
                        <>
                          <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span>🕒 출근: <strong>{worker.clockIn} ~ 18:00</strong></span>
                            <span>실적: <strong>1 M/D ({worker.hours}h)</strong> / 약정 8.0h</span>
                            {worker.variance > 0 && (
                              <span style={{ color: '#D97706', fontWeight: 700, fontSize: '11px' }}>
                                (지연 +{worker.variance}분)
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>
                            공정: {worker.task} · {worker.team}
                          </div>
                          {worker.reason && (
                            <div style={{
                              marginTop: '4px',
                              background: '#FFFBEB',
                              border: '1px dashed #FDE68A',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              color: '#B45309'
                            }}>
                              📝 소명 안내: {worker.reason}
                            </div>
                          )}
                        </>
                      )}

                      {/* 2) 주별 상세 뷰 (40h 및 주간 요일 도트) */}
                      {timeFrame === 'weekly' && (
                        <>
                          <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>주간 누적 실적: <strong>{worker.isWarning ? '38.5h' : '40.0h'} (5 M/D)</strong></span>
                            <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: 700 }}>100% 이행</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            {['월', '화', '수', '목', '금'].map((d, i) => (
                              <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '9.5px', color: '#94A3B8' }}>{d}</span>
                                <div style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '9px',
                                  background: (worker.isWarning && i === 3) ? '#FEF3C7' : '#DCFCE7',
                                  color: (worker.isWarning && i === 3) ? '#D97706' : '#16A34A',
                                  fontSize: '9px',
                                  fontWeight: 800,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: (worker.isWarning && i === 3) ? '1px solid #F59E0B' : '1px solid #86EFAC'
                                }}>
                                  {worker.isWarning && i === 3 ? '!' : '8'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}

                      {/* 3) 월별 상세 뷰 (M/M 누적 및 계약 공수) */}
                      {timeFrame === 'monthly' && (
                        <>
                          <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                            <span>월간 총 실적: <strong>{worker.isWarning ? '20.8 M/D (166.5h)' : '21.0 M/D (168h)'}</strong></span>
                            <span style={{ fontSize: '11.5px', color: '#0052FF', fontWeight: 800 }}>약정: 1.0 M/M</span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', gap: '10px' }}>
                            <span>실투입: <strong>21일</strong></span>
                            <span>•</span>
                            <span>휴가/부재: <strong>0일</strong></span>
                            <span>•</span>
                            <span>소속: <strong>{worker.team}</strong></span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 탭 2: 🌟 승인관리 (소속 근로자 휴가/근태 결재 요청 승인/반려 화면) */}
        {/* ========================================================================= */}
        {activeTab === 'approvals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* 1. 승인 현황 요약 KPI */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '14px 16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>1차 결재 대기</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#D97706', marginTop: '2px' }}>
                  {myGapNotices.filter(n => n.status === 'PENDING').length}건
                </div>
              </div>
              <div style={{ borderLeft: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>원청 검수 대기</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0284C7', marginTop: '2px' }}>
                  {myGapNotices.filter(n => n.status === 'PENDING_DS').length}건
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>최종 승인 완료</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
                  {myGapNotices.filter(n => n.status === 'APPROVED' || n.status === 'ACKNOWLEDGED').length}건
                </div>
              </div>
            </div>

            {/* 2. 결재 상태별 필터 칩 */}
            <div style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              paddingBottom: '2px'
            }}>
              {[
                { key: 'ALL', label: `전체 (${myGapNotices.length})` },
                { key: 'PENDING', label: `⏳ 결재 대기 (${myGapNotices.filter(n => n.status === 'PENDING').length})` },
                { key: 'PENDING_DS', label: `📢 원청 대기 (${myGapNotices.filter(n => n.status === 'PENDING_DS').length})` },
                { key: 'APPROVED', label: `✓ 승인 완료 (${myGapNotices.filter(n => n.status === 'APPROVED' || n.status === 'ACKNOWLEDGED').length})` },
                { key: 'REJECTED', label: `❌ 반려 (${myGapNotices.filter(n => n.status === 'REJECTED').length})` }
              ].map(f => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setApprovalFilter(f.key as any)}
                  style={{
                    flexShrink: 0,
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: approvalFilter === f.key ? '1.5px solid #0052FF' : '1px solid #E2E8F0',
                    background: approvalFilter === f.key ? '#EFF6FF' : '#FFFFFF',
                    color: approvalFilter === f.key ? '#0052FF' : '#64748B',
                    fontSize: '12px',
                    fontWeight: approvalFilter === f.key ? 800 : 600,
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* 3. 결재 요청 카드 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myGapNotices
                .filter(n => {
                  if (approvalFilter === 'ALL') return true;
                  if (approvalFilter === 'APPROVED') return n.status === 'APPROVED' || n.status === 'ACKNOWLEDGED';
                  return n.status === approvalFilter;
                })
                .length === 0 ? (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '40px 20px',
                  textAlign: 'center',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B'
                }}>
                  <UserCheck size={36} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                    해당 상태의 결재 요청이 없습니다.
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    소속 직원이 휴가나 소명을 신청하면 이곳에서 1차 결재할 수 있습니다.
                  </div>
                </div>
              ) : (
                myGapNotices
                  .filter(n => {
                    if (approvalFilter === 'ALL') return true;
                    if (approvalFilter === 'APPROVED') return n.status === 'APPROVED' || n.status === 'ACKNOWLEDGED';
                    return n.status === approvalFilter;
                  })
                  .map((n) => (
                    <div
                      key={n.id}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '16px',
                        border: n.status === 'PENDING' ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
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
                            {n.gapType}
                          </span>
                          <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                            {n.workerName}
                          </span>
                        </div>

                        {/* 결재 단계 상태 뱃지 */}
                        {n.status === 'PENDING' && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#D97706',
                            background: '#FEF3C7',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            ⏳ 1차 결재 대기
                          </span>
                        )}

                        {n.status === 'PENDING_DS' && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#0284C7',
                            background: '#E0F2FE',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            📢 원청(신한DS) PM 최종 검수 대기
                          </span>
                        )}

                        {(n.status === 'APPROVED' || n.status === 'ACKNOWLEDGED') && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#16A34A',
                            background: '#DCFCE7',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            ✓ 최종 승인 완료
                          </span>
                        )}

                        {n.status === 'REJECTED' && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#DC2626',
                            background: '#FEE2E2',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            ❌ 반려됨
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📅 신청 일정: <strong>{n.gapPeriod}</strong></span>
                        <span>•</span>
                        <span>공백 공수: <strong>{n.gapHours}시간 (1 M/D)</strong></span>
                      </div>

                      <div style={{
                        fontSize: '12px',
                        color: '#475569',
                        background: '#F8FAFC',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #F1F5F9'
                      }}>
                        <strong>신청 사유:</strong> {n.reason}
                      </div>

                      {/* 1차 결재/반려 액션 버튼 */}
                      {n.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '2px' }}>
                          <button
                            type="button"
                            onClick={() => handlePartnerApproveVacation(n.id)}
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
                              gap: '5px',
                              boxShadow: '0 2px 6px rgba(0, 82, 255, 0.25)'
                            }}
                          >
                            <CheckCircle2 size={15} />
                            <span>1차 승인 및 원청 통보 상신</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handlePartnerRejectVacation(n.id)}
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
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 탭 3: 원청 소명 관리 (DS PM 공문 확인 및 답변서 작성) */}
        {/* ========================================================================= */}
        {activeTab === 'clarifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* ── D1 직원 소명 1차 승인 섹션 ── */}
            {clarToastMsg && (
              <div style={{
                background: clarToastMsg.startsWith('✅') ? '#ECFDF5' : clarToastMsg.startsWith('📋') ? '#EFF6FF' : '#FEF2F2',
                border: `1px solid ${clarToastMsg.startsWith('✅') ? '#6EE7B7' : clarToastMsg.startsWith('📋') ? '#BFDBFE' : '#FCA5A5'}`,
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '13px',
                fontWeight: 700,
                color: clarToastMsg.startsWith('✅') ? '#065F46' : clarToastMsg.startsWith('📋') ? '#1E40AF' : '#991B1B'
              }}>
                {clarToastMsg}
              </div>
            )}

            {/* ── 🚨 1. 원청 신한DS PM의 공식 소명 요구 수신함 (Top-Down 역방향 수신) ── */}
            <div style={{
              background: '#FFFBEB',
              border: '1.5px solid #F59E0B',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={17} color="#D97706" />
                  <span style={{ fontSize: '14px', fontWeight: 900, color: '#92400E' }}>
                    🚨 원청 신한DS의 SLA 소명 요구 수신함 ({d1Clarifications.filter(c => c.status === 'DS_DEMANDED').length}건)
                  </span>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, background: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '6px' }}>
                  원청 ➔ 협력사 관리인 수신
                </span>
              </div>

              <div style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.5 }}>
                원청 DS PM이 투입 지연/편차에 대해 공식 소명을 요구한 건입니다. <strong>[소속 직원에게 소명 전달]</strong> 버튼을 누르면 해당 직원의 개인 탭으로 소명서 작성 요청이 전달됩니다.
              </div>

              {d1Clarifications.filter(c => c.status === 'DS_DEMANDED').length === 0 ? (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '10px',
                  padding: '16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#94A3B8',
                  border: '1px dashed #FDE68A'
                }}>
                  현재 원청 DS로부터 접수된 소명 요구 건이 없습니다.
                </div>
              ) : (
                d1Clarifications.filter(c => c.status === 'DS_DEMANDED').map(demand => (
                  <div key={demand.id} style={{
                    background: '#FFFFFF',
                    borderRadius: '10px',
                    padding: '14px',
                    border: '1px solid #FDE68A',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                        👤 대상 인력: <strong style={{ color: '#0046FF' }}>{demand.employee_name}</strong> ({demand.incident_date})
                      </span>
                      <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 800, background: '#FEE2E2', padding: '2px 6px', borderRadius: '4px' }}>
                        지연 +{demand.delay_minutes || 15}분
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#475569', background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px' }}>
                      <strong>신한DS PM 요구 공문:</strong> {demand.reason_text || demand.ds_approval_memo}
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/clarification-requests/${demand.id}/partner-forward`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              approver_id: 'M001',
                              approver_name: '유브갓 현장관리인',
                              partner_memo: '신한DS PM의 소명 요구에 따라 해당 일자 투입 지연 사유를 사실에 기반하여 상세히 작성해주시기 바랍니다.'
                            })
                          });
                          if (res.ok) {
                            setClarToastMsg(`📋 [소명 전달 완료] ${demand.employee_name} 직원에게 소명서 작성 요청이 전달되었습니다.`);
                            setTimeout(() => setClarToastMsg(null), 3500);
                            fetchRemoteData();
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new CustomEvent('clarification_updated'));
                            }
                          }
                        } catch (e) {
                          alert('전달 실패');
                        }
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #0052FF 0%, #1D4ED8 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '9px 0',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 6px rgba(0, 82, 255, 0.25)'
                      }}
                    >
                      <Send size={14} />
                      <span>소속 직원({demand.employee_name})에게 소명서 작성 요청 전달 ➔</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* ── ⏳ 2. 직원 소명서 작성 대기 중인 건 (전달 완료 건) ── */}
            {d1Clarifications.filter(c => c.status === 'FORWARDED_TO_WORKER').length > 0 && (
              <div style={{
                background: '#F0F9FF',
                border: '1px solid #BAE6FD',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0369A1', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={15} />
                  <span>소속 직원 소명서 작성 진행 중 ({d1Clarifications.filter(c => c.status === 'FORWARDED_TO_WORKER').length}건)</span>
                </div>
                {d1Clarifications.filter(c => c.status === 'FORWARDED_TO_WORKER').map(fwd => (
                  <div key={fwd.id} style={{ fontSize: '12px', color: '#475569', background: '#FFFFFF', padding: '8px 10px', borderRadius: '6px', border: '1px solid #E0F2FE' }}>
                    <strong>{fwd.employee_name}</strong> ({fwd.incident_date}) - 소명서 작성 대기 중 (개인 탭에 요청 전달됨)
                  </div>
                ))}
              </div>
            )}

            {/* ── 3. 직원이 제출한 소명서 1차 검수 & 원청 상신 섹션 ── */}
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <span>📋 직원 소명 서류 1차 검수</span>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>(협력사 현장대리인 결재 대기)</span>
            </div>

            {d1Clarifications.filter(c => c.status === 'PENDING_PARTNER').length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '28px 20px',
                textAlign: 'center',
                border: '1px dashed #CBD5E1',
                color: '#64748B'
              }}>
                <CheckCircle2 size={32} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>1차 검수 대기 소명 없음</div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>소속 직원이 소명서를 제출하면 여기서 확인 후 원청(신한DS)으로 상신할 수 있습니다.</div>
              </div>
            ) : (
              d1Clarifications.filter(c => c.status === 'PENDING_PARTNER').map(clar => (
                <div key={clar.id} style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '16px',
                  border: '1px solid #FDE68A',
                  boxShadow: '0 2px 8px rgba(251, 191, 36, 0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                        {clar.incident_type === 'LATE' ? '🕐 지각 투입 소명' : '📋 출근 누락 소명'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                        신청자: <strong>{clar.employee_name}</strong> · {clar.incident_date}
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 9px', borderRadius: '12px', background: '#FEF3C7', color: '#B45309', flexShrink: 0 }}>
                      1차 검수 대기
                    </span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: '#374151', background: '#FFFBEB', padding: '8px 12px', borderRadius: '8px', marginBottom: '10px', borderLeft: '3px solid #F59E0B' }}>
                    <strong>소명 내용:</strong> {clar.reason_text}
                  </div>

                  {clar.delay_minutes > 0 && (
                    <div style={{ fontSize: '12px', color: '#B45309', marginBottom: '8px' }}>
                      ⏱ 지연 시간: <strong>{clar.delay_minutes}분</strong> · 약정: {clar.scheduled_time} → 실제: {clar.actual_time}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handlePartnerApprove(clar.id)}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 0',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.3)'
                      }}
                    >
                      ✅ 1차 승인 → DS 상신
                    </button>
                    <button
                      onClick={() => handlePartnerReject(clar.id)}
                      style={{
                        flex: 1,
                        background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '10px',
                        padding: '10px 0',
                        fontSize: '13px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                      }}
                    >
                      ❌ 반려
                    </button>
                  </div>
                </div>
              ))
            )}

            {/* 이미 DS 상신된 소명 이력 */}
            {d1Clarifications.filter(c => c.status !== 'PENDING_PARTNER').length > 0 && (
              <>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#475569', marginTop: '8px' }}>처리 완료 이력</div>
                {d1Clarifications.filter(c => c.status !== 'PENDING_PARTNER').map(clar => {
                  const st = getClarStatusLabel(clar.status);
                  return (
                    <div key={clar.id} style={{
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E293B' }}>{clar.employee_name} · {clar.incident_date}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>{clar.incident_type === 'LATE' ? '지각 투입 소명' : '출근 누락 소명'}</div>
                      </div>
                      <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '3px 9px', borderRadius: '12px', background: st.bg, color: st.color }}>{st.label}</span>
                    </div>
                  );
                })}
              </>
            )}


            {pendingClarifications.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px dashed #CBD5E1',
                color: '#64748B'
              }}>
                <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                  미해결 소명 건이 없습니다.
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                  현재 [{selectedPartner}]의 모든 도급 공수가 정상 이행 승인 상태입니다.
                </div>
              </div>
            ) : (
              pendingClarifications.map((c) => (
                <div
                  key={c.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '16px',
                    border: '1px solid #FCA5A5',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        background: '#FEE2E2',
                        color: '#DC2626',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        답변 대기중 (원청 공문)
                      </span>
                      <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A', marginTop: '6px', marginBottom: '2px' }}>
                        {c.officialTitle} ({c.partName} 파트)
                      </h3>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        접수일시: {c.createdAt}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAnswerModal(c)}
                      style={{
                        background: '#0052FF',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '7px 12px',
                        fontSize: '12px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <FileText size={14} />
                      <span>소명서 작성</span>
                    </button>
                  </div>

                  <div style={{
                    background: '#F8FAFC',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#334155',
                    borderLeft: '3px solid #EF4444',
                    marginTop: '8px'
                  }}>
                    <strong>원청 PM 요청 내용:</strong> {c.messageContent}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 탭 3: 투입 공백 사전 통보 및 소속 인력 휴가 신청 결재 (D1 실시간 연동) */}
        {/* ========================================================================= */}
        {activeTab === 'gap_notices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>
                  소속 인력 휴가 신청 및 원청 공백 통보 ({myGapNotices.length}건)
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  소속사 1차 결재 완료 및 신한DS PM 공정 공백 통보 내역
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVacationModalOpen(true)}
                style={{
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)'
                }}
              >
                <PlusCircle size={14} />
                <span>+ 공백 사전 통보</span>
              </button>
            </div>

            {myGapNotices.length === 0 ? (
              <div style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '40px 20px',
                textAlign: 'center',
                border: '1px dashed #CBD5E1',
                color: '#64748B'
              }}>
                <Megaphone size={36} color="#94A3B8" style={{ margin: '0 auto 8px auto' }} />
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>
                  등록된 휴가 신청 및 사전 통보 내역이 없습니다.
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                  소속 인력이 휴가를 신청하면 D1 DB와 실시간 동기화되어 이곳에 표시됩니다.
                </div>
              </div>
            ) : (
              myGapNotices.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '2px 7px',
                        borderRadius: '5px',
                        background: '#EFF6FF',
                        color: '#0052FF'
                      }}>
                        {n.gapType}
                      </span>
                      <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>
                        {n.workerName}
                      </span>
                    </div>

                    {n.status === 'PENDING' && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#D97706',
                        background: '#FEF3C7',
                        padding: '2px 8px',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        ⏳ 1차 결재 대기
                      </span>
                    )}

                    {n.status === 'PENDING_DS' && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#0284C7',
                        background: '#E0F2FE',
                        padding: '2px 8px',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        📢 원청(신한DS) PM 최종 검수 대기
                      </span>
                    )}

                    {(n.status === 'APPROVED' || n.status === 'ACKNOWLEDGED') && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#16A34A',
                        background: '#DCFCE7',
                        padding: '2px 8px',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        ✓ 최종 승인 완료
                      </span>
                    )}

                    {n.status === 'REJECTED' && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        color: '#DC2626',
                        background: '#FEE2E2',
                        padding: '2px 8px',
                        borderRadius: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        ❌ 반려됨
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '12.5px', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span>📅 일정: <strong>{n.gapPeriod}</strong></span>
                    <span>•</span>
                    <span>공백 공수: <strong>{n.gapHours}시간 (1 M/D)</strong></span>
                  </div>

                  <div style={{
                    fontSize: '12px',
                    color: '#64748B',
                    background: '#F8FAFC',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #F1F5F9',
                    marginBottom: n.status === 'PENDING' ? '10px' : '0'
                  }}>
                    <strong>사유:</strong> {n.reason}
                  </div>

                  {/* 2단계 결재 액션 버튼 (소속사 관리자 1차 결재 및 원청 통보) */}
                  {n.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handlePartnerApproveVacation(n.id)}
                        style={{
                          flex: 1,
                          height: '36px',
                          background: '#0052FF',
                          color: '#FFFFFF',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 4px rgba(0, 82, 255, 0.2)'
                        }}
                      >
                        <CheckCircle2 size={14} />
                        <span>1차 승인 및 원청 통보 상신</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePartnerRejectVacation(n.id)}
                        style={{
                          padding: '0 14px',
                          height: '36px',
                          background: '#F1F5F9',
                          color: '#EF4444',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          border: '1px solid #E2E8F0',
                          cursor: 'pointer'
                        }}
                      >
                        반려
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 소명서 작성 모달 */}
      {isAnswerModalOpen && selectedClarification && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '430px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              원청(신한DS) 앞 공식 소명서 제출
            </h3>
            
            <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '12.5px', color: '#475569' }}>
              <strong>공문:</strong> {selectedClarification.officialTitle} ({selectedClarification.partName} 파트)<br/>
              <strong>내용:</strong> {selectedClarification.messageContent}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', margin: 0 }}>
                  협력사 관리인 공식 소명 사유 및 대체 투입 계획 *
                </label>
                <span style={{ fontSize: '11px', color: '#0052FF', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Sparkles size={13} />
                  AI 표준 소명 가이드
                </span>
              </div>

              {/* AI 원클릭 추천 템플릿 칩 */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {[
                  { key: 'TRANSPORT_DELAY' as const, label: '🚇 대중교통 지연' },
                  { key: 'CUSTOMER_OUTSIDE' as const, label: '💼 공정 외근/출장' },
                  { key: 'MILITARY_TRAINING' as const, label: '🎖️ 예비군/민방위' },
                  { key: 'FAMILY_EVENT' as const, label: '💐 경조/청원휴가' },
                  { key: 'HEALTH_CHECK' as const, label: '🏥 건강검진' }
                ].map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      const draft = aiAnalyticsService.generateClarificationDraft(
                        opt.key,
                        selectedClarification.requesterId || '담당자',
                        selectedPartner,
                        selectedClarification.partName,
                        45
                      );
                      setAnswerText(draft.generatedText);
                    }}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      fontSize: '11.5px',
                      color: '#1D4ED8',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <textarea
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                rows={5}
                placeholder="상세 소명 사유 또는 상단 AI 템플릿을 선택하세요."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '12.5px',
                  lineHeight: 1.4,
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsAnswerModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#F1F5F9',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmitAnswer}
                style={{
                  flex: 1.5,
                  padding: '10px 0',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0052FF',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                소명서 공식 발송
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공백 통보 모달 */}
      <VacationRegistrationModal
        isOpen={isVacationModalOpen}
        onClose={() => setIsVacationModalOpen(false)}
        currentUser={currentUser}
        themeMode={themeMode}
        onSuccess={() => {
          setIsVacationModalOpen(false);
        }}
      />
    </div>
  );
};
