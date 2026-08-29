import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Activity, 
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
  ShieldCheck, 
  Sliders, 
  Building2,
  Server,
  Zap,
  CheckCircle,
  FileCheck2,
  Radio,
  BarChart3
} from 'lucide-react';
import { geminiAiService } from '../services/geminiAiService';

interface AiStatsAnalyticsViewProps {
  onBack?: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const AiStatsAnalyticsView: React.FC<AiStatsAnalyticsViewProps> = ({
  onBack,
  themeMode
}) => {
  const [activeTab, setActiveTab] = useState<'sla_optimizer' | 'availability_mttr' | 'compliance_index'>('sla_optimizer');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 1. SM SLA & 온콜 최적화 에이전트 상태
  const [slaData, setSlaData] = useState<any>(null);
  const [isSlaLoading, setIsSlaLoading] = useState(false);
  const [shiftCount, setShiftCount] = useState<number>(2);
  const [isShiftDispatched, setIsShiftDispatched] = useState(false);

  // 2. SM 서비스 가용성 & MTTR 관제 상태
  const [selectedPartner, setSelectedPartner] = useState<string>('(주)유브갓');
  const [selectedSystem, setSelectedSystem] = useState<string>('신한 카드IS 코어 SM 운영계');
  const [availabilityData, setAvailabilityData] = useState<any>(null);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 3. 협력사 SM 운영 품질 지수(Compliance Index) 상태
  const [complianceData, setComplianceData] = useState<any>(null);
  const [isComplianceLoading, setIsComplianceLoading] = useState(false);

  // 최초 로드 시 데이터 패치
  useEffect(() => {
    loadSlaOptimization();
    loadAvailabilityMetrics('(주)유브갓', selectedSystem);
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

  const loadAvailabilityMetrics = async (partner: string, sys: string) => {
    setIsAvailabilityLoading(true);
    try {
      const res = await geminiAiService.getSmServiceAvailabilityAndMttr({
        partnerCompany: partner,
        targetSystem: sys
      });
      setAvailabilityData(res);
    } finally {
      setIsAvailabilityLoading(false);
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
    setToastMsg('🚀 [SM 운영 조율안 긴급 발송] 유브갓 SM 현장대리인 앞으로 월말 피크 온콜 지원 배치 요청이 전송되었습니다.');
    setTimeout(() => setToastMsg(null), 4500);
  };

  const handleCopyReport = () => {
    if (!availabilityData) return;
    navigator.clipboard.writeText(availabilityData.officialReportSummary || '');
    setIsCopied(true);
    setToastMsg('📋 [SM 무중단 가용성 보고서 복사] 클립보드에 증빙 시트가 복사되었습니다.');
    setTimeout(() => setIsCopied(false), 3000);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div style={{
      background: '#F8FAFC',
      minHeight: '100vh',
      paddingBottom: '80px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", sans-serif'
    }}>
      {/* 알림 토스트 */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '70px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '12px',
          fontSize: '13.5px',
          fontWeight: 700,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '92%'
        }}>
          <Sparkles size={16} color="#A5B4FC" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. 상단 히어로 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
        color: '#FFFFFF',
        padding: '24px 20px 20px 20px',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#C7D2FE',
              marginBottom: '8px'
            }}>
              <Sparkles size={13} color="#A5B4FC" />
              <span>SHINHAN DS • SM INTELLIGENT AUTONOMOUS AGENT</span>
            </div>

            <h1 style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              SM 운영 통계 & 무중단 관제 AI
            </h1>
            <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
              신한DS SM(운영/유지보수) 현장의 <strong>거래 피크 리소스 최적화</strong>, <strong>무중단 가용성(99.98%) & MTTR 관제</strong>, <strong>협력사 운영 품질 지수</strong>를 AI가 실시간 자율 분석합니다.
            </p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              닫기
            </button>
          )}
        </div>

