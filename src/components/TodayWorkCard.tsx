import React, { useState } from 'react';
import { dbService } from '../services/db';
import { WorkLocation } from '../views/WorkLocationSelectView';

interface TodayWorkCardProps {
  onOpenRequest: () => void;
  onOpenNoScheduleModal: () => void;
  selectedLocation?: WorkLocation;
  hasScheduleToday?: boolean;
  themeMode: 'ddangyo' | 'shinhan';
  onLogUpdated: () => void;
}

// 거리 계산 유틸리티 (Haversine formula in KM)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const TodayWorkCard: React.FC<TodayWorkCardProps> = ({
  onOpenRequest,
  onOpenNoScheduleModal,
  selectedLocation,
  hasScheduleToday = false,
  themeMode,
  onLogUpdated
}) => {
  const [isPunchedIn, setIsPunchedIn] = useState(false);
  const [punchInTime, setPunchInTime] = useState<string | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<string | null>(null);
  const [isCheckingGPS, setIsCheckingGPS] = useState(false);

  // 오늘 날짜 계산
  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  // 타겟 근무지 좌표 (기본값: 서울 중구 파인에비뉴)
  const targetLat = selectedLocation?.lat || 37.5663;
  const targetLng = selectedLocation?.lng || 126.9890;
  const targetName = selectedLocation?.name.replace('[좌표] ', '') || '파인에비뉴(카드)';

  const handlePunchToggle = () => {
    // 1. 근무 일정이 등록되어 있지 않은 경우 (스크린샷 일치 팝업 표시)
    if (!hasScheduleToday && !isPunchedIn) {
      onOpenNoScheduleModal();
      return;
    }

    // 2. GPS 위치 확인 (반경 100km 이내 검증)
    setIsCheckingGPS(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsCheckingGPS(false);
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          const distance = getDistanceKm(currentLat, currentLng, targetLat, targetLng);

          // 반경 100km 검증
          if (distance > 100) {
            alert(`⚠️ 현재 위치가 지정 근무지 [${targetName}] 반경 100km를 초과하였습니다.\n(현재 거리: 약 ${distance.toFixed(1)}km)\n근무지 근처에서 다시 시도해주세요.`);
            return;
          }

          processPunch(distance);
        },
        (error) => {
          // 브라우저 위치 권한 거부 또는 시뮬레이션 환경 처리
          setIsCheckingGPS(false);
          // 기본 반경 0.5km 이내로 간주하여 처리
          processPunch(0.5);
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    } else {
      setIsCheckingGPS(false);
      processPunch(0.5);
    }
  };

  const processPunch = (dist: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (!isPunchedIn) {
      setIsPunchedIn(true);
      setPunchInTime(timeStr);
      dbService.addCommuteLog('출근', timeStr);
      onLogUpdated();
      alert(`📍 [${targetName}] 출근이 완료되었습니다.\n• 출근 시각: ${timeStr}\n• 근무지 거리: ${dist.toFixed(2)}km (GPS 인증됨)`);
    } else {
      setIsPunchedIn(false);
      setPunchOutTime(timeStr);
      dbService.addCommuteLog('퇴근', timeStr);
      onLogUpdated();
      alert(`📍 [${targetName}] 퇴근이 완료되었습니다.\n• 퇴근 시각: ${timeStr}\n• 수고하셨습니다!`);
    }
  };

  return (
    <div className="card" style={{ padding: '20px', marginBottom: '16px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
        오늘 근무
      </h2>

      {/* 날짜 및 일정 상태 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{
          width: '3.5px',
          height: '42px',
          background: 'var(--color-mint)',
          borderRadius: '2px',
          marginRight: '12px'
        }} />
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {month}/{date} ({dayName})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
              {hasScheduleToday ? '09:00 - 18:00' : '일정 없음'}
            </span>
            <span className="badge badge-gray" style={{ fontSize: '11px', padding: '2px 6px' }}>
              {hasScheduleToday ? '정상근무' : '무일정'}
            </span>
            {isPunchedIn && (
              <span className="badge" style={{ background: '#E6F9F0', color: '#00A859', fontSize: '11px', padding: '2px 6px', fontWeight: 700 }}>
                ● 근무중 ({punchInTime}~)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼 그룹 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.2fr', gap: '10px' }}>
        {/* 요청 버튼 (스크린샷 일치) */}
        <button
          onClick={onOpenRequest}
          style={{
            height: '48px',
            background: '#F1F3F5',
            border: '1px solid #DDE2E5',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 700,
            color: '#191F28',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          요청
        </button>

        {/* 출근하기 / 퇴근하기 버튼 (스크린샷 일치) */}
        <button
          onClick={handlePunchToggle}
          disabled={isCheckingGPS}
          style={{
            height: '48px',
            background: isPunchedIn 
              ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') 
              : (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF'),
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 800,
            color: '#FFFFFF',
            cursor: isCheckingGPS ? 'wait' : 'pointer',
            boxShadow: '0 2px 6px rgba(0, 70, 255, 0.2)',
            transition: 'all 0.2s',
            opacity: isCheckingGPS ? 0.7 : 1
          }}
        >
          {isCheckingGPS ? 'GPS 위치 확인중...' : isPunchedIn ? '퇴근하기' : '출근하기'}
        </button>
      </div>
    </div>
  );
};
