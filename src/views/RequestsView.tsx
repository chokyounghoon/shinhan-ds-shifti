import React, { useState } from 'react';
import { 
  Search, Filter, Calendar, Clock, Plane, FileText, 
  Plus, X, ChevronDown, CheckCircle2, AlertCircle, Send,
  AlertTriangle, Sparkles, ArrowRight, ShieldCheck
} from 'lucide-react';
import { AttendanceRequest } from '../types';
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

  const pendingRequests = requestList.filter(r => r.status === 'PENDING');
  const completedRequests = requestList.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED');

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

      {/* 4. 본문 목록 또는 빈 상태 (스크린샷 일치) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'pending' && pendingRequests.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 0 140px 0'
          }}>
            {/* 종이비행기 & 문서 일러스트 (스크린샷 일치) */}
            <div style={{
              width: '90px',
              height: '90px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                width: '60px',
                height: '45px',
                background: '#F1F3F5',
                borderRadius: '6px',
                border: '1px solid #E4E8EB'
              }} />
              <div style={{
                position: 'absolute',
                transform: 'rotate(-20deg) translate(8px, -4px)',
                color: '#CED4DA'
              }}>
                <Send size={42} strokeWidth={1.2} />
              </div>
            </div>

            <div style={{ fontSize: '15px', fontWeight: 600, color: '#8B95A1' }}>
              대기 중인 공백 통보 및 소명서가 없습니다
            </div>
          </div>
        ) : (
          <div style={{ padding: '12px 16px 80px 16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#4E5968', marginBottom: '8px' }}>
              {activeTab === 'pending' ? `검수 대기중인 소명/신청 (${pendingRequests.length}건)` : `완료된 소명/신청 (${completedRequests.length}건)`}
            </div>

            {(activeTab === 'pending' ? pendingRequests : completedRequests).map(req => (
              <div
                key={req.id}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid #ECEFF2',
                  marginBottom: '10px',
                  background: '#FFFFFF',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#191F28' }}>
                    {(req as any).title || (req.requestType === 'VACATION' ? '투입 공백 사전 통보' : ((req.requestType as any) === 'PUNCH_CORRECTION' || (req.requestType as any) === 'MISSED_PUNCH') ? '지각/출근 누락 소명' : req.requestType === 'OVERTIME' ? '연장 투입' : '근무 일정')}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    background: req.status === 'APPROVED' ? '#E6F9F0' : req.status === 'REJECTED' ? '#FFEBEB' : '#EFF6FF',
                    color: req.status === 'APPROVED' ? '#00A859' : req.status === 'REJECTED' ? '#FF3B30' : '#0052FF'
                  }}>
                    {req.status === 'APPROVED' ? '소명 승인 완료' : req.status === 'REJECTED' ? '공정 제외' : '협력사 검수 대기'}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#4E5968', fontWeight: 600 }}>
                  대상 일자: {req.targetDate} {req.startTime ? `(${req.startTime} ~ ${req.endTime})` : ''}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', background: '#F8FAFC', padding: '6px 10px', borderRadius: '6px' }}>
                  <strong>사유:</strong> {req.reason}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} color="#16A34A" />
                  <span>결재선: {(req as any).approverName || '소속사 현장대리인'} (원청 비개입 원칙)</span>
                </div>
              </div>
            ))}
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
