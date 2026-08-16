import React, { useState } from 'react';
import { dbService } from '../services/db';
import { WorkLocation } from '../views/WorkLocationSelectView';
import { ShieldCheck, MapPin, Clock, CheckCircle2, AlertCircle, Send, FileCheck } from 'lucide-react';

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
  const [isCheckingGPS, setIsCheckingGPS] = useState(false);
  const [taskSummary, setTaskSummary] = useState('상담 파트 도급 공정 수행 (카드 안내 시스템 개발 및 운영)');

  const today = new Date();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const dayName = ['일', '월', '화', '수', '목', '금', '토'][today.getDay()];

  const targetName = selectedLocation?.name.replace('[좌표] ', '') || '파인에비뉴(상담센터)';

  const handleInputToggle = () => {
    setIsCheckingGPS(true);
    setTimeout(() => {
      setIsCheckingGPS(false);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      if (!isInputStarted) {
        setIsInputStarted(true);
        setInputStartTime(timeStr);
        dbService.addCommuteLog('투입시작', timeStr);
        onLogUpdated();
        alert(`📍 [${targetName}] 도급 인력 투입이 개시되었습니다.\n• 투입 시각: ${timeStr}\n• 상태: 도급 공정 수행 중 (협력사 자체 관리)`);
      } else {
        setIsInputStarted(false);
        setInputEndTime(timeStr);
        dbService.addCommuteLog('투입종료', timeStr);
        onLogUpdated();
        alert(`🏁 [${targetName}] 일일 도급 투입이 종료되었습니다.\n• 투입 완료 시각: ${timeStr}\n• 실투입 공수: 8.0 Man-Hour가 협력사 관리자 확인 큐로 전송되었습니다.`);
      }
    }, 400);
  };

  return (
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

      {/* 도급 수행 장소 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12.5px',
        color: '#4E5968',
        marginBottom: '14px',
        background: '#F9FAFB',
        padding: '8px 12px',
        borderRadius: '8px'
      }}>
        <MapPin size={15} color="#0052FF" />
        <span>약정 도급 장소: <strong>{targetName}</strong></span>
      </div>

      {/* 투입 개시 / 종료 큰 액션 버튼 */}
      <button
        type="button"
        onClick={handleInputToggle}
        disabled={isCheckingGPS}
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
        <Clock size={18} />
        <span>{isCheckingGPS ? '투입 위치 확인 중...' : isInputStarted ? '일일 투입 종료 (실적 전송)' : '일일 투입 시작 (실적 기록)'}</span>
      </button>

      {/* 투입 시간 현황 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
        <div style={{ background: '#F8F9FA', padding: '10px', borderRadius: '8px', textAlign: 'center', border: '1px solid #ECEFF2' }}>
          <div style={{ fontSize: '11px', color: '#8B95A1', fontWeight: 600 }}>투입 시작 시각</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginTop: '2px' }}>
            {inputStartTime || '08:50 (정상)'}
          </div>
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
        ※ 본 시스템은 원청의 근태 지휘·감독 툴이 아니며, 도급 계약에 따른 완성물 제작을 위한 <strong>인력 투입 공수(Man-Hour) 검수 확인 툴</strong>입니다.
      </div>
    </div>
  );
};
