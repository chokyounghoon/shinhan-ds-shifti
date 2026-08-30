import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Info,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { WeeklyWorkStat } from '../../types';

export interface DailyBreakdownItem {
  dayOfWeek: string; // '월', '화', '수', '목', '금', '토', '일'
  dateStr: string;   // '8/25'
  regularHours: number;
  overtimeHours: number;
  status: 'WORK' | 'OVERTIME' | 'VACATION' | 'OFF' | 'TODAY';
  statusLabel: string;
  clockIn?: string;
  clockOut?: string;
}

interface DetailStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: WeeklyWorkStat;
  themeMode?: 'ddangyo' | 'shinhan';
  dailyBreakdown?: DailyBreakdownItem[];
}

export const DetailStatusModal: React.FC<DetailStatusModalProps> = ({
  isOpen,
  onClose,
  stats,
  themeMode = 'shinhan',
  dailyBreakdown
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'breakdown' | 'compliance'>('summary');
  const [showTooltip, setShowTooltip] = useState(false);

  if (!isOpen) return null;

  // 통계 기본값 및 동적 계산
  const approvedHours = stats?.approvedHours ?? 40;
  const totalCapHours = stats?.totalCapHours ?? 52;
  const overtimeHours = stats?.overtimeHours ?? 0;
  const regularHours = Math.min(approvedHours, 40);
  const remainingCapHours = Math.max(0, totalCapHours - approvedHours);
  const workedDays = stats?.workedDays ?? 5;
  const lateCount = stats?.lateCount ?? 0;
  const earlyLeaveCount = stats?.earlyLeaveCount ?? 0;

  // 52시간 게이지 비율 계산 (최대 100%)
  const percentage = Math.min(100, Math.round((approvedHours / totalCapHours) * 100));
  const regularPercentage = Math.min(100, (40 / totalCapHours) * 100); // 76.9%

  // 테마 컬러
  const primaryColor = themeMode === 'ddangyo' ? '#FF462D' : '#0046FF';
  const primaryGradient = themeMode === 'ddangyo' 
    ? 'linear-gradient(135deg, #FF5538 0%, #FF2E17 100%)' 
    : 'linear-gradient(135deg, #0052FF 0%, #0036C7 100%)';
  const lightBgColor = themeMode === 'ddangyo' ? '#FFF5F3' : '#F0F5FF';
  const badgeBorderColor = themeMode === 'ddangyo' ? '#FFDCD6' : '#D0E1FD';

  // 상태 등급 (안전 / 주의 / 위험 / 초과)
  let statusLevel: { label: string; color: string; bg: string; icon: React.ReactNode; desc: string } = {
    label: '안전 (소정 근로 준수)',
    color: '#059669',
    bg: '#ECFDF5',
    icon: <CheckCircle2 size={16} color="#059669" />,
    desc: '법정 한도 내에서 매우 안정적으로 근무하고 있습니다.'
  };

  if (approvedHours > 52) {
    statusLevel = {
      label: '법정 한도 초과 위반',
      color: '#DC2626',
      bg: '#FEF2F2',
      icon: <AlertCircle size={16} color="#DC2626" />,
      desc: '주 52시간 한도를 초과했습니다. 즉시 추가 근로를 중단해야 합니다.'
    };
  } else if (approvedHours >= 48) {
    statusLevel = {
      label: '한도 임박 (위험)',
      color: '#EA580C',
      bg: '#FFF7ED',
      icon: <AlertTriangle size={16} color="#EA580C" />,
      desc: `법정 한도까지 잔여 ${remainingCapHours}시간 남았습니다. 연장근로 승인에 유의하세요.`
    };
  } else if (approvedHours > 40) {
    statusLevel = {
      label: '연장 근로 진행 중',
      color: '#D97706',
      bg: '#FFFBEB',
      icon: <TrendingUp size={16} color="#D97706" />,
      desc: `기본 40시간 초과 연장근로(${overtimeHours}시간)가 발생했습니다.`
    };
  }

  // 기본 일별 데이터 (mock/fallback)
  const defaultBreakdown: DailyBreakdownItem[] = [
    { dayOfWeek: '월', dateStr: '8/25', regularHours: 8, overtimeHours: 0, status: 'WORK', statusLabel: '정상 8h', clockIn: '08:50', clockOut: '18:00' },
    { dayOfWeek: '화', dateStr: '8/26', regularHours: 8, overtimeHours: 0, status: 'WORK', statusLabel: '정상 8h', clockIn: '08:48', clockOut: '18:05' },
    { dayOfWeek: '수', dateStr: '8/27', regularHours: 8, overtimeHours: 0, status: 'WORK', statusLabel: '정상 8h', clockIn: '08:52', clockOut: '18:00' },
    { dayOfWeek: '목', dateStr: '8/28', regularHours: 8, overtimeHours: 0, status: 'WORK', statusLabel: '정상 8h', clockIn: '08:45', clockOut: '18:10' },
    { dayOfWeek: '금', dateStr: '8/29', regularHours: 8, overtimeHours: 0, status: 'VACATION', statusLabel: '여름휴가 8h (공수인정)', clockIn: '승인완료', clockOut: '도급공백승인' },
    { dayOfWeek: '토', dateStr: '8/30', regularHours: 0, overtimeHours: 0, status: 'OFF', statusLabel: '휴무', clockIn: '-', clockOut: '-' },
    { dayOfWeek: '일', dateStr: '8/31', regularHours: 0, overtimeHours: 0, status: 'OFF', statusLabel: '휴무', clockIn: '-', clockOut: '-' },
  ];

  const breakdownList = dailyBreakdown || defaultBreakdown;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
          maxWidth: '520px',
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
        {/* 상단 드래그 인디케이터 바 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '4px', background: '#E2E8F0', borderRadius: '2px' }} />
        </div>

        {/* 1. 타이틀 헤더 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#191F28', letterSpacing: '-0.3px', margin: 0 }}>
                근무 상황 상세 내역
              </h3>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                color: themeMode === 'ddangyo' ? '#FF462D' : '#0052FF',
                background: lightBgColor,
                border: `1px solid ${badgeBorderColor}`,
                padding: '2px 7px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <ShieldCheck size={12} />
                52시간 준수
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
              근로기준법 제53조 주 52시간 상한제 준수 현황
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

        {/* 2. 탭 메뉴 */}
        <div style={{
          display: 'flex',
          background: '#F1F5F9',
          borderRadius: '12px',
          padding: '3px',
          marginBottom: '18px'
        }}>
          <button
            onClick={() => setActiveTab('summary')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '9px',
              border: 'none',
              fontSize: '13px',
              fontWeight: activeTab === 'summary' ? 800 : 600,
              color: activeTab === 'summary' ? '#1E293B' : '#64748B',
              background: activeTab === 'summary' ? '#FFFFFF' : 'transparent',
              boxShadow: activeTab === 'summary' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            누적 현황 요약
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '9px',
              border: 'none',
              fontSize: '13px',
              fontWeight: activeTab === 'breakdown' ? 800 : 600,
              color: activeTab === 'breakdown' ? '#1E293B' : '#64748B',
              background: activeTab === 'breakdown' ? '#FFFFFF' : 'transparent',
              boxShadow: activeTab === 'breakdown' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            일별 상세 타임라인
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '9px',
              border: 'none',
              fontSize: '13px',
              fontWeight: activeTab === 'compliance' ? 800 : 600,
              color: activeTab === 'compliance' ? '#1E293B' : '#64748B',
              background: activeTab === 'compliance' ? '#FFFFFF' : 'transparent',
              boxShadow: activeTab === 'compliance' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            노무 기준 안내
          </button>
        </div>

        {/* 탭 1: 누적 현황 요약 */}
        {activeTab === 'summary' && (
          <>
            {/* 주 52시간 다이내믹 게이지 카드 */}
            <div style={{
              background: '#FFFFFF',
              padding: '18px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
              marginBottom: '16px'
            }}>
              {/* 카드 상단 헤더 & 수치 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} color={primaryColor} />
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>
                    주간 총 누적 근로시간
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: 900, color: primaryColor }}>
                    {approvedHours}시간
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#94A3B8', marginLeft: '4px' }}>
                    / {totalCapHours}시간
                  </span>
                </div>
              </div>

              {/* 프로그레스 바 (소정 40h 지점 마커 포함) */}
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <div style={{
                  height: '12px',
                  background: '#F1F5F9',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  {/* 실제 진행 바 */}
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: approvedHours > 52 
                      ? '#DC2626' 
                      : approvedHours >= 48 
                      ? '#EA580C' 
                      : primaryGradient,
                    borderRadius: '6px',
                    transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }} />
                </div>

                {/* 40시간 소정근로 한계선 마커 */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    left: `${regularPercentage}%`,
                    width: '2px',
                    height: '18px',
                    background: '#64748B',
                    transform: 'translateX(-50%)',
                    zIndex: 2
                  }}
                  title="기본 소정근로 40시간 기준선"
                />
              </div>

              {/* 하단 범례 및 잔여 시간 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748B', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: primaryColor, display: 'inline-block' }} />
                  소정근로 {regularHours}h / 40h
                </span>
                <span style={{ fontWeight: 700, color: remainingCapHours <= 4 ? '#EA580C' : '#059669' }}>
                  연장 가능 잔여: {remainingCapHours}시간
                </span>
              </div>

              {/* 상태 레벨 알림 박스 */}
              <div style={{
                background: statusLevel.bg,
                border: `1px solid ${statusLevel.color}30`,
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {statusLevel.icon}
                <div style={{ fontSize: '12px', color: '#1E293B', flex: 1 }}>
                  <span style={{ fontWeight: 800, color: statusLevel.color, marginRight: '4px' }}>
                    [{statusLevel.label}]
                  </span>
                  {statusLevel.desc}
                </div>
              </div>
            </div>

            {/* 세부 항목 리스트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              <div style={detailRowStyle}>
                <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0052FF' }} />
                  기본 소정근로 시간
                </span>
                <strong style={{ color: '#1E293B', fontSize: '14px' }}>{regularHours}시간 00분</strong>
              </div>

              <div style={detailRowStyle}>
                <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
                  연장 근로 시간 (주 최대 12h)
                </span>
                <strong style={{ color: overtimeHours > 0 ? '#EA580C' : '#1E293B', fontSize: '14px' }}>
                  {overtimeHours}시간 00분
                </strong>
              </div>

              <div style={detailRowStyle}>
                <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#8B5CF6' }} />
                  야간 근로 (22:00 ~ 06:00)
                </span>
                <strong style={{ color: '#1E293B', fontSize: '14px' }}>0시간 00분</strong>
              </div>

              <div style={detailRowStyle}>
                <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#64748B' }} />
                  휴일 근로
                </span>
                <strong style={{ color: '#1E293B', fontSize: '14px' }}>0시간 00분</strong>
              </div>

              <div style={{ 
                ...detailRowStyle, 
                background: lightBgColor, 
                border: `1px solid ${badgeBorderColor}` 
              }}>
                <span style={{ color: primaryColor, fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color={primaryColor} />
                  유급휴가/약정휴무 인정 시간 ({workedDays}일)
                </span>
                <strong style={{ color: primaryColor, fontSize: '14px' }}>
                  {regularHours}시간 인정
                </strong>
              </div>
            </div>
          </>
        )}

        {/* 탭 2: 일별 상세 타임라인 */}
        {activeTab === 'breakdown' && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '12.5px', color: '#64748B', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>이번 주 일별 투입 내역</span>
              <span>총 {workedDays}일 정상 출근 완료</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {breakdownList.map((item, idx) => {
                const isOff = item.status === 'OFF';
                return (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: isOff ? '#F8FAFC' : '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      opacity: isOff ? 0.75 : 1
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: isOff ? '#F1F5F9' : lightBgColor,
                        color: isOff ? '#94A3B8' : primaryColor,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '12px'
                      }}>
                        <span>{item.dayOfWeek}</span>
                      </div>

                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>
                          {item.dateStr} ({item.dayOfWeek})
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          출퇴근: {item.clockIn} ~ {item.clockOut}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '13.5px', 
                        fontWeight: 800, 
                        color: isOff ? '#94A3B8' : '#1E293B' 
                      }}>
                        {item.regularHours + item.overtimeHours > 0 ? `${item.regularHours + item.overtimeHours}.0h` : '-'}
                      </div>
                      <span style={{
                        fontSize: '10.5px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: isOff ? '#F1F5F9' : '#ECFDF5',
                        color: isOff ? '#64748B' : '#059669',
                        fontWeight: 700
                      }}>
                        {item.statusLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 탭 3: 노무 기준 및 법적 안내 */}
        {activeTab === 'compliance' && (
          <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <ShieldCheck size={16} color="#0052FF" />
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>
                  근로기준법 제53조 (연장 근로의 제한)
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                당사자 간의 합의가 있는 경우 1주간에 12시간을 한도로 근로시간을 연장할 수 있습니다. 
                따라서 1주일 총 근로시간은 소정근로 40시간과 연장근로 12시간을 합산하여 <strong>최대 52시간</strong>을 초과할 수 없습니다.
              </p>
            </div>

            <div style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <TrendingUp size={16} color="#EA580C" />
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>
                  가산 수당 지급 기준 (제56조)
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                연장 근로(1일 8시간 초과), 야간 근로(오후 10시~오전 6시), 휴일 근로에 대해서는 통상임금의 <strong>50% 이상을 가산</strong>하여 지급합니다.
              </p>
            </div>

            <div style={{
              background: '#EFF6FF',
              border: '1px solid #DBEAFE',
              borderRadius: '12px',
              padding: '12px 14px',
              fontSize: '11.5px',
              color: '#1E40AF',
              lineHeight: 1.5
            }}>
              <div style={{ fontWeight: 800, marginBottom: '2px' }}>💡 도급 업무 독립성 가이드</div>
              본 시스템의 근로시간 집계는 협력사의 자체 노무 관리 기준을 존중하며, 원·하청 간 불법파견 요소를 차단하고 계약상 투입 공수(Man-Hour)를 정확히 정산하기 위한 목적으로 운용됩니다.
            </div>
          </div>
        )}

        {/* 하단 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            height: '48px',
            background: primaryGradient,
            color: '#FFFFFF',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 800,
            border: 'none',
            cursor: 'pointer',
            boxShadow: themeMode === 'ddangyo' ? '0 4px 14px rgba(255, 70, 45, 0.3)' : '0 4px 14px rgba(0, 70, 255, 0.3)',
            transition: 'opacity 0.2s'
          }}
        >
          확인 완료
        </button>
      </div>
    </div>
  );
};

const detailRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px 14px',
  borderRadius: '10px',
  background: '#F8FAFC',
  border: '1px solid #F1F5F9',
  fontSize: '13px'
};
