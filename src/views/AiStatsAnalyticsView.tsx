import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Activity, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  Copy, 
  Printer, 
  RefreshCw, 
  Users, 
  Clock, 
  ShieldCheck, 
  Sliders, 
  Building2,
  Zap,
  MapPin,
  Calendar,
  AlertCircle,
  Eye
} from 'lucide-react';
import { geminiAiService } from '../services/geminiAiService';
import { AiStatsReportPreviewModal, AiReportType } from '../components/modals/AiStatsReportPreviewModal';

interface AiStatsAnalyticsViewProps {
  onBack?: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const AiStatsAnalyticsView: React.FC<AiStatsAnalyticsViewProps> = ({
  onBack,
  themeMode
}) => {
  const [activeTab, setActiveTab] = useState<'settlement_auditor' | 'availability_mttr' | 'compliance_index'>('settlement_auditor');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 리포트 인쇄 전 화면 확인(미리보기) 모달 상태
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewReportType, setPreviewReportType] = useState<AiReportType>('settlement');

  const openReportPreview = (type: AiReportType) => {
    setPreviewReportType(type);
    setPreviewModalOpen(true);
  };

  // 1. 도급 인력 실투입 vs 약정 공수(M/D) 달성률 및 월말 정산 적격성 AI 진단 상태
  const [settlementData, setSettlementData] = useState<any>(null);
  const [isSettlementLoading, setIsSettlementLoading] = useState(false);
  const [isSettlementCopied, setIsSettlementCopied] = useState(false);

