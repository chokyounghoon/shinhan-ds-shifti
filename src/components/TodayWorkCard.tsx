import React, { useState } from 'react';
import { dbService } from '../services/db';
import { WorkLocation, defaultWorkLocations } from '../views/WorkLocationSelectView';
import { ShieldCheck, MapPin, CheckCircle2, Navigation, Clock } from 'lucide-react';
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
  const [isInputCompleted, setIsInputCompleted] = useState(false);
  const [inputTime, setInputTime] = useState<string | null>(null);
  const [verifiedDistance, setVerifiedDistance] = useState<number | null>(null);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);

  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  const activeLocation: WorkLocation = selectedLocation || defaultWorkLocations[0];
  const targetName = activeLocation.name.replace('[좌표] ', '');

  // 1. 투입 확인 버튼 클릭 시 -> 카카오 지도 100m GPS 검증 모달 열기
  const handleOpenGpsVerification = () => {
    if (isInputCompleted) {
      alert('✅ 금일 도급 인력 투입(출근)이 이미 정상 인증 완료되었습니다.\n(도급 계약 특성상 퇴근은 별도 기록하지 않습니다.)');
      return;
    }
    setIsGpsModalOpen(true);
  };

  // 2. 100m 이내 확인 후 최종 1회 투입 완료 (퇴근 기록 불필요)
  const handleConfirmGpsPunch = (dist: number) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setVerifiedDistance(dist);
    setIsInputCompleted(true);
    setInputTime(timeStr);
    dbService.addCommuteLog('투입확인', timeStr);
    onLogUpdated();
    alert(`🎉 [${targetName}] 금일 도급 인력 투입이 정상 확인되었습니다.\n• 투입 시각: ${timeStr}\n• GPS 인증 거리: ${dist}m (100m 이내 검증 완료)\n• 인정 실적: 당일 약정 1 M/D (8.0 Man-Hour)\n\n※ 퇴근 시간은 별도 기록하지 않으며, 오늘의 도급 투입 의무가 확정되었습니다.`);
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
              <span>1 M/D 단일 투입 인증 시스템 (퇴근 기록 배제)</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#191F28', margin: 0 }}>
              오늘 도급 투입 실적 ({month}월 {date}일, {dayName})
            </h2>
          </div>

          <div style={{
            background: isInputCompleted ? '#E8F5E9' : '#F4F6F8',
            color: isInputCompleted ? '#2E7D32' : '#6B7684',
            fontSize: '11.5px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isInputCompleted ? <CheckCircle2 size={13} color="#2E7D32" /> : <Clock size={13} />}
            <span>{isInputCompleted ? '투입 완료 (1 M/D)' : '투입 대기'}</span>
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

        {/* 단일 출근(투입) 원액션 버튼 - 퇴근 버튼 완전 삭제 */}
        <button
          type="button"
          onClick={handleOpenGpsVerification}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '12px',
            background: isInputCompleted 
              ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)' 
              : 'linear-gradient(90deg, #0052FF 0%, #0066FF 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '16px',
            fontWeight: 900,
            cursor: isInputCompleted ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isInputCompleted 
              ? '0 4px 14px rgba(16, 185, 129, 0.35)' 
              : '0 4px 14px rgba(0, 82, 255, 0.35)',
            transition: 'all 0.15s ease'
          }}
        >
          {isInputCompleted ? <CheckCircle2 size={20} /> : <Navigation size={18} />}
          <span>
            {isInputCompleted 
              ? `✓ 금일 도급 투입 인증 완료 (${inputTime})` 
              : '일일 투입(출근) 확인 (카카오 맵 GPS 인증)'}
          </span>
        </button>

        {/* 투입 인증 현황 (퇴근란 완전 배제) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
          <div style={{ background: '#F8F9FA', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #ECEFF2' }}>
            <div style={{ fontSize: '11px', color: '#8B95A1', fontWeight: 600 }}>투입 인증 시각</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginTop: '2px' }}>
              {inputTime || '08:50 (정상)'}
            </div>
            {verifiedDistance !== null && (
              <div style={{ fontSize: '10px', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>
                ✓ GPS {verifiedDistance}m 인증
              </div>
            )}
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

        {/* 법적 및 제도적 방어 고지 배너 */}
        <div style={{
          marginTop: '12px',
          padding: '10px 12px',
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#166534',
          lineHeight: 1.45
        }}>
          💡 <strong>도급 계약 관리 원칙</strong>: 본 시스템은 원청의 개별 근로시간 지휘·감독을 배제하기 위해 <strong>퇴근 시간을 기록하지 않으며</strong>, 지정 사업장 내 <strong>정상 투입 여부(1 M/D)</strong>만을 단일 검증합니다.
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
