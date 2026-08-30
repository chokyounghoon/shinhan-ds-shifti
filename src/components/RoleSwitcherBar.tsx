import React from 'react';
import { ShieldCheck, User as UserIcon, Users, Building } from 'lucide-react';
import { User } from '../types';

interface RoleSwitcherBarProps {
  currentUser: User;
  onSwitchUser: (roleKey: 'PARTNER' | 'PARTNER_MANAGER' | 'DS_PM' | 'DS_DIRECTOR') => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentUser,
  onSwitchUser,
  themeMode
}) => {
  const isDsDirector = currentUser.role === 'DS_DIRECTOR';
  const isDsPm = (currentUser.role === 'DS_PRINCIPAL_PM' || currentUser.role === 'PRINCIPAL_INSPECTOR') && !isDsDirector;
  const isPartnerManager = currentUser.role === 'PARTNER_PART_LEADER' || currentUser.role === 'PARTNER_SITE_MANAGER';
  const isPartnerWorker = !isDsDirector && !isDsPm && !isPartnerManager;

  return (
    <div style={{
      background: '#191F28',
      color: '#FFFFFF',
      padding: '8px 12px',
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
        {/* 1. 협력사 (개인) */}
        <button
          type="button"
          onClick={() => onSwitchUser('PARTNER')}
          style={{
            padding: '7px 2px',
            borderRadius: '8px',
            background: isPartnerWorker ? '#0066FF' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: isPartnerWorker ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            border: isPartnerWorker ? '1px solid #00E5FF' : '1px solid transparent',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <UserIcon size={12} color={isPartnerWorker ? '#00E5FF' : '#90A4AE'} />
          <span>개인</span>
        </button>

        {/* 2. 협력사 관리인 */}
        <button
          type="button"
          onClick={() => onSwitchUser('PARTNER_MANAGER')}
          style={{
            padding: '7px 2px',
            borderRadius: '8px',
            background: isPartnerManager ? '#0066FF' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: isPartnerManager ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            border: isPartnerManager ? '1px solid #00E5FF' : '1px solid transparent',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Users size={12} color={isPartnerManager ? '#00E5FF' : '#90A4AE'} />
          <span>협력사 관리인</span>
        </button>

        {/* 3. DS현장대리인 */}
        <button
          type="button"
          onClick={() => onSwitchUser('DS_PM')}
          style={{
            padding: '7px 2px',
            borderRadius: '8px',
            background: isDsPm ? '#0066FF' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: isDsPm ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            border: isDsPm ? '1px solid #00E5FF' : '1px solid transparent',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <Building size={12} color={isDsPm ? '#00E5FF' : '#90A4AE'} />
          <span>DS현장대리인</span>
        </button>

        {/* 4. 🌟 DS총괄담당자 (부서장 / 전사 도급 총괄) */}
        <button
          type="button"
          onClick={() => onSwitchUser('DS_DIRECTOR')}
          style={{
            padding: '7px 2px',
            borderRadius: '8px',
            background: isDsDirector ? '#0066FF' : 'rgba(255, 255, 255, 0.08)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: isDsDirector ? 800 : 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            cursor: 'pointer',
            border: isDsDirector ? '1px solid #00E5FF' : '1px solid transparent',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap'
          }}
        >
          <ShieldCheck size={12} color={isDsDirector ? '#00E5FF' : '#90A4AE'} />
          <span>DS총괄담당자</span>
        </button>
      </div>
    </div>
  );
};
