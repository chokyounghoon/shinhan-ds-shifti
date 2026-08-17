import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MapPin, Navigation, Layers } from 'lucide-react';
import L from 'leaflet';
import { WorkLocation } from './WorkLocationSelectView';

declare global {
  interface Window {
    kakao: any;
  }
}

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
  const kakaoMapRef = useRef<any>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [mapType, setMapType] = useState<'ROADMAP' | 'SKYVIEW'>('ROADMAP');
  const [isKakaoActive, setIsKakaoActive] = useState<boolean>(true);

  const locName = location ? location.name.replace('[좌표] ', '') : '파인에비뉴(카드)';
  const locAddress = location ? location.address : '서울 중구 을지로 100 파인에비뉴';
  const targetLat = location?.lat || 37.5663;
  const targetLng = location?.lng || 126.9890;
  // 각 도급지별 인근 지하철역 및 주요 랜드마크 정보
  const nearbyLandmarks: { [key: string]: { name: string; type: 'SUBWAY' | 'BUILDING'; lat: number; lng: number; tag: string }[] } = {
    '파인에비뉴(카드)': [
      { name: '을지로3가역 12번출구', type: 'SUBWAY', lat: 37.5662, lng: 126.9897, tag: '2호선·3호선' },
      { name: '을지로3가역 11번출구', type: 'SUBWAY', lat: 37.5661, lng: 126.9888, tag: '2호선·3호선' },
      { name: '파인에비뉴 B동', type: 'BUILDING', lat: 37.5665, lng: 126.9889, tag: '신한카드' },
      { name: 'IBK기업은행 본점', type: 'BUILDING', lat: 37.5668, lng: 126.9875, tag: '금융본부' }
    ],
    'KT IDC': [
      { name: '여의도역 5번출구', type: 'SUBWAY', lat: 37.5218, lng: 126.9240, tag: '5호선·9호선' },
      { name: 'KT여의도타워', type: 'BUILDING', lat: 37.5255, lng: 126.9242, tag: 'KT IDC' },
      { name: '여의도공원', type: 'BUILDING', lat: 37.5270, lng: 126.9220, tag: '공원' }
    ],
    '그레이츠 청계': [
      { name: '종각역 4번출구', type: 'SUBWAY', lat: 37.5698, lng: 126.9835, tag: '1호선' },
      { name: '을지로입구역 2번출구', type: 'SUBWAY', lat: 37.5660, lng: 126.9820, tag: '2호선' },
      { name: '그레이츠청계 빌딩', type: 'BUILDING', lat: 37.5685, lng: 126.9840, tag: '도급사업장' }
    ],
    '광교 IDC': [
      { name: '상현역 1번출구', type: 'SUBWAY', lat: 37.2975, lng: 127.0690, tag: '신분당선' },
      { name: '광교신한IDC센터', type: 'BUILDING', lat: 37.2985, lng: 127.0710, tag: '전산센터' }
    ]
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 기존 맵 정리
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    mapContainerRef.current.innerHTML = '';

    try {
      // 1. Leaflet 고배율 상세 지도 인스턴스 생성 (18.5 레벨로 초근접 뷰)
      const map = L.map(mapContainerRef.current, {
        center: [targetLat, targetLng],
        zoom: 18,
        minZoom: 14,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        touchZoom: true,
        doubleClickZoom: true
      });

      leafletMapRef.current = map;

      // 2. OpenStreetMap & CartoDB 레티나 고해상도 타일 레이어
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png', {
        maxZoom: 20,
        maxNativeZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // 3. 약정 도급지 메인 핀 마커
      const mainPinIcon = L.divIcon({
        className: 'custom-main-pin',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
            filter: drop-shadow(0 4px 12px rgba(0,82,255,0.45));
            cursor: pointer;
            z-index: 50;
          ">
            <div style="
              background: #0052FF;
              color: #FFFFFF;
              padding: 6px 14px;
              border-radius: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
              font-size: 12px;
              font-weight: 800;
              white-space: nowrap;
              border: 2px solid #FFFFFF;
              box-shadow: 0 4px 12px rgba(0,82,255,0.5);
              margin-bottom: 4px;
              display: flex;
              align-items: center;
              gap: 5px;
            ">
              <span>📍</span> <span>${locName}</span>
              <span style="background: rgba(255,255,255,0.25); padding: 1px 6px; border-radius: 10px; font-size: 10px;">100m</span>
            </div>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.8">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
            </svg>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      });

      L.marker([targetLat, targetLng], { icon: mainPinIcon }).addTo(map);

      // 4. 100m 지오펜스 반경 원 표시
      L.circle([targetLat, targetLng], {
        radius: 100, // 100m
        color: '#0052FF',
        weight: 2.5,
        dashArray: '6, 6',
        fillColor: '#0052FF',
        fillOpacity: 0.16
      }).addTo(map);

      // 5. 주변 지하철역 및 주요 빌딩 랜드마크 마커 자동 오버레이
      const currentLandmarks = nearbyLandmarks[locName] || nearbyLandmarks['파인에비뉴(카드)'];
      currentLandmarks.forEach((lm) => {
        const isSubway = lm.type === 'SUBWAY';
        const lmIcon = L.divIcon({
          className: 'landmark-pin',
          html: `
            <div style="
              display: flex;
              align-items: center;
              gap: 4px;
              background: ${isSubway ? '#059669' : '#334155'};
              color: #FFFFFF;
              padding: 3px 8px;
              border-radius: 14px;
              font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
              font-size: 10.5px;
              font-weight: 700;
              white-space: nowrap;
              border: 1.5px solid #FFFFFF;
              box-shadow: 0 2px 6px rgba(0,0,0,0.25);
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              <span>${isSubway ? '🚇' : '🏢'}</span>
              <span>${lm.name}</span>
              <span style="font-size: 9px; opacity: 0.85; background: rgba(255,255,255,0.2); padding: 1px 4px; border-radius: 4px;">${lm.tag}</span>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        L.marker([lm.lat, lm.lng], { icon: lmIcon }).addTo(map);
      });

      // 리사이즈 보정
      setTimeout(() => {
        map.invalidateSize();
      }, 150);

    } catch (err) {
      console.warn('Map initialization error:', err);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [targetLat, targetLng, locName]);

  // 줌인 (+)
  const handleZoomIn = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    }
  };

  // 줌아웃 (-)
  const handleZoomOut = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
    }
  };

  // 중심 위치 복귀
  const handleResetCenter = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([targetLat, targetLng], 18, { animate: true });
    }
  };

  // 일반지도 / 위성사진 레이어 전환
  const handleToggleMapType = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          leafletMapRef.current?.removeLayer(layer);
        }
      });

      if (mapType === 'ROADMAP') {
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19
        }).addTo(leafletMapRef.current);
        setMapType('SKYVIEW');
      } else {
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png', {
          maxZoom: 20,
          subdomains: 'abcd'
        }).addTo(leafletMapRef.current);
        setMapType('ROADMAP');
      }
    }
  };

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
        height: '300px',
        background: '#F1F5F9',
        overflow: 'hidden',
        borderBottom: '1px solid #ECEFF2'
      }}>
        {/* 실제 인터랙티브 지도 DOM */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

        {/* 인터랙티브 줌 컨트롤 (+, -) & 센터 복귀 & 스카이뷰 전환 버튼 */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 10
        }}>
          <button
            type="button"
            onClick={handleZoomIn}
            aria-label="지도 확대"
            title="지도 확대 (건물/지하철역 POI 상세 보기)"
            style={{
              width: '36px',
              height: '36px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              fontSize: '20px',
              fontWeight: 800,
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            +
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            aria-label="지도 축소"
            title="지도 축소"
            style={{
              width: '36px',
              height: '36px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              fontSize: '20px',
              fontWeight: 800,
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            −
          </button>
          <button
            type="button"
            onClick={handleResetCenter}
            aria-label="중심 위치로 이동"
            title="약정 도급지 중심으로 이동"
            style={{
              width: '36px',
              height: '36px',
              background: '#0052FF',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,82,255,0.35)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Navigation size={17} />
          </button>
          {isKakaoActive && (
            <button
              type="button"
              onClick={handleToggleMapType}
              aria-label="지도/위성사진 전환"
              title="지도 / 스카이뷰(위성사진) 전환"
              style={{
                width: '36px',
                height: '36px',
                background: mapType === 'SKYVIEW' ? '#0F172A' : '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                color: mapType === 'SKYVIEW' ? '#F8FAFC' : '#334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Layers size={16} />
            </button>
          )}
        </div>

        {/* 축척 및 안내 로고 표시 */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '10px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '4px 9px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#1E293B',
          boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{ color: '#0052FF', fontWeight: 800 }}>● GPS Geofence</span>
          <span style={{ color: '#94A3B8' }}>|</span>
          <span>100m 약정구역</span>
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
