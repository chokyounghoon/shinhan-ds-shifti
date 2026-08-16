import React from 'react';
import { ShieldCheck, User as UserIcon, Users, Building } from 'lucide-react';
import { User } from '../types';

interface RoleSwitcherBarProps {
  currentUser: User;
  onSwitchUser: (roleKey: 'PARTNER' | 'PARTNER_MANAGER' | 'DS_PM') => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentUser,
  onSwitchUser,
  themeMode
}) => {
  const isDsPm = currentUser.role === 'DS_PRINCIPAL_PM' || currentUser.role === 'PRINCIPAL_INSPECTOR';
  const isPartnerManager = currentUser.role === 'PARTNER_PART_LEADER' || currentUser.role === 'PARTNER_SITE_MANAGER';
  const isPartnerWorker = !isDsPm && !isPartnerManager;

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.15fr 1fr', gap: '5px' }}>
        {/* 1. 협력사 (개인) */}
        <button
          type="button"
          onClick={() => onSwitchUser('PARTNER')}
          style={{
            padding: '7px 4px',
            borderRadius: '8px',
            background: isPartnerWorker ? '#0066FF' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11.5px',
            fontWeight: isPartnerWorker ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer',
            border: isPartnerWorker ? '1px solid #00E5FF' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <UserIcon size={13} color={isPartnerWorker ? '#00E5FF' : '#90A4AE'} />
          <span>협력사 (개인)</span>
        </button>

        {/* 2. 협력사 관리인 (영업대표) */}
        <button
          type="button"
          onClick={() => onSwitchUser('PARTNER_MANAGER')}
          style={{
            padding: '7px 4px',
            borderRadius: '8px',
            background: isPartnerManager ? '#0066FF' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11.5px',
            fontWeight: isPartnerManager ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer',
            border: isPartnerManager ? '1px solid #00E5FF' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={13} color={isPartnerManager ? '#00E5FF' : '#90A4AE'} />
          <span>협력사 관리인</span>
        </button>

        {/* 3. DS현장대리인 */}
        <button
          type="button"
          onClick={() => onSwitchUser('DS_PM')}
          style={{
            padding: '7px 4px',
            borderRadius: '8px',
            background: isDsPm ? '#0066FF' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11.5px',
            fontWeight: isDsPm ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer',
            border: isDsPm ? '1px solid #00E5FF' : '1px solid transparent',
            transition: 'all 0.15s ease'
          }}
        >
          <Building size={13} color={isDsPm ? '#00E5FF' : '#90A4AE'} />
          <span>DS현장대리인</span>
        </button>
      </div>
    </div>
  );
};
