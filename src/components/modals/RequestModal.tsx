import React, { useState } from 'react';
import { X, Send, Calendar, Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { dbService } from '../../services/db';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  onRequestSubmitted,
  themeMode
}) => {
  const [requestType, setRequestType] = useState<'VACATION' | 'OVERTIME' | 'MISSED_PUNCH' | 'BUSINESS_TRIP'>('VACATION');
  const [targetDate, setTargetDate] = useState('2026-08-17');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('신청 사유를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      dbService.addRequest({
        requestType,
        targetDate,
        startTime: requestType === 'OVERTIME' ? startTime : undefined,
        endTime: requestType === 'OVERTIME' ? endTime : undefined,
        reason
      });

      setIsSubmitting(false);
      onRequestSubmitted();
      onClose();
    }, 400);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>근태 신청서 (협력사 전결)</h3>
            <p style={{ fontSize: '12px', color: '#6B7684' }}>소속사 현장대리인 결재선 자동 지정</p>
          </div>
          <button onClick={onClose} style={{ color: '#8B95A1' }}>
            <X size={22} />
          </button>
        </div>

        {/* 법적 컴플라이언스 보호 배너 */}
        <div style={{
          background: '#E8F8F0',
          border: '1px solid #B7EB8F',
          borderRadius: '8px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
          <ShieldCheck size={18} color="#52C41A" />
          <div style={{ fontSize: '11.5px', color: '#135200', lineHeight: 1.3 }}>
            <strong>결재권자: 김협력 PM (소속 협력사 현장대리인)</strong><br />
            원청(신한DS)은 결재선에 포함되지 않으며, 소속사의 독자적인 인사권으로 처리됩니다.
          </div>
        </div>

        {/* 요청 타입 탭 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '18px' }}>
          {[
            { key: 'VACATION', label: '휴가신청' },
            { key: 'OVERTIME', label: '연장근무' },
            { key: 'MISSED_PUNCH', label: '누락소명' },
            { key: 'BUSINESS_TRIP', label: '외근/출장' }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setRequestType(tab.key as any)}
              style={{
                padding: '10px 4px',
                borderRadius: '8px',
                fontSize: '12.5px',
                fontWeight: 700,
                background: requestType === tab.key ? (themeMode === 'ddangyo' ? '#FFF0ED' : '#EDF3FF') : '#F8F9FA',
                color: requestType === tab.key ? (themeMode === 'ddangyo' ? '#FF462D' : '#0046FF') : '#6B7684',
                border: requestType === tab.key ? `1.5px solid ${themeMode === 'ddangyo' ? '#FF462D' : '#0046FF'}` : '1px solid #E5E8EB'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#4E5968', display: 'block', marginBottom: '6px' }}>
              대상 일자
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              style={inputStyle}
            />
          </div>

          {requestType === 'OVERTIME' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#4E5968', display: 'block', marginBottom: '6px' }}>
                  시작 시간
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#4E5968', display: 'block', marginBottom: '6px' }}>
                  종료 시간
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#4E5968', display: 'block', marginBottom: '6px' }}>
              신청 사유 및 상세 업무
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="상세 사유를 구체적으로 작성해주세요."
              style={{ ...inputStyle, height: 'auto', resize: 'none' }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              height: '48px',
              background: themeMode === 'ddangyo' ? 'linear-gradient(135deg, #FF5538 0%, #FF381E 100%)' : '#0046FF',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '8px',
              boxShadow: '0 4px 12px rgba(255, 70, 45, 0.25)'
            }}
          >
            <Send size={18} />
            <span>{isSubmitting ? '현장대리인에게 상신 중...' : '협력사 현장대리인에게 상신'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #D0D5DD',
  fontSize: '14px',
  color: '#191F28',
  outline: 'none',
  background: '#FFFFFF'
};
