import React from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { WorkLocation } from './WorkLocationSelectView';

interface WorkLocationDetailViewProps {
  location: WorkLocation | null;
  onBack: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const WorkLocationDetailView: React.FC<WorkLocationDetailViewProps> = ({
  location,
  onBack,
  themeMode
}) => {
  const locName = location ? location.name.replace('[좌표] ', '') : '파인에비뉴(카드)';
  const locAddress = location ? location.address : '서울 중구 을지로 100 파인에비뉴';

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 출퇴근 장소) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        gap: '14px'
      }}>
        <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>출퇴근 장소</span>
      </div>

      {/* 2. 기본 정보 3개 행 (스크린샷 일치) */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={infoRowStyle}>
          <span style={labelStyle}>출퇴근 장소명</span>
          <span style={valueStyle}>{locName}</span>
        </div>

        <div style={infoRowStyle}>
          <span style={labelStyle}>근무지 주소</span>
          <span style={valueStyle}>{locAddress}</span>
        </div>

        <div style={infoRowStyle}>
          <span style={labelStyle}>출퇴근 수단</span>
          <span style={valueStyle}>좌표</span>
        </div>
      </div>

      {/* 3. 좌표 섹션 헤더 & 반경 */}
      <div style={{
        background: '#F8F9FA',
        padding: '12px 18px 8px 18px',
        fontSize: '13px',
        fontWeight: 800,
        color: '#4E5968',
        borderTop: '1px solid #ECEFF2',
        borderBottom: '1px solid #ECEFF2'
      }}>
        좌표
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <span style={labelStyle}>좌표 반경</span>
        <span style={valueStyle}>100m</span>
      </div>

      {/* 4. 좌표 지도 시각화 (Geofence 반경 원 및 핀) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '240px',
        background: '#E8ECEF',
        overflow: 'hidden',
        borderBottom: '1px solid #ECEFF2'
      }}>
        {/* 지도 배경 그래픽 / 일러스트레이션 맵 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: '#E6E9EE',
          backgroundImage: `
            linear-gradient(#D8DCE3 1px, transparent 1px),
            linear-gradient(90deg, #D8DCE3 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}>
          {/* 주변 블록 및 도로 시뮬레이션 */}
          <div style={{ position: 'absolute', top: '15px', left: '10px', width: '90px', height: '60px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid #D0D5DD', padding: '6px', fontSize: '9px', color: '#4E5968', fontWeight: 600 }}>
            IBK 기업은행
          </div>

          <div style={{ position: 'absolute', bottom: '15px', left: '10px', width: '100px', height: '50px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid #D0D5DD', padding: '6px', fontSize: '9px', color: '#4E5968', fontWeight: 600 }}>
            서울YWCA 스포츠센터
          </div>

          <div style={{ position: 'absolute', top: '10px', right: '15px', width: '90px', height: '55px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid #D0D5DD', padding: '6px', fontSize: '9px', color: '#4E5968', fontWeight: 600 }}>
            을지로3가역
          </div>

          <div style={{ position: 'absolute', bottom: '20px', right: '15px', width: '85px', height: '55px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid #D0D5DD', padding: '6px', fontSize: '9px', color: '#4E5968', fontWeight: 600 }}>
            조선호텔 명동
          </div>

          {/* 중앙 근무지 빌딩 박스 */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120px',
            height: '90px',
            background: '#FFFFFF',
            borderRadius: '6px',
            border: '1.5px solid #BAC4D0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#191F28' }}>신한카드 본사</span>
            <span style={{ fontSize: '9px', color: '#8B95A1', marginTop: '2px' }}>{locName}</span>
          </div>

          {/* 100m 지오펜스(Geofence) 반경 원 */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: 'rgba(0, 70, 255, 0.12)',
            border: '1.5px dashed #0046FF',
            pointerEvents: 'none'
          }} />

          {/* 중심 위치 마커 핀 */}
          <div style={{
            position: 'absolute',
            top: '44%',
            left: '50%',
            transform: 'translate(-50%, -100%)',
            color: '#F04438',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            animation: 'bouncePin 1.5s infinite ease-in-out'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#F04438" stroke="#B42318" strokeWidth="1">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>

          {/* 축척 및 카카오 맵 로고 표시 */}
          <div style={{
            position: 'absolute',
            bottom: '6px',
            left: '8px',
            background: 'rgba(255, 255, 255, 0.85)',
            padding: '2px 6px',
            borderRadius: '3px',
            fontSize: '9px',
            fontWeight: 700,
            color: '#4E5968'
          }}>
            ━ 50m | kakao
          </div>
        </div>
      </div>

      {/* 5. 메모 섹션 (스크린샷 일치) */}
      <div style={{
        background: '#F8F9FA',
        padding: '12px 18px 8px 18px',
        fontSize: '13px',
        fontWeight: 800,
        color: '#4E5968',
        borderBottom: '1px solid #ECEFF2'
      }}>
        메모
      </div>

      <div style={{
        padding: '16px 18px 80px 18px',
        fontSize: '15px',
        fontWeight: 700,
        color: '#191F28',
        background: '#FFFFFF'
      }}>
        금융본부,카드IS팀
      </div>

      <style>{`
        @keyframes bouncePin {
          0%, 100% { transform: translate(-50%, -100%); }
          50% { transform: translate(-50%, -115%); }
        }
      `}</style>
    </div>
  );
};

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 18px',
  borderBottom: '1px solid #ECEFF2',
  background: '#FFFFFF'
};

const labelStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#191F28',
  width: '100px'
};

const valueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#191F28',
  textAlign: 'right',
  flex: 1
};
