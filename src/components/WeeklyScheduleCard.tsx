import React from 'react';
import { Calendar, ChevronDown, CheckCircle2, FileText, Sparkles, Plane, Clock } from 'lucide-react';
import { DaySchedule } from '../types';

interface WeeklyScheduleCardProps {
  schedules: DaySchedule[];
  onSelectDay: (schedule: DaySchedule) => void;
  onOpenVacationModal?: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const WeeklyScheduleCard: React.FC<WeeklyScheduleCardProps> = ({
  schedules,
  onSelectDay,
  onOpenVacationModal,
  themeMode
}) => {
  const primaryColor = themeMode === 'ddangyo' ? '#FF462D' : '#0052FF';

  return (
    <div 
      className="week-schedule-card"
      style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
        border: '1px solid #E5E8EB',
        marginBottom: '12px'
      }}
    >
      <div className="week-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={17} color={primaryColor} />
            <span style={{ fontSize: '15.5px', fontWeight: 900, color: '#191F28', whiteSpace: 'nowrap' }}>
              주간 도급 투입 계획 (Man-Day)
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#6B7684', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            소속사 휴가 결재 ➔ 원청 PM 공정 공백 실시간 동기화
          </div>
        </div>

        {onOpenVacationModal && (
          <button
            type="button"
            onClick={onOpenVacationModal}
            style={{
              background: '#F0FDF4',
              border: '1.5px solid #16A34A',
              color: '#15803D',
              fontSize: '11.5px',
              fontWeight: 800,
              padding: '6px 11px',
              borderRadius: '9px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.1)',
              transition: 'all 0.15s ease'
            }}
          >
            <FileText size={13} />
            <span>+ 소속사 휴가 신청</span>
          </button>
        )}
      </div>

      <div className="week-grid" style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {schedules.map((day, idx) => {
          const isSat = day.dayOfWeek === '토';
          const isSun = day.dayOfWeek === '일';
          const isWeekend = isSat || isSun;
          const isToday = day.isToday;
          const isVacation = day.isVacation || day.title?.includes('휴가') || day.title?.includes('연차');

          return (
            <div
              key={idx}
              onClick={() => onSelectDay(day)}
              role="button"
              tabIndex={0}
              style={{
                background: isToday 
                  ? (themeMode === 'ddangyo' ? '#FFF5F3' : '#EFF6FF') 
                  : isWeekend 
                  ? '#F8FAFC' 
                  : '#FFFFFF',
                border: isToday 
                  ? `2px solid ${primaryColor}` 
                  : isVacation 
                  ? '1px solid #86EFAC' 
                  : '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '10px 4px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative',
                boxShadow: isToday ? `0 4px 12px ${themeMode === 'ddangyo' ? 'rgba(255, 70, 45, 0.15)' : 'rgba(0, 82, 255, 0.15)'}` : 'none'
              }}
            >
              {/* 오늘 표시 뱃지 */}
              {isToday && (
                <div style={{
                  position: 'absolute',
                  top: '-7px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: primaryColor,
                  color: '#FFFFFF',
                  fontSize: '9px',
                  fontWeight: 900,
                  padding: '1px 5px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap'
                }}>
                  오늘
                </div>
              )}

              <div
                style={{
                  fontSize: '12px',
                  fontWeight: isToday ? 900 : 700,
                  color: isToday 
                    ? primaryColor 
                    : isSun 
                    ? '#EF4444' 
                    : isSat 
                    ? '#3B82F6' 
                    : '#475569',
                  marginBottom: '4px'
                }}
              >
                {day.dayOfWeek}
              </div>

              <div style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: isVacation ? '#16A34A' : isWeekend ? '#94A3B8' : '#1E293B',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                minHeight: '26px',
                justifyContent: 'center'
              }}>
                {isVacation ? (
                  <>
                    <Plane size={11} color="#16A34A" />
                    <span style={{ fontSize: '10px' }}>휴가</span>
                  </>
                ) : isWeekend ? (
                  <span>휴무</span>
                ) : (
                  <span>1.0 M/D</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
