import React from 'react';
import { Calendar, ChevronDown, Plane } from 'lucide-react';
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
        <div className="week-title">이번주 근무</div>

        <div className="week-range-selector">
          <Calendar size={15} color="#4E5968" />
          <span>08.10 - 08.16</span>
          <ChevronDown size={14} color="#6B7684" />
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
                style={isToday ? { color: '#F04438' } : undefined}
              >
                {day.dayOfWeek}
              </div>

              <div className="day-content">
                <span>{day.title}</span>
                {day.isVacation && (
                  <Plane
                    size={12}
                    className="airplane-icon"
                    style={{
                      transform: 'rotate(-45deg)',
                      color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF'
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
