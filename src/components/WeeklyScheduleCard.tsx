import React from 'react';
import { Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';
import { DaySchedule } from '../types';

interface WeeklyScheduleCardProps {
  schedules: DaySchedule[];
  onSelectDay: (schedule: DaySchedule) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const WeeklyScheduleCard: React.FC<WeeklyScheduleCardProps> = ({
  schedules,
  onSelectDay,
  themeMode
}) => {
  return (
    <div className="week-schedule-card">
      <div className="week-header">
        <div className="week-title" style={{ fontSize: '15px', fontWeight: 800 }}>
          주간 도급 인력 투입 계획 (Man-Day)
        </div>

        <div className="week-range-selector">
          <Calendar size={14} color="#4E5968" />
          <span>08.10 - 08.16</span>
          <ChevronDown size={13} color="#6B7684" />
        </div>
      </div>

      <div className="week-grid">
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
                <span>{day.title === '체력단련휴.' || day.title === '연차' ? '약정휴무' : day.title}</span>
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
