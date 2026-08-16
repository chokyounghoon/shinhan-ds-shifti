import React from 'react';
import { X, Calendar, Clock, Plane, MapPin } from 'lucide-react';
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
  themeMode
}) => {
  if (!schedule) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>
              {schedule.date} ({schedule.dayOfWeek}) 상세 일정
            </h3>
            <p style={{ fontSize: '12px', color: '#6B7684' }}>근태 및 휴가 계획</p>
          </div>
          <button onClick={onClose} style={{ color: '#8B95A1' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{
          background: '#F8F9FA',
          padding: '16px',
          borderRadius: '12px',
          border: '1px solid #ECEFF2',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            {schedule.isVacation ? (
              <Plane size={24} color={themeMode === 'ddangyo' ? '#FF462D' : '#0046FF'} />
            ) : (
              <Calendar size={24} color="#6B7684" />
            )}
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#191F28' }}>
                {schedule.title}
              </div>
              <div style={{ fontSize: '12px', color: '#8B95A1' }}>
                {schedule.isVacation ? '유급 휴가 (8시간 근로 인정)' : '일정 없음 / 주말 휴무'}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #E5E8EB', paddingTop: '10px', fontSize: '12px', color: '#4E5968', lineHeight: 1.6 }}>
            <div>• 근무 장소: 신한DS 데이터센터 상주실</div>
            <div>• 결재 상태: <strong style={{ color: '#12B76A' }}>승인 완료 (신한DS PM 결재)</strong></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              onClose();
              onOpenRequest();
            }}
            style={{
              flex: 1,
              height: '46px',
              background: '#FFFFFF',
              border: '1px solid #D0D5DD',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#191F28'
            }}
          >
            일정 변경 신청
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: '46px',
              background: themeMode === 'ddangyo' ? '#FF462D' : '#0046FF',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
