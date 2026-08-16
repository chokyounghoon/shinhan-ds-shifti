import React, { useState } from 'react';
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
  MessageSquare,
  Sparkles,
  Megaphone,
  PlusCircle
} from 'lucide-react';
import { dbService, DbManpowerInput, DbSlaClarification, DbPreGapNotice } from '../services/db';
import { User } from '../types';
import { VacationRegistrationModal } from '../components/modals/VacationRegistrationModal';

interface PartnerManagerPortalViewProps {
  themeMode: 'ddangyo' | 'shinhan';
  currentUser?: User;
  onRequestUpdated?: () => void;
}

export const PartnerManagerPortalView: React.FC<PartnerManagerPortalViewProps> = ({
  themeMode,
  currentUser = dbService.getCurrentUser()
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'clarifications' | 'gap_notices'>('roster');
  const [selectedPartner, setSelectedPartner] = useState<string>(currentUser.partnerCompany || '유브갓');
  
  // 소명 답변 모달 상태
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [selectedClarification, setSelectedClarification] = useState<DbSlaClarification | null>(null);
  const [answerText, setAnswerText] = useState('');

  // 신규 공백 통보 모달 상태
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);

  // DB 데이터 로드
  const allInputs = dbService.getManpowerInputs();
  const allClarifications = dbService.getSlaClarifications();
  const allGapNotices = dbService.getPreGapNotices();

  // 현재 선택된 협력사 소속 인력 필터링
  const myWorkers = allInputs.filter(r => r.partnerCompany === selectedPartner);

  // 미답변 소명 요청 필터링
  const pendingClarifications = allClarifications.filter(c => 
    c.partnerCompany === selectedPartner && c.status === 'REQUESTED'
  );

  // 현재 협력사 공백 통보 목록 필터링
  const myGapNotices = allGapNotices.filter(n => n.partnerCompany === selectedPartner);

  const partnerCompanies = ['유브갓', '(주)협력아이티에스', '현대IT솔루션', '오토시스', '파이낸스ITS'];

  const handleOpenAnswerModal = (item: DbSlaClarification) => {
    setSelectedClarification(item);
    setAnswerText('대중교통 지연으로 인한 45분 지각 소명서 접수 완료 (당일 집중 공정 대체 투입 이행 계획 제출)');
    setIsAnswerModalOpen(true);
  };

  const handleSubmitAnswer = () => {
    if (!selectedClarification || !answerText.trim()) return;
    dbService.answerClarification(selectedClarification.id, answerText);
    alert(`📨 [${selectedPartner}] 원청(신한DS PM) 앞으로 공식 소명서가 성공적으로 제출되었습니다.\n\n🛡️ [도급 검수 합법 절차 완료]\n원청 PM의 승인 대기 큐로 전송되었습니다.`);
    setIsAnswerModalOpen(false);
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
              {currentUser.name.split(' ')[0] || '박영업 대표'}
            </div>
          </div>
        </div>

        {/* 협력사 전환 칩 (다중 협력사 관제 지원) */}
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
              onClick={() => setSelectedPartner(comp)}
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
      </div>

      {/* 2. 핵심 3개 메뉴 탭 바 (소속인력 / 원청소명 / 투입공백통보) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 12px'
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
            fontSize: '13px',
            fontWeight: activeTab === 'roster' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <Users size={16} />
          <span>투입현황 ({myWorkers.length})</span>
        </button>

        {/* 메뉴 2: 원청 소명 접수 및 처리 */}
        <button
          type="button"
          onClick={() => setActiveTab('clarifications')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'clarifications' ? '3px solid #0052FF' : '3px solid transparent',
            color: activeTab === 'clarifications' ? '#0052FF' : '#64748B',
            fontSize: '13px',
            fontWeight: activeTab === 'clarifications' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <Send size={15} />
          <span>소명관리</span>
          {pendingClarifications.length > 0 && (
            <span style={{
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '10px'
            }}>
              {pendingClarifications.length}
            </span>
          )}
        </button>

        {/* 메뉴 3: 투입 공백 사전 통보 */}
        <button
          type="button"
          onClick={() => setActiveTab('gap_notices')}
          style={{
            padding: '14px 0',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'gap_notices' ? '3px solid #0052FF' : '3px solid transparent',
            color: activeTab === 'gap_notices' ? '#0052FF' : '#64748B',
            fontSize: '13px',
            fontWeight: activeTab === 'gap_notices' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          <Megaphone size={15} />
          <span>공백통보 ({myGapNotices.length})</span>
        </button>
      </div>

      {/* 3. 탭별 컨텐츠 영역 */}
      <div style={{ padding: '16px' }}>

        {/* ========================================================================= */}
        {/* 탭 1: 소속 인력 투입 현황 (1 M/D 투입 확인 및 정산 공수) */}
        {/* ========================================================================= */}
        {activeTab === 'roster' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* 상단 핵심 KPI 요약 */}
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
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>총 투입 인원</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                  {myWorkers.length}명
                </div>
              </div>
              <div style={{ borderLeft: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9' }}>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>정상 1 M/D 투입</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
                  {myWorkers.filter(w => !w.isSlaBreach).length}명
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>지연/소명 필요</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: myWorkers.some(w => w.isSlaBreach) ? '#EF4444' : '#64748B', marginTop: '2px' }}>
                  {myWorkers.filter(w => w.isSlaBreach).length}건
                </div>
              </div>
            </div>

            {/* 인력별 1 M/D 투입 카드 리스트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B', paddingLeft: '2px' }}>
                [{selectedPartner}] 소속 인력 일일 투입 현황
              </div>

              {myWorkers.map((worker) => (
                <div
                  key={worker.recordId}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '14px',
                    border: worker.isSlaBreach ? '1px solid #FCA5A5' : '1px solid #E2E8F0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                        {worker.workerName}
                      </span>
                      <span style={{ fontSize: '11px', color: '#0284C7', background: '#E0F2FE', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                        {worker.partName} 파트
                      </span>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      🕒 출근 투입: <strong>{worker.clockInTime}</strong> · 실적: <strong>1 M/D ({worker.actualInputHours}h)</strong>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                      {worker.taskSummary}
                    </div>
                  </div>

                  <div>
                    {worker.isSlaBreach ? (
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        color: '#DC2626',
                        background: '#FEE2E2',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <AlertTriangle size={12} />
                        <span>{worker.varianceMinutes}분 지연</span>
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: 800,
                        color: '#16A34A',
                        background: '#DCFCE7',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <CheckCircle2 size={12} />
                        <span>정상 투입</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 탭 2: 원청 소명 관리 (DS PM 공문 확인 및 답변서 작성) */}
        {/* ========================================================================= */}
        {activeTab === 'clarifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '12px',
              color: '#1E40AF',
              lineHeight: 1.45
            }}>
              🛡️ <strong>[도급 분쟁 방어 절차]</strong>: 원청(신한DS PM)은 협력사 직원에게 직접 징계/문책하지 않고 오직 <strong>협력사 관리인(영업대표)</strong>에게 개선 및 소명을 요구합니다. 본 화면에서 공식 답변서를 제출해 주십시오.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pendingClarifications.length === 0 ? (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B'
                }}>
                  <CheckCircle2 size={32} color="#16A34A" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    대기 중인 원청 소명 요구가 없습니다.
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    자사 소속 인력 모두 정상 계약 공정 투입 중입니다.
                  </div>
                </div>
              ) : (
                pendingClarifications.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '14px',
                      padding: '16px',
                      border: '1.5px solid #F59E0B',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#B45309', background: '#FEF3C7', padding: '2px 8px', borderRadius: '6px' }}>
                          공식 공문 접수
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748B' }}>
                          {item.partName} 파트
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                        {item.createdAt}
                      </span>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', marginBottom: '6px' }}>
                      {item.officialTitle}
                    </div>

                    <div style={{
                      background: '#F8FAFC',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '12.5px',
                      color: '#334155',
                      lineHeight: 1.45,
                      marginBottom: '12px',
                      border: '1px solid #E2E8F0'
                    }}>
                      {item.messageContent}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenAnswerModal(item)}
                      style={{
                        width: '100%',
                        height: '42px',
                        borderRadius: '10px',
                        background: 'linear-gradient(90deg, #0052FF 0%, #0066FF 100%)',
                        border: 'none',
                        color: '#FFFFFF',
                        fontSize: '13.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(0, 82, 255, 0.25)'
                      }}
                    >
                      <Send size={15} />
                      <span>원청 공식 소명서 작성 및 제출 ›</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 탭 3: 투입 공백 사전 통보 (협력사 관리자 -> 원청 PM 공문 발송) */}
        {/* ========================================================================= */}
        {activeTab === 'gap_notices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>
                원청 앞 투입 공백 사전 통보 목록
              </div>
              <button
                type="button"
                onClick={() => setIsVacationModalOpen(true)}
                style={{
                  background: '#0052FF',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <PlusCircle size={14} />
                <span>+ 공백 통보서 발송</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {myGapNotices.length === 0 ? (
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '36px 20px',
                  textAlign: 'center',
                  border: '1px dashed #CBD5E1',
                  color: '#64748B'
                }}>
                  <Megaphone size={32} color="#0052FF" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    발송된 투입 공백 통보가 없습니다.
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    소속 직원의 휴가 발생 시 상단 버튼으로 원청에 사전 통보하십시오.
                  </div>
                </div>
              ) : (
                myGapNotices.map((notice) => {
                  const isAck = notice.status === 'ACKNOWLEDGED';

                  return (
                    <div
                      key={notice.id}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '14px',
                        border: isAck ? '1px solid #BBF7D0' : '1.5px solid #93C5FD',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A' }}>
                            {notice.workerName}
                          </span>
                          <span style={{ fontSize: '11px', color: '#0284C7', background: '#E0F2FE', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            {notice.gapType}
                          </span>
                        </div>

                        {isAck ? (
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A', background: '#DCFCE7', padding: '2px 8px', borderRadius: '6px' }}>
                            ✓ DS PM 공정 확인 완료
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284C7', background: '#E0F2FE', padding: '2px 8px', borderRadius: '6px' }}>
                            공문 발송됨 (PM 검수 대기)
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                        📅 공백 기간: <strong>{notice.gapPeriod}</strong> (영향 공수: {notice.gapHours / 8} M/D)
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#64748B', lineHeight: 1.4 }}>
                        {notice.reason}
                      </div>

                      {notice.acknowledgedAt && (
                        <div style={{ fontSize: '11px', color: '#16A34A', marginTop: '6px', fontWeight: 700 }}>
                          • {notice.acknowledgedBy} 공정 투입 공백 확인 및 기성 검수 반영 완료 ({notice.acknowledgedAt})
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. 원청 소명 답변 작성 팝업 모달 */}
      {isAnswerModalOpen && selectedClarification && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '430px',
            background: '#FFFFFF',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 24px 48px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '16px 18px',
              borderBottom: '1px solid #ECEFF2',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} color="#0052FF" />
                <span style={{ fontSize: '16px', fontWeight: 900, color: '#191F28' }}>
                  원청(신한DS PM) 공식 소명서 작성
                </span>
              </div>
            </div>

            <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', fontSize: '12px', border: '1px solid #E2E8F0' }}>
                <div>수신처: <strong>신한DS {selectedClarification.partName} 파트 PM 귀하</strong></div>
                <div>발신처: <strong>[{selectedClarification.partnerCompany}] 현장관리자 ({currentUser.name.split(' ')[0] || '박영업 대표'})</strong></div>
                <div style={{ marginTop: '4px', color: '#DC2626' }}>안건: {selectedClarification.officialTitle}</div>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  공식 소명 및 사후 대책 내용 *
                </label>
                <textarea
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  rows={5}
                  style={{
                    width: '100%',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '10px',
                    fontSize: '13px',
                    color: '#1E293B',
                    outline: 'none',
                    resize: 'none',
                    lineHeight: 1.4,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{
              padding: '14px 18px',
              borderTop: '1px solid #ECEFF2',
              display: 'flex',
              gap: '8px',
              background: '#F8FAFC'
            }}>
              <button
                type="button"
                onClick={() => setIsAnswerModalOpen(false)}
                style={{
                  flex: 1,
                  height: '44px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#475569',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                닫기
              </button>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                style={{
                  flex: 1.5,
                  height: '44px',
                  borderRadius: '10px',
                  background: 'linear-gradient(90deg, #0052FF 0%, #0066FF 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 82, 255, 0.3)'
                }}
              >
                소명서 공식 제출
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. 신규 투입 공백 통보 모달 */}
      <VacationRegistrationModal
        isOpen={isVacationModalOpen}
        onClose={() => setIsVacationModalOpen(false)}
        onSuccess={() => {
          // reload
        }}
        currentUser={currentUser}
        themeMode={themeMode}
      />
    </div>
  );
};
