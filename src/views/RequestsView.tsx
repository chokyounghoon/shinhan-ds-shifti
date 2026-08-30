import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, Clock, Plane, FileText, 
  Plus, X, ChevronDown, CheckCircle2, AlertCircle, Send,
  AlertTriangle, Sparkles, ArrowRight, ShieldCheck, RefreshCw
} from 'lucide-react';
import { AttendanceRequest } from '../types';
import { dbService } from '../services/db';
import { formatKstDateTime } from '../utils/dateUtils';
import { RequestTypeSelectActionSheetModal, RequestCategoryType } from '../components/modals/RequestTypeSelectActionSheetModal';
import { SubmitClarificationModal, UnclarifiedIncident } from '../components/modals/SubmitClarificationModal';

interface RequestsViewProps {
  requests: AttendanceRequest[];
  onOpenNewRequest: (initialType?: string, actionName?: string) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  onOpenNewRequest,
  themeMode
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'my' | 'completed' | 'ref'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('08.01 - 08.29');
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RequestCategoryType | null>(null);
  const [requestList, setRequestList] = useState<AttendanceRequest[]>(requests);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [d1Clarifications, setD1Clarifications] = useState<any[]>([]);
  const [d1Vacations, setD1Vacations] = useState<any[]>([]);
  const [isLoadingClarifications, setIsLoadingClarifications] = useState(false);

  // 현재 로그인 사용자 정보
  const currentUser = dbService.getCurrentUser();
  const empId = currentUser?.employeeId || currentUser?.id || 'S01832';
  const currentEmpId = (empId || '').toUpperCase().trim();
  const currentUserName = (currentUser?.name || '').trim();

  // D1에서 본인 소명 및 휴가 신청 목록 실시간 조회
  const fetchClarifications = async () => {
    setIsLoadingClarifications(true);
    try {
      // employee_id 대소문자 불일치 방어: 대문자 및 소문자 모두 시도
      const empIdUpper = (empId || '').toUpperCase().trim();
      const empIdLower = (empId || '').toLowerCase().trim();

      const [clarRes, vacRes, vacResLower, logsRes] = await Promise.all([
        fetch(`/api/clarification-requests?role=PARTNER_WORKER&employee_id=${encodeURIComponent(empIdUpper)}`),
        fetch(`/api/attendance/requests?employee_id=${encodeURIComponent(empIdUpper)}`),
        fetch(`/api/attendance/requests?employee_id=${encodeURIComponent(empIdLower)}`),
        fetch(`/api/commute/logs?employee_id=${encodeURIComponent(empIdUpper)}`)
      ]);
      
      let clarData: any[] = [];
      let vacData: any[] = [];
      let commuteLogs: any[] = [];

      if (clarRes.ok) {
        const json = await clarRes.json();
        clarData = json.data || [];
        setD1Clarifications(clarData);
      }

      if (logsRes.ok) {
        const j = await logsRes.json();
        commuteLogs = j.data || [];
      }
      
      // 대문자 결과와 소문자 결과 병합 (중복 제거)
      const vacIds = new Set<string>();
      const mergedVac: any[] = [];
      
      for (const res of [vacRes, vacResLower]) {
        if (res.ok) {
          const j = await res.json();
          const rows: any[] = j.data || [];
          for (const r of rows) {
            if (!vacIds.has(r.id)) {
              vacIds.add(r.id);
              mergedVac.push(r);
            }
          }
        }
      }
      vacData = mergedVac;
      setD1Vacations(vacData);
    } catch (e) {
      console.warn('소명 및 휴가 조회 실패:', e);
    } finally {
      setIsLoadingClarifications(false);
    }
  };

  useEffect(() => {
    fetchClarifications();

    const handleUpdate = () => fetchClarifications();
    window.addEventListener('attendance_request_updated', handleUpdate);
    window.addEventListener('notification_updated', handleUpdate);

    return () => {
      window.removeEventListener('attendance_request_updated', handleUpdate);
      window.removeEventListener('notification_updated', handleUpdate);
    };
  }, [empId]);

