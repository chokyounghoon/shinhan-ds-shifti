import React from 'react';
import { Calendar, ChevronDown, CheckCircle2, FileText } from 'lucide-react';
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
  return (
    <div className="week-schedule-card">
      <div className="week-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="week-title" style={{ fontSize: '15px', fontWeight: 800 }}>
            주간 도급 투입 계획 (Man-Day)
          </div>
          <div style={{ fontSize: '11px', color: '#6B7684', marginTop: '2px' }}>
            소속사에 휴가 신청 시 관리자가 원청에 공백을 통보합니다
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
              padding: '5px 9px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FileText size={13} />
            <span>+ 소속사 휴가 신청</span>
          </button>
        )}
      </div>

      <div className="week-grid" style={{ marginTop: '12px' }}>
        {schedules.map((day, idx) => {
          const isSat = day.dayOfWeek === '토';
          const isToday = day.isToday;

          return (
            <div
              key={idx}
              className={`day-cell ${isToday ? (themeMode === 'ddangyo' ? 'ddangyo-today' : 'is-today') : ''}`}
              onClick={() => onSelectDay(day)}
              role="button"
              tabIndex={0}
            >
              <div
                className={`day-name ${isSat ? 'sat' : isToday ? 'today-red' : ''}`}
                style={isToday ? { color: '#0052FF', fontWeight: 800 } : undefined}
              >
                {day.dayOfWeek}
              </div>

              <div className="day-content" style={{ fontSize: '11px' }}>
                <span>{day.title === '체력단련휴.' || day.title === '연차' ? '소속사휴가' : day.title}</span>
                {day.isVacation && (
                  <CheckCircle2
                    size={11}
                    style={{
                      color: '#16A34A',
                      marginTop: '2px'
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
