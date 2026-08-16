import React from 'react';
import { ShieldCheck, Briefcase, Building } from 'lucide-react';
import { User } from '../types';

interface RoleSwitcherBarProps {
  currentUser: User;
  onSwitchUser: (roleKey: 'PARTNER' | 'DS_PM') => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentUser,
  onSwitchUser,
  themeMode
}) => {
  const isDsPm = currentUser.role === 'DS_PRINCIPAL_PM' || currentUser.role === 'PRINCIPAL_INSPECTOR';

  return (
    <div style={{
      background: '#191F28',
      color: '#FFFFFF',
      padding: '8px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#00E5FF' }}>
          <ShieldCheck size={14} />
          <span>도급 인력 투입 및 공정 검수 모드</span>
        </div>
        <span style={{ fontSize: '10px', color: '#8B95A1' }}>
          권한 시뮬레이션
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {/* 1. 협력사 */}
        <button
          type="button"
          onClick={() => onSwitchUser('PARTNER')}
          style={{
            padding: '8px 6px',
            borderRadius: '8px',
            background: !isDsPm ? '#0066FF' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '12.5px',
            fontWeight: !isDsPm ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            border: !isDsPm ? '1px solid #00E5FF' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <Briefcase size={14} color={!isDsPm ? '#00E5FF' : '#90A4AE'} />
          <span>협력사</span>
        </button>

        {/* 2. DS현장대리인 */}
        <button
          type="button"
          onClick={() => onSwitchUser('DS_PM')}
          style={{
            padding: '8px 6px',
            borderRadius: '8px',
            background: isDsPm ? '#0066FF' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '12.5px',
            fontWeight: isDsPm ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            border: isDsPm ? '1px solid #00E5FF' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <Building size={14} color={isDsPm ? '#00E5FF' : '#90A4AE'} />
          <span>DS현장대리인</span>
        </button>
      </div>
    </div>
  );
};