  // 날짜/시간 포맷 헬퍼 (YYYY-MM-DD HH:mm:ss 년월일 시분초 보장)
  // 날짜/시간 포맷 헬퍼 (한국 표준시 KST YYYY-MM-DD HH:mm:ss)
  const formatDateTimeSec = (dateStr?: string | null): string => {
    return formatKstDateTime(dateStr);
  };

  // D1 통합 요청 항목 리스트 (소명 + 휴가)
  const unifiedRequests = [
    ...d1Clarifications.map((c: any) => ({
      id: `clar-${c.id}`,
      originalId: c.id,
      itemCategory: 'CLARIFICATION' as const,
      typeLabel: c.incident_type === 'LATE' ? '🚨 지각 투입 소명' : c.incident_type === 'MISSING_PUNCH' ? '🚨 출근 누락 소명' : '소명 신청',
      targetDate: c.incident_date,
      scheduledTime: c.scheduled_time,
      reason: c.reason_text,
      status: c.status || 'PENDING_PARTNER',
      isPending: c.status !== 'APPROVED' && c.status !== 'REJECTED' && c.status !== 'REJECTED_PARTNER' && c.status !== 'REJECTED_DS',
      isCompleted: c.status === 'APPROVED' || c.status === 'REJECTED' || c.status === 'REJECTED_PARTNER' || c.status === 'REJECTED_DS',
      partnerApproved: !!(c.partner_approved_at || c.status === 'PENDING_DS' || c.status === 'APPROVED'),
      dsApproved: !!(c.ds_approved_at || c.status === 'APPROVED'),
      createdAt: c.created_at,
      partnerApprovedAt: c.partner_approved_at,
      partnerApprovalMemo: c.partner_approval_memo,
      partnerApproverName: c.partner_approver_name || '협력사 현장관리인',
      dsApprovedAt: c.ds_approved_at,
      dsApprovalMemo: c.ds_approval_memo,
      dsApproverName: c.ds_approver_name || '신한DS 현장대리인(PM)',
      updatedAt: c.updated_at
    })),
    ...d1Vacations.map((v: any) => ({
      id: `vac-${v.id}`,
      originalId: v.id,
      itemCategory: 'VACATION' as const,
      typeLabel: v.request_type === 'VACATION' ? '🏖️ 휴가 신청 (사전 공백 통보)' : v.request_type === 'OVERTIME' ? '⏱️ 연장 투입' : '📅 근무 일정',
      targetDate: v.target_date,
      scheduledTime: v.start_time ? `${v.start_time} ~ ${v.end_time || ''}` : undefined,
      reason: v.reason,
      status: v.status || 'PENDING',
      isPending: v.status !== 'APPROVED' && v.status !== 'REJECTED' && v.status !== 'REJECTED_PARTNER' && v.status !== 'REJECTED_DS',
      isCompleted: v.status === 'APPROVED' || v.status === 'REJECTED' || v.status === 'REJECTED_PARTNER' || v.status === 'REJECTED_DS',
      partnerApproved: v.status === 'PENDING_DS' || v.status === 'APPROVED' || !!v.partner_approved_at,
      dsApproved: v.status === 'APPROVED' || !!v.ds_approved_at,
      createdAt: v.created_at,
      partnerApprovedAt: v.partner_approved_at,
      partnerApprovalMemo: v.partner_approval_memo,
      partnerApproverName: v.approver_name || '협력사 현장관리인',
      dsApprovedAt: v.ds_approved_at,
      dsApprovalMemo: v.ds_approval_memo,
      dsApproverName: '신한DS 현장대리인(PM)',
      updatedAt: v.updated_at
    }))
  ].sort((a, b) => (b.createdAt || b.targetDate || '').localeCompare(a.createdAt || a.targetDate || ''))
   .filter((item, idx, arr) => {
     // 동일 일자 + 동일 카테고리(휴가/소명) 건은 가장 최신(첫 번째) 1건만 노출
     const key = `${item.itemCategory}_${(item.targetDate || '').trim()}`;
     return arr.findIndex(x => `${x.itemCategory}_${(x.targetDate || '').trim()}` === key) === idx;
   });

  const pendingCount = unifiedRequests.filter(r => r.isPending).length;
  const completedCount = unifiedRequests.filter(r => r.isCompleted).length;
  const totalMyCount = unifiedRequests.length;

