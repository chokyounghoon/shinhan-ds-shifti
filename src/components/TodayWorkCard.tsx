import React, { useState } from 'react';
import { dbService } from '../services/db';
import { WorkLocation, defaultWorkLocations } from '../views/WorkLocationSelectView';
import { ShieldCheck, MapPin, Clock, CheckCircle2, Navigation } from 'lucide-react';
import { GpsPunchMapModal } from './GpsPunchMapModal';

interface TodayWorkCardProps {
  onOpenRequest: () => void;
  onOpenNoScheduleModal: () => void;
  selectedLocation?: WorkLocation;
  hasScheduleToday?: boolean;
  themeMode: 'ddangyo' | 'shinhan';
  onLogUpdated: () => void;
}

export const TodayWorkCard: React.FC<TodayWorkCardProps> = ({
  onOpenRequest,
  onOpenNoScheduleModal,
  selectedLocation,
  hasScheduleToday = true,
  themeMode,
  onLogUpdated
}) => {
  const [isInputStarted, setIsInputStarted] = useState(false);
  const [inputStartTime, setInputStartTime] = useState<string | null>(null);
  const [inputEndTime, setInputEndTime] = useState<string | null>(null);
  const [verifiedDistance, setVerifiedDistance] = useState<number | null>(null);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);

  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  const activeLocation: WorkLocation = selectedLocation || defaultWorkLocations[0];
  const targetName = activeLocation.name.replace('[좌표] ', '');

  // 1. 투입 시작 버튼 클릭 시 -> 카카오 지도 100m GPS 검증 모달 열기
  const handleOpenGpsVerification = () => {
    setIsGpsModalOpen(true);
  };

  // 2. 100m 이내 확인 후 최종 투입 확정
  const handleConfirmGpsPunch = (dist: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setVerifiedDistance(dist);

    if (!isInputStarted) {
      setIsInputStarted(true);
      setInputStartTime(timeStr);
      dbService.addCommuteLog('투입시작', timeStr);
      onLogUpdated();
      alert(`🎉 [${targetName}] 도급 인력 투입이 개시되었습니다.\n• 투입 시각: ${timeStr}\n• GPS 인증 거리: ${dist}m (100m 이내 검증 완료)\n• 상태: 도급 공정 수행 중`);
    } else {
      setIsInputStarted(false);
      setInputEndTime(timeStr);
      dbService.addCommuteLog('투입종료', timeStr);
      onLogUpdated();
      alert(`🏁 [${targetName}] 일일 도급 투입이 종료되었습니다.\n• 투입 완료 시각: ${timeStr}\n• 실투입 공수: 8.0h가 협력사 관리자 확인 큐로 전송되었습니다.`);
    }
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
              <span>도급 인력 투입 확인 시스템</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#191F28', margin: 0 }}>
              오늘 도급 투입 실적 ({month}월 {date}일, {dayName})
            </h2>
          </div>

          <div style={{
            background: isInputStarted ? '#E8F5E9' : '#F4F6F8',
            color: isInputStarted ? '#2E7D32' : '#6B7684',
            fontSize: '11.5px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isInputStarted ? <CheckCircle2 size={13} color="#2E7D32" /> : <Clock size={13} />}
            <span>{isInputStarted ? '공정 투입 중' : '투입 대기'}</span>
          </div>
        </div>

        {/* 도급 수행 장소 & 100m GPS 인증 배지 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12.5px',
          color: '#4E5968',
          marginBottom: '14px',
          background: '#F9FAFB',
          padding: '8px 12px',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={15} color="#0052FF" />
            <span>약정 도급 장소: <strong>{targetName}</strong></span>
          </div>

          <span style={{ fontSize: '11px', color: '#0052FF', fontWeight: 800, background: 'rgba(0,82,255,0.08)', padding: '2px 6px', borderRadius: '4px' }}>
            GPS 반경 100m 검증
          </span>
        </div>

        {/* 투입 개시 / 종료 버튼 (클릭 시 카카오 맵 100m GPS 검증 팝업) */}
        <button
          type="button"
          onClick={handleOpenGpsVerification}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '12px',
            background: isInputStarted 
              ? 'linear-gradient(90deg, #E53935 0%, #D32F2F 100%)' 
              : 'linear-gradient(90deg, #0052FF 0%, #0066FF 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isInputStarted 
              ? '0 4px 14px rgba(229, 57, 53, 0.35)' 
              : '0 4px 14px rgba(0, 82, 255, 0.35)',
            transition: 'all 0.15s ease'
          }}
        >
          <Navigation size={18} />
          <span>{isInputStarted ? '일일 투입 종료 (카카오 맵 위치 확인)' : '일일 투입 시작 (카카오 맵 100m 위치 확인)'}</span>
        </button>

        {/* 투입 시간 현황 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
          <div style={{ background: '#F8F9FA', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #ECEFF2' }}>
            <div style={{ fontSize: '11px', color: '#8B95A1', fontWeight: 600 }}>투입 시작 시각</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginTop: '2px' }}>
              {inputStartTime || '08:50 (정상)'}
            </div>
            {verifiedDistance !== null && (
              <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>
                ✓ GPS {verifiedDistance}m 인증
              </div>
            )}
          </div>

          <div style={{ background: '#F8F9FA', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #ECEFF2' }}>
            <div style={{ fontSize: '11px', color: '#8B95A1', fontWeight: 600 }}>투입 종료 예정/완료</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginTop: '2px' }}>
              {inputEndTime || '18:00 (8.0h)'}
            </div>
          </div>
        </div>

        {/* 법적 방어 고지 배너 */}
        <div style={{
          marginTop: '12px',
          padding: '8px 10px',
          background: '#EFF6FF',
          border: '1px solid #DBEAFE',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#1E40AF',
          lineHeight: 1.4
        }}>
          ※ 근무지 반경 100m 이내 GPS 좌표가 카카오 지도를 통해 실시간 인증된 경우에만 도급 실적이 기록됩니다.
        </div>
      </div>

      {/* 카카오 지도 100m GPS 검증 모달 */}
      <GpsPunchMapModal
        isOpen={isGpsModalOpen}
        onClose={() => setIsGpsModalOpen(false)}
        onConfirmPunch={handleConfirmGpsPunch}
        targetLocation={activeLocation}
        isPunchedIn={isInputStarted}
        themeMode={themeMode}
      />
    </>
  );
};
