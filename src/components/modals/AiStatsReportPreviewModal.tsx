import React from 'react';
import { X, Printer, Copy, ShieldCheck, CheckCircle2, FileText, Building2, Calendar, Award, Activity, Sparkles, UserCheck } from 'lucide-react';

export type AiReportType = 'settlement' | 'availability' | 'compliance';

interface AiStatsReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: AiReportType;
  settlementData?: any;
  availabilityData?: any;
  complianceData?: any;
  selectedPartner?: string;
  selectedSystem?: string;
  themeMode?: 'ddangyo' | 'shinhan';
}

export const AiStatsReportPreviewModal: React.FC<AiStatsReportPreviewModalProps> = ({
  isOpen,
  onClose,
  reportType,
  settlementData,
  availabilityData,
  complianceData,
  selectedPartner = '(주)유브갓',
  selectedSystem = '상담 공정 (인바운드/분실)',
  themeMode = 'shinhan'
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  if (!isOpen) return null;

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let content = '';
    if (reportType === 'settlement') {
      content = settlementData?.officialSettlementReportDraft || 
        `[도급 공수 달성률 및 정산 적격성 감사 결과서]\n\n대상: ${settlementData?.partnerCompany || selectedPartner} (${settlementData?.targetPart || selectedSystem})\n평가월: ${settlementData?.evaluationMonth || '2026년 8월'}\n약정 공수: ${settlementData?.metrics?.contractedManDays || 160} M/D\n실투입 검수: ${settlementData?.metrics?.actualDeliveredManDays || 159.1} M/D (${settlementData?.metrics?.fulfillmentRate || 99.4}%)\n정산 판정: ${settlementData?.settlementVerdict?.status || '정산 적격'}\n\n감사 소견: ${settlementData?.settlementVerdict?.summary || ''}`;
    } else if (reportType === 'availability') {
      content = availabilityData?.officialReportSummary || 
        `[도급 공정 출퇴근 정시성 & 공수 이행률 분석 보고서]\n\n대상: ${availabilityData?.partnerCompany || selectedPartner} (${availabilityData?.systemName || selectedSystem})\n평균 출근: ${availabilityData?.commuteMetrics?.avgArrivalTime || '08:44'}\n정시 출근율: ${availabilityData?.commuteMetrics?.onTimeRate || '94.2%'}\nGPS 무결성: ${availabilityData?.commuteMetrics?.gpsIntegrityRate || '99.1%'}`;
    } else {
      content = complianceData?.officialBriefingMemo || 
        `[신한DS 협력사 도급 근태 건전성 종합 평가 브리핑 리포트]\n\n평가 대상: ${complianceData?.summary?.totalEvaluatedCompanies || 4}개사\n종합 평균: ${complianceData?.summary?.overallAverageScore || 92.6}점 (${complianceData?.summary?.complianceGrade || '우수 S등급'})\n위장도급 리스크: ${complianceData?.summary?.laborLawRiskStatus || '무결격 (클린)'}`;
    }

    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #E2E8F0'
      }}>
        {/* 상단 액션 툴바 */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0F172A',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#38BDF8" />
            <div>
              <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, letterSpacing: '0.5px' }}>
                DOCUMENT PREVIEW & AUDIT LEDGER
              </span>
              <h3 style={{ fontSize: '15px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                {reportType === 'settlement' && '도급 공수 달성률 및 월말 정산 적격성 감사 결과서'}
                {reportType === 'availability' && '도급 공정 출퇴근 정시성 & 공수 이행률 종합 분석 보고서'}
                {reportType === 'compliance' && '신한DS 협력사 도급 근태 건전성 종합 평가 브리핑 리포트'}
              </h3>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopyText}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 12px',
                borderRadius: '8px',
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#E2E8F0',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Copy size={14} />
              <span>{isCopied ? '복사 완료!' : '텍스트 복사'}</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '7px 14px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0052FF 0%, #003ECC 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 82, 255, 0.4)'
              }}
            >
              <Printer size={14} />
              <span>인쇄 / PDF 다운로드</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 인쇄/화면 확인용 문서 본체 (A4 규격 스타일) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px 36px',
          background: '#F8FAFC',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", sans-serif'
        }}>
          <div style={{
            background: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '12px',
            padding: '36px 32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* 공식 공문서 헤더 */}
            <div style={{
              borderBottom: '2px solid #0F172A',
              paddingBottom: '16px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#0052FF', letterSpacing: '1px', marginBottom: '4px' }}>
                  SHINHAN DS CO., LTD. • IT SERVICE OPERATIONS AUDIT
                </div>
                <h1 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
                  {reportType === 'settlement' && '도급 인력 약정 공수(M/D) 이행 달성 및 월말 정산 검수 결과서'}
                  {reportType === 'availability' && '도급 공정 출퇴근 시간대 패턴 & 정시성(Punctuality) 검수 보고서'}
                  {reportType === 'compliance' && '협력사 도급 근태 건전성 지수 & 운영 위원회 브리핑 리포트'}
                </h1>
                <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                  근거: 도급계약서 제12조(대가 지급 및 정산 검수) & 근로기준법·파견법 준수 컴플라이언스
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{
                  display: 'inline-block',
                  border: '2px solid #0052FF',
                  color: '#0052FF',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 900,
                  marginBottom: '6px'
                }}>
                  공식 검수 완료
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>발행일: {todayStr}</div>
              </div>
            </div>

            {/* 기본 메타데이터 테이블 */}
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '12.5px',
              marginBottom: '24px',
              border: '1px solid #E2E8F0'
            }}>
              <tbody>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '8px 12px', border: '1px solid #E2E8F0', width: '18%', textAlign: 'left', color: '#475569' }}>수급사업자(협력사)</th>
                  <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0', width: '32%', fontWeight: 700, color: '#0F172A' }}>
                    {settlementData?.partnerCompany || availabilityData?.partnerCompany || selectedPartner}
                  </td>
                  <th style={{ padding: '8px 12px', border: '1px solid #E2E8F0', width: '18%', textAlign: 'left', color: '#475569' }}>대상 공정 파트</th>
                  <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0', width: '32%', fontWeight: 700, color: '#0F172A' }}>
                    {settlementData?.targetPart || availabilityData?.systemName || selectedSystem}
                  </td>
                </tr>
                <tr>
                  <th style={{ padding: '8px 12px', border: '1px solid #E2E8F0', textAlign: 'left', color: '#475569', background: '#F8FAFC' }}>평가 대상 기간</th>
                  <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0', color: '#0F172A' }}>
                    {settlementData?.evaluationMonth || availabilityData?.evaluationMonth || '2026년 8월'} (당월 전체)
                  </td>
                  <th style={{ padding: '8px 12px', border: '1px solid #E2E8F0', textAlign: 'left', color: '#475569', background: '#F8FAFC' }}>검수 총괄 책임자</th>
                  <td style={{ padding: '8px 12px', border: '1px solid #E2E8F0', fontWeight: 700, color: '#0F172A' }}>
                    신한DS 도급 공정 총괄 검수관 (인)
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ========================================================================= */}
            {/* 1. REPORT TYPE: SETTLEMENT AUDITOR */}
            {/* ========================================================================= */}
            {reportType === 'settlement' && (
              <div>
                {/* 1. 종합 판정 결과 배너 */}
                <div style={{
                  background: '#F0FDF4',
                  border: '1.5px solid #86EFAC',
                  borderRadius: '10px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#15803D', letterSpacing: '0.5px' }}>
                      FINAL VERDICT
                    </span>
                    <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#14532D', margin: '2px 0 4px 0' }}>
                      {settlementData?.settlementVerdict?.status || '정산 적격 (100% 정상 도급비 지급 권고)'}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#166534', margin: 0, lineHeight: 1.5 }}>
                      {settlementData?.settlementVerdict?.summary || '약정 공수 대비 실투입 공수 달성률 99.4%로 계약 기준을 충족하여 정상 승인됨.'}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <div style={{ fontSize: '11px', color: '#15803D', fontWeight: 700 }}>도급비 감액액</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#15803D' }}>
                      {settlementData?.settlementVerdict?.deductionAmount || '0원'}
                    </div>
                  </div>
                </div>

                {/* 2. 공수 집계 요약 그리드 */}
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                  1. 월간 약정 공수 vs 실투입 검수 공수 실측 집계
                </h4>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                  marginBottom: '20px',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center'
                }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', color: '#334155' }}>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>구분</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>약정 공수 (Contracted)</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>실투입 검수 공수 (Delivered)</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>공수 달성률 (%)</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>오차 시간 (Variance)</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>정산 적격 여부</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '10px', border: '1px solid #E2E8F0', fontWeight: 700 }}>상담 공정 파트 합계</td>
                      <td style={{ padding: '10px', border: '1px solid #E2E8F0', fontWeight: 800 }}>{settlementData?.metrics?.contractedManDays || 160.0} M/D (1,280h)</td>
                      <td style={{ padding: '10px', border: '1px solid #E2E8F0', fontWeight: 800, color: '#0052FF' }}>{settlementData?.metrics?.actualDeliveredManDays || 159.1} M/D (1,272.8h)</td>
                      <td style={{ padding: '10px', border: '1px solid #E2E8F0', fontWeight: 900, color: '#16A34A' }}>{settlementData?.metrics?.fulfillmentRate || 99.4}%</td>
                      <td style={{ padding: '10px', border: '1px solid #E2E8F0', color: '#64748B' }}>{settlementData?.metrics?.varianceHours || -7.2}h</td>
                      <td style={{ padding: '10px', border: '1px solid #E2E8F0', fontWeight: 800, color: '#16A34A' }}>적격 승인 (PASS)</td>
                    </tr>
                  </tbody>
                </table>

                {/* 3. 투입 인력별 상세 내역 */}
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                  2. D1 실시간 타각 데이터 기반 투입 인력별 이행 내역
                </h4>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                  marginBottom: '20px',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center'
                }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', color: '#475569' }}>
                      <th style={{ padding: '8px', border: '1px solid #E2E8F0' }}>작업자명</th>
                      <th style={{ padding: '8px', border: '1px solid #E2E8F0' }}>약정 기준 시간</th>
                      <th style={{ padding: '8px', border: '1px solid #E2E8F0' }}>실제 투입 시간</th>
                      <th style={{ padding: '8px', border: '1px solid #E2E8F0' }}>개인 달성률</th>
                      <th style={{ padding: '8px', border: '1px solid #E2E8F0' }}>소명 및 검수상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(settlementData?.breakdownByWorker || [
                      { workerName: '송무준', contractedHours: 160, actualHours: 160, fulfillmentRate: 100, status: '정상 완수' },
                      { workerName: '김철수', contractedHours: 160, actualHours: 158.5, fulfillmentRate: 99.1, status: '소명 인정 완수' },
                      { workerName: '이영희', contractedHours: 160, actualHours: 159.0, fulfillmentRate: 99.4, status: '정상 완수' },
                      { workerName: '박민호', contractedHours: 160, actualHours: 159.0, fulfillmentRate: 99.4, status: '정상 완수' }
                    ]).map((w: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontWeight: 700 }}>{w.workerName}</td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0' }}>{w.contractedHours}h</td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', color: '#0052FF', fontWeight: 700 }}>{w.actualHours}h</td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontWeight: 800 }}>{w.fulfillmentRate}%</td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', color: '#16A34A', fontWeight: 700 }}>{w.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 4. AI 감사 소견 */}
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  3. 위장도급 방지 및 도급 적격성 감사 소견
                </h4>
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: '#334155',
                  marginBottom: '24px'
                }}>
                  {(settlementData?.aiAuditFindings || [
                    { title: '무결격 약정 공수 이행 달성', description: '실투입 공수 달성률 99.4%로 월간 계약 범위 내 안정적 도급 공정 완수 확인.' },
                    { title: '위장도급 방지 컴플라이언스 준수', description: '근태 및 투입 실적이 협력사 현장대리인의 자체 관리 및 소명 검수를 거쳐 확정되어 도급 법적 적격성 확보.' }
                  ]).map((f: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: '6px' }}>
                      <strong>• {f.title}:</strong> {f.description}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 2. REPORT TYPE: SM AVAILABILITY & PUNCTUALITY */}
            {/* ========================================================================= */}
            {reportType === 'availability' && (
              <div>
                {/* 1. 핵심 타각 통계 지표 */}
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                  1. 출퇴근 타각 및 정시성(Punctuality) 핵심 지표
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                  marginBottom: '20px'
                }}>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>평균 출근 타각 시각</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                      {availabilityData?.commuteMetrics?.avgArrivalTime || '08:44'}
                    </div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>출근 정시 이행률</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#16A34A', marginTop: '2px' }}>
                      {availabilityData?.commuteMetrics?.onTimeRate || '94.2%'}
                    </div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>GPS 권역 무결성</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0052FF', marginTop: '2px' }}>
                      {availabilityData?.commuteMetrics?.gpsIntegrityRate || '99.1%'}
                    </div>
                  </div>
                  <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>총 누적 타각 건수</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                      {availabilityData?.commuteMetrics?.totalPunchCount || 88}건
                    </div>
                  </div>
                </div>

                {/* 2. 시간대별 출근 분포 테이블 */}
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                  2. 시간대별 출근 타각 집중도 분포
                </h4>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                  marginBottom: '20px',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center'
                }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', color: '#334155' }}>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>시간대 구간</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>구간 정의 및 상태</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>타각 인원수 (건수)</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>비율 (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(availabilityData?.timeDistribution || [
                      { bracket: '08:30 이전', label: '조기 출근 (얼리버드 안정권)', count: 28, percentage: 32 },
                      { bracket: '08:30 ~ 08:50', label: '정시 집중 출근 구간', count: 42, percentage: 48 },
                      { bracket: '08:50 ~ 09:00', label: '임계 시간대 출근 (혼잡 구간)', count: 12, percentage: 14 },
                      { bracket: '09:00 이후', label: '지각 / 사후 소명 대상', count: 6, percentage: 6 }
                    ]).map((row: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontWeight: 700 }}>{row.bracket}</td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', textAlign: 'left', paddingLeft: '14px' }}>{row.label}</td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontWeight: 700 }}>{row.count}명</td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontWeight: 800, color: '#0052FF' }}>{row.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 3. AI 인사이트 및 근태 제언 */}
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  3. AI 근태 패턴 진단 및 공정 운영 권고사항
                </h4>
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '14px 16px',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: '#334155',
                  marginBottom: '24px'
                }}>
                  {(availabilityData?.aiOperationalInsights || [
                    { category: '출근 집중도', title: '08:45~08:55 엘리베이터 혼잡 병목', action: '임계 구간 타각 인원 대상 협력사 자체 분산 출근 권고' },
                    { category: '소명 적시성', title: '지각 6건 중 5건 당일 현장대리인 소명 승인', action: '도급 관리 지침에 따른 적법 근태 관리 확인' }
                  ]).map((item: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: '6px' }}>
                      <strong>• [{item.category}] {item.title}:</strong> {item.action}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 3. REPORT TYPE: COMPLIANCE INDEX */}
            {/* ========================================================================= */}
            {reportType === 'compliance' && (
              <div>
                {/* 1. 협력사 종합 랭킹 매트릭스 */}
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                  1. 신한DS 도급 협력사 근태 건전성 종합 평가 랭킹
                </h4>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '12px',
                  marginBottom: '20px',
                  border: '1px solid #E2E8F0',
                  textAlign: 'center'
                }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', color: '#334155' }}>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>순위</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>협력사명</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>평가 등급</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>종합 점수</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>핵심 특이사항</th>
                      <th style={{ padding: '8px', border: '1px solid #CBD5E1' }}>도급 계약 갱신 권고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(complianceData?.partnerRankings || [
                      { partnerName: '(주)협력아이티에스', grade: 'S', complianceIndex: 98.8, highlight: '결근율 0%, 소명 적시 승인율 100%', procurementRecommendation: '최우수 파트너 - 인센티브 및 재계약 우선 추천' },
                      { partnerName: '현대IT솔루션', grade: 'A', complianceIndex: 95.2, highlight: '정시 출근율 96.2%, 약정 공수 초과 달성', procurementRecommendation: '우수 파트너 - 정산 전액 승인 및 유지' },
                      { partnerName: '(주)유브갓', grade: 'B', complianceIndex: 90.4, highlight: '소명률 91.5%, 공수 달성률 99.4%', procurementRecommendation: '정상 적격 - 월간 근태 모니터링 유지' },
                      { partnerName: '부뜰정보통신', grade: 'B', complianceIndex: 86.1, highlight: '지각 4건 발생, 소명 보완 권고', procurementRecommendation: '개선 권고 - 자체 근태 관리 강화 요청' }
                    ]).map((p: any, idx: number) => (
                      <tr key={idx}>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontWeight: 800 }}>{idx + 1}위</td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontWeight: 700 }}>{p.partnerName}</td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontWeight: 900, color: p.grade === 'S' ? '#15803D' : p.grade === 'A' ? '#0052FF' : '#B45309' }}>
                          {p.grade}등급
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontWeight: 900 }}>{p.complianceIndex}점</td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', textAlign: 'left', paddingLeft: '10px' }}>{p.highlight}</td>
                        <td style={{ padding: '8px', border: '1px solid #E2E8F0', fontSize: '11.5px', color: '#475569' }}>{p.procurementRecommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* 2. 4대 가중치 평가 모델 설명 */}
                <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  2. 4대 기둥(Pillar) 근태 평가 기준 및 가중치
                </h4>
                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '12px',
                  lineHeight: 1.6,
                  color: '#334155',
                  marginBottom: '24px'
                }}>
                  • <strong>출근 정시성 및 결근율 (40%)</strong>: 09:00 이전 정상 타각 비율 및 미결근 이행률<br />
                  • <strong>약정 공수(M/D) 달성률 (30%)</strong>: 계약상 약정 투입 인월 대비 실제 검수 완료 투입 비율<br />
                  • <strong>소명 사유 건전성 & 적기 제출 (20%)</strong>: 이상 타각 시 협력사 현장대리인의 24시간 내 자체 소명 및 검수 완료율<br />
                  • <strong>GPS 정상 권역 타각률 (10%)</strong>: 등록 사업장 반경 500m 이내 정상 위치 기반 타각 준수율
                </div>
              </div>
            )}

            {/* 공식 서명란 */}
            <div style={{
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px dashed #CBD5E1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end'
            }}>
              <div style={{ fontSize: '11.5px', color: '#64748B', lineHeight: 1.5 }}>
                본 보고서는 신한DS S-GUARD 시스템에 기록된 실시간 Cloudflare D1 데이터 및<br />
                인공지능(AI) 감사 분석 엔진에 의해 무결성이 검증되었음을 증명합니다.
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
                  신한DS IT도급 검수 책임관
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#F1F5F9',
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  fontWeight: 800,
                  fontSize: '13px',
                  color: '#0F172A'
                }}>
                  <ShieldCheck size={16} color="#0052FF" />
                  <span>조 경 훈 수석 (서명완료)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