  // D1에 이미 소명이 제출된 일자 목록
  const clarifiedDates = new Set(d1Clarifications.map(c => c.incident_date));

  // 미소명 결손 내역 (D1 DB 기준, 이미 소명 신청된 날짜는 제외)
  const rawIncidents: UnclarifiedIncident[] = [];
  const unclarifiedIncidents = rawIncidents.filter(inc => !clarifiedDates.has(inc.incidentDate));

  const [selectedIncidentForModal, setSelectedIncidentForModal] = useState<UnclarifiedIncident | null>(null);
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);

  // 보완 및 재상신 전용 모달 상태
  const [resubmitModalOpen, setResubmitModalOpen] = useState(false);
  const [targetReqForResubmit, setTargetReqForResubmit] = useState<any | null>(null);
  const [resubmitReasonText, setResubmitReasonText] = useState('');
  const [resubmitDelayMinutes, setResubmitDelayMinutes] = useState(30);
  const [isSubmittingResubmit, setIsSubmittingResubmit] = useState(false);

  // D1 소명/휴가 상태 → 표시용 레이블 변환
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_PARTNER':
      case 'PENDING':
        return { label: '1단계: 협력사 검토중', color: '#D97706', bg: '#FEF3C7' };
      case 'PENDING_DS': 
        return { label: '2단계: DS 공정검수 대기', color: '#2563EB', bg: '#EFF6FF' };
      case 'APPROVED': 
        return { label: '최종 승인 완료', color: '#059669', bg: '#ECFDF5' };
      case 'REJECTED_PARTNER':
        return { label: '⚠️ 협력사 보완요청 (재상신 가능)', color: '#DC2626', bg: '#FEF2F2' };
      case 'REJECTED_DS':
        return { label: '⚠️ DS PM 보완요청 (재상신 가능)', color: '#DC2626', bg: '#FEF2F2' };
      case 'REJECTED': 
        return { label: '⚠️ 보완 및 재상신 필요', color: '#DC2626', bg: '#FEF2F2' };
      default: 
        return { label: '검토 중', color: '#64748B', bg: '#F8FAFC' };
    }
  };

  const handleOpenResubmitModal = (req: any) => {
    setTargetReqForResubmit(req);
    setResubmitReasonText(req.reason || '');
    setResubmitDelayMinutes(30);
    setResubmitModalOpen(true);
  };

  const handleExecuteResubmit = async () => {
    if (!targetReqForResubmit) return;
    if (!resubmitReasonText.trim()) {
      alert('보완 소명 사유를 입력해주세요.');
      return;
    }
    setIsSubmittingResubmit(true);
    try {
      const isClar = targetReqForResubmit.id.startsWith('clar-');
      // originalId를 사용해야 DB에서 정확히 찾을 수 있음 (id는 'clar-', 'vac-' prefix 포함)
      const apiId = targetReqForResubmit.originalId || targetReqForResubmit.id;
      const url = isClar 
        ? `/api/clarification-requests/${apiId}/resubmit`
        : `/api/attendance/requests/${apiId}/resubmit`;

      const payload = isClar ? {
        employee_id: currentEmpId,
        employee_name: currentUserName,
        reason_text: resubmitReasonText,
        delay_minutes: resubmitDelayMinutes,
        category: 'TRAFFIC'
      } : {
        employee_id: currentEmpId,
        user_name: currentUserName,
        reason: resubmitReasonText
      };

      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setToastMsg('🎉 [보완 재상신 완료] 소명서가 보완되어 협력사 관리인에게 다시 1차 승인 상신되었습니다.');
        setTimeout(() => setToastMsg(null), 4000);
        setResubmitModalOpen(false);
        fetchClarifications();
      } else {
        alert('재상신 처리 중 오류가 발생했습니다.');
      }
    } catch (e) {
      alert('서버 통신 실패');
    } finally {
      setIsSubmittingResubmit(false);
    }
  };

  const handleOpenClarificationForIncident = (inc: UnclarifiedIncident) => {
    setSelectedIncidentForModal(inc);
    setIsClarificationModalOpen(true);
  };

  const handleClarificationSubmitted = (newReq: any) => {
    setToastMsg(`🎉 [소명서 제출 완료] ${newReq.targetDate || newReq.incidentDate} 결손 건이 소속 협력사 관리자에게 상신되었습니다.`);
    setTimeout(() => setToastMsg(null), 4000);
    fetchClarifications();
  };

  const fabItems = [
    { id: 'clarify', label: '지각/누락 소명 등록', icon: AlertTriangle, type: 'PUNCH_CORRECTION' as RequestCategoryType },
    { id: 'schedule', label: '근무일정 요청', icon: Calendar, type: 'SCHEDULE' as RequestCategoryType },
    { id: 'punch', label: '출퇴근기록 요청', icon: Clock, type: 'PUNCH_CORRECTION' as RequestCategoryType },
    { id: 'vacation', label: '휴가 요청', icon: Plane, type: 'VACATION' as RequestCategoryType },
    { id: 'custom', label: '커스텀 요청', icon: FileText, type: 'CUSTOM' as RequestCategoryType },
  ];

  const handleFabItemClick = (item: typeof fabItems[0]) => {
    setIsFabOpen(false);
    if (item.id === 'clarify') {
      setSelectedIncidentForModal(unclarifiedIncidents[0] || null);
      setIsClarificationModalOpen(true);
      return;
    }
    setSelectedCategory(item.type);
  };

  const handleSubActionSelect = (actionName: string) => {
    setSelectedCategory(null);
    onOpenNewRequest(selectedCategory || 'SCHEDULE', actionName);
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* 1. 상단 검색바 & 필터 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        gap: '12px'
      }}>
        <div style={{
          flex: 1,
          height: '38px',
          background: '#F1F3F5',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          gap: '8px'
        }}>
          <Search size={16} color="#8B95A1" />
          <input
            type="text"
            placeholder="휴가, 소명, 사유 검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '14px',
              color: '#191F28',
              width: '100%'
            }}
          />
        </div>

        <button 
          onClick={fetchClarifications}
          style={{ color: '#4E5968', display: 'flex', alignItems: 'center', padding: '6px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer' }}
          title="새로고침"
        >
          <RefreshCw size={17} className={isLoadingClarifications ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 2. 상단 4개 서브탭 (대기중 / 내 요청 / 완료 / 참조) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ECEFF2', background: '#FFFFFF' }}>
        {[
          { id: 'pending', label: '대기중', count: pendingCount },
          { id: 'my', label: '내 요청', count: totalMyCount },
          { id: 'completed', label: '완료', count: completedCount },
          { id: 'ref', label: '참조', count: 0 }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: 1,
                padding: '12px 0',
                fontSize: '14px',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#191F28' : '#8B95A1',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span style={{
                  fontSize: '11px',
                  padding: '1px 5px',
                  borderRadius: '4px',
                  background: isActive ? (themeMode === 'ddangyo' ? '#FFF0ED' : '#EBF1FF') : '#F1F3F5',
                  color: isActive ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') : '#8B95A1',
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              )}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '15%',
                  right: '15%',
                  height: '2.5px',
                  background: '#191F28'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. 날짜 범위 드롭다운 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 18px',
        borderBottom: '1px solid #F1F3F5'
      }}>
        <div 
          onClick={() => alert('조회 기간 변경: 2026.08.01 ~ 2026.08.31')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          <Calendar size={16} color="#4E5968" />
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#4E5968' }}>{dateRange}</span>
          <ChevronDown size={15} color="#8B95A1" />
        </div>
      </div>

      {/* 알림 토스트 */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          color: '#FFFFFF',
          padding: '12px 18px',
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '90%'
        }}>
          <Sparkles size={16} color="#A5B4FC" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 3-2. 🚨 미소명 지각 및 출근 미체크 결손 내역 섹션 (소명 미제출 건만 표시) */}
      <div style={{ padding: '14px 16px 4px 16px' }}>
        {unclarifiedIncidents.length > 0 ? (
          <div style={{
            background: '#FFF5F5',
            border: '1.5px solid #FEB2B2',
            borderRadius: '14px',
            padding: '14px 16px',
            boxShadow: '0 4px 12px rgba(229, 62, 62, 0.08)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={18} color="#E53E3E" strokeWidth={2.5} />
                <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#C53030' }}>
                  미소명 지각 및 출근 미체크 결손 ({unclarifiedIncidents.length}건)
                </span>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#9B2C2C', background: '#FED7D7', padding: '2px 7px', borderRadius: '10px' }}>
                소명 필수
              </span>
            </div>

            <p style={{ fontSize: '12px', color: '#742A2A', margin: '0 0 12px 0', lineHeight: 1.4 }}>
              도급 계약 SLA 규정에 따라 지각 또는 출퇴근 미인증 건은 <strong>24시간 이내 소명서를 등록</strong>해야 기성 공수가 정상 산입됩니다.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {unclarifiedIncidents.map(inc => (
                <div
                  key={inc.id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #FEB2B2',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1A202C' }}>
                        {inc.incidentDate} ({inc.incidentDate.includes('28') ? '금' : '수'})
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: inc.type === 'LATE' ? '#FEEBC8' : '#FED7D7',
                        color: inc.type === 'LATE' ? '#C05621' : '#C53030'
                      }}>
                        {inc.typeLabel}
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#4A5568' }}>
                      약정: {inc.scheduledTime} ➔ 실제: <strong style={{ color: '#E53E3E' }}>{inc.actualTime}</strong> ({inc.varianceTime})
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenClarificationForIncident(inc)}
                    style={{
                      background: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 6px rgba(197, 48, 48, 0.3)',
                      flexShrink: 0
                    }}
                  >
                    <span>✍️ 소명 등록</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12.5px',
            color: '#166534'
          }}>
            <CheckCircle2 size={18} color="#16A34A" />
            <span>최근 30일간 미소명된 지각이나 출근 미체크 결손 내역이 없습니다.</span>
          </div>
        )}
      </div>

      {/* 4. D1 실시간 소명 및 휴가 요청 통합 목록 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px 16px' }}>
          {/* 목록 상단 타이틀 & 새로고침 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', marginTop: '6px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155' }}>
              {activeTab === 'pending'
                ? `검수 대기중인 소명/신청 (${pendingCount}건)`
                : activeTab === 'my'
                ? `내가 등록한 전체 소명/신청 (${totalMyCount}건)`
                : activeTab === 'completed'
                ? `최종 처리 완료된 내역 (${completedCount}건)`
                : '참조 및 공람 내역 (0건)'}
            </span>
            <button onClick={fetchClarifications} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', color: '#64748B', fontSize: '11px', fontWeight: 700 }}>
              <RefreshCw size={12} className={isLoadingClarifications ? 'animate-spin' : ''} /><span>새로고침</span>
            </button>
          </div>

          {/* D1 실시간 통합 목록 필터링 */}
          {unifiedRequests
            .filter(req => {
              if (activeTab === 'pending') return req.isPending;
              if (activeTab === 'completed') return req.isCompleted;
              if (activeTab === 'my') return true;
              return false;
            })
            .filter(req => {
              if (!searchQuery) return true;
              return (req.reason || '').includes(searchQuery) || (req.targetDate || '').includes(searchQuery);
            })
            .map(req => {
              const st = getStatusBadge(req.status);
              const isRejected = req.status === 'REJECTED' || req.status === 'REJECTED_PARTNER' || req.status === 'REJECTED_DS';
              return (
                <div key={req.id} style={{
                  background: isRejected ? '#FFF5F5' : '#FFFFFF',
                  border: isRejected ? '1.5px solid #FEB2B2' : '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                      {req.typeLabel}
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '3px 9px', borderRadius: '12px', background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                    <div>대상 일자: <strong style={{ color: '#0F172A' }}>{req.targetDate}</strong> {req.scheduledTime ? `(${req.scheduledTime})` : ''}</div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} color="#8B95A1" />
                      <span>신청일시: <strong style={{ color: '#334155' }}>{formatDateTimeSec(req.createdAt)}</strong></span>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', marginBottom: '10px', border: '1px solid #EEF2F6' }}>
                    <strong style={{ color: '#334155' }}>신청 사유:</strong> {req.reason}
                  </div>

                  {/* 반려/보완 요청 사유 및 재상신 버튼 */}
                  {isRejected && (
                    <div style={{
                      background: '#FEF2F2',
                      border: '1px solid #FCA5A5',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginBottom: '10px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B', marginBottom: '4px' }}>
                        ⚠️ 보완 요청 사유 ({formatDateTimeSec(req.updatedAt)}):
                      </div>
                      <div style={{ fontSize: '12px', color: '#7F1D1D', marginBottom: '8px', background: '#FFFFFF', padding: '6px 8px', borderRadius: '4px', border: '1px solid #FECACA' }}>
                        {req.dsApprovalMemo || req.partnerApprovalMemo || '관리자 검토 결과 사유 또는 증빙이 보완되어야 합니다.'}
                      </div>
                      <button
                        onClick={() => handleOpenResubmitModal(req)}
                        style={{
                          width: '100%',
                          background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '9px 0',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
                        }}
                      >
                        <span>✍️ 사유 보완 후 다시 상신하기 (재상신)</span>
                      </button>
                    </div>
                  )}
                  
                  {/* 🛡️ 결재 단계별 상세 진행 타임라인 (년월일 시분초 표시) */}
                  <div style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '11.5px'
                  }}>
                    {/* 1단계: 협력사 1차 결재 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '10.5px',
                          background: req.partnerApproved ? '#DCFCE7' : req.status === 'REJECTED_PARTNER' ? '#FEE2E2' : '#FEF3C7',
                          color: req.partnerApproved ? '#15803D' : req.status === 'REJECTED_PARTNER' ? '#DC2626' : '#B45309'
                        }}>
                          1단계 협력사
                        </span>
                        <span style={{ fontWeight: 700, color: req.partnerApproved ? '#15803D' : '#475569' }}>
                          {req.partnerApproved ? `✓ 1차 승인 완료 (${req.partnerApproverName})` : req.status === 'REJECTED_PARTNER' ? '⚠️ 보완 요청 (반려)' : '⏳ 1차 검토 대기중'}
                        </span>
                      </div>
                      <span style={{ color: '#64748B', fontSize: '11px', fontWeight: 600 }}>
                        {req.partnerApprovedAt ? formatDateTimeSec(req.partnerApprovedAt) : (req.status === 'REJECTED_PARTNER' ? formatDateTimeSec(req.updatedAt) : '대기중')}
                      </span>
                    </div>

                    {/* 2단계: 신한DS 최종 승인 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', paddingTop: '4px', borderTop: '1px dashed #E2E8F0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{
                          padding: '2px 7px',
                          borderRadius: '4px',
                          fontWeight: 800,
                          fontSize: '10.5px',
                          background: req.dsApproved ? '#DCFCE7' : req.status === 'PENDING_DS' ? '#EFF6FF' : req.status === 'REJECTED_DS' ? '#FEE2E2' : '#F1F5F9',
                          color: req.dsApproved ? '#15803D' : req.status === 'PENDING_DS' ? '#2563EB' : req.status === 'REJECTED_DS' ? '#DC2626' : '#94A3B8'
                        }}>
                          2단계 신한DS
                        </span>
                        <span style={{ fontWeight: 700, color: req.dsApproved ? '#15803D' : req.status === 'PENDING_DS' ? '#2563EB' : '#64748B' }}>
                          {req.dsApproved ? `✓ 최종 승인 완료 (${req.dsApproverName})` : req.status === 'PENDING_DS' ? '⏳ PM 최종 검수 진행중' : req.status === 'REJECTED_DS' ? '⚠️ DS PM 보완요청' : '1차 승인 후 검수 대기'}
                        </span>
                      </div>
                      <span style={{ color: '#64748B', fontSize: '11px', fontWeight: 600 }}>
                        {req.dsApprovedAt ? formatDateTimeSec(req.dsApprovedAt) : (req.status === 'APPROVED' ? formatDateTimeSec(req.updatedAt) : req.status === 'PENDING_DS' ? '검수 진행중' : '-')}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

          {((activeTab === 'pending' && pendingCount === 0) ||
            (activeTab === 'my' && totalMyCount === 0) ||
            (activeTab === 'completed' && completedCount === 0) ||
            (activeTab === 'ref')) && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '13px' }}>
              <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 8px auto', display: 'block' }} />
              {activeTab === 'pending' ? '대기중인 소명/휴가 신청 건이 없습니다.' : activeTab === 'completed' ? '처리 완료된 내역이 없습니다.' : activeTab === 'ref' ? '참조된 내역이 없습니다.' : '등록된 내 요청 건이 없습니다.'}
            </div>
          )}
        </div>
      </div>

      {/* 5. 플로팅 스피드 다이얼 메뉴 (스크린샷 100% 일치) */}
      {isFabOpen && (
        <div 
          onClick={() => setIsFabOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(2px)',
            zIndex: 900
          }}
        />
      )}

      {/* 스피드 다이얼 액션 아이템들 */}
      <div style={{
        position: 'fixed',
        bottom: '84px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '16px',
        zIndex: 950
      }}>
        {isFabOpen && fabItems.map((item, index) => {
          const IconComp = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => handleFabItemClick(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                animation: `fadeInUp ${0.15 + index * 0.05}s ease-out`
              }}
            >
              <span style={{
                fontSize: '14.5px',
                fontWeight: 700,
                color: '#191F28',
                letterSpacing: '-0.3px',
                textShadow: '0 1px 3px rgba(255,255,255,0.9)'
              }}>
                {item.label}
              </span>

              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 3px 12px rgba(0, 0, 0, 0.14)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF'
              }}>
                <IconComp size={22} strokeWidth={2.2} />
              </div>
            </div>
          );
        })}

        {/* 메인 FAB 버튼 (+ / ✕) */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF',
            boxShadow: '0 4px 16px rgba(0, 102, 255, 0.35)',
            border: 'none',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            transform: isFabOpen ? 'rotate(90deg)' : 'none'
          }}
        >
          {isFabOpen ? <X size={26} strokeWidth={2.5} /> : <Plus size={28} strokeWidth={2.5} />}
        </button>
      </div>

      {/* 6. 요청 세부 종류 선택 바텀 액션 시트 모달 (스크린샷 일치) */}
      <RequestTypeSelectActionSheetModal
        isOpen={selectedCategory !== null}
        category={selectedCategory}
        onClose={() => setSelectedCategory(null)}
        onSelectAction={handleSubActionSelect}
        themeMode={themeMode}
      />

      {/* 7. 지각 및 출근 미체크 투입 결손 소명 등록 모달 */}
      <SubmitClarificationModal
        isOpen={isClarificationModalOpen}
        onClose={() => {
          setIsClarificationModalOpen(false);
          setSelectedIncidentForModal(null);
        }}
        incident={selectedIncidentForModal}
        onClarificationSubmitted={handleClarificationSubmitted}
        themeMode={themeMode}
      />

      {/* 8. 반려 건 보완 및 재상신 모달 */}
      {resubmitModalOpen && targetReqForResubmit && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={18} color="#DC2626" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                  소명 사유 보완 및 재상신
                </h3>
              </div>
              <button 
                onClick={() => setResubmitModalOpen(false)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              >
                <X size={18} color="#94A3B8" />
              </button>
            </div>

            <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '12px' }}>
              반려된 소명 내용이나 사유, 지연 시간을 보완하여 다시 협력사 관리인에게 1차 승인 단계로 상신합니다.
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                대상 일자
              </label>
              <div style={{ background: '#F8FAFC', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#0F172A', border: '1px solid #E2E8F0' }}>
                {targetReqForResubmit.targetDate} ({targetReqForResubmit.typeLabel})
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                보완 소명 사유 (구체적 기재)
              </label>
              <textarea
                value={resubmitReasonText}
                onChange={e => setResubmitReasonText(e.target.value)}
                placeholder="지연/결손 발생 경위 및 보완 증빙 사유를 상세히 작성해주세요."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setResubmitModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                onClick={handleExecuteResubmit}
                disabled={isSubmittingResubmit}
                style={{
                  flex: 2,
                  padding: '10px 0',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                {isSubmittingResubmit ? '재상신 중...' : '🚀 보완 소명서 재상신하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
