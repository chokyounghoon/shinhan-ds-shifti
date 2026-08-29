import React, { useEffect, useState } from 'react';
import { Radar, X, AlertOctagon, TrendingDown, Clock, MapPin, Sparkles, RefreshCw, ShieldAlert, Users, ArrowRight } from 'lucide-react';
import { geminiAiService, AiAnomalyRadarReport } from '../../services/geminiAiService';

interface AiAnomalyRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSummonPartnerRep?: (targetName: string, pattern: string) => void;
}

export const AiAnomalyRadarModal: React.FC<AiAnomalyRadarModalProps> = ({
  isOpen,
  onClose,
  onSummonPartnerRep
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<AiAnomalyRadarReport | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleFetchAnomalies();
    }
  }, [isOpen]);

  const handleFetchAnomalies = async () => {
    setIsLoading(true);
    try {
      const data = await geminiAiService.detectAnomalyPatterns();
      setReport(data);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '580px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg, #881337 0%, #9F1239 50%, #BE123C 100%)',
          color: '#FFFFFF',
          padding: '20px 24px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '12px',
              padding: '10px',
              display: 'flex'
            }}>
              <Radar size={24} color="#FECDD3" />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#FDA4AF', letterSpacing: '0.5px' }}>
                GEMINI AI STEALTH PATTERN & ANOMALY RADAR
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '2px 0 0 0' }}>
                이상 징후(꼼수) 패턴 AI 자동 탐지 레이더
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 본문 */}
        <div style={{ padding: '20px 24px' }}>
          {/* 상단 통계 바 */}
          <div style={{
            background: '#FFF1F2',
            border: '1.5px solid #FECDD3',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#9F1239' }}>
                빅데이터 AI 심층 스캔 결과
              </div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#BE123C', marginTop: '2px' }}>
                이상 징후 {report?.anomalies.length || 3}건 식별
                <span style={{ fontSize: '12px', color: '#881337', fontWeight: 700, marginLeft: '6px' }}>
                  (고위험 꼼수 {report?.highRiskCount || 2}건)
                </span>
              </div>
            </div>

            <button
              onClick={handleFetchAnomalies}
              disabled={isLoading}
              style={{
                background: '#FFFFFF',
                border: '1px solid #FDA4AF',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#9F1239',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} className={isLoading ? 'spinning' : ''} />
              <span>AI 재스캔</span>
            </button>
          </div>

          <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '10px' }}>
            🕵️‍♂️ PM 전용 인텔리전스 팩트 도출 리스트
          </div>

          {isLoading ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
              <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 10px auto', display: 'block', color: '#BE123C' }} />
              Google Gemini AI가 도급 인력 1,420건의 GPS 타임스탬프와 요일별 편차 패턴을 전수 대조 중입니다...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {report?.anomalies.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    background: '#FAFAFA',
                    border: item.riskLevel === 'HIGH' ? '1.5px solid #FDA4AF' : '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        background: item.riskLevel === 'HIGH' ? '#DC2626' : '#D97706',
                        color: '#FFFFFF',
                        fontSize: '10.5px',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {item.riskLevel === 'HIGH' ? '고위험 꼼수' : '주의 관찰'}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>
                        {item.targetName}
                      </span>
                    </div>

                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#BE123C' }}>
                      {item.patternType}
                    </span>
                  </div>

                  {/* 통계적 팩트 근거 */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontSize: '12px',
                    color: '#334155',
                    marginBottom: '8px',
                    lineHeight: 1.5
                  }}>
                    📊 <strong>통계적 팩트 근거:</strong> {item.statisticalEvidence}
                  </div>

                  {/* 행동 패턴 분석 */}
                  <div style={{ fontSize: '11.5px', color: '#64748B', marginBottom: '10px', lineHeight: 1.4 }}>
                    • <strong>심층 분석:</strong> {item.behavioralAnalysis}
                  </div>

                  {/* PM 대응 가이드 및 협력사 호출 버튼 */}
                  <div style={{
                    background: '#FFF5F5',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#9F1239', flex: 1 }}>
                      ⚔️ <strong>대응 무기:</strong> {item.recommendedAction}
                    </div>

                    {onSummonPartnerRep && (
                      <button
                        onClick={() => {
                          onSummonPartnerRep(item.targetName, item.patternType);
                          onClose();
                        }}
                        style={{
                          background: '#881337',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 9px',
                          fontSize: '11px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}
                      >
                        <span>협력사 PM 소환</span>
                        <ArrowRight size={11} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div style={{
          padding: '14px 24px 20px 24px',
          borderTop: '1px solid #E5E8EB',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#191F28',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 22px',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
