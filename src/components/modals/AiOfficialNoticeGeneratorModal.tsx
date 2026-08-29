import React, { useState } from 'react';
import { FileText, X, Sparkles, Copy, Check, Send, Download, Printer, RefreshCw } from 'lucide-react';
import { geminiAiService, AiPenaltyNotice } from '../../services/geminiAiService';

interface AiOfficialNoticeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerCompany?: string;
  complianceRate?: number;
  totalPenaltyAmount?: number;
  onSendNoticeSuccess?: (doc: AiPenaltyNotice) => void;
}

export const AiOfficialNoticeGeneratorModal: React.FC<AiOfficialNoticeGeneratorModalProps> = ({
  isOpen,
  onClose,
  partnerCompany = '유브갓',
  complianceRate = 92.0,
  totalPenaltyAmount = 480000,
  onSendNoticeSuccess
}) => {
  const [company, setCompany] = useState(partnerCompany);
  const [rate, setRate] = useState(complianceRate);
  const [penalty, setPenalty] = useState(totalPenaltyAmount);
  const [month, setMonth] = useState('2026년 8월');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);
  const [noticeData, setNoticeData] = useState<AiPenaltyNotice | null>(null);

  if (!isOpen) return null;

  const handleGenerateNotice = async () => {
    setIsLoading(true);
    try {
      const doc = await geminiAiService.generatePenaltyNotice({
        partnerCompany: company,
        complianceRate: rate,
        totalPenaltyAmount: penalty,
        targetMonth: month
      });
      setNoticeData(doc);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!noticeData) return;
    navigator.clipboard.writeText(`${noticeData.subject}\n\n${noticeData.bodyText}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    if (!noticeData) return;
    setSent(true);
    if (onSendNoticeSuccess) {
      onSendNoticeSuccess(noticeData);
    }
    setTimeout(() => {
      setSent(false);
      onClose();
    }, 1500);
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
        maxWidth: '640px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 모달 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
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
              <FileText size={24} color="#38BDF8" />
            </div>
            <div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>
                GEMINI AI MONTHLY PENALTY DISPATCH
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '2px 0 0 0' }}>
                월말 도급 정산용 '공문(이메일)' 자동 초안 생성
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
          {/* 설정 입력 영역 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>수신 협력사</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>도급 이행률 (%)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>감액 청구액 (원)</label>
              <input
                type="number"
                value={penalty}
                onChange={(e) => setPenalty(parseInt(e.target.value, 10))}
                style={{ width: '100%', padding: '7px 9px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '12.5px' }}
              />
            </div>
          </div>

          <button
            onClick={handleGenerateNotice}
            disabled={isLoading}
            style={{
              width: '100%',
              background: 'linear-gradient(90deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '11px',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              marginBottom: '16px'
            }}
          >
            {isLoading ? (
              <>
                <RefreshCw size={15} className="spinning" />
                <span>Google Gemini AI가 도급 계약서 조항을 인용하여 공문 작성 중...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} color="#BAE6FD" />
                <span>5초 만에 법적 감액 공문/이메일 초안 생성하기</span>
              </>
            )}
          </button>

          {/* 공문 프리뷰 영역 */}
          {noticeData && (
            <div style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{
                  background: '#0F172A',
                  color: '#38BDF8',
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  공문번호: {noticeData.docNumber}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handleCopyText}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copied ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
                    <span>{copied ? '복사완료' : '텍스트 복사'}</span>
                  </button>

                  <button
                    onClick={() => window.print()}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Printer size={12} />
                    <span>인쇄/PDF</span>
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
                {noticeData.subject}
              </div>

              {/* 공문 HTML 렌더링 */}
              <div 
                style={{
                  background: '#FFFFFF',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12.5px',
                  lineHeight: 1.6,
                  color: '#1E293B',
                  maxHeight: '260px',
                  overflowY: 'auto'
                }}
                dangerouslySetInnerHTML={{ __html: noticeData.bodyHtml }}
              />

              <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#64748B' }}>
                • <strong>이의신청 마감 기한:</strong> <span style={{ color: '#DC2626', fontWeight: 800 }}>{noticeData.replyDeadline}</span>
              </div>
            </div>
          )}
        </div>

        {/* 모달 하단 푸터 */}
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

          {noticeData && (
            <button
              onClick={handleSendEmail}
              disabled={sent}
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 22px',
                fontSize: '13.5px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.3)'
              }}
            >
              <Send size={15} color="#38BDF8" />
              <span>{sent ? '✓ 협력사 대표 메일 발송 완료' : '협력사 대표 앞으로 정식 공문 발송'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
