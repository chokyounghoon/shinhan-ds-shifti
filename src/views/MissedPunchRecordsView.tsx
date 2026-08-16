import React, { useState } from 'react';
import { ArrowLeft, Calendar, ChevronDown, CheckCircle2, AlertCircle, FileEdit } from 'lucide-react';

interface MissedPunchRecordsViewProps {
  onBack: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const MissedPunchRecordsView: React.FC<MissedPunchRecordsViewProps> = ({
  onBack,
  themeMode
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [dateRange, setDateRange] = useState('08.14 - 08.23');

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        gap: '14px'
      }}>
        <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>도급 투입 누락/보정 기록</span>
      </div>

      {/* 2. 날짜 선택기 & [미인증 건 / 소명 완료] 탭 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        paddingLeft: '16px'
      }}>
        {/* 날짜 선택기 */}
        <div 
          onClick={() => alert('조회 기간 변경: 2026.08.14 ~ 2026.08.23')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
        >
          <Calendar size={17} color="#333D4B" />
          <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#191F28' }}>{dateRange}</span>
          <ChevronDown size={15} color="#6B7684" />
        </div>

        {/* 탭: 미인증 건 / 소명 완료 건 */}
        <div style={{ display: 'flex', width: '220px' }}>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              flex: 1,
              padding: '14px 0',
              fontSize: '13.5px',
              fontWeight: activeTab === 'pending' ? 800 : 600,
              color: activeTab === 'pending' ? '#0052FF' : '#8B95A1',
              borderBottom: activeTab === 'pending' ? '2.5px solid #0052FF' : 'none',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            투입 미인증 (0)
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            style={{
              flex: 1,
              padding: '14px 0',
              fontSize: '13.5px',
              fontWeight: activeTab === 'completed' ? 800 : 600,
              color: activeTab === 'completed' ? '#0052FF' : '#8B95A1',
              borderBottom: activeTab === 'completed' ? '2.5px solid #0052FF' : 'none',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer'
            }}
          >
            소명 완료 (0)
          </button>
        </div>
      </div>

      {/* 3. 본문 영역 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        color: '#8B95A1',
        textAlign: 'center'
      }}>
        <CheckCircle2 size={48} color="#0052FF" style={{ opacity: 0.8, marginBottom: '12px' }} />
        <div style={{ fontSize: '16px', fontWeight: 800, color: '#191F28', marginBottom: '6px' }}>
          누락된 도급 투입 실적이 없습니다
        </div>
        <p style={{ fontSize: '13px', color: '#6B7684', lineHeight: 1.5, margin: 0, maxWidth: '280px' }}>
          해당 기간 내 모든 지정 공정에 1 M/D 투입 인증이 정상 완료되었습니다.
        </p>
      </div>

      {/* 4. 법적 안내 배너 */}
      <div style={{
        margin: '16px',
        padding: '12px 14px',
        background: '#F0FDF4',
        border: '1px solid #BBF7D0',
        borderRadius: '10px',
        fontSize: '11.5px',
        color: '#166534',
        lineHeight: 1.45
      }}>
        ※ 도급 계약 원칙에 따라 <strong>일일 출근(투입) 1회 인증</strong>만 집계되며, 퇴근 시간은 기록 및 검수 대상이 아닙니다.
      </div>
    </div>
  );
};
