import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const locName = location ? location.name.replace('[좌표] ', '') : 'KT IDC';
  const locAddress = location ? location.address : '서울 영등포구 여의대로 14 KT여의도타워';
  const targetLat = location?.lat || 37.5255;
  const targetLng = location?.lng || 126.9242;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 기존 맵 인스턴스가 있다면 정리
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // 1. Leaflet 지도 생성
      const map = L.map(mapContainerRef.current, {
        center: [targetLat, targetLng],
        zoom: 16,
        zoomControl: false,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // 2. 고해상도 지도 타일 레이어 (OpenStreetMap / CartoDB Voyager 밝은 테마)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // 3. 커스텀 마커 아이콘 생성
      const customIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
            filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
          ">
            <div style="
              background: #0052FF;
              color: #FFFFFF;
              padding: 5px 10px;
              border-radius: 8px;
              font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
              font-size: 11.5px;
              font-weight: 800;
              white-space: nowrap;
              border: 1.5px solid #FFFFFF;
              box-shadow: 0 2px 8px rgba(0,82,255,0.4);
              margin-bottom: 4px;
            ">
              📍 ${locName}
            </div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      // 4. 마커 및 100m 지오펜스 반경 원 추가
      L.marker([targetLat, targetLng], { icon: customIcon }).addTo(map);

      L.circle([targetLat, targetLng], {
        radius: 100, // 100m
        color: '#0052FF',
        weight: 2,
        dashArray: '5, 6',
        fillColor: '#0052FF',
        fillOpacity: 0.18
      }).addTo(map);

      // 지도 렌더링 갱신
      setTimeout(() => {
        map.invalidateSize();
      }, 150);

    } catch (err) {
      console.warn('Map initialization error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [targetLat, targetLng, locName]);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 도급 투입 장소) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF',
        gap: '14px'
      }}>
        <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>도급 투입 장소</span>
      </div>

      {/* 2. 기본 정보 3개 행 */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={infoRowStyle}>
          <span style={labelStyle}>약정 도급 장소명</span>
          <span style={valueStyle}>{locName}</span>
        </div>

        <div style={infoRowStyle}>
          <span style={labelStyle}>도급 수행지 주소</span>
          <span style={valueStyle}>{locAddress}</span>
        </div>

        <div style={infoRowStyle}>
          <span style={labelStyle}>투입 인증 수단</span>
          <span style={valueStyle}>카카오 맵 GPS 좌표</span>
        </div>
      </div>

      {/* 3. 좌표 섹션 헤더 */}
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

      {/* GPS 좌표값 표시 행 */}
      <div style={infoRowStyle}>
        <span style={labelStyle}>GPS 위경도 좌표</span>
        <span style={{ ...valueStyle, fontFamily: 'monospace', color: '#0052FF', fontWeight: 700 }}>
          {targetLat.toFixed(6)}, {targetLng.toFixed(6)}
        </span>
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
        <span style={{ ...valueStyle, fontWeight: 700, color: '#0F172A' }}>100m (정밀 지오펜스)</span>
      </div>

      {/* 4. 실제 인터랙티브 지도 렌더링 컨테이너 */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '280px',
        background: '#F1F5F9',
        overflow: 'hidden',
        borderBottom: '1px solid #ECEFF2'
      }}>
        {/* 실제 인터랙티브 지도 DOM */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

        {/* 축척 및 안내 로고 표시 */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.92)',
          padding: '3px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 700,
          color: '#475569',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          zIndex: 10
        }}>
          ━ 50m | GPS Geofence Map
        </div>
      </div>

      {/* 5. 메모 섹션 */}
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
        fontSize: '14.5px',
        fontWeight: 700,
        color: '#191F28',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div>금융본부, 카드IS팀</div>
        <div style={{ fontSize: '12.5px', fontWeight: 500, color: '#64748B' }}>
          약정된 도급수행지 반경 100m 이내에서만 출퇴근 인증이 가능합니다.
        </div>
      </div>
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
  width: '120px'
};

const valueStyle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 600,
  color: '#191F28',
  textAlign: 'right',
  flex: 1
};
