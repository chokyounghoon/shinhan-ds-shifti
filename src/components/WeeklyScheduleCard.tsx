import React from 'react';
import { Calendar, ChevronDown, CheckCircle2, PlusCircle, Sun } from 'lucide-react';
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
            주간 도급 투입 계획 및 휴가 (Man-Day)
          </div>
          <div style={{ fontSize: '11px', color: '#6B7684', marginTop: '2px' }}>
            휴가 시 당일 도급 공수에서 사전 제외(0 M/D)
          </div>
        </div>

        {onOpenVacationModal && (
          <button
            type="button"
            onClick={onOpenVacationModal}
            style={{
              background: 'rgba(0, 82, 255, 0.08)',
              border: '1px solid #0052FF',
              color: '#0052FF',
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
            <Sun size={13} />
            <span>+ 휴가 등록</span>
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
                <span>{day.title === '체력단련휴.' || day.title === '연차' ? '연차/휴무' : day.title}</span>
                {day.isVacation && (
                  <CheckCircle2
                    size={11}
                    style={{
                      color: '#0052FF',
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
