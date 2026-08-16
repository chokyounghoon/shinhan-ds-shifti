import React from 'react';
import { X, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { WeeklyWorkStat } from '../../types';

interface DetailStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: WeeklyWorkStat;
  themeMode: 'ddangyo' | 'shinhan';
}

export const DetailStatusModal: React.FC<DetailStatusModalProps> = ({
  isOpen,
  onClose,
  stats,
  themeMode
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>근무 상황 상세 내역</h3>
            <p style={{ fontSize: '12px', color: '#6B7684' }}>근로기준법 제53조 주 52시간제 준수 현황</p>
          </div>
          <button onClick={onClose} style={{ color: '#8B95A1' }}>
            <X size={22} />
          </button>
        </div>

        {/* 주 52시간 게이지 */}
        <div style={{
          background: '#F8F9FA',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #ECEFF2',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#191F28' }}>주간 총 누적 근로시간</span>
            <span style={{ fontSize: '15px', fontWeight: 800, color: themeMode === 'ddangyo' ? '#FF462D' : '#0046FF' }}>
              40시간 / 52시간
            </span>
          </div>

          <div style={{ height: '10px', background: '#E5E8EB', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{
              width: '76.9%',
              height: '100%',
              background: themeMode === 'ddangyo' ? 'linear-gradient(90deg, #FF5538, #FF381E)' : '#0046FF'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8B95A1' }}>
            <span>소정 근로 40시간 (휴가 반영)</span>
            <span>법정 한도 52시간 (잔여 12시간)</span>
          </div>
        </div>

        {/* 세부 항목 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
          <div style={detailRowStyle}>
            <span style={{ color: '#4E5968' }}>기본 소정근로 시간</span>
            <strong style={{ color: '#191F28' }}>40시간 00분</strong>
          </div>
          <div style={detailRowStyle}>
            <span style={{ color: '#4E5968' }}>연장 근로 시간</span>
            <strong style={{ color: '#191F28' }}>0시간 00분</strong>
          </div>
          <div style={detailRowStyle}>
            <span style={{ color: '#4E5968' }}>야간 근로 (22:00 ~ 06:00)</span>
            <strong style={{ color: '#191F28' }}>0시간 00분</strong>
          </div>
          <div style={detailRowStyle}>
            <span style={{ color: '#4E5968' }}>휴일 근로</span>
            <strong style={{ color: '#191F28' }}>0시간 00분</strong>
          </div>
          <div style={{ ...detailRowStyle, background: '#EDF3FF', border: '1px solid #D5E5FF' }}>
            <span style={{ color: '#0046FF', fontWeight: 700 }}>휴가 인정 시간 (5일)</span>
            <strong style={{ color: '#0046FF' }}>40시간 인정</strong>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            height: '46px',
            background: '#191F28',
            color: '#FFFFFF',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700
          }}
        >
          확인
        </button>
      </div>
    </div>
  );
};

const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 14px',
  borderRadius: '8px',
  background: '#F8F9FA',
  fontSize: '13px'
};
