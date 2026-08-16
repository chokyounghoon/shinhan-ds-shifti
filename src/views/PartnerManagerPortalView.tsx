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
  Sparkles
} from 'lucide-react';
import { dbService, DbManpowerInput, DbSlaClarification } from '../services/db';
import { User } from '../types';

interface PartnerManagerPortalViewProps {
  themeMode: 'ddangyo' | 'shinhan';
  currentUser?: User;
  onRequestUpdated?: () => void;
}

export const PartnerManagerPortalView: React.FC<PartnerManagerPortalViewProps> = ({
  themeMode,
  currentUser = dbService.getCurrentUser()
}) => {
  const [activeTab, setActiveTab] = useState<'roster' | 'clarifications'>('roster');
  const [selectedPartner, setSelectedPartner] = useState<string>(currentUser.partnerCompany || '유브갓');
  
  // 소명 답변 모달 상태
  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [selectedClarification, setSelectedClarification] = useState<DbSlaClarification | null>(null);
  const [answerText, setAnswerText] = useState('');

  // DB 데이터 로드
  const allInputs = dbService.getManpowerInputs();
  const allClarifications = dbService.getSlaClarifications();

  // 현재 선택된 협력사 소속 인력 필터링
  const myWorkers = allInputs.filter(r => r.partnerCompany === selectedPartner);

  // 미답변 소명 요청 필터링
  const pendingClarifications = allClarifications.filter(c => 
    c.partnerCompany === selectedPartner && c.status === 'REQUESTED'
  );

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

      {/* 2. 핵심 2개 메뉴 탭 바 (불필요한 메뉴 완전 제거!) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 16px'
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
            fontSize: '14px',
            fontWeight: activeTab === 'roster' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Users size={17} />
          <span>소속인력 투입현황 ({myWorkers.length})</span>
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
            fontSize: '14px',
            fontWeight: activeTab === 'clarifications' ? 900 : 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          <Send size={16} />
          <span>원청 소명 관리</span>
          {pendingClarifications.length > 0 && (
            <span style={{
              background: '#EF4444',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px'
            }}>
              {pendingClarifications.length}
            </span>
          )}
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
                [{selectedPartner}] 소속 직원 일일 투입 목록
              </div>

              {myWorkers.map((worker) => (
                <div
                  key={worker.recordId}
                  style={{
                    background: '#FFFFFF',
                    border: worker.isSlaBreach ? '1.5px solid #FCA5A5' : '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                        {worker.workerName}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748B', background: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                        {worker.partName} 파트
                      </span>
                      {worker.isSlaBreach && (
                        <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#DC2626', background: '#FEE2E2', padding: '1px 6px', borderRadius: '4px' }}>
                          {worker.varianceMinutes}분 편차
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '3px' }}>
                      투입 시각: <strong>{worker.clockInTime}</strong> · 실적: <strong>{worker.actualInputHours}h (1 M/D)</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: worker.isSlaBreach ? '#D97706' : '#16A34A',
                      background: worker.isSlaBreach ? '#FEF3C7' : '#DCFCE7',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      display: 'inline-block'
                    }}>
                      {worker.isSlaBreach ? '소명 진행' : '정산 확정 ✓'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 탭 2: 원청 소명 접수 및 처리 (DS PM 소명 요구 대응) */}
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
              🛡️ <strong>도급 검수 합법 절차 안내</strong>: 원청(신한DS PM)은 개별 근로자에게 직접 지시하지 않으며, 협력사 관리인 앞으로 소명 요구를 발송합니다. 아래 공문을 확인하시고 사유를 작성하여 제출해주세요.
            </div>

            {/* 소명 요청 목록 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                background: '#FFFFFF',
                border: '1.5px solid #F97316',
                borderRadius: '14px',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#EA580C', fontSize: '14px', fontWeight: 800 }}>
                    <AlertTriangle size={17} />
                    <span>[SLA 미달 통보 및 소명 요청]</span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#EA580C', background: '#FFEDD5', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                    답변 대기
                  </span>
                </div>

                <div style={{ fontSize: '12.5px', color: '#334155', background: '#F8FAFC', padding: '10px 12px', borderRadius: '8px', lineHeight: 1.45, marginBottom: '12px' }}>
                  <strong>수신</strong>: {selectedPartner} 현장관리인 (영업대표) 귀하<br />
                  <strong>발신</strong>: 신한DS 상담 파트 전담 PM (조경훈)<br />
                  <strong>내용</strong>: 귀사 소속 <strong>이하은</strong> 인원의 투입 지연(45분)이 감지되었습니다. 도급 계약서 제8조에 의거하여 공식 지연 사유 소명 및 대체 공수 계획을 제출해 주시기 바랍니다.
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenAnswerModal({
                    id: 1,
                    recordId: 'rec-c-07',
                    partName: '상담',
                    partnerCompany: selectedPartner,
                    requesterId: 'DS_PM',
                    officialTitle: '투입 지연 소명 요청',
                    messageContent: '이하은 45분 지연',
                    status: 'REQUESTED',
                    createdAt: '2026-08-16 09:40'
                  })}
                  style={{
                    width: '100%',
                    height: '44px',
                    background: 'linear-gradient(90deg, #EA580C 0%, #F97316 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
                  }}
                >
                  <FileText size={16} />
                  <span>소명서 작성 및 원청 제출</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 소명서 작성 모달 */}
      {isAnswerModalOpen && (
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
            maxWidth: '400px',
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
              공식 소명서 작성 (원청 PM 제출)
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '12px' }}>
              수신: 신한DS 파트 PM | 발신: {selectedPartner} 현장관리자
            </div>

            <textarea
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                lineHeight: 1.45,
                marginBottom: '14px'
              }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setIsAnswerModalOpen(false)}
                style={{
                  flex: 1,
                  height: '42px',
                  borderRadius: '8px',
                  background: '#F1F5F9',
                  border: 'none',
                  color: '#475569',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmitAnswer}
                style={{
                  flex: 2,
                  height: '42px',
                  borderRadius: '8px',
                  background: '#0052FF',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Send size={14} />
                <span>소명서 원청 전송</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
