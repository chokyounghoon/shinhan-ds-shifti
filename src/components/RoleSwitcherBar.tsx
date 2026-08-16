import React from 'react';
import { ShieldCheck, UserCheck, Briefcase, Building } from 'lucide-react';
import { User } from '../types';

interface RoleSwitcherBarProps {
  currentUser: User;
  onSwitchUser: (userId: string) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentUser,
  onSwitchUser,
  themeMode
}) => {
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
          <span>도급 인력 투입 및 공정 검수 모드 (30인)</span>
        </div>
        <span style={{ fontSize: '10px', color: '#8B95A1' }}>
          권한 시뮬레이션
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
        {/* 1. DS 도급 총괄 PM (User) */}
        <button
          onClick={() => onSwitchUser('usr-ds-pm')}
          style={{
            padding: '6px 4px',
            borderRadius: '6px',
            background: currentUser.id === 'usr-ds-pm' ? '#0066FF' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: currentUser.id === 'usr-ds-pm' ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          <Building size={12} />
          <span>DS 총괄 PM</span>
        </button>

        {/* 2. 협력사 파트장 (현장대리인) */}
        <button
          onClick={() => onSwitchUser('usr-part-lead-1')}
          style={{
            padding: '6px 4px',
            borderRadius: '6px',
            background: currentUser.id === 'usr-part-lead-1' ? '#FF9500' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: currentUser.id === 'usr-part-lead-1' ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          <Briefcase size={12} />
          <span>협력 파트장</span>
        </button>

        {/* 3. 협력사 근로자 */}
        <button
          onClick={() => onSwitchUser('usr-worker-01')}
          style={{
            padding: '6px 4px',
            borderRadius: '6px',
            background: currentUser.id === 'usr-worker-01' ? '#12B76A' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: currentUser.id === 'usr-worker-01' ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer',
            border: 'none'
          }}
        >
          <UserCheck size={12} />
          <span>협력 근로자</span>
        </button>
      </div>
    </div>
  );
};
