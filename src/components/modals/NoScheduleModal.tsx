import React from 'react';

interface NoScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSchedule: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const NoScheduleModal: React.FC<NoScheduleModalProps> = ({
  isOpen,
  onClose,
  onRequestSchedule,
  themeMode
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        zIndex: 1000
      }}
    >
      <div 
        style={{
          width: '88%',
          maxWidth: '340px',
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '24px 22px 18px 22px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          animation: 'popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 1. 모달 타이틀 (스크린샷 일치) */}
        <div style={{
          fontSize: '17px',
          fontWeight: 800,
          color: '#191F28',
          marginBottom: '12px',
          letterSpacing: '-0.3px'
        }}>
          출근 가능한 근무일정 없음
        </div>

        {/* 2. 본문 안내 텍스트 (스크린샷 일치) */}
        <div style={{
          fontSize: '14px',
          color: '#4E5968',
          lineHeight: '1.5',
          marginBottom: '24px'
        }}>
          <p style={{ margin: 0 }}>출근 가능한 일정이 없습니다. (180분 이내).</p>
          <p style={{ margin: '14px 0 0 0', color: '#6B7684', fontSize: '13.5px' }}>
            * 일정이 없다면, 근무일정 생성을 요청하세요.
          </p>
        </div>

        {/* 3. 하단 액션 버튼 (취소 / 근무일정 생성 요청) */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '18px'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            취소
          </button>

          <button
            onClick={() => {
              onClose();
              onRequestSchedule();
            }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            근무일정 생성 요청
          </button>
        </div>
      </div>
    </div>
  );
};
