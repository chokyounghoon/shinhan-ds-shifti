import React, { useState } from 'react';
import { X, Download, TrendingUp, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { User, WeeklyWorkStat } from '../../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  themeMode: 'ddangyo' | 'shinhan';
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  user,
  themeMode
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026년 08월');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>근태 리포트</h3>
            <p style={{ fontSize: '12px', color: '#6B7684' }}>{user.name} ({user.companyName})</p>
          </div>
          <button onClick={onClose} style={{ color: '#8B95A1' }}>
            <X size={22} />
          </button>
        </div>

        {/* 월 선택 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#F8F9FA',
          padding: '10px 14px',
          borderRadius: '10px',
          marginBottom: '16px'
        }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#191F28' }}>📅 {selectedMonth}</span>
          <span style={{ fontSize: '11px', color: '#00C48C', fontWeight: 700 }}>● 100% 정상 출근/휴가</span>
        </div>

        {/* 핵심 KPI 카드 3종 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
          <div style={statBoxStyle}>
            <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>총 인정근로</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: themeMode === 'ddangyo' ? '#FF462D' : '#0046FF', marginTop: '4px' }}>
              80<span style={{ fontSize: '11px', fontWeight: 500, color: '#4E5968' }}>시간</span>
            </div>
          </div>
          <div style={statBoxStyle}>
            <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>연장근로</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#191F28', marginTop: '4px' }}>
              0<span style={{ fontSize: '11px', fontWeight: 500, color: '#4E5968' }}>시간</span>
            </div>
          </div>
          <div style={statBoxStyle}>
            <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>휴가사용</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#12B76A', marginTop: '4px' }}>
              5<span style={{ fontSize: '11px', fontWeight: 500, color: '#4E5968' }}>일</span>
            </div>
          </div>
        </div>

        {/* 주별 근로시간 그래프 */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #ECEFF2',
          borderRadius: '12px',
          padding: '14px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#191F28', marginBottom: '12px' }}>
            주차별 52시간 준수 현황
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>1주차 (08.01 ~ 08.07)</span>
                <span style={{ fontWeight: 700 }}>40시간 / 52시간</span>
              </div>
              <div style={{ height: '8px', background: '#F1F3F5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '77%', height: '100%', background: themeMode === 'ddangyo' ? '#FF462D' : '#0046FF' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>2주차 (08.10 ~ 08.16) - 이번주</span>
                <span style={{ fontWeight: 700, color: themeMode === 'ddangyo' ? '#FF462D' : '#0046FF' }}>40시간 (휴가 5일 인정)</span>
              </div>
              <div style={{ height: '8px', background: '#F1F3F5', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '77%', height: '100%', background: '#00C48C' }} />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            alert('근태 증빙 리포트(PDF/Excel)가 다운로드되었습니다.');
          }}
          style={{
            width: '100%',
            height: '46px',
            background: '#F8F9FA',
            border: '1px solid #D0D5DD',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 700,
            color: '#191F28',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <Download size={16} />
          <span>월간 근태 증명서 다운로드 (PDF)</span>
        </button>
      </div>
    </div>
  );
};

const statBoxStyle: React.CSSProperties = {
  background: '#F8F9FA',
  padding: '12px 10px',
  borderRadius: '10px',
  border: '1px solid #ECEFF2',
  textAlign: 'center'
};
