import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: location?.lat || 37.5255,
    lng: location?.lng || 126.9242
  });

  const locName = location ? location.name.replace('[좌표] ', '') : 'KT IDC';
  const locAddress = location ? location.address : '서울 영등포구 여의대로 14 KT여의도타워';

  useEffect(() => {
    let lat = location?.lat || 37.5255;
    let lng = location?.lng || 126.9242;

    const initMap = (targetLat: number, targetLng: number) => {
      if (!mapContainerRef.current) return;
      if (!window.kakao || !window.kakao.maps) {
        setMapLoaded(false);
        return;
      }

      window.kakao.maps.load(() => {
        if (!mapContainerRef.current) return;
        const center = new window.kakao.maps.LatLng(targetLat, targetLng);
        const options = {
          center: center,
          level: 4
        };

        const map = new window.kakao.maps.Map(mapContainerRef.current, options);

        // 1. 마커 표시
        const marker = new window.kakao.maps.Marker({
          position: center,
          map: map
        });

        // 2. 100m 지오펜스 반경 원 표시
        const circle = new window.kakao.maps.Circle({
          center: center,
          radius: 100, // 100m
          strokeWeight: 2,
          strokeColor: '#0052FF',
          strokeOpacity: 0.8,
          strokeStyle: 'dashed',
          fillColor: '#0052FF',
          fillOpacity: 0.15
        });
        circle.setMap(map);

        // 3. 커스텀 인포윈도우 / 오버레이 표시
        const content = `
          <div style="
            background: #FFFFFF;
            padding: 6px 12px;
            border-radius: 8px;
            border: 1px solid #CBD5E1;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            font-family: 'Pretendard', sans-serif;
            font-size: 11.5px;
            font-weight: 800;
            color: #0F172A;
            text-align: center;
            transform: translateY(-45px);
            white-space: nowrap;
          ">
            <span>📍 ${locName}</span>
            <div style="font-size: 9.5px; color: #0052FF; font-weight: 700; margin-top: 2px;">인증 반경 100m</div>
          </div>
        `;

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: center,
          content: content,
          yAnchor: 1
        });
        customOverlay.setMap(map);

        setMapLoaded(true);
      });
    };

    // 카카오 지오코더로 주소 기반 정밀 위경도 확인 (있을 경우)
    if (window.kakao && window.kakao.maps && window.kakao.maps.services && locAddress) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(locAddress, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK && result && result.length > 0) {
          const exactLat = parseFloat(result[0].y);
          const exactLng = parseFloat(result[0].x);
          setCurrentCoords({ lat: exactLat, lng: exactLng });
          initMap(exactLat, exactLng);
        } else {
          setCurrentCoords({ lat, lng });
          initMap(lat, lng);
        }
      });
    } else {
      setCurrentCoords({ lat, lng });
      initMap(lat, lng);
    }
  }, [location, locAddress, locName]);

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
          {currentCoords.lat.toFixed(6)}, {currentCoords.lng.toFixed(6)}
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

      {/* 4. 실제 카카오 지도 렌더링 컨테이너 */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '280px',
        background: '#E8ECEF',
        overflow: 'hidden',
        borderBottom: '1px solid #ECEFF2'
      }}>
        {/* 실제 카카오 지도 DOM */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        {/* 카카오맵 SDK 로딩 전 또는 폴백 인터랙티브 그래픽 */}
        {!mapLoaded && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: '#EEF2F6',
            backgroundImage: `
              linear-gradient(#D8DCE3 1px, transparent 1px),
              linear-gradient(90deg, #D8DCE3 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* 100m 지오펜스 반경 원 */}
            <div style={{
              position: 'absolute',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'rgba(0, 82, 255, 0.12)',
              border: '2px dashed #0052FF'
            }} />

            {/* 마커 핀 */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transform: 'translateY(-12px)'
            }}>
              <div style={{
                background: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                fontSize: '12px',
                fontWeight: 800,
                color: '#0F172A',
                marginBottom: '6px'
              }}>
                📍 {locName}
              </div>
              <MapPin size={34} color="#EF4444" fill="#EF4444" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }} />
            </div>

            {/* 축척 및 카카오 맵 로고 표시 */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              left: '10px',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 700,
              color: '#475569',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              ━ 50m | Kakao Map GPS
            </div>
          </div>
        )}
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
