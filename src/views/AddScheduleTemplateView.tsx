import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScheduleTemplateItem } from './ScheduleTemplateManageView';

interface AddScheduleTemplateViewProps {
  onBack: () => void;
  onSaveTemplate: (newTmpl: ScheduleTemplateItem) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const AddScheduleTemplateView: React.FC<AddScheduleTemplateViewProps> = ({
  onBack,
  onSaveTemplate,
  themeMode
}) => {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [useScheduleType, setUseScheduleType] = useState(false);

  const handleSave = () => {
    const tmplName = `${startTime.split(':')[0]}~${endTime.split(':')[0]}`;
    const newTmpl: ScheduleTemplateItem = {
      id: `tmpl-${Date.now()}`,
      name: tmplName,
      timeRange: `${startTime} - ${endTime}`,
      scope: '(모든 조직) / 사용자 정의 템플릿',
      color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF',
      isActive: true
    };

    onSaveTemplate(newTmpl);
    alert(`✅ [${tmplName}] (${startTime} - ${endTime}) 템플릿이 성공적으로 저장되었습니다.`);
    onBack();
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 내 템플릿 추가 | 저장) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>내 템플릿 추가</span>
        </div>

        <button
          onClick={handleSave}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: 800,
            color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF',
            cursor: 'pointer'
          }}
        >
          저장
        </button>
      </div>

      {/* 2. 시작시간 & 종료시간 입력 행 (스크린샷 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '8px solid #F8F9FA' }}>
        <div style={formRowStyle}>
          <span style={labelStyle}>시작시간</span>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            style={timeInputStyle}
          />
        </div>

        <div style={formRowStyle}>
          <span style={labelStyle}>종료시간</span>
          <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            style={timeInputStyle}
          />
        </div>
      </div>

      {/* 3. 근무일정 유형 사용 토글 행 (스크린샷 일치) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <span style={labelStyle}>근무일정 유형 사용</span>

        {/* 토글 스위치 */}
        <div
          onClick={() => setUseScheduleType(!useScheduleType)}
          style={{
            width: '48px',
            height: '28px',
            borderRadius: '14px',
            background: useScheduleType ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') : '#E4E8EB',
            padding: '2px',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: '#FFFFFF',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transform: useScheduleType ? 'translateX(20px)' : 'translateX(0px)',
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
          }} />
        </div>
      </div>

      {/* 하단 여백 영역 */}
      <div style={{ flex: 1, background: '#F8F9FA' }} />
    </div>
  );
};

const formRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 18px',
  borderBottom: '1px solid #ECEFF2',
  background: '#FFFFFF'
};

const labelStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#191F28'
};

const timeInputStyle: React.CSSProperties = {
  border: 'none',
  background: 'transparent',
  fontSize: '15px',
  fontWeight: 600,
  color: '#191F28',
  textAlign: 'right',
  outline: 'none',
  cursor: 'pointer'
};
