import React from 'react';

interface RequestActionSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionType: string) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const RequestActionSheetModal: React.FC<RequestActionSheetModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  themeMode
}) => {
  if (!isOpen) return null;

  const actionItems = [
    { id: 'create_schedule', label: '근무일정 생성' },
    { id: 'edit_schedule', label: '근무일정 수정' },
    { id: 'delete_schedule', label: '근무일정 삭제' },
    { id: 'delete_punch', label: '출퇴근기록 삭제' },
    { id: 'create_vacation', label: '휴가 생성' },
    { id: 'edit_vacation', label: '휴가 수정' },
    { id: 'delete_vacation', label: '휴가 삭제' },
    { id: 'settings', label: '설정...' },
    { id: 'cancel', label: '취소' },
  ];

  const handleClick = (id: string, label: string) => {
    if (id === 'cancel') {
      onClose();
      return;
    }

    if (id === 'settings') {
      alert('⚙️ 요청 단축키 맞춤 설정 화면입니다.');
      onClose();
      return;
    }

    onSelectAction(label);
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        alignItems: 'flex-end',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.45)',
        zIndex: 999
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '430px',
          background: '#FFFFFF',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          padding: '24px 24px 32px 24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -8px 30px rgba(0, 0, 0, 0.15)',
          animation: 'slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 상단 안내 문구 (스크린샷 일치) */}
        <div style={{
          fontSize: '14.5px',
          fontWeight: 600,
          color: '#4E5968',
          marginBottom: '16px',
          letterSpacing: '-0.3px'
        }}>
          아래 '설정'을 클릭해 요청 단축키를 맞춤 설정해보세요.
        </div>

        {/* 액션 항목 리스트 (스크린샷 일치) */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {actionItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleClick(item.id, item.label)}
              style={{
                padding: '14px 0',
                fontSize: '16px',
                fontWeight: item.id === 'cancel' ? 700 : 600,
                color: item.id === 'cancel' ? '#4E5968' : '#191F28',
                textAlign: 'left',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.15s ease'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
