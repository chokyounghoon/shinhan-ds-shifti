import React, { useState } from 'react';
import { Sparkles, X, CheckCircle2, AlertTriangle, Scale, ShieldAlert, FileText, ArrowRight, RefreshCw } from 'lucide-react';
import { geminiAiService, AiClarificationAudit } from '../../services/geminiAiService';

interface AiClarificationAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVerdict?: (verdict: AiClarificationAudit) => void;
  initialReason?: string;
  employeeName?: string;
  companyName?: string;
}

export const AiClarificationAuditModal: React.FC<AiClarificationAuditModalProps> = ({
  isOpen,
  onClose,
  onApplyVerdict,
  initialReason = '출근길 지하철 2호선 고장 및 강남대로 교통 체증으로 45분 늦었습니다.',
  employeeName = '이하은',
  companyName = '유브갓'
}) => {
  const [reasonText, setReasonText] = useState(initialReason);
  const [empName, setEmpName] = useState(employeeName);
  const [compName, setCompName] = useState(companyName);
  const [delayMins, setDelayMins] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<AiClarificationAudit | null>(null);

  if (!isOpen) return null;

  const handleRunAiAudit = async () => {
    setIsLoading(true);
    try {
      const result = await geminiAiService.auditClarificationReason({
        employeeName: empName,
        companyName: compName,
        reasonText,
        delayMinutes: delayMins
      });
      setAuditResult(result);
    } finally {
      setIsLoading(false);
    }
  };

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
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 모달 상단 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
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
              <Sparkles size={24} color="#A5B4FC" />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#C7D2FE', letterSpacing: '0.5px' }}>
                GEMINI AI SLA REASON AUDITOR & TRIAGE
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '2px 0 0 0' }}>
                협력사 소명 사유 AI 자동 필터링 & 판독
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

        {/* 본문 콘텐츠 */}
        <div style={{ padding: '20px 24px' }}>
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#475569',
            lineHeight: 1.5
          }}>
            🤖 <strong>도급 계약 SLA 기반 AI 판정 원칙</strong>: 협력사 직원의 출퇴근 교통체증, 늦잠, 개인사정 등 수탁사 고유 귀책은 <strong>[수용 불가 (공수 차감 대상)]</strong>로 즉시 판독되어 PM님의 검토 피로를 100% 해소합니다.
          </div>

          {/* 입력 필드들 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>소속 협력사</label>
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>대상 직원명</label>
              <input
                type="text"
                value={empName}
                onChange={(e) => setEmpName(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>협력사 입력 소명 사유 원문</label>
              <span style={{ fontSize: '11px', color: '#64748B' }}>결손 시간: {delayMins}분</span>
            </div>
            <textarea
              rows={3}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="협력사 직원이 입력한 소명 사유를 입력하세요..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                lineHeight: 1.5,
                resize: 'none'
              }}
            />
          </div>

          <button
            onClick={handleRunAiAudit}
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #4338CA 0%, #3730A3 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(67, 56, 202, 0.3)',
              marginBottom: '18px'
            }}
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="spinning" />
                <span>Google Gemini AI가 도급 계약서(SLA) 기준으로 판독 중...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} color="#A5B4FC" />
                <span>Gemini AI 소명 판독 실행하기</span>
              </>
            )}
          </button>

          {/* AI 판독 결과 박스 */}
          {auditResult && (
            <div style={{
              background: auditResult.verdict === 'REJECT' ? '#FEF2F2' : auditResult.verdict === 'ACCEPT' ? '#F0FDF4' : '#FFFBEB',
              border: auditResult.verdict === 'REJECT' ? '1.5px solid #FECACA' : auditResult.verdict === 'ACCEPT' ? '1.5px solid #BBF7D0' : '1.5px solid #FDE68A',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {auditResult.verdict === 'REJECT' && <ShieldAlert size={20} color="#DC2626" />}
                  {auditResult.verdict === 'ACCEPT' && <CheckCircle2 size={20} color="#16A34A" />}
                  {auditResult.verdict === 'REVIEW' && <AlertTriangle size={20} color="#D97706" />}
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 900,
                    color: auditResult.verdict === 'REJECT' ? '#DC2626' : auditResult.verdict === 'ACCEPT' ? '#16A34A' : '#D97706'
                  }}>
                    AI 판정 결과: {auditResult.verdictLabel}
                  </span>
                </div>

                {auditResult.penaltyDeductionHours > 0 && (
                  <span style={{
                    background: '#DC2626',
                    color: '#FFFFFF',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    공수 차감 권고: {auditResult.penaltyDeductionHours} M/H
                  </span>
                )}
              </div>

              {/* 판정 요약 */}
              <div style={{
                fontSize: '13.5px',
                fontWeight: 800,
                color: '#1E293B',
                marginBottom: '8px',
                lineHeight: 1.4
              }}>
                "{auditResult.summaryReasoning}"
              </div>

              {/* 법적 근거 */}
              <div style={{ fontSize: '12px', color: '#475569', marginBottom: '10px', lineHeight: 1.5 }}>
                • <strong>도급 법적 근거:</strong> {auditResult.legalBasis}
              </div>

              {/* PM 권고 액션 */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                fontWeight: 800,
                color: '#1E1B4B',
                border: '1px solid rgba(0,0,0,0.06)'
              }}>
                🎯 <strong>PM 조치 권고:</strong> {auditResult.recommendedAction}
              </div>
            </div>
          )}
        </div>

        {/* 하단 푸터 버튼 */}
        <div style={{
          padding: '14px 24px 20px 24px',
          borderTop: '1px solid #E5E8EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              color: '#475569',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            닫기
          </button>

          {auditResult && onApplyVerdict && (
            <button
              onClick={() => {
                onApplyVerdict(auditResult);
                onClose();
              }}
              style={{
                background: auditResult.verdict === 'REJECT' ? '#DC2626' : '#16A34A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{auditResult.verdict === 'REJECT' ? 'AI 권고대로 [차감/반려] 확정' : 'AI 권고대로 [정상 승인] 확정'}</span>
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
