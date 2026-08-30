import React from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  Plane, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  FileEdit, 
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { DaySchedule } from '../../types';

interface DayDetailModalProps {
  schedule: DaySchedule | null;
  onClose: () => void;
  onOpenRequest: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  schedule,
  onClose,
  onOpenRequest,
  themeMode = 'shinhan'
}) => {
  if (!schedule) return null;

  const isVacation = schedule.isVacation || schedule.statusType === 'VACATION' || schedule.title?.includes('휴가') || schedule.title?.includes('연차');
  const isOff = schedule.statusType === 'OFF' || schedule.title === '휴무' || schedule.dayOfWeek === '토' || schedule.dayOfWeek === '일';
  const isWork = !isVacation && !isOff;

  const primaryColor = themeMode === 'ddangyo' ? '#FF462D' : '#0046FF';
  const primaryGradient = themeMode === 'ddangyo' 
    ? 'linear-gradient(135deg, #FF5538 0%, #FF2E17 100%)' 
    : 'linear-gradient(135deg, #0052FF 0%, #0036C7 100%)';
  const lightBgColor = themeMode === 'ddangyo' ? '#FFF5F3' : '#F0F5FF';

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 9999,
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="bottom-sheet" 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          background: '#FFFFFF',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          padding: '24px 20px 28px 20px',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.15)',
          overflowY: 'auto',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* 상단 드래그 바 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '4px', background: '#E2E8F0', borderRadius: '2px' }} />
        </div>

        {/* 1. 타이틀 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#191F28', letterSpacing: '-0.3px', margin: 0 }}>
                {schedule.date || schedule.dateStr || '일정'} ({schedule.dayOfWeek}) 상세 투입 계획
              </h3>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: isVacation ? '#059669' : isWork ? primaryColor : '#64748B',
                background: isVacation ? '#ECFDF5' : isWork ? lightBgColor : '#F1F5F9',
                padding: '2px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                {isVacation ? '유급 휴가' : isWork ? '정규 투입 8.0h' : '주말 휴무'}
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
              도급 계약에 따른 일일 공수 및 소속사 일정 확인
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. 핵심 카드 정보 */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isVacation ? '#ECFDF5' : isWork ? lightBgColor : '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isVacation ? (
                <Plane size={24} color="#059669" />
              ) : isWork ? (
                <Clock size={24} color={primaryColor} />
              ) : (
                <Calendar size={24} color="#64748B" />
              )}
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#1E293B' }}>
                {schedule.title || (isVacation ? '소속사 연차 휴가' : isWork ? '정규 도급 투입 (09:00~18:00)' : '주말 정기 휴무')}
              </div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                {isVacation 
                  ? '소속사 승인 완료 (1 M/D 8시간 근로 공수 인정)' 
                  : isWork 
                  ? '약정 도급지 정상 출근 및 완성물 제작' 
                  : '약정 휴무일 (투입 공수 산정 제외)'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#475569', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748B' }}>지정 근무 장소</span>
              <strong style={{ color: '#1E293B' }}>파인에비뉴(카드) 100m 지오펜스</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748B' }}>인정 투입 공수</span>
              <strong style={{ color: isOff ? '#94A3B8' : primaryColor }}>
                {isOff ? '0.0 Man-Day (휴무)' : '1.0 Man-Day (8.0h)'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748B' }}>공정 검수 상태</span>
              <span style={{ color: '#16A34A', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} />
                신한DS PM 사전 확인 완료
              </span>
            </div>
          </div>
        </div>

        {/* 3. 법적 보호 및 소명 안내 */}
        <div style={{
          background: '#F8FAFC',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '12px 14px',
          marginBottom: '20px',
          fontSize: '11.5px',
          color: '#475569',
          lineHeight: 1.5
        }}>
          <div style={{ fontWeight: 800, color: '#1E293B', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} color="#0052FF" />
            <span>도급 계약 공정 이행 관리 지침</span>
          </div>
          일정 변동(휴가, 조기퇴실, 연장투입 등) 발생 시 소속사 관리자 결재를 거쳐 신한DS 전담 PM에게 공백 사실이 자동 통보됩니다.
        </div>

        {/* 4. 하단 버튼 액션 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              onClose();
              onOpenRequest();
            }}
            style={{
              flex: 1,
              height: '48px',
              background: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: 800,
              color: '#334155',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <FileEdit size={16} />
            <span>일정 변경/소명</span>
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: '48px',
              background: primaryGradient,
              color: '#FFFFFF',
              borderRadius: '12px',
              fontSize: '14.5px',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: themeMode === 'ddangyo' ? '0 4px 14px rgba(255, 70, 45, 0.3)' : '0 4px 14px rgba(0, 70, 255, 0.3)'
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