        {/* 3대 핵심 SM 탭 네비게이션 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '6px',
          marginTop: '18px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={() => setActiveTab('sla_optimizer')}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'sla_optimizer' ? 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)' : 'transparent',
              color: activeTab === 'sla_optimizer' ? '#FFFFFF' : '#94A3B8',
              fontSize: '12px',
              fontWeight: activeTab === 'sla_optimizer' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <TrendingUp size={14} />
            <span>피크 리소스 최적화</span>
          </button>

          <button
            onClick={() => setActiveTab('availability_mttr')}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'availability_mttr' ? 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)' : 'transparent',
              color: activeTab === 'availability_mttr' ? '#FFFFFF' : '#94A3B8',
              fontSize: '12px',
              fontWeight: activeTab === 'availability_mttr' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <Activity size={14} />
            <span>무중단 가용성 & MTTR</span>
          </button>

          <button
            onClick={() => setActiveTab('compliance_index')}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'compliance_index' ? 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)' : 'transparent',
              color: activeTab === 'compliance_index' ? '#FFFFFF' : '#94A3B8',
              fontSize: '12px',
              fontWeight: activeTab === 'compliance_index' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <Award size={14} />
            <span>SM 운영 품질 지수</span>
          </button>
        </div>
      </div>

      {/* 본문 콘텐츠 컨테이너 */}
      <div style={{ padding: '16px 16px 0 16px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* ========================================================= */}
        {/* 탭 1. SM 피크 리소스 최적화 & 온콜 공백 예측 자율 에이전트 */}
        {/* ========================================================= */}
        {activeTab === 'sla_optimizer' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 경보 배너 카드 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#FEE2E2', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                    <AlertTriangle size={18} color="#DC2626" />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#DC2626', letterSpacing: '0.5px' }}>
                      CRITICAL RISK FORECAST
                    </span>
                    <h3 style={{ fontSize: '15.5px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                      {slaData?.predictedBottleneck || '금주 목요일(8/27) 14:00~17:00 월말 결제 피크 타임 SM 운영 인력 2명 결손 예상'}
                    </h3>
                  </div>
                </div>

                <span style={{
                  background: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '12px',
                  fontWeight: 900,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  border: '1px solid #FECACA'
                }}>
                  위험률 {slaData?.slaRiskPercentage || 87}% 감지
                </span>
              </div>

              {/* 트래픽 영향 분석 */}
              <div style={{
                background: '#F8FAFC',
                borderLeft: '4px solid #DC2626',
                padding: '10px 14px',
                borderRadius: '0 8px 8px 0',
                fontSize: '12.5px',
                color: '#334155',
                marginBottom: '14px',
                lineHeight: 1.5
              }}>
                <strong>예상 서비스 영향:</strong> {slaData?.trafficImpact || '카드 승인 및 결제 API 대기시간 급증 및 서비스 수준 협약(SLA) 미달 위협'}
              </div>

              {/* AI 자율 가이드 지침 */}
              <div style={{
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                border: '1px solid #C7D2FE',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Sparkles size={16} color="#4338CA" />
                  <span style={{ fontSize: '12px', fontWeight: 900, color: '#312E81' }}>
                    AI 선제적 SM 운영 조율 권고안
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1E1B4B', lineHeight: 1.5 }}>
                  {slaData?.aiDirectiveAction || '협력사 A(유브갓)의 예비 SM 온콜 대기 리소스 2명을 피크 집중 관제 파트로 3시간 임시 지원 배치 권고'}
                </div>
              </div>

              {/* What-If 인터랙티브 슬라이더 & 시뮬레이션 */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={16} color="#4F46E5" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>
                      What-If 시뮬레이터: 온콜 지원 인원 조율
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#4F46E5' }}>
                    {shiftCount}명 온콜 집중 투입 시 ➔ 예상 SLA {shiftCount === 1 ? '91.2%' : shiftCount === 2 ? '96.8%' : '98.5%'}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="4"
                  value={shiftCount}
                  onChange={(e) => setShiftCount(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#4F46E5', cursor: 'pointer', marginBottom: '14px' }}
                />

                {/* 시뮬레이션 곡선 바 차트 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
                    <span>시간대별 SLA 추이</span>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ color: '#EF4444' }}>● 방치 시 (SLA 급락)</span>
                      <span style={{ color: '#10B981' }}>● AI 지원 조율 시 (정상 회복)</span>
                    </div>
                  </div>

                  {(slaData?.simulationCurve || [
                    { time: '10:00', withoutAi: 98, withAiShift: 98 },
                    { time: '12:00', withoutAi: 96, withAiShift: 97 },
                    { time: '14:00', withoutAi: 88, withAiShift: 96 },
                    { time: '15:00', withoutAi: 84, withAiShift: 97 },
                    { time: '16:00', withoutAi: 86, withAiShift: 96 },
                    { time: '18:00', withoutAi: 95, withAiShift: 98 }
                  ]).map((point: any) => (
                    <div key={point.time} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px' }}>
                      <span style={{ width: '38px', color: '#475569', fontWeight: 700 }}>{point.time}</span>
                      
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {/* 방치 시 바 */}
                        <div style={{
                          height: '8px',
                          width: `${point.withoutAi}%`,
                          background: point.withoutAi < 90 ? '#EF4444' : '#94A3B8',
                          borderRadius: '4px',
                          transition: 'all 0.3s ease'
                        }} />
                        {/* AI 조율 시 바 */}
                        <div style={{
                          height: '8px',
                          width: `${shiftCount === 1 ? point.withAiShift - 4 : shiftCount >= 3 ? 98.5 : point.withAiShift}%`,
                          background: '#10B981',
                          borderRadius: '4px',
                          transition: 'all 0.3s ease'
                        }} />
                      </div>

                      <span style={{ width: '55px', textAlign: 'right', fontWeight: 800, color: point.withoutAi < 90 ? '#DC2626' : '#059669' }}>
                        {point.withoutAi}% ➔ {shiftCount === 1 ? point.withAiShift - 4 : point.withAiShift}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-클릭 긴급 발송 버튼 */}
              <button
                onClick={handleDispatchShift}
                disabled={isShiftDispatched}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isShiftDispatched 
                    ? '#E2E8F0' 
                    : 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 100%)',
                  color: isShiftDispatched ? '#64748B' : '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: isShiftDispatched ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isShiftDispatched ? 'none' : '0 4px 14px rgba(67, 56, 202, 0.3)'
                }}
              >
                {isShiftDispatched ? (
                  <>
                    <CheckCircle2 size={18} color="#059669" />
                    <span>협력사 SM 현장대리인에게 조율안 발송 완료됨 (대기 상태)</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>협력사에 AI 온콜 공정 조율안 1-클릭 긴급 발송 ({shiftCount}명 지원 요청)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 탭 2. SM 무중단 서비스 SLA 가용성 & 장애 복구(MTTR) 지능형 관제 */}
        {/* ========================================================= */}
        {activeTab === 'availability_mttr' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* 상단 파트너사 및 시스템 선택기 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '14px 16px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>관제 대상 시스템 / 협력사</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <select
                    value={selectedPartner}
                    onChange={(e) => {
                      setSelectedPartner(e.target.value);
                      loadAvailabilityMetrics(e.target.value, selectedSystem);
                    }}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 800 }}
                  >
                    <option value="(주)유브갓">(주)유브갓 (카드SM)</option>
                    <option value="(주)협력아이티에스">(주)협력아이티에스 (코어SM)</option>
                    <option value="현대IT솔루션">현대IT솔루션 (모바일SM)</option>
                    <option value="부뜰정보통신">부뜰정보통신 (대외계SM)</option>
                  </select>

                  <select
                    value={selectedSystem}
                    onChange={(e) => {
                      setSelectedSystem(e.target.value);
                      loadAvailabilityMetrics(selectedPartner, e.target.value);
                    }}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700 }}
                  >
                    <option value="신한 카드IS 코어 SM 운영계">신한 카드IS 코어 SM 운영계</option>
                    <option value="신한 땡겨요 가맹점/배달 SM">신한 땡겨요 가맹점/배달 SM</option>
                    <option value="신한 모바일 결제 오픈API계">신한 모바일 결제 오픈API계</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => loadAvailabilityMetrics(selectedPartner, selectedSystem)}
                style={{
                  background: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '7px 12px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RefreshCw size={13} />
                <span>실시간 재계측</span>
              </button>
            </div>

            {/* 4대 SM 핵심 KPI 메트릭 대시보드 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* 1. 가용성 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>서비스 가용성 (Availability)</span>
                  <span style={{ background: '#ECFDF5', color: '#059669', fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    목표 99.95% 초과
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669', letterSpacing: '-0.5px' }}>
                  {availabilityData?.serviceAvailability?.actual || '99.98%'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  무중단 연속 가동 {availabilityData?.serviceAvailability?.uptimeHours || 1420.5}시간 (다운타임 8.5분)
                </div>
              </div>

              {/* 2. 장애 복구 시간 MTTR */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>장애 평균 복구 시간 (MTTR)</span>
                  <span style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    52% 신속 단축
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#2563EB', letterSpacing: '-0.5px' }}>
                  {availabilityData?.mttrMetrics?.actualAverageMinutes || 14.2}분
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  SLA 기준 30분 이내 (최단 조치: 6.0분 / 총 4건)
                </div>
              </div>

              {/* 3. SR 적기 처리율 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>SR(서비스요청) 적기처리율</span>
                  <span style={{ background: '#F5F3FF', color: '#7C3AED', fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    당일 처리율 98%
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#7C3AED', letterSpacing: '-0.5px' }}>
                  {availabilityData?.srFulfillment?.fulfillmentRate || '97.9%'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  142건 중 139건 완료 (평균 처리 시간: 3.4h)
                </div>
              </div>

              {/* 4. 온콜 출동 준수율 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>야간/휴일 온콜 준수율</span>
                  <span style={{ background: '#ECFDF5', color: '#059669', fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    100% 무결격
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                  {availabilityData?.onCallReadiness?.complianceRate || '100%'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  야간 당직 12회 / 긴급 접속 평균 18.0분
                </div>
              </div>
            </div>

            {/* AI 지능형 장애 예방 & 성능 튜닝 브리핑 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Zap size={17} color="#4F46E5" />
                <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                  AI 사전 예방 점검 및 인시던트 차단 리포트
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(availabilityData?.aiOperationalInsights || [
                  {
                    category: '예방 점검 (Preventive)',
                    title: '월말 정기 배치 메모리 누수 사전 감지',
                    action: '매월 25일 02:00 배치 서버 JVM 힙 메모리 자동 가비지 컬렉션 및 인스턴스 롤링 재기동 스케줄 권고'
                  },
                  {
                    category: '장애 격리 (Isolation)',
                    title: '외부 결제 PG사 네트워크 타임아웃 감지',
                    action: '서킷 브레이커(Circuit Breaker) 임계치를 3초➔1.5초로 탄력 조정하여 코어 뱅킹 스레드 고갈 방지 완료'
                  }
                ]).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '12px 14px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: item.category.includes('예방') ? '#EEF2FF' : '#FEF3C7',
                        color: item.category.includes('예방') ? '#4338CA' : '#B45309'
                      }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>
                        {item.title}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                      {item.action}
                    </div>
                  </div>
                ))}
              </div>

              {/* 하단 보고서 복사 및 출력 바 */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                <button
                  onClick={handleCopyReport}
                  style={{
                    flex: 1,
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Copy size={14} />
                  <span>{isCopied ? '복사 완료됨!' : 'SM 가용성 공식 요약 복사'}</span>
                </button>

                <button
                  onClick={() => alert('📄 [SM 무중단 서비스 품질 보증서] PDF 출력이 완료되었습니다.')}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '10px',
                    fontSize: '12.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={14} />
                  <span>SLA 달성 증빙서 출력</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 탭 3. 협력사 SM 운영 품질 및 서비스 신뢰도 지수 */}
        {/* ========================================================= */}
        {activeTab === 'compliance_index' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* 산출 기준 배너 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={18} color="#4F46E5" />
                  <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                    SM 운영 품질 평가 모델 (SM Operational Excellence Index)
                  </h3>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
                  {complianceData?.evaluationPeriod || '2026년 3분기 누적'}
                </span>
              </div>

              {/* 4대 가중치 지표 바 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '6px',
                background: '#F8FAFC',
                padding: '10px',
                borderRadius: '10px',
                marginBottom: '14px',
                fontSize: '11px',
                color: '#475569',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#4F46E5' }}>30%</div>
                  <div>SM 상주율 & 공수</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#4F46E5' }}>40%</div>
                  <div>SR & 장애 신속대응</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#4F46E5' }}>20%</div>
                  <div>예방점검 이행률</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#4F46E5' }}>10%</div>
                  <div>보안/제로트러스트</div>
                </div>
              </div>

              {/* 협력사별 SM 품질 랭킹 카드 리스트 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                    procurementRecommendation: '최우수 SM 파트너사: 카드 코어 무중단 가동률 1위, 차기년도 SM 재계약 최우선권 부여',
                    highlight: '월간 무결격 SM 상주율 99.8% 유지 및 장애 초동 대응 평균 8분 이내 달성'
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
                    procurementRecommendation: '우수 SM 파트너사: 모바일 뱅킹 SM 및 대외계 안정적 운영 파트너 유지',
                    highlight: '장애 대응 MTTR 100% 준수, 예방 점검 일지 정기 작성 우수'
                  },
                  {
                    rank: 3,
                    companyName: '(주)유브갓',
                    grade: 'B',
                    complianceIndex: 89.1,
                    timeConsistencyScore: 87.0,
                    slaAchievementScore: 91.5,
                    clarificationFidelityScore: 85.0,
                    securityCleanRate: 96.0,
                    procurementRecommendation: '양호 SM 파트너사: 가맹점 SM 안정 운영 중이나 금요일 피크시간 온콜 백업 강화 권고',
                    highlight: 'SR 적기 처리율 96.2%, 월말 피크 대응 인력 보강 필요'
                  },
                  {
                    rank: 4,
                    companyName: '부뜰정보통신',
                    grade: 'B-',
                    complianceIndex: 85.2,
                    timeConsistencyScore: 83.0,
                    slaAchievementScore: 86.0,
                    clarificationFidelityScore: 84.0,
                    securityCleanRate: 92.0,
                    procurementRecommendation: '지도 대상 SM 파트너사: 예방점검 일지 제출 지연 개선 및 당직 인력 교육 강화 지도',
                    highlight: '야간 온콜 응답 시간 편차 발생, 현장대리인 품질 통제 강화 권고'
                  }
                ]).map((partner: any) => {
                  const isTop = partner.rank === 1;
                  return (
                    <div
                      key={partner.companyName}
                      style={{
                        background: isTop ? 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)' : '#FFFFFF',
                        border: isTop ? '1.5px solid #818CF8' : '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: partner.rank === 1 ? '#FEF08A' : partner.rank === 2 ? '#E2E8F0' : '#FFEDD5',
                            color: '#0F172A',
                            fontWeight: 900,
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {partner.rank}
                          </span>
                          <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>
                            {partner.companyName}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 900,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            background: partner.grade === 'S' ? '#4F46E5' : partner.grade === 'A' ? '#059669' : '#D97706',
                            color: '#FFFFFF'
                          }}>
                            {partner.grade}등급
                          </span>
                        </div>

                        <div style={{ fontSize: '18px', fontWeight: 900, color: '#4F46E5' }}>
                          {partner.complianceIndex}점
                        </div>
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.4 }}>
                        <strong>운영 제언:</strong> {partner.procurementRecommendation}
                      </div>

                      <div style={{ fontSize: '11.5px', color: '#64748B', background: '#F8FAFC', padding: '6px 10px', borderRadius: '6px' }}>
                        ✨ <strong>특이사항:</strong> {partner.highlight}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 하단 사내 운영 위원회 제출용 브리핑 버튼 */}
              <button
                onClick={() => alert('📄 [신한DS 협력사 SM 운영 품질 종합 보고서]가 출력되었습니다.')}
                style={{
                  width: '100%',
                  marginTop: '14px',
                  background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Printer size={15} />
                <span>🏢 SM 운영 품질 종합 평가 브리핑 리포트 출력</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
