import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Send, 
  Copy, 
  Download, 
  Printer, 
  RefreshCw, 
  Users, 
  Clock, 
  Scale, 
  ShieldCheck, 
  Sliders, 
  ChevronRight,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { geminiAiService } from '../services/geminiAiService';
import { excelService } from '../services/excelService';

interface AiStatsAnalyticsViewProps {
  onBack?: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const AiStatsAnalyticsView: React.FC<AiStatsAnalyticsViewProps> = ({
  onBack,
  themeMode
}) => {
  const [activeTab, setActiveTab] = useState<'sla_optimizer' | 'billing_simulator' | 'compliance_index'>('sla_optimizer');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 1. SLA-공수 최적화 에이전트 상태
  const [slaData, setSlaData] = useState<any>(null);
  const [isSlaLoading, setIsSlaLoading] = useState(false);
  const [shiftCount, setShiftCount] = useState<number>(2);
  const [isShiftDispatched, setIsShiftDispatched] = useState(false);

  // 2. 도급비 자동 정산 & 페널티 시뮬레이터 상태
  const [selectedPartner, setSelectedPartner] = useState<string>('(주)유브갓');
  const [basePrice, setBasePrice] = useState<number>(120000000);
  const [billingData, setBillingData] = useState<any>(null);
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 3. 협력사 계약 이행 지수(Compliance Index) 상태
  const [complianceData, setComplianceData] = useState<any>(null);
  const [isComplianceLoading, setIsComplianceLoading] = useState(false);

  // 최초 로드 시 데이터 패치
  useEffect(() => {
    loadSlaOptimization();
    loadBillingSimulation('(주)유브갓', basePrice);
    loadComplianceIndex();
  }, []);

  const loadSlaOptimization = async () => {
    setIsSlaLoading(true);
    try {
      const res = await geminiAiService.getPredictiveSlaOptimization();
      setSlaData(res);
    } finally {
      setIsSlaLoading(false);
    }
  };

  const loadBillingSimulation = async (partner: string, price: number) => {
    setIsBillingLoading(true);
    try {
      const res = await geminiAiService.simulateBillingAndPenalty({
        partnerCompany: partner,
        baseContractPrice: price
      });
      setBillingData(res);
    } finally {
      setIsBillingLoading(false);
    }
  };

  const loadComplianceIndex = async () => {
    setIsComplianceLoading(true);
    try {
      const res = await geminiAiService.getPartnerComplianceIndex();
      setComplianceData(res);
    } finally {
      setIsComplianceLoading(false);
    }
  };

  const handleDispatchShift = () => {
    setIsShiftDispatched(true);
    setToastMsg('🚀 [공정 조율안 긴급 발송] 유브갓 현장대리인 앞으로 프로젝트 인력 2명 운영 전환 요청 공문이 전송되었습니다.');
    setTimeout(() => setToastMsg(null), 4500);
  };

  const handleCopyBillingSheet = () => {
    if (!billingData) return;
    navigator.clipboard.writeText(billingData.oneClickSummarySheet);
    setIsCopied(true);
    setToastMsg('📋 계약 조항별 시간 단위 공제 산식 및 타임스탬프 근거 시트가 클립보드에 복사되었습니다.');
    setTimeout(() => {
      setIsCopied(false);
      setToastMsg(null);
    }, 3000);
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '90px' }}>
      {/* 1. 상단 히어로 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
        color: '#FFFFFF',
        padding: '20px 16px',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '10px',
              padding: '6px',
              display: 'flex'
            }}>
              <Sparkles size={20} color="#A5B4FC" />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#C7D2FE', letterSpacing: '0.5px' }}>
                GOOGLE GEMINI AI SUBCONTRACTING INTELLIGENCE
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>
                AI 도급 공정 통계 & 시뮬레이터
              </h2>
            </div>
          </div>

          <span style={{
            background: 'rgba(34, 197, 94, 0.2)',
            color: '#4ADE80',
            border: '1px solid rgba(74, 222, 128, 0.4)',
            fontSize: '11px',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '12px'
          }}>
            ● 실시간 AI 엔진 가동
          </span>
        </div>

        {/* 3대 통계 탭 네비게이션 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.08)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <button
            onClick={() => setActiveTab('sla_optimizer')}
            style={{
              padding: '9px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'sla_optimizer' ? '#4338CA' : 'transparent',
              color: '#FFFFFF',
              fontSize: '11.5px',
              fontWeight: activeTab === 'sla_optimizer' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              boxShadow: activeTab === 'sla_optimizer' ? '0 2px 8px rgba(67, 56, 202, 0.4)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <TrendingUp size={15} color={activeTab === 'sla_optimizer' ? '#A5B4FC' : '#94A3B8'} />
            <span style={{ whiteSpace: 'nowrap' }}>1. SLA 병목 예측</span>
          </button>

          <button
            onClick={() => setActiveTab('billing_simulator')}
            style={{
              padding: '9px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'billing_simulator' ? '#0284C7' : 'transparent',
              color: '#FFFFFF',
              fontSize: '11.5px',
              fontWeight: activeTab === 'billing_simulator' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              boxShadow: activeTab === 'billing_simulator' ? '0 2px 8px rgba(2, 132, 199, 0.4)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <DollarSign size={15} color={activeTab === 'billing_simulator' ? '#BAE6FD' : '#94A3B8'} />
            <span style={{ whiteSpace: 'nowrap' }}>2. 도급비 감액 시뮬</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance_index')}
            style={{
              padding: '9px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'compliance_index' ? '#B91C1C' : 'transparent',
              color: '#FFFFFF',
              fontSize: '11.5px',
              fontWeight: activeTab === 'compliance_index' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              boxShadow: activeTab === 'compliance_index' ? '0 2px 8px rgba(185, 28, 28, 0.4)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Award size={15} color={activeTab === 'compliance_index' ? '#FECDD3' : '#94A3B8'} />
            <span style={{ whiteSpace: 'nowrap' }}>3. 협력사 이행 지수</span>
          </button>
        </div>
      </div>

      {/* 토스트 메시지 */}
      {toastMsg && (
        <div style={{
          margin: '12px 16px 0 16px',
          background: '#0F172A',
          color: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: '10px',
          fontSize: '12.5px',
          fontWeight: 700,
          boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
        }}>
          {toastMsg}
        </div>
      )}