  // 2. 출퇴근 시간대 패턴 & 정시성 다차원 분석 상태
  const [selectedPartner, setSelectedPartner] = useState<string>('(주)유브갓');
  const [selectedSystem, setSelectedSystem] = useState<string>('상담 공정 (인바운드/분실)');
  const [availabilityData, setAvailabilityData] = useState<any>(null);
  const [isAvailabilityLoading, setIsAvailabilityLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // 3. 협력사 도급 근태 건전성 지수 상태
  const [complianceData, setComplianceData] = useState<any>(null);
  const [isComplianceLoading, setIsComplianceLoading] = useState(false);

  // 최초 로드 시 데이터 패치
  useEffect(() => {
    loadSettlementAudit('(주)유브갓', selectedSystem);
    loadAvailabilityMetrics('(주)유브갓', selectedSystem);
    loadComplianceIndex();
  }, []);

  const loadSettlementAudit = async (partner: string = '(주)유브갓', part: string = selectedSystem) => {
    setIsSettlementLoading(true);
    try {
      const res = await geminiAiService.getManpowerSettlementAudit({
        partnerCompany: partner,
        targetPart: part
      });
      setSettlementData(res);
    } finally {
      setIsSettlementLoading(false);
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

  const handleCopySettlementReport = () => {
    if (!settlementData) return;
    navigator.clipboard.writeText(settlementData.officialSettlementReportDraft || '');
    setIsSettlementCopied(true);
    setToastMsg('📋 [도급 공수 정산 결과서 복사] 클립보드에 정산 검수 보고서가 복사되었습니다.');
    setTimeout(() => setIsSettlementCopied(false), 3000);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyReport = () => {
    if (!availabilityData) return;
    navigator.clipboard.writeText(availabilityData.officialReportSummary || '');
    setIsCopied(true);
    setToastMsg('📋 [도급 근태 정산 요약 복사] 클립보드에 증빙 시트가 복사되었습니다.');
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
              <span>SHINHAN DS • 도급 근태 빅데이터 & 공수 정산 AI</span>
            </div>

            <h1 style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              도급 공정 근태 통계 & 공수 검수 AI
            </h1>
            <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: 0, lineHeight: 1.5, maxWidth: '650px' }}>
              실제 출퇴근 타각 및 공수 투입(Manpower) 데이터 기반의 약정 달성률(M/D) 검증, 출근 시간대별 정시성 분석, 협력사별 근태 건전성 지수를 AI가 정밀 분석합니다.
            </p>
          </div>

          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              닫기
            </button>
          )}
        </div>

        {/* 3대 핵심 근태 분석 탭 네비게이션 */}
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
            onClick={() => setActiveTab('settlement_auditor')}
            style={{
              padding: '8px 4px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'settlement_auditor' ? 'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)' : 'transparent',
              color: activeTab === 'settlement_auditor' ? '#FFFFFF' : '#94A3B8',
              fontSize: '12px',
              fontWeight: activeTab === 'settlement_auditor' ? 800 : 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <ShieldCheck size={14} />
            <span>공수 달성률 & 정산</span>
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
            <span>출근 시간대 & 정시성</span>
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
            <span>협력사 근태 지수</span>
          </button>
        </div>
      </div>

      {/* 본문 콘텐츠 컨테이너 */}
      <div style={{ padding: '16px 16px 0 16px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* ========================================================= */}
        {/* 탭 1. 도급 인력 실투입 vs 약정 공수(M/D) 달성률 및 월말 정산 적격성 AI 진단 */}
        {/* ========================================================= */}
        {activeTab === 'settlement_auditor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 정산 판정 배너 카드 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#DCFCE7', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                    <CheckCircle2 size={20} color="#16A34A" />
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A', letterSpacing: '0.5px' }}>
                      DELIVERY FULFILLMENT & SETTLEMENT AUDIT
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                      {settlementData?.partnerCompany || '(주)유브갓'} • {settlementData?.targetPart || '상담 공정 파트'} 도급 공수 달성률 및 정산 검수
                    </h3>
                  </div>
                </div>

                <span style={{
                  background: '#F0FDF4',
                  color: '#15803D',
                  fontSize: '12px',
                  fontWeight: 900,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: '1px solid #BBF7D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={14} color="#16A34A" />
                  <span>{settlementData?.settlementVerdict?.status || '정산 적격 (100% 정상 지급 권고)'}</span>
                </span>
              </div>

              {/* 정산 판정 요약 박스 */}
              <div style={{
                background: '#F8FAFC',
                borderLeft: '4px solid #16A34A',
                padding: '12px 14px',
                borderRadius: '0 8px 8px 0',
                fontSize: '12.5px',
                color: '#334155',
                marginBottom: '16px',
                lineHeight: 1.6
              }}>
                <strong>AI 공수 검수 소견:</strong> {settlementData?.settlementVerdict?.summary || '약정 공수(160.0 M/D) 대비 실투입 공수(159.1 M/D) 달성률 99.4%로 도급 계약 기준(95% 이상)을 초과 달성하여 전액 정상 정산 승인 적격으로 판정되었습니다.'}
              </div>

              {/* 4대 핵심 공수 지표 그리드 */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px',
                marginBottom: '16px'
              }}>
                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, marginBottom: '2px' }}>약정 투입 공수</div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A' }}>
                    {settlementData?.metrics?.contractedManDays || 160.0} <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#64748B' }}>M/D</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>월간 기준 1,280시간</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, marginBottom: '2px' }}>실투입 검수 공수</div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#0052FF' }}>
                    {settlementData?.metrics?.actualDeliveredManDays || 159.1} <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#0052FF' }}>M/D</span>
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#0052FF', marginTop: '2px' }}>D1 타각 실측 1,272.8h</div>
                </div>

                <div style={{ background: '#F0FDF4', padding: '12px 14px', borderRadius: '10px', border: '1px solid #BBF7D0' }}>
                  <div style={{ fontSize: '11px', color: '#15803D', fontWeight: 700, marginBottom: '2px' }}>약정 공수 달성률</div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#16A34A' }}>
                    {settlementData?.metrics?.fulfillmentRate || 99.4}%
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#15803D', marginTop: '2px' }}>계약 기준(95%) 초과</div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, marginBottom: '2px' }}>도급비 감액 발생</div>
                  <div style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A' }}>
                    {settlementData?.settlementVerdict?.deductionAmount || '0원'}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#16A34A', marginTop: '2px' }}>무결격 정산 완료</div>
                </div>
              </div>

              {/* 공수 이행 달성률 프로그레스 바 */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E293B' }}>
                    월간 약정 공수 이행 달성률 (목표 대비 실적)
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#0052FF' }}>
                    {settlementData?.metrics?.actualDeliveredManDays || 159.1} / {settlementData?.metrics?.contractedManDays || 160.0} M/D ({settlementData?.metrics?.fulfillmentRate || 99.4}%)
                  </span>
                </div>
                <div style={{ height: '10px', background: '#E2E8F0', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, settlementData?.metrics?.fulfillmentRate || 99.4)}%`,
                    background: 'linear-gradient(90deg, #0052FF 0%, #10B981 100%)',
                    borderRadius: '5px',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* D1 실시간 투입 인력별 공수 이행 현황 */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={15} color="#0052FF" />
                  <span>D1 실시간 투입 인력별 공수 검수 내역</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(settlementData?.breakdownByWorker || [
                    { workerName: '송무준', contractedHours: 160, actualHours: 160, fulfillmentRate: 100, status: '정상 완수' },
                    { workerName: '김철수', contractedHours: 160, actualHours: 158.5, fulfillmentRate: 99.1, status: '소명 인정 완수' },
                    { workerName: '이영희', contractedHours: 160, actualHours: 159.0, fulfillmentRate: 99.4, status: '정상 완수' },
                    { workerName: '박민호', contractedHours: 160, actualHours: 159.0, fulfillmentRate: 99.4, status: '정상 완수' }
                  ]).map((w: any, idx: number) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: '#F8FAFC',
                      borderRadius: '8px',
                      fontSize: '12.5px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, color: '#0F172A' }}>{w.workerName}</span>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          약정 {w.contractedHours}h ➔ 실투입 {w.actualHours}h
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 800, color: '#0052FF' }}>{w.fulfillmentRate}%</span>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: w.status === '정상 완수' ? '#DCFCE7' : '#FEF3C7',
                          color: w.status === '정상 완수' ? '#15803D' : '#B45309'
                        }}>
                          {w.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI 감사 의견서 (Audit Findings) */}
              <div style={{
                background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
                border: '1px solid #C7D2FE',
                borderRadius: '12px',
                padding: '14px 16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Sparkles size={16} color="#4338CA" />
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#312E81' }}>
                    도급 공수 적격성 감사 소견 (Audit Findings)
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {(settlementData?.aiAuditFindings || [
                    { title: '무결격 약정 공수 이행 달성', description: '실투입 공수 달성률 99.4%로 월간 계약 범위 내 안정적 도급 공정 완수 확인.' },
                    { title: '위장도급 방지 컴플라이언스 준수', description: '근태 및 투입 실적이 협력사 현장대리인의 자체 관리 및 소명 검수를 거쳐 확정되어 도급 법적 적격성 확보.' }
                  ]).map((f: any, idx: number) => (
                    <div key={idx} style={{ fontSize: '12.5px', color: '#1E1B4B', lineHeight: 1.5 }}>
                      <strong>• {f.title}:</strong> {f.description}
                    </div>
                  ))}
                </div>
              </div>

              {/* 1-클릭 정산 보고서 복사 버튼 */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleCopySettlementReport}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #0052FF 0%, #003ECC 100%)',
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
                  <Copy size={16} />
                  <span>{isSettlementCopied ? '복사 완료!' : '도급비 정산 결과서 클립보드 복사'}</span>
                </button>

                <button
                  onClick={() => openReportPreview('settlement')}
                  style={{
                    padding: '13px 18px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#0052FF',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(0, 82, 255, 0.1)'
                  }}
                >
                  <Eye size={16} />
                  <span>정산 검수서 화면 확인 / 인쇄</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 탭 2. 출퇴근 시간대 패턴 & 정시성(Punctuality) 및 공수 이행률 다차원 분석 */}
        {/* ========================================================= */}
        {activeTab === 'availability_mttr' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* 상단 파트너사 및 공정 파트 선택기 */}
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
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>관제 대상 도급사 / 공정 파트</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                  <select
                    value={selectedPartner}
                    onChange={(e) => {
                      setSelectedPartner(e.target.value);
                      loadAvailabilityMetrics(e.target.value, selectedSystem);
                    }}
                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 800 }}
                  >
                    <option value="(주)유브갓">(주)유브갓 (상담 공정)</option>
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
                    <option value="상담 공정 (인바운드/분실)">상담 공정 (인바운드/분실)</option>
                    <option value="카드 코어 SM 공정">카드 코어 SM 공정</option>
                    <option value="모바일 결제 연동 공정">모바일 결제 연동 공정</option>
                    <option value="가맹점 정산 공정">가맹점 정산 공정</option>
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

            {/* 4대 근태 핵심 KPI 메트릭 대시보드 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* 1. 평균 출근 시각 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>평균 출근 시각</span>
                  <span style={{ background: '#EFF6FF', color: '#2563EB', fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    09:00 대비 16분 여유
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#2563EB', letterSpacing: '-0.5px' }}>
                  {availabilityData?.commuteMetrics?.avgArrivalTime || '08:44:12'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  총 {availabilityData?.commuteMetrics?.totalPunchCount || 176}건 타각 분석 결과
                </div>
              </div>

              {/* 2. 출근 정시 준수율 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>출근 정시 준수율 (On-Time)</span>
                  <span style={{ background: '#ECFDF5', color: '#059669', fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    목표 98.0% 초과
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#059669', letterSpacing: '-0.5px' }}>
                  {availabilityData?.commuteMetrics?.onTimeRate || '98.6%'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  월간 지각 발생 {availabilityData?.commuteMetrics?.lateCount || 2}건 (소명 1건 승인)
                </div>
              </div>

              {/* 3. 약정 공수 이행률 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>약정 공수 이행률 (M/D)</span>
                  <span style={{ background: '#F5F3FF', color: '#7C3AED', fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    정산 공제 위험 없음
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#7C3AED', letterSpacing: '-0.5px' }}>
                  {availabilityData?.commuteMetrics?.contractFulfillmentRate || '99.4%'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  약정 1,280h 중 1,272.5h 실투입 확정
                </div>
              </div>

              {/* 4. GPS 정상 권역 타각률 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 700 }}>GPS 권역 정상 타각률</span>
                  <span style={{ background: '#ECFDF5', color: '#059669', fontSize: '11px', fontWeight: 800, padding: '2px 7px', borderRadius: '10px' }}>
                    위치 무결성 100%
                  </span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                  {availabilityData?.commuteMetrics?.gpsIntegrityRate || '99.8%'}
                </div>
                <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                  을지로 파인에비뉴 반경 25m 이내 타각
                </div>
              </div>
            </div>

            {/* 출근 시간대별 타각 분포 차트 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={17} color="#4F46E5" />
                  <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                    출근 시간대별 타각 분포 (Punch-In Distribution)
                  </h4>
                </div>
                <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 700 }}>
                  08:30~08:50 집중 출근 구간
                </span>
              </div>

              {/* 시간대별 분포 바 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(availabilityData?.timeDistribution || [
                  { bracket: '08:00~08:30', label: '얼리버드 출근', percentage: 18, count: 14, color: '#3B82F6' },
                  { bracket: '08:30~08:50', label: '안정 출근 구간', percentage: 54, count: 43, color: '#10B981' },
                  { bracket: '08:50~09:00', label: '마감 임박 구간', percentage: 22, count: 18, color: '#F59E0B' },
                  { bracket: '09:00 이후', label: '지각/소명 대상', percentage: 6, count: 5, color: '#EF4444' }
                ]).map((item: any) => (
                  <div key={item.bracket} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                    <div style={{ width: '90px', fontWeight: 800, color: '#334155' }}>
                      {item.bracket}
                    </div>
                    <div style={{ width: '85px', color: '#64748B', fontSize: '11.5px' }}>
                      {item.label}
                    </div>
                    <div style={{ flex: 1, background: '#F1F5F9', borderRadius: '6px', height: '12px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${item.percentage}%`,
                        background: item.color,
                        height: '100%',
                        borderRadius: '6px',
                        transition: 'all 0.4s ease'
                      }} />
                    </div>
                    <div style={{ width: '70px', textAlign: 'right', fontWeight: 800, color: item.color }}>
                      {item.percentage}% ({item.count}명)
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI 지능형 근태 이상 패턴 & 개선 가이드 브리핑 */}
            <div style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px',
              border: '1px solid #E2E8F0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Zap size={17} color="#4F46E5" />
                <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#1E293B', margin: 0 }}>
                  AI 근태 패턴 분석 및 공정 개선 인사이트
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(availabilityData?.aiOperationalInsights || [
                  {
                    category: '출근 병목 (Congestion)',
                    title: '월요일 08:50~09:00 엘리베이터 혼잡 구간 타각 집중',
                    action: '월요일 08:55 이후 타각자(4명) 대상 10분 조기 출근 유도 또는 파트별 시차 출근제 권고'
                  },
                  {
                    category: '소명 분석 (Fidelity)',
                    title: '지각 소명 신청 2건 중 1건(지하철 연착) 정상 인정 완료',
                    action: '단순 교통 정체 소명건은 도급 계약 제12조에 의거 면책 불가 처리 및 정상 공수 반영'
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
                        background: item.category.includes('소명') ? '#EEF2FF' : '#FEF3C7',
                        color: item.category.includes('소명') ? '#4338CA' : '#B45309'
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
                  <span>{isCopied ? '복사 완료됨!' : '도급 근태 정산 요약 복사'}</span>
                </button>

                <button
                  onClick={() => openReportPreview('availability')}
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
                  <Eye size={15} />
                  <span>출퇴근 정산 증빙서 화면 확인 & 인쇄</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 탭 3. 협력사 도급 근태 건전성 및 신뢰도 지수 */}
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
                    협력사 도급 근태 건전성 모델 (Attendance Compliance Index)
                  </h3>
                </div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>
                  {complianceData?.evaluationPeriod || '2026년 8월 당월 누적'}
                </span>
              </div>

              {/* 4대 가중치 지표 바 (순수 근태 데이터 기반) */}
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
                  <div style={{ fontWeight: 800, color: '#4F46E5' }}>40%</div>
                  <div>출근 정시성</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#4F46E5' }}>30%</div>
                  <div>약정 공수 달성</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#4F46E5' }}>20%</div>
                  <div>소명 건전성</div>
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#4F46E5' }}>10%</div>
                  <div>GPS 정상 타각</div>
                </div>
              </div>

              {/* 협력사별 근태 랭킹 카드 리스트 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(complianceData?.partnerRankings || [
                  {
                    rank: 1,
                    companyName: '(주)협력아이티에스',
                    grade: 'S',
                    complianceIndex: 98.8,
                    onTimeRate: 99.4,
                    manpowerDeliveryRate: 100.0,
                    clarificationFidelityScore: 98.0,
                    gpsAccuracyRate: 100.0,
                    procurementRecommendation: '최우수 도급 파트너사: 정시 출근율 99.4% 및 무결격 공수 100% 완수, 차기년도 우선 계약 권고',
                    highlight: '월간 지각 0건, 전 인원 08:50 이전 출근 타각 완료로 최우수 근태 건전성 기록'
                  },
                  {
                    rank: 2,
                    companyName: '현대IT솔루션',
                    grade: 'A',
                    complianceIndex: 95.2,
                    onTimeRate: 97.8,
                    manpowerDeliveryRate: 98.5,
                    clarificationFidelityScore: 94.0,
                    gpsAccuracyRate: 99.5,
                    procurementRecommendation: '우수 도급 파트너사: 약정 공수 안정적 투입 중, 우수 파트너 등급 유지',
                    highlight: 'GPS 정상 권역 타각율 99.5% 달성, 소명 승인 처리 신속도 양호'
                  },
                  {
                    rank: 3,
                    companyName: '(주)유브갓',
                    grade: 'B',
                    complianceIndex: 90.4,
                    onTimeRate: 94.0,
                    manpowerDeliveryRate: 96.8,
                    clarificationFidelityScore: 88.0,
                    gpsAccuracyRate: 98.0,
                    procurementRecommendation: '양호 도급 파트너사: 상담 공정 인력 휴가 분산 및 월요일 아슬아슬 타각 개선 지도 권고',
                    highlight: '08:59 마감 타각 비율(8.2%) 다소 발생, 현장대리인 근태 가이드 필요'
                  },
                  {
                    rank: 4,
                    companyName: '부뜰정보통신',
                    grade: 'B-',
                    complianceIndex: 86.1,
                    onTimeRate: 89.5,
                    manpowerDeliveryRate: 92.0,
                    clarificationFidelityScore: 84.0,
                    gpsAccuracyRate: 96.5,
                    procurementRecommendation: '지도 대상 파트너사: 누락 타각 소명서 지연 제출(3건) 개선 및 현장대리인 근태 통제 강화',
                    highlight: '출근 미타각 소명 발생률 5.2%, 정기 근태 교육 실시 권고'
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
                        <strong>근태 제언:</strong> {partner.procurementRecommendation}
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
                onClick={() => openReportPreview('compliance')}
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
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(30, 27, 75, 0.25)'
                }}
              >
                <Eye size={16} />
                <span>🏢 협력사 도급 근태 종합 평가 브리핑 리포트 화면 확인 & 출력</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 인쇄/출력 전 화면 데이터 확인(미리보기) 모달 */}
      <AiStatsReportPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        reportType={previewReportType}
        settlementData={settlementData}
        availabilityData={availabilityData}
        complianceData={complianceData}
        selectedPartner={selectedPartner}
        selectedSystem={selectedSystem}
        themeMode={themeMode}
      />
    </div>
  );
};
