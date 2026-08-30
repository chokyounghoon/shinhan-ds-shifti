import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Calendar, Clock, Plane, FileText, 
  Plus, X, ChevronDown, CheckCircle2, AlertCircle, Send,
  AlertTriangle, Sparkles, ArrowRight, ShieldCheck, RefreshCw
} from 'lucide-react';
import { AttendanceRequest } from '../types';
import { dbService } from '../services/db';
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
  const [isLoadingClarifications, setIsLoadingClarifications] = useState(false);

  // 현재 로그인 사용자 정보
  const currentUser = dbService.getCurrentUser();
  const empId = currentUser?.employeeId || currentUser?.id || '';

  // D1에서 본인 소명 목록 조회
  const fetchClarifications = async () => {
    if (!empId) return;
    setIsLoadingClarifications(true);
    try {
      const res = await fetch(`/api/clarification-requests?role=PARTNER_WORKER&employee_id=${encodeURIComponent(empId)}`);
      if (res.ok) {
        const json = await res.json();
        setD1Clarifications(json.data || []);
      }
    } catch (e) {
      console.warn('소명 조회 실패:', e);
    } finally {
      setIsLoadingClarifications(false);
    }
  };

  useEffect(() => {
    fetchClarifications();
  }, [empId]);

  // 미소명 지각 및 출근 미체크 내역 (휴가 제외, 근무 일정 대비 결손 발생 건)
  const [unclarifiedIncidents, setUnclarifiedIncidents] = useState<UnclarifiedIncident[]>([
    {
      id: 'inc-01',
      incidentDate: '2026-08-28',
      type: 'LATE',
      typeLabel: '지각 투입',
      delayMinutes: 45,
      varianceTime: '45분 결손 (0.75h)',
      scheduledTime: '09:00',
      actualTime: '09:45',
      defaultReason: '출근 시간대 지하철 2호선 신호 고장으로 인한 45분 지연 투입 (간편지연증명서 구비)'
    },
    {
      id: 'inc-02',
      incidentDate: '2026-08-26',
      type: 'MISSING_PUNCH',
      typeLabel: '출퇴근 미등록 (결근 결손)',
      varianceTime: '8.0시간 결손',
      scheduledTime: '09:00 ~ 18:00',
      actualTime: '미인증',
      defaultReason: '사옥 3층 출입 게이트 통과 후 사내 Wi-Fi 인식 지연으로 GPS 출근 태그 누락'
    }
  ]);

  const [selectedIncidentForModal, setSelectedIncidentForModal] = useState<UnclarifiedIncident | null>(null);
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);

  const currentEmpId = (empId || currentUser?.id || '').toUpperCase().trim();
  const currentUserName = (currentUser?.name || '').trim();

  const isMyRequest = (r: AttendanceRequest) => {
    const rUserId = (r.userId || (r as any).employeeId || '').toUpperCase().trim();
    const rName = (r.userName || '').trim();
    return rUserId === currentEmpId || (currentUserName && rName === currentUserName);
  };

  const pendingRequests = requestList.filter(r => isMyRequest(r) && ((r.status as any) === 'PENDING' || (r.status as any) === 'PENDING_PARTNER' || (r.status as any) === 'PENDING_DS'));
  const completedRequests = requestList.filter(r => isMyRequest(r) && (r.status === 'APPROVED' || r.status === 'REJECTED'));

  // D1 소명 상태 → 표시용 레이블 변환
  const getClarStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING_PARTNER': return { label: '협력사 검수 대기', color: '#D97706', bg: '#FEF3C7' };
      case 'PENDING_DS': return { label: 'DS 최종 승인 대기', color: '#2563EB', bg: '#EFF6FF' };
      case 'APPROVED': return { label: '최종 승인 완료', color: '#059669', bg: '#ECFDF5' };
      case 'REJECTED': return { label: '반려됨', color: '#DC2626', bg: '#FEF2F2' };
      default: return { label: '검토 중', color: '#64748B', bg: '#F8FAFC' };
    }
  };

  const handleOpenClarificationForIncident = (inc: UnclarifiedIncident) => {
    setSelectedIncidentForModal(inc);
    setIsClarificationModalOpen(true);
  };

  const handleClarificationSubmitted = (newReq: any) => {
    if (selectedIncidentForModal) {
      setUnclarifiedIncidents(prev => prev.filter(i => i.id !== selectedIncidentForModal.id));
    }
    setRequestList(prev => [newReq, ...prev]);
    setToastMsg(`🎉 [소명서 제출 완료] ${newReq.targetDate} 결손 건이 소속 협력사 관리자에게 상신되었습니다.`);
    setTimeout(() => setToastMsg(null), 4000);
    // D1 목록 새로고침
    setTimeout(() => fetchClarifications(), 1500);
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
            placeholder="검색"
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
          onClick={() => alert('요청 필터: 기간별, 유형별(휴가/연장/근무일정), 승인상태별')}
          style={{ color: '#4E5968', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* 2. 상단 4개 서브탭 (대기중 0 / 내 요청 0 / 완료 8 / 참조) (스크린샷 일치) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ECEFF2', background: '#FFFFFF' }}>
        {[
          { id: 'pending', label: '대기중', count: pendingRequests.length },
          { id: 'my', label: '내 요청', count: 0 },
          { id: 'completed', label: '완료', count: completedRequests.length },
          { id: 'ref', label: '참조', count: undefined }
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

      {/* 3. 날짜 범위 드롭다운 (스크린샷 일치) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 18px',
        borderBottom: '1px solid #F1F3F5'
      }}>
        <div 
          onClick={() => alert('조회 기간 변경: 2026.08.02 ~ 2026.08.16')}
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

      {/* 3-2. 🚨 미소명 지각 및 출근 미체크 결손 내역 섹션 (휴가 제외 대상) */}
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

      {/* 4. 소명 목록 (D1 실시간) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* D1 소명 요청 목록 */}
        {(activeTab === 'pending' || activeTab === 'my') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '0 16px 8px' }}>
            {/* D1 실시간 소명 이력 */}
            {d1Clarifications.length > 0 && (
              <React.Fragment>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#475569' }}>검수 대기중인 소명/신청 ({d1Clarifications.filter(c => c.status !== 'APPROVED' && c.status !== 'REJECTED').length}건)</span>
                  <button onClick={fetchClarifications} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', color: '#64748B', fontSize: '11px' }}>
                    <RefreshCw size={12} /><span>새로고침</span>
                  </button>
                </div>
                {d1Clarifications.map(clar => {
                  const st = getClarStatusLabel(clar.status);
                  return (
                    <div key={clar.id} style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                          {clar.incident_type === 'LATE' ? '지각 투입 소명' : clar.incident_type === 'MISSING_PUNCH' ? '출근 누락 소명' : '소명 신청'}
                        </span>
                        <span style={{ fontSize: '11.5px', fontWeight: 800, padding: '3px 9px', borderRadius: '12px', background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '4px' }}>
                        대상 일자: <strong>{clar.incident_date}</strong> {clar.scheduled_time ? `(약정: ${clar.scheduled_time})` : ''}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B', background: '#F8FAFC', padding: '6px 10px', borderRadius: '6px', marginBottom: '6px' }}>
                        {clar.reason_text}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px' }}>
                        <span style={{ padding: '2px 7px', borderRadius: '4px', fontWeight: 700,
                          background: clar.status === 'PENDING_PARTNER' ? '#FEF3C7' : '#ECFDF5',
                          color: clar.status === 'PENDING_PARTNER' ? '#B45309' : '#059669' }}>
                          1단계: 협력사 검수 {clar.partner_approved_at ? '✓완료' : '대기중'}
                        </span>
                        <span style={{ color: '#CBD5E1' }}>›</span>
                        <span style={{ padding: '2px 7px', borderRadius: '4px', fontWeight: 700,
                          background: clar.status === 'PENDING_DS' ? '#EFF6FF' : clar.status === 'APPROVED' ? '#ECFDF5' : '#F8FAFC',
                          color: clar.status === 'PENDING_DS' ? '#2563EB' : clar.status === 'APPROVED' ? '#059669' : '#94A3B8' }}>
                          2단계: DS 최종 승인 {clar.ds_approved_at ? '✓완료' : '대기중'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            )}

            {/* 기존 requestList (비소명 요청) */}
            {pendingRequests.filter(r => !(r as any).incidentType).map(req => {
              const isPending1 = (req.status as any) === 'PENDING';
              const isPendingDs = (req.status as any) === 'PENDING_DS';
              const isApproved = req.status === 'APPROVED';
              const isRejected = req.status === 'REJECTED';

              return (
                <div
                  key={req.id}
                  style={{
                    border: '1px solid #ECEFF2',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    marginBottom: '10px',
                    background: '#FFFFFF',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#191F28' }}>
                      {(req as any).title || (req.requestType === 'VACATION' ? '투입 공백 사전 통보' : req.requestType === 'OVERTIME' ? '연장 투입' : '근무 일정')}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontWeight: 700,
                      background: isPending1 ? '#FEF3C7' : isPendingDs ? '#EFF6FF' : isApproved ? '#DCFCE7' : '#FEE2E2',
                      color: isPending1 ? '#B45309' : isPendingDs ? '#2563EB' : isApproved ? '#16A34A' : '#DC2626'
                    }}>
                      {isPending1 ? '1단계: 협력사 검토중' : isPendingDs ? '2단계: DS 공정검수 대기' : isApproved ? '최종 승인 완료' : '반려'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#4E5968', fontWeight: 600 }}>
                    대상 일자: {req.targetDate} {req.startTime ? `(${req.startTime})` : ''}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', background: '#F8FAFC', padding: '6px 10px', borderRadius: '6px' }}>
                    <strong>사유:</strong> {req.reason}
                  </div>

                  {/* 3단계 스텝 게이지 */}
                  <div style={{
                    marginTop: '10px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '4px'
                  }}>
                    <div style={{
                      padding: '4px 2px',
                      borderRadius: '4px',
                      background: isPending1 ? '#FEF3C7' : '#DCFCE7',
                      border: isPending1 ? '1px solid #F59E0B' : '1px solid #86EFAC',
                      textAlign: 'center',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: isPending1 ? '#B45309' : '#16A34A'
                    }}>
                      ① 협력사 {isPending1 ? '검토중' : '승인✓'}
                    </div>
                    <div style={{
                      padding: '4px 2px',
                      borderRadius: '4px',
                      background: isPendingDs ? '#EFF6FF' : isApproved ? '#DCFCE7' : '#F8FAFC',
                      border: isPendingDs ? '1px solid #3B82F6' : isApproved ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                      textAlign: 'center',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: isPendingDs ? '#2563EB' : isApproved ? '#16A34A' : '#94A3B8'
                    }}>
                      ② 원청DS {isPendingDs ? '검수중' : isApproved ? '검수완료✓' : '대기'}
                    </div>
                    <div style={{
                      padding: '4px 2px',
                      borderRadius: '4px',
                      background: isApproved ? '#DCFCE7' : isRejected ? '#FEE2E2' : '#F8FAFC',
                      border: isApproved ? '1px solid #16A34A' : isRejected ? '1px solid #EF4444' : '1px solid #E2E8F0',
                      textAlign: 'center',
                      fontSize: '10px',
                      fontWeight: 800,
                      color: isApproved ? '#16A34A' : isRejected ? '#DC2626' : '#94A3B8'
                    }}>
                      ③ {isApproved ? '승인완료✓' : isRejected ? '반려' : '확정'}
                    </div>
                  </div>
                </div>
              );
            })}

            {d1Clarifications.length === 0 && pendingRequests.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '13px' }}>
                <CheckCircle2 size={36} color="#10B981" style={{ margin: '0 auto 8px auto', display: 'block' }} />
                접수된 소명 또는 요청 건이 없습니다.
              </div>
            )}
          </div>
        )}
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

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