      {/* 2. 메인 탭별 콘텐츠 */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* ========================================================================= */}
        {/* TAB 1: SLA-공수 실시간 최적화 및 병목 예측 자율 에이전트 */}
        {/* ========================================================================= */}
        {activeTab === 'sla_optimizer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 상단 경고 & 예측 카드 */}
            <div style={{
              background: '#FFF1F2',
              border: '1.5px solid #FDA4AF',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(244, 63, 94, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={18} color="#E11D48" />
                  <span style={{ fontSize: '13.5px', fontWeight: 900, color: '#9F1239' }}>
                    SLA 병목 및 리소스 결손 사전 경보
                  </span>
                </div>
                <span style={{
                  background: '#E11D48',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  위험도 87% (CRITICAL)
                </span>
              </div>

              <div style={{ fontSize: '15px', fontWeight: 900, color: '#1E293B', marginBottom: '6px' }}>
                {slaData?.predictedBottleneck || '금주 목요일(8/27) 14:00~17:00 피크 타임 운영 인력 2명 결손 예상'}
              </div>

              <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                • <strong>트래픽 영향:</strong> {slaData?.trafficImpact || '상담 인바운드 콜 대기시간 14분 초과 및 CTI 장애 응답 지연 리스크'}<br />
                • <strong>AI 자율 지침:</strong> {slaData?.aiDirectiveAction || '협력사 A(유브갓)의 프로젝트 비상주 리소스 2명을 운영 파트로 3시간 임시 전환 배치 권고'}
              </p>
            </div>

            {/* SLA 회복 시뮬레이션 곡선 그래프 카드 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sliders size={16} color="#4338CA" />
                  <span>SLA 회복 What-If 시뮬레이션</span>
                </div>
                <div style={{ fontSize: '11px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#E11D48', fontWeight: 700 }}>■ 방치 시 (SLA 84%)</span>
                  <span style={{ color: '#16A34A', fontWeight: 700 }}>■ AI 조율 시 (SLA 96.8%)</span>
                </div>
              </div>

              {/* 가로 타임라인 바 시뮬레이션 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                {(slaData?.simulationCurve || [
                  { time: '10:00', withoutAi: 98, withAiShift: 98 },
                  { time: '12:00', withoutAi: 96, withAiShift: 97 },
                  { time: '14:00 (피크)', withoutAi: 88, withAiShift: 96 },
                  { time: '15:00 (위기)', withoutAi: 84, withAiShift: 97 },
                  { time: '16:00 (회복)', withoutAi: 86, withAiShift: 96 },
                  { time: '18:00', withoutAi: 95, withAiShift: 98 }
                ]).map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px' }}>
                    <span style={{ width: '70px', color: '#64748B', fontWeight: 700 }}>{item.time}</span>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ height: '6px', background: '#FDA4AF', borderRadius: '3px', width: `${item.withoutAi}%` }} />
                      <div style={{ height: '6px', background: '#4ADE80', borderRadius: '3px', width: `${item.withAiShift}%` }} />
                    </div>
                    <span style={{ width: '45px', textAlign: 'right', fontWeight: 800, color: item.withAiShift >= 95 ? '#16A34A' : '#DC2626' }}>
                      {item.withAiShift}%
                    </span>
                  </div>
                ))}
              </div>

              {/* 전환 인력 조절 슬라이더 */}
              <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                  <span>프로젝트 ➔ 운영 긴급 전환 인력 수</span>
                  <span style={{ color: '#4338CA', fontWeight: 900 }}>{shiftCount}명 투입</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={shiftCount}
                  onChange={(e) => setShiftCount(parseInt(e.target.value, 10))}
                  style={{ width: '100%', accentColor: '#4338CA' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                  <span>1명 (SLA 92%)</span>
                  <span style={{ fontWeight: 800, color: '#4338CA' }}>2명 권고 (SLA 96.8%)</span>
                  <span>3명 (SLA 99%)</span>
                  <span>4명 (과투입)</span>
                </div>
              </div>
            </div>

            {/* AI 자동 작성 선제적 공정 조율안 공문 박스 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B', marginBottom: '8px' }}>
                📄 AI 자율 생성 공정 조율 통지문 초안
              </div>
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '12px',
                lineHeight: 1.6,
                color: '#334155',
                whiteSpace: 'pre-wrap',
                marginBottom: '12px'
              }}>
                {slaData?.recommendedShiftPlan?.officialDispatchDraft || '수신: (주)유브갓 현장대리인 최영호 귀하\n\n도급계약서 제7조(공정 탄력 조율)에 의거하여, 금주 목요일 오후 피크 시간대(14:00~17:00) 프로젝트 투입 인력 2명의 운영 파트 긴급 공정 전환 배치를 요청합니다.'}
              </div>

              <button
                onClick={handleDispatchShift}
                disabled={isShiftDispatched}
                style={{
                  width: '100%',
                  background: isShiftDispatched ? '#16A34A' : 'linear-gradient(90deg, #4338CA 0%, #3730A3 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(67, 56, 202, 0.3)'
                }}
              >
                <Send size={15} />
                <span>{isShiftDispatched ? '✓ 협력사에 긴급 공정 전환 발송 완료' : '협력사에 AI 공정 조율안 1-클릭 긴급 발송'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: B2B 도급비 자동 정산 및 페널티 실시간 시뮬레이터 */}
        {/* ========================================================================= */}
        {activeTab === 'billing_simulator' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 정산 대상 협력사 및 약정 금액 설정 바 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '14px',
              border: '1px solid #E2E8F0',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '10px'
            }}>
              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>
                  정산 대상 협력사
                </label>
                <select
                  value={selectedPartner}
                  onChange={(e) => {
                    setSelectedPartner(e.target.value);
                    loadBillingSimulation(e.target.value, basePrice);
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700 }}
                >
                  <option value="(주)유브갓">(주)유브갓 (이행률 95%)</option>
                  <option value="(주)협력아이티에스">(주)협력아이티에스 (이행률 99%)</option>
                  <option value="현대IT솔루션">현대IT솔루션 (이행률 94%)</option>
                  <option value="부뜰정보통신">부뜰정보통신 (이행률 84%)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '4px' }}>
                  약정 도급 대금 (원)
                </label>
                <input
                  type="number"
                  value={basePrice}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setBasePrice(val);
                    loadBillingSimulation(selectedPartner, val);
                  }}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700 }}
                />
              </div>
            </div>

            {/* 종합 정산 계산서 카드 */}
            <div style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#94A3B8' }}>
                  {selectedPartner} · 2026년 8월 기성 정산
                </span>
                <span style={{
                  background: '#0284C7',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  공수 인정률 {billingData?.deliveredHoursRate || 95.0}%
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '10px 6px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8' }}>약정 도급액</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px' }}>
                    ₩{(billingData?.contractedAmount || basePrice).toLocaleString()}
                  </div>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.15)', padding: '10px 6px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <div style={{ fontSize: '10.5px', color: '#FCA5A5' }}>SLA 감액 공제</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#EF4444', marginTop: '2px' }}>
                    -₩{(billingData?.totalPenaltyDeduction || 1420000).toLocaleString()}
                  </div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.15)', padding: '10px 6px', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <div style={{ fontSize: '10.5px', color: '#86EFAC' }}>최종 지급 확정액</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: '#22C55E', marginTop: '2px' }}>
                    ₩{(billingData?.finalPayableAmount || (basePrice - 1420000)).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                color: '#CBD5E1'
              }}>
                ⚖️ <strong>방어 확정:</strong> {billingData?.defenseVerdict || '계약서 제12조 3항 및 SLA 제5조에 따른 시간 단위 산식 일치로 협력사의 반박 여지 0%'}
              </div>
            </div>

            {/* 계약 조항별 시간 단위 공제 산식 및 타임스탬프 근거 테이블 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '16px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scale size={16} color="#0284C7" />
                  <span>조항별 시간 단위 공제 산식 및 타임스탬프 근거</span>
                </div>

                <button
                  onClick={handleCopyBillingSheet}
                  style={{
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Copy size={12} />
                  <span>{isCopied ? '복사됨' : '근거 시트 복사'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(billingData?.deductionBreakdown || [
                  {
                    clause: '도급계약 제12조(공수 결손 정산)',
                    target: '이하은 외 1명 (총 8.0 Man-Hours 결손)',
                    calculationFormula: '8.0h × 시간당 기본단가(₩75,000)',
                    deductionAmount: 600000,
                    evidenceTimestamp: '8/3, 8/10, 8/21 출퇴근 타임스탬프 누적 편차'
                  },
                  {
                    clause: 'SLA 제5조(코어 타임 투입 미달 페널티)',
                    target: '배포 및 피크 시간대 지연 4건',
                    calculationFormula: '건당 위약벌 가산금 ₩150,000 × 4건',
                    deductionAmount: 600000,
                    evidenceTimestamp: '8/7 09:45, 8/14 09:51 GPS 지오펜스 인증 지연 로그'
                  },
                  {
                    clause: '도급계약 제18조(사전 미통보 공백 배상)',
                    target: '사전 서면 통보 없는 임의 공백 2건',
                    calculationFormula: '건당 ₩110,000 × 2건',
                    deductionAmount: 220000,
                    evidenceTimestamp: '8/19 14:00~16:00 CTI 공백 로그'
                  }
                ]).map((row: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A' }}>
                        {row.clause}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 900, color: '#DC2626' }}>
                        -₩{row.deductionAmount.toLocaleString()}원
                      </span>
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                      • 대상: <strong>{row.target}</strong><br />
                      • 계산식: <span style={{ color: '#0284C7', fontWeight: 700 }}>{row.calculationFormula}</span><br />
                      • 타임스탬프 증빙: <span style={{ color: '#64748B' }}>{row.evidenceTimestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: 협력사 계약 이행 지수(Compliance Index) 자동 산출기 */}
        {/* ========================================================================= */}
        {activeTab === 'compliance_index' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 구매·조달 부서 제출용 총괄 브리핑 배너 */}
            <div style={{
              background: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              borderRadius: '16px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={18} color="#D97706" />
                  <span style={{ fontSize: '13.5px', fontWeight: 900, color: '#92400E' }}>
                    2026년 3분기 도급사 계약 이행 지수 종합 랭킹
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: '#B45309', fontWeight: 700 }}>
                  구매/조달 평가용
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#78350F', lineHeight: 1.5, margin: 0 }}>
                {complianceData?.executiveSummary || '2026년 3분기 도급사 평가 결과: 협력아이티에스(98.4점) 1위, 유브갓(88.6점) 및 부뜰(84.1점)은 계약 관리 감독 강화 필요.'}
              </p>
            </div>

            {/* 협력사별 랭킹 카드 리스트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(complianceData?.partnerRankings || [
                {
                  rank: 1,
                  companyName: '(주)협력아이티에스',
                  grade: 'S',
                  complianceIndex: 98.4,
                  timeConsistencyScore: 99.0,
                  slaAchievementScore: 98.5,
                  clarificationFidelityScore: 97.0,
                  securityCleanRate: 100.0,
                  procurementRecommendation: '최우수 파트너사: 차기년도 계약 갱신 우선권 및 단가 3.5% 인상 검토 권고',
                  highlight: '월간 무결격 인력 투입률 99.8% 유지 및 신속한 공정 대체 체계 구축'
                },
                {
                  rank: 2,
                  companyName: '현대IT솔루션',
                  grade: 'A',
                  complianceIndex: 94.2,
                  timeConsistencyScore: 94.0,
                  slaAchievementScore: 95.0,
                  clarificationFidelityScore: 92.0,
                  securityCleanRate: 98.0,
                  procurementRecommendation: '우수 파트너사: 계약 유지 및 코어 파트 유지보수 배정 적합',
                  highlight: '장애 대응 SLA 100% 준수, 일부 GPS 경계선 턱걸이 인증 개선 권고'
                },
                {
                  rank: 3,
                  companyName: '(주)유브갓',
                  grade: 'B',
                  complianceIndex: 88.6,
                  timeConsistencyScore: 86.0,
                  slaAchievementScore: 91.0,
                  clarificationFidelityScore: 84.0,
                  securityCleanRate: 96.0,
                  procurementRecommendation: '조건부 갱신 파트너사: 금요일 투입 편차 및 월말 몰아넣기 소명에 대한 관리 개선 확약 필요',
                  highlight: '기성비 8% 결손 발생, 현장대리인 통제 강화 지도 요구'
                },
                {
                  rank: 4,
                  companyName: '부뜰정보통신',
                  grade: 'B-',
                  complianceIndex: 84.1,
                  timeConsistencyScore: 82.0,
                  slaAchievementScore: 85.0,
                  clarificationFidelityScore: 83.0,
                  securityCleanRate: 92.0,
                  procurementRecommendation: '주의 파트너사: 단가 인하 협상 및 대체 수급사 다변화 검토 권고',
                  highlight: '지연 소명 24시간 초과율 22%로 현장 관리 미흡'
                }
              ]).map((p: any) => (
                <div
                  key={p.rank}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '16px',
                    border: p.rank === 1 ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: p.rank === 1 ? '#F59E0B' : p.rank === 2 ? '#3B82F6' : '#64748B',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {p.rank}
                      </span>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>
                        {p.companyName}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        background: p.grade === 'S' ? '#FEF3C7' : p.grade === 'A' ? '#DBEAFE' : '#FEE2E2',
                        color: p.grade === 'S' ? '#B45309' : p.grade === 'A' ? '#1D4ED8' : '#B91C1C',
                        fontSize: '12px',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {p.grade} 등급
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A' }}>
                        {p.complianceIndex}점
                      </span>
                    </div>
                  </div>

                  {/* 세부 4대 지표 바 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
                    <div style={{ background: '#F8FAFC', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>투입정합(30%)</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#1E293B' }}>{p.timeConsistencyScore}점</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>SLA달성(40%)</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#1E293B' }}>{p.slaAchievementScore}점</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>소명성실(20%)</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#1E293B' }}>{p.clarificationFidelityScore}점</div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '6px', borderRadius: '6px', textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>보안클린(10%)</div>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#1E293B' }}>{p.securityCleanRate}%</div>
                    </div>
                  </div>

                  {/* 구매부서 제언 */}
                  <div style={{
                    background: '#F1F5F9',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    color: '#334155',
                    lineHeight: 1.4
                  }}>
                    🎯 <strong>구매·조달 제언:</strong> {p.procurementRecommendation}
                  </div>
                </div>
              ))}
            </div>

            {/* 구매부서 제출용 PDF/인쇄 출력 버튼 */}
            <button
              onClick={() => window.print()}
              style={{
                width: '100%',
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)'
              }}
            >
              <Printer size={15} color="#38BDF8" />
              <span>사내 구매·조달 부서 제출용 공식 PDF/브리핑 출력</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
