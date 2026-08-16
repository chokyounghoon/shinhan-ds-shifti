import React from 'react';
import { ShieldCheck, UserCheck, Briefcase, Building } from 'lucide-react';
import { User, UserRole } from '../types';

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 700, color: '#00C48C' }}>
          <ShieldCheck size={14} />
          <span>노란봉투법·파견법 컴플라이언스 모드</span>
        </div>
        <span style={{ fontSize: '10px', color: '#8B95A1' }}>
          역할 시뮬레이션
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
        {/* 1. 협력사 직원 */}
        <button
          onClick={() => onSwitchUser('usr-001')}
          style={{
            padding: '6px 4px',
            borderRadius: '6px',
            background: currentUser.id === 'usr-001' ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: currentUser.id === 'usr-001' ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.15s ease'
          }}
        >
          <UserCheck size={12} />
          <span>협력사 직원</span>
        </button>

        {/* 2. 협력사 현장대리인 */}
        <button
          onClick={() => onSwitchUser('usr-rep-001')}
          style={{
            padding: '6px 4px',
            borderRadius: '6px',
            background: currentUser.id === 'usr-rep-001' ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: currentUser.id === 'usr-rep-001' ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.15s ease'
          }}
        >
          <Briefcase size={12} />
          <span>현장대리인</span>
        </button>

        {/* 3. 원청 도급검수관 */}
        <button
          onClick={() => onSwitchUser('usr-ds-001')}
          style={{
            padding: '6px 4px',
            borderRadius: '6px',
            background: currentUser.id === 'usr-ds-001' ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: currentUser.id === 'usr-ds-001' ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            transition: 'all 0.15s ease'
          }}
        >
          <Building size={12} />
          <span>신한DS 검수</span>
        </button>
      </div>
    </div>
  );
};
