import React, { useState } from 'react';
import { ShieldAlert, Send, X, AlertTriangle, Clock, Building2, User } from 'lucide-react';

interface DsDemandClarificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetWorker?: {
    name: string;
    id?: string;
    company: string;
    date: string;
    varianceMinutes?: number;
    clockIn?: string;
  };
  onSuccess?: () => void;
}

export const DsDemandClarificationModal: React.FC<DsDemandClarificationModalProps> = ({
  isOpen,
  onClose,
  targetWorker,
  onSuccess
}) => {
  const [demandMemo, setDemandMemo] = useState(
    '계약 약정 투입 시간(09:00) 대비 공정 투입 지연이 확인되어, 도급 계약 제14조에 의거 협력사 차원의 사실관계 확인 및 소명서를 요청합니다.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetWorker) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/clarification-requests/ds-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: targetWorker.id || 'UB0008',
          employee_name: targetWorker.name,
          company_name: targetWorker.company,
          incident_type: 'LATE',
          incident_date: targetWorker.date || '2026-08-30',
          scheduled_time: '09:00',
          actual_time: targetWorker.clockIn || '09:15',
          delay_minutes: targetWorker.varianceMinutes || 15,
          demand_memo: demandMemo,
          requester_name: '조경훈 수석PM (신한DS)'
        })
      });

      if (res.ok) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('clarification_updated'));
          window.dispatchEvent(new CustomEvent('notification_updated'));
        }
        alert(`[소명 요구서 발송 완료]\n\n${targetWorker.company} 협력사 현장관리인 앞으로 공식 소명 요구 공문이 전송되었습니다.\n(근로자 직접 지시 배제 원칙 준수)`);
        onSuccess?.();
        onClose();
      } else {
        alert('소명 요구서 발송 중 오류가 발생했습니다.');
      }
    } catch (err) {
      alert('서버 통신 실패');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '460px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid #CBD5E1'
      }}>
        {/* 헤더 */}
        <div style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          padding: '18px 20px',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={20} color="#F59E0B" />
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>협력사 앞 SLA 소명 요구서 발송</div>
              <div style={{ fontSize: '11px', color: '#94A3B8' }}>원청 ➔ 협력사 관리인 공식 채널 (독립 도급 준수)</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 법적 컴플라이언스 배너 */}
          <div style={{
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: '10px',
            padding: '10px 12px',
            fontSize: '11.5px',
            color: '#92400E',
            lineHeight: 1.5
          }}>
            🛡️ <strong>적법 도급 원칙 (직접 지시 배제)</strong><br />
            원청 현장대리인은 협력사 근로자 개인에게 직접 지시할 수 없으며, 반드시 <strong>협력사 현장관리인 귀하</strong>로 소명 요구를 발송합니다.
          </div>

          {/* 대상 정보 요약 카드 */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '12.5px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>수신처:</span>
              <strong style={{ color: '#0F172A' }}>[{targetWorker.company}] 현장관리인 귀하</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>대상 인력:</span>
              <strong style={{ color: '#0046FF' }}>{targetWorker.name} ({targetWorker.company})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>편차 일시:</span>
              <span>{targetWorker.date} (지연 +{targetWorker.varianceMinutes || 15}분)</span>
            </div>
          </div>

          {/* 소명 요구 사유 입력 */}
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
              공문 내용 및 소명 요구 사유:
            </label>
            <textarea
              value={demandMemo}
              onChange={(e) => setDemandMemo(e.target.value)}
              rows={3}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '12.5px',
                lineHeight: 1.5,
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 버튼 액션 */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                height: '42px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 2,
                height: '42px',
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 800,
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)'
              }}
            >
              <Send size={15} />
              <span>{isSubmitting ? '발송 중...' : '협력사 앞 소명 요구 발송'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
