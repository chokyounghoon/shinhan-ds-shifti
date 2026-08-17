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

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 기존 맵 정리
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    mapContainerRef.current.innerHTML = '';

    // 1. 카카오 지도 SDK 초기화 시도
    const initKakaoMap = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!mapContainerRef.current) return;

          const center = new window.kakao.maps.LatLng(targetLat, targetLng);
          const options = {
            center: center,
            level: 3 // 카카오맵 3레벨 (건물명, 지하철역 출구, 상호명 상세 뷰)
          };

          const map = new window.kakao.maps.Map(mapContainerRef.current, options);
          kakaoMapRef.current = map;
          setIsKakaoActive(true);

          // 100m 지오펜스 반경 원 표시
          const circle = new window.kakao.maps.Circle({
            center: center,
            radius: 100, // 100m
            strokeWeight: 2.5,
            strokeColor: '#0052FF',
            strokeOpacity: 0.85,
            strokeStyle: 'dashed',
            fillColor: '#0052FF',
            fillOpacity: 0.16
          });
          circle.setMap(map);

          // 커스텀 오버레이 마커 핀
          const content = document.createElement('div');
          content.innerHTML = `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              transform: translate(-50%, -100%);
              filter: drop-shadow(0 4px 10px rgba(0,0,0,0.35));
              cursor: pointer;
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
                box-shadow: 0 4px 12px rgba(0,82,255,0.45);
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
          `;

          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: center,
            content: content,
            yAnchor: 1
          });
          customOverlay.setMap(map);

          // 지도 렌더링 리사이즈 보정
          setTimeout(() => {
            map.relayout();
            map.setCenter(center);
          }, 200);
        });
        return true;
      }
      return false;
    };

    // 2. 카카오맵 SDK 로드 대기 및 실행
    if (!initKakaoMap()) {
      // SDK가 아직 준비되지 않았다면 잠시 후 재시도
      const timer = setTimeout(() => {
        if (!initKakaoMap()) {
          // 카카오맵 로드 실패 시 고해상도 Leaflet 타일맵으로 자동 폴백
          initLeafletFallback();
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    // 폴백 Leaflet 맵
    const initLeafletFallback = () => {
      if (!mapContainerRef.current) return;
      setIsKakaoActive(false);
      try {
        const map = L.map(mapContainerRef.current, {
          center: [targetLat, targetLng],
          zoom: 18,
          maxZoom: 20,
          zoomControl: false,
          attributionControl: false
        });
        leafletMapRef.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png', {
          maxZoom: 20,
          subdomains: 'abcd'
        }).addTo(map);

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%);">
              <div style="background: #0052FF; color: #FFFFFF; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 800; border: 2px solid #FFFFFF; margin-bottom: 4px;">
                📍 ${locName}
              </div>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.8">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
              </svg>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0]
        });

        L.marker([targetLat, targetLng], { icon: customIcon }).addTo(map);
        L.circle([targetLat, targetLng], { radius: 100, color: '#0052FF', weight: 2.5, dashArray: '6, 6', fillColor: '#0052FF', fillOpacity: 0.16 }).addTo(map);
        setTimeout(() => map.invalidateSize(), 200);
      } catch (e) {
        console.warn('Leaflet fallback error:', e);
      }
    };

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [targetLat, targetLng, locName]);

  // 줌인 (+)
  const handleZoomIn = () => {
    if (kakaoMapRef.current && window.kakao && window.kakao.maps) {
      const level = kakaoMapRef.current.getLevel();
      if (level > 1) {
        kakaoMapRef.current.setLevel(level - 1, { animate: true });
      }
    } else if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    }
  };

  // 줌아웃 (-)
  const handleZoomOut = () => {
    if (kakaoMapRef.current && window.kakao && window.kakao.maps) {
      const level = kakaoMapRef.current.getLevel();
      if (level < 14) {
        kakaoMapRef.current.setLevel(level + 1, { animate: true });
      }
    } else if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
    }
  };

  // 중심 위치 복귀
  const handleResetCenter = () => {
    if (kakaoMapRef.current && window.kakao && window.kakao.maps) {
      const center = new window.kakao.maps.LatLng(targetLat, targetLng);
      kakaoMapRef.current.setLevel(3, { animate: true });
      kakaoMapRef.current.panTo(center);
    } else if (leafletMapRef.current) {
      leafletMapRef.current.setView([targetLat, targetLng], 18, { animate: true });
    }
  };

  // 일반지도 / 스카이뷰 위성사진 전환
  const handleToggleMapType = () => {
    if (kakaoMapRef.current && window.kakao && window.kakao.maps) {
      if (mapType === 'ROADMAP') {
        kakaoMapRef.current.setMapTypeId(window.kakao.maps.MapTypeId.HYBRID);
        setMapType('SKYVIEW');
      } else {
        kakaoMapRef.current.setMapTypeId(window.kakao.maps.MapTypeId.ROADMAP);
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
          <span style={{ color: '#0052FF', fontWeight: 800 }}>● Kakao Map</span>
          <span style={{ color: '#94A3B8' }}>|</span>
          <span>100m Geofence</span>
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
