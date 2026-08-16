import React, { useState } from 'react';
import { ArrowLeft, Calendar, ChevronDown } from 'lucide-react';

interface MissedPunchRecordsViewProps {
  onBack: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const MissedPunchRecordsView: React.FC<MissedPunchRecordsViewProps> = ({
  onBack,
  themeMode
}) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'checkout'>('checkin');
  const [dateRange, setDateRange] = useState('08.14 - 08.23');

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 출근/퇴근 누락 기록) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        gap: '14px'
      }}>
        <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>출근/퇴근 누락 기록</span>
      </div>

      {/* 2. 날짜 선택기 & [출근 누락 / 퇴근 누락] 탭 (스크린샷 일치) */}
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

        {/* 출근 누락 / 퇴근 누락 탭 */}
        <div style={{ display: 'flex', width: '200px' }}>
          <button
            onClick={() => setActiveTab('checkin')}
            style={{
              flex: 1,
              padding: '14px 0',
              fontSize: '14px',
              fontWeight: activeTab === 'checkin' ? 800 : 600,
              color: activeTab === 'checkin' ? '#191F28' : '#8B95A1',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <span>출근 누락</span>
            {activeTab === 'checkin' && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '15%',
                right: '15%',
                height: '2.5px',
                background: '#191F28'
              }} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('checkout')}
            style={{
              flex: 1,
              padding: '14px 0',
              fontSize: '14px',
              fontWeight: activeTab === 'checkout' ? 800 : 600,
              color: activeTab === 'checkout' ? '#191F28' : '#8B95A1',
              textAlign: 'center',
              position: 'relative'
            }}
          >
            <span>퇴근 누락</span>
            {activeTab === 'checkout' && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: '15%',
                right: '15%',
                height: '2.5px',
                background: '#191F28'
              }} />
            )}
          </button>
        </div>
      </div>

      {/* 3. 중앙 빈 상태 일러스트 & 텍스트 (스크린샷 100% 일치) */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: '120px'
      }}>
        {/* 시계 & 체크 배지 그래픽 */}
        <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '20px' }}>
          {/* 구름/배경 블러 */}
          <div style={{
            position: 'absolute',
            inset: '10px',
            background: '#EEF2F6',
            borderRadius: '50%',
            filter: 'blur(8px)',
            opacity: 0.8
          }} />

          {/* 시계 원형 바디 */}
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '26px',
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            background: '#D9E0EA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* 시계 바늘 (L자) */}
            <div style={{
              width: '26px',
              height: '26px',
              borderLeft: '4.5px solid #FFFFFF',
              borderBottom: '4.5px solid #FFFFFF',
              borderRadius: '2px',
              transform: 'translate(4px, -4px)'
            }} />
          </div>

          {/* 좌측 체크 배지 */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '20px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: '#758092',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* 반짝이 별 */}
          <div style={{ position: 'absolute', top: '24px', left: '16px', color: '#B0B8C1', fontSize: '11px' }}>✦</div>
          <div style={{ position: 'absolute', bottom: '38px', left: '8px', color: '#B0B8C1', fontSize: '8px' }}>✦</div>
        </div>

        {/* 결근 기록이 없습니다 텍스트 */}
        <div style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#333D4B',
          letterSpacing: '-0.3px'
        }}>
          결근 기록이 없습니다.
        </div>
      </div>
    </div>
  );
};
