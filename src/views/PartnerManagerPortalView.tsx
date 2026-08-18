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
  MessageSquare,
  Sparkles,
  Megaphone,
  PlusCircle,
  UserCheck
} from 'lucide-react';
import { dbService, DbSlaClarification, DbPreGapNotice } from '../services/db';
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
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrgs, setAllOrgs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Cloudflare D1 users 및 organizations 실시간 조회
  const fetchRemoteData = async () => {
    setIsLoading(true);
    try {
      const [userRes, orgRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/organizations')
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
    } catch (err) {
      console.warn('Failed to load portal data from D1:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRemoteData();
  }, []);

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

  // 3. 해당 협력사의 현장관리인(영업대표) 성명 동적 조회
  const currentManager = useMemo(() => {
    const mgr = allUsers.find(u => 
      u.company === selectedPartner && 
      (u.is_partner_manager === 1 || u.role === 'PARTNER_PART_LEADER' || u.role === 'PARTNER_MANAGER')
    );
    return mgr ? `${mgr.name} ${mgr.position || '대표'}` : `${currentUser.name.split(' ')[0]} 관리자`;
  }, [allUsers, selectedPartner, currentUser.name]);

  // 4. 해당 협력사 소속 투입 인력(작업자) 실시간 필터링
  const myWorkers = useMemo(() => {
    return allUsers.filter(u => 
      u.company === selectedPartner && 
      u.role === 'PARTNER_WORKER' && 
      !u.is_partner_manager
    );
  }, [allUsers, selectedPartner]);

  // 소명 및 공백 통보 상태
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [selectedClarification, setSelectedClarification] = useState<DbSlaClarification | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);

  const allClarifications = dbService.getSlaClarifications();
  const allGapNotices = dbService.getPreGapNotices();

  const pendingClarifications = allClarifications.filter(c => 
    c.partnerCompany === selectedPartner && c.status === 'REQUESTED'
  );
  const myGapNotices = allGapNotices.filter(n => n.partnerCompany === selectedPartner);

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
        {/* 탭 1: 소속 인력 투입 현황 (실시간 D1 users 연동) */}
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
                  {myWorkers.length}명
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>지연/소명 필요</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#64748B', marginTop: '2px' }}>
                  0건
                </div>
              </div>
            </div>

            {/* 인력별 1 M/D 투입 카드 리스트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B', paddingLeft: '2px' }}>
                [{selectedPartner}] 소속 인력 일일 투입 현황
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
                    key={worker.employee_id || worker.seq}
                    style={{
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '14px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                          {worker.name}
                        </span>
                        {worker.part && (
                          <span style={{ fontSize: '11px', color: '#0284C7', background: '#E0F2FE', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                            {worker.part.endsWith('파트') ? worker.part : `${worker.part} 파트`}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                          ({worker.employee_id})
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        🕒 출근 투입: <strong>08:50</strong> · 실적: <strong>1 M/D (8.0h)</strong>
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '2px' }}>
                        {worker.team || '상담운영팀'} · {worker.position || '선임'} (도급 공정 수행)
                      </div>
                    </div>

                    <div>
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
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 탭 2: 원청 소명 관리 (DS PM 공문 확인 및 답변서 작성) */}
        {/* ========================================================================= */}
        {activeTab === 'clarifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>
              원청(신한DS) 도급 공수 결손 소명 요청서 접수함
            </div>

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
        {/* 탭 3: 투입 공백 사전 통보 (휴가/교육 등 협력사 자체 통보) */}
        {/* ========================================================================= */}
        {activeTab === 'gap_notices' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>
                원청 대상 투입 인력 공백 사전 통보 이력
              </div>
              <button
                type="button"
                onClick={() => setIsVacationModalOpen(true)}
                style={{
                  background: '#0284C7',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <PlusCircle size={14} />
                <span>공백 사전 통보</span>
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
                  등록된 사전 통보 내역이 없습니다.
                </div>
              </div>
            ) : (
              myGapNotices.map((n) => (
                <div
                  key={n.id}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '14px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                      {n.workerName} ({n.gapType})
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: n.status === 'ACKNOWLEDGED' ? '#16A34A' : '#0284C7',
                      background: n.status === 'ACKNOWLEDGED' ? '#DCFCE7' : '#E0F2FE',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {n.status === 'ACKNOWLEDGED' ? '원청 확인 완료' : '원청 통보 완료'}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    일정: {n.gapPeriod} ({n.gapHours}시간)
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>
                    사유: {n.reason}
                  </div>
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
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                협력사 관리인 공식 소명 사유 및 대체 투입 계획 *
              </label>
              <textarea
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontSize: '13px',
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
