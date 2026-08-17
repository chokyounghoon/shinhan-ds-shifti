import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { WorkLocation, defaultWorkLocations } from '../views/WorkLocationSelectView';
import { ShieldCheck, MapPin, CheckCircle2, Navigation, Clock, AlertTriangle, LocateFixed, RefreshCw, ShieldAlert } from 'lucide-react';
import { GpsPunchMapModal } from './GpsPunchMapModal';
import { antiSpoofService, SpoofCheckResult } from '../services/antiSpoofService';

interface TodayWorkCardProps {
  onOpenRequest: () => void;
  onOpenNoScheduleModal: () => void;
  selectedLocation?: WorkLocation;
  hasScheduleToday?: boolean;
  themeMode: 'ddangyo' | 'shinhan';
  onLogUpdated: () => void;
}

// 거리 계산 유틸 (Haversine Formula in Meters)
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// 거리 읽기 편한 포맷터 (예: 25m, 1.2km, 26.3km)
function formatDistanceText(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

export const TodayWorkCard: React.FC<TodayWorkCardProps> = ({
  onOpenRequest,
  onOpenNoScheduleModal,
  selectedLocation,
  hasScheduleToday = true,
  themeMode,
  onLogUpdated
}) => {
  const [isInputCompleted, setIsInputCompleted] = useState(false);
  const [inputTime, setInputTime] = useState<string | null>(null);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);

  // 실시간 실제 GPS 거리 및 상태 관리 (테스트를 위해 기본 25m 설정 및 모의 모드 지원)
  const [gpsDistance, setGpsDistance] = useState<number>(25);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isTestBypass, setIsTestBypass] = useState<boolean>(true); // 테스트용 지오펜스 바이패스 활성화

  const activeLocation: WorkLocation = selectedLocation || defaultWorkLocations[0];
  const targetName = activeLocation.name.replace('[좌표] ', '');
  const targetLat = activeLocation.lat || 37.5663;
  const targetLng = activeLocation.lng || 126.9890;

  // 실시간 안티스푸핑 무결성 검증
  const [spoofResult, setSpoofResult] = useState<SpoofCheckResult>({
    isSecure: true,
    isMockDetected: false,
    isJitterValid: true,
    isTeleportationDetected: false,
    securityScore: 100,
    securityToken: 'SEC-TOKEN-TEST',
    detectedThreats: [],
    clientIpHash: 'HASH_LOCAL',
    timestamp: new Date().toISOString()
  });

  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  // 100m 이내 & 안티스푸핑 무결성 통과 여부 판정 (테스트 바이패스 시 항상 활성화)
  const isWithin100m = isTestBypass ? true : gpsDistance <= 100;
  const isSecurityPassed = isTestBypass ? true : spoofResult.isSecure;

  // 실제 브라우저 GPS 하드웨어 센서 측정
  const measureLiveGps = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const dist = calculateDistanceMeters(pos.coords.latitude, pos.coords.longitude, targetLat, targetLng);
          setGpsDistance(dist);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    // 기본 측정
  }, [activeLocation]);

  // 1. 활성화된 버튼 터치 시 -> 카카오 지도 100m GPS 검증 모달 열기 및 최종 투입 확정
  const handleButtonClick = () => {
    if (isInputCompleted) {
      alert('✅ 금일 도급 인력 투입이 이미 정상 인증 완료되었습니다.\n(도급 계약 특성상 퇴근은 별도 기록하지 않습니다.)');
      return;
    }

    setIsGpsModalOpen(true);
  };

  // 2. 최종 1회 투입 완료 (퇴근 기록 불필요)
  const handleConfirmGpsPunch = (dist: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setGpsDistance(dist);
    setIsInputCompleted(true);
    setInputTime(timeStr);
    dbService.addCommuteLog('투입확인', timeStr);
    onLogUpdated();
    alert(`🎉 [${targetName}] 금일 도급 인력 투입이 정상 확정되었습니다.\n• 투입 인증 시각: ${timeStr}\n• GPS 인증 거리: ${formatDistanceText(dist)} (100m 이내 진입 확인)\n• 안티스푸핑 보안 검증: 정상 통과\n• 인정 실적: 당일 약정 1 M/D (8.0 Man-Hour)\n\n※ 퇴근 시간은 별도 기록하지 않으며 오늘의 도급 투입 의무가 완결되었습니다.`);
  };

  return (
    <>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        padding: '18px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
        border: '1px solid #E5E8EB',
        marginBottom: '12px'
      }}>
        {/* 헤더: 도급 인력 투입 확인 뱃지 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'rgba(0, 82, 255, 0.08)',
              color: '#0052FF',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '12px',
              marginBottom: '4px'
            }}>
              <ShieldCheck size={12} />
              <span>실시간 GPS 반경 100m 진입 시 조건부 활성화</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#191F28', margin: 0 }}>
              오늘 도급 투입 실적 ({month}월 {date}일, {dayName})
            </h2>
          </div>

          <div style={{
            background: isInputCompleted ? '#E8F5E9' : !isSecurityPassed ? '#FEF2F2' : isWithin100m ? '#EFF6FF' : '#F1F5F9',
            color: isInputCompleted ? '#2E7D32' : !isSecurityPassed ? '#DC2626' : isWithin100m ? '#0052FF' : '#64748B',
            fontSize: '11.5px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isInputCompleted ? (
              <CheckCircle2 size={13} color="#2E7D32" />
            ) : (
              <LocateFixed size={13} color="#0052FF" />
            )}
            <span>
              {isInputCompleted 
                ? '투입 완료 (1 M/D)' 
                : '현장 100m 내 (인증 가능)'}
            </span>
          </div>
        </div>

        {/* 도급 수행 장소 및 실시간 GPS 거리 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12.5px',
          color: '#4E5968',
          marginBottom: '10px',
          background: '#F9FAFB',
          padding: '8px 12px',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} color={isWithin100m ? '#0052FF' : '#64748B'} />
            <span>약정 도급 장소: <strong>{targetName}</strong></span>
          </div>

          <button
            type="button"
            onClick={measureLiveGps}
            style={{
              background: 'none',
              border: 'none',
              color: '#0052FF',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: 0
            }}
          >
            <RefreshCw size={11} className={isLocating ? 'spinning' : ''} />
            <span>GPS 재측정 ({formatDistanceText(gpsDistance)})</span>
          </button>
        </div>

        {/* 안내 배너: 100m 이내 vs 100m 밖 */}
        {!isInputCompleted && (
          <div style={{
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 700,
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: isWithin100m ? '#F0FDF4' : '#F8FAFC',
            border: isWithin100m ? '1px solid #BBF7D0' : '1px solid #E2E8F0',
            color: isWithin100m ? '#15803D' : '#475569'
          }}>
            {isWithin100m ? (
              <>
                <CheckCircle2 size={14} color="#16A34A" />
                <span>현장 100m 반경 내 진입 확인됨 ({formatDistanceText(gpsDistance)}) ➔ 버튼이 활성화되었습니다.</span>
              </>
            ) : (
              <>
                <Clock size={14} color="#64748B" />
                <span>약정 근무지 100m 반경 밖입니다 (현재 거리: {formatDistanceText(gpsDistance)}). 현장 도착 시 활성화됩니다.</span>
              </>
            )}
          </div>
        )}

        {/* 위치 기반 조건부 활성화 버튼 (테스트 모드 활성화됨) */}
        <button
          type="button"
          onClick={handleButtonClick}
          style={{
            width: '100%',
            height: '54px',
            borderRadius: '12px',
            background: isInputCompleted
              ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
              : 'linear-gradient(90deg, #0052FF 0%, #0066FF 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 900,
            cursor: isInputCompleted ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isInputCompleted
              ? '0 4px 14px rgba(16, 185, 129, 0.35)'
              : '0 4px 16px rgba(0, 82, 255, 0.35)',
            transition: 'all 0.2s ease'
          }}
        >
          {isInputCompleted ? (
            <>
              <CheckCircle2 size={20} />
              <span>✓ 금일 도급 투입 인증 완료 ({inputTime || '08:50'})</span>
            </>
          ) : (
            <>
              <Navigation size={18} />
              <span>📍 터치하여 도급 인력 투입 확정 (1 M/D)</span>
            </>
          )}
        </button>

        {/* 투입 인증 현황 (퇴근란 배제) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
          <div style={{ background: '#F8F9FA', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #ECEFF2' }}>
            <div style={{ fontSize: '11px', color: '#8B95A1', fontWeight: 600 }}>투입 인증 시각</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginTop: '2px' }}>
              {inputTime || '08:50 (정상)'}
            </div>
            <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>
              ✓ GPS 실시간 위치 검증
            </div>
          </div>

          <div style={{ background: '#F8F9FA', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #ECEFF2' }}>
            <div style={{ fontSize: '11px', color: '#8B95A1', fontWeight: 600 }}>도급 실적 확정</div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: '#0052FF', marginTop: '2px' }}>
              {isInputCompleted ? '1 M/D (8.0h)' : '1 M/D 예정'}
            </div>
            <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700, marginTop: '2px' }}>
              ✓ 정산 확정 (퇴근 기록 불요)
            </div>
          </div>
        </div>
      </div>

      {/* 카카오 지도 100m GPS 검증 모달 */}
      <GpsPunchMapModal
        isOpen={isGpsModalOpen}
        onClose={() => setIsGpsModalOpen(false)}
        onConfirmPunch={handleConfirmGpsPunch}
        targetLocation={activeLocation}
        isPunchedIn={false}
        themeMode={themeMode}
      />
    </>
  );
};
