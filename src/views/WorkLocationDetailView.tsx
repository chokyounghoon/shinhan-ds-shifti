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
  const [mapType, setMapType] = useState<'ROADMAP' | 'SKYVIEW' | 'TERRAIN'>('ROADMAP');
  const [isKakaoActive, setIsKakaoActive] = useState<boolean>(true);

  const locName = location ? location.name.replace('[좌표] ', '') : '파인에비뉴(카드)';
  const locAddress = location ? location.address : '서울 중구 을지로 100 파인에비뉴';
  const targetLat = location?.lat || 37.5663;
  const targetLng = location?.lng || 126.9890;
  // 각 도급지별 인근 지하철역 및 주요 랜드마크 정보 (정밀 좌표)
  const nearbyLandmarks: { [key: string]: { name: string; type: 'SUBWAY' | 'BUILDING' | 'CAFE'; lat: number; lng: number; tag: string; distance: string }[] } = {
    '파인에비뉴(카드)': [
      { name: '을지로3가역 12번출구', type: 'SUBWAY', lat: 37.5662, lng: 126.9897, tag: '2호선·3호선', distance: '도보 1분 (35m)' },
      { name: '을지로3가역 11번출구', type: 'SUBWAY', lat: 37.5661, lng: 126.9886, tag: '2호선·3호선', distance: '도보 1분 (60m)' },
      { name: '파인에비뉴 B동', type: 'BUILDING', lat: 37.5665, lng: 126.9889, tag: '신한카드 본사', distance: '도급 약정지 (0m)' },
      { name: '파인에비뉴 A동', type: 'BUILDING', lat: 37.5668, lng: 126.9891, tag: '비즈니스센터', distance: '도보 30초 (40m)' },
      { name: 'IBK기업은행 본점', type: 'BUILDING', lat: 37.5668, lng: 126.9875, tag: '금융본부', distance: '도보 2분 (120m)' }
    ],
    'KT IDC': [
      { name: '여의도역 5번출구', type: 'SUBWAY', lat: 37.5218, lng: 126.9240, tag: '5호선·9호선', distance: '도보 3분 (250m)' },
      { name: 'KT여의도타워', type: 'BUILDING', lat: 37.5255, lng: 126.9242, tag: 'KT IDC', distance: '도급 약정지 (0m)' },
      { name: '더현대 서울', type: 'BUILDING', lat: 37.5260, lng: 126.9280, tag: '복합시설', distance: '도보 5분 (400m)' },
      { name: '여의도공원', type: 'BUILDING', lat: 37.5270, lng: 126.9220, tag: '도심공원', distance: '도보 3분 (200m)' }
    ],
    '그레이츠 청계': [
      { name: '종각역 4번출구', type: 'SUBWAY', lat: 37.5698, lng: 126.9835, tag: '1호선', distance: '도보 2분 (150m)' },
      { name: '을지로입구역 2번출구', type: 'SUBWAY', lat: 37.5660, lng: 126.9820, tag: '2호선', distance: '도보 3분 (200m)' },
      { name: '그레이츠청계 빌딩', type: 'BUILDING', lat: 37.5685, lng: 126.9840, tag: '도급사업장', distance: '도급 약정지 (0m)' },
      { name: '청계천 광통교', type: 'BUILDING', lat: 37.5690, lng: 126.9825, tag: '명소', distance: '도보 1분 (80m)' }
    ],
    '광교 IDC': [
      { name: '상현역 1번출구', type: 'SUBWAY', lat: 37.2975, lng: 127.0690, tag: '신분당선', distance: '도보 3분 (200m)' },
      { name: '광교신한IDC센터', type: 'BUILDING', lat: 37.2985, lng: 127.0710, tag: '전산센터', distance: '도급 약정지 (0m)' },
      { name: '광교호수공원', type: 'BUILDING', lat: 37.2880, lng: 127.0650, tag: '명소', distance: '차량 5분' }
    ]
  };

  // 실시간 카카오 API 검색 결과 및 랜드마크 저장
  const [kakaoPlaces, setKakaoPlaces] = useState<{ id: string; name: string; category: string; address: string; distance: string; lat: number; lng: number; phone?: string }[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initKakaoMap = () => {
      if (!window.kakao || !window.kakao.maps) {
        console.warn('Kakao SDK not loaded, retrying...');
        return;
      }

      window.kakao.maps.load(() => {
        if (!mapContainerRef.current) return;
        mapContainerRef.current.innerHTML = '';

        const container = mapContainerRef.current;
        const options = {
          center: new window.kakao.maps.LatLng(targetLat, targetLng),
          level: 3 // 확대 레벨 (건물 및 지하철역 최적 가시성)
        };

        const map = new window.kakao.maps.Map(container, options);
        kakaoMapRef.current = map;
        setIsKakaoActive(true);

        // 1. 도급 약정지 100m 지오펜스 원 생성
        const circle = new window.kakao.maps.Circle({
          center: new window.kakao.maps.LatLng(targetLat, targetLng),
          radius: 100, // 100m
          strokeWeight: 3,
          strokeColor: '#0052FF',
          strokeOpacity: 0.9,
          strokeStyle: 'dash',
          fillColor: '#0052FF',
          fillOpacity: 0.14
        });
        circle.setMap(map);

        // 2. 파인에비뉴(카드) 메인 핀 커스텀 오버레이
        const mainOverlayContent = document.createElement('div');
        mainOverlayContent.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
            filter: drop-shadow(0 4px 12px rgba(0,82,255,0.5));
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
              box-shadow: 0 4px 14px rgba(0,82,255,0.55);
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

        const mainOverlay = new window.kakao.maps.CustomOverlay({
          position: new window.kakao.maps.LatLng(targetLat, targetLng),
          content: mainOverlayContent,
          yAnchor: 1,
          zIndex: 100
        });
        mainOverlay.setMap(map);

        // 3. 카카오 Places API로 실시간 인근 지하철역(SW8) 및 은행/건물 검색 연동
        if (window.kakao.maps.services && window.kakao.maps.services.Places) {
          const places = new window.kakao.maps.services.Places();
          const searchCenter = new window.kakao.maps.LatLng(targetLat, targetLng);

          // 지하철역 검색
          places.categorySearch('SW8', (data: any[], status: any) => {
            if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
              const subwayItems: any[] = [];
              data.slice(0, 3).forEach((item) => {
                const subLat = parseFloat(item.y);
                const subLng = parseFloat(item.x);
                subwayItems.push({
                  id: item.id,
                  name: item.place_name,
                  category: 'SUBWAY',
                  address: item.address_name,
                  distance: `${item.distance}m`,
                  lat: subLat,
                  lng: subLng,
                  phone: item.phone
                });

                // 지하철역 커스텀 오버레이 핀
                const subOverlayEl = document.createElement('div');
                subOverlayEl.innerHTML = `
                  <div style="
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: #059669;
                    color: #FFFFFF;
                    padding: 4px 9px;
                    border-radius: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                    font-size: 11px;
                    font-weight: 800;
                    white-space: nowrap;
                    border: 1.5px solid #FFFFFF;
                    box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                    cursor: pointer;
                  ">
                    <span>🚇</span>
                    <span>${item.place_name}</span>
                    <span style="font-size: 9.5px; opacity: 0.9; background: rgba(255,255,255,0.22); padding: 1px 5px; border-radius: 4px;">${item.distance}m</span>
                  </div>
                `;
                subOverlayEl.onclick = () => {
                  map.panTo(new window.kakao.maps.LatLng(subLat, subLng));
                };

                new window.kakao.maps.CustomOverlay({
                  position: new window.kakao.maps.LatLng(subLat, subLng),
                  content: subOverlayEl,
                  yAnchor: 0.5,
                  zIndex: 50
                }).setMap(map);
              });

              // 주요 빌딩 검색 (은행/공공기관)
              places.keywordSearch('파인에비뉴', (buildingData: any[], bStatus: any) => {
                const buildingItems: any[] = [];
                if (bStatus === window.kakao.maps.services.Status.OK && buildingData.length > 0) {
                  buildingData.slice(0, 2).forEach((bItem) => {
                    const bLat = parseFloat(bItem.y);
                    const bLng = parseFloat(bItem.x);
                    buildingItems.push({
                      id: bItem.id,
                      name: bItem.place_name,
                      category: 'BUILDING',
                      address: bItem.address_name,
                      distance: `${bItem.distance || '0'}m`,
                      lat: bLat,
                      lng: bLng
                    });

                    const bOverlayEl = document.createElement('div');
                    bOverlayEl.innerHTML = `
                      <div style="
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        background: #1E293B;
                        color: #FFFFFF;
                        padding: 4px 9px;
                        border-radius: 16px;
                        font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif;
                        font-size: 11px;
                        font-weight: 800;
                        white-space: nowrap;
                        border: 1.5px solid #FFFFFF;
                        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
                        cursor: pointer;
                      ">
                        <span>🏢</span>
                        <span>${bItem.place_name}</span>
                      </div>
                    `;
                    bOverlayEl.onclick = () => {
                      map.panTo(new window.kakao.maps.LatLng(bLat, bLng));
                    };

                    new window.kakao.maps.CustomOverlay({
                      position: new window.kakao.maps.LatLng(bLat, bLng),
                      content: bOverlayEl,
                      yAnchor: 0.5,
                      zIndex: 40
                    }).setMap(map);
                  });
                }
                setKakaoPlaces([...subwayItems, ...buildingItems]);
              }, { location: searchCenter, radius: 250 });
            }
          }, { location: searchCenter, radius: 400 });
        }
      });
    };

    // Kakao SDK가 로드되어 있는지 체크하고 로드, 없으면 즉시 고해상도 Leaflet 엔진 가동
    if (window.kakao && window.kakao.maps) {
      initKakaoMap();
    } else {
      const checkScript = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkScript);
          initKakaoMap();
        }
      }, 100);

      // 카카오 미지원 또는 빠른 반응을 위해 200ms 내 Leaflet 고해상도 벡터 지도 즉시 렌더
      const timer = setTimeout(() => {
        clearInterval(checkScript);
        if (!kakaoMapRef.current && mapContainerRef.current) {
          initLeafletFallback();
        }
      }, 200);

      return () => {
        clearInterval(checkScript);
        clearTimeout(timer);
      };
    }
  }, [targetLat, targetLng, locName]);

  // Leaflet 고해상도 상세 지도 엔진 (구글 고화질 한국어 레이어: 빌딩 상세 윤곽, 번지수, 등고선, 지하철역, 줌 22 지원)
  const initLeafletFallback = () => {
    if (!mapContainerRef.current || leafletMapRef.current) return;
    mapContainerRef.current.innerHTML = '';
    const map = L.map(mapContainerRef.current, {
      center: [targetLat, targetLng],
      zoom: 18,
      maxZoom: 22,
      zoomControl: false,
      attributionControl: false
    });
    leafletMapRef.current = map;

    // Google Maps 한국어 표준 고화질 타일 (상세 건물 윤곽 및 지번 완벽 표시)
    L.tileLayer('https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=ko', {
      subdomains: ['0', '1', '2', '3'],
      maxZoom: 22,
      maxNativeZoom: 20
    }).addTo(map);

    // 100m 정밀 지오펜스 반경 원
    L.circle([targetLat, targetLng], {
      radius: 100,
      color: '#0052FF',
      weight: 3,
      dashArray: '6, 6',
      fillColor: '#0052FF',
      fillOpacity: 0.12
    }).addTo(map);

    // 메인 도급지 핀 마커 (커스텀 HTML)
    const mainPinIcon = L.divIcon({
      className: 'custom-main-pin',
      html: `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); filter: drop-shadow(0 4px 10px rgba(0,82,255,0.45)); cursor: pointer;">
          <div style="background: #0052FF; color: #FFFFFF; padding: 5px 12px; border-radius: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif; font-size: 11.5px; font-weight: 800; white-space: nowrap; border: 2px solid #FFFFFF; box-shadow: 0 4px 12px rgba(0,82,255,0.5); display: flex; align-items: center; gap: 5px; margin-bottom: 2px;">
            <span>📍</span> <span>${locName}</span>
            <span style="background: rgba(255,255,255,0.25); padding: 1px 5px; border-radius: 8px; font-size: 9.5px;">100m</span>
          </div>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="#EF4444" stroke="#FFFFFF" stroke-width="1.8">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" fill="#FFFFFF" />
          </svg>
        </div>
      `,
      iconSize: [0, 0]
    });
    L.marker([targetLat, targetLng], { icon: mainPinIcon }).addTo(map);

    // 주변 랜드마크 및 전철역 핀 마커
    const landmarks = nearbyLandmarks[locName] || nearbyLandmarks['파인에비뉴(카드)'] || [];
    landmarks.forEach(poi => {
      const isSubway = poi.type === 'SUBWAY';
      const poiIcon = L.divIcon({
        className: 'custom-poi-pin',
        html: `
          <div style="display: flex; align-items: center; gap: 4px; background: ${isSubway ? '#059669' : '#1E293B'}; color: #FFFFFF; padding: 3px 8px; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Pretendard', sans-serif; font-size: 10.5px; font-weight: 800; white-space: nowrap; border: 1.5px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.3); cursor: pointer; transform: translate(-50%, -50%);">
            <span>${isSubway ? '🚇' : '🏢'}</span>
            <span>${poi.name}</span>
          </div>
        `,
        iconSize: [0, 0]
      });
      const marker = L.marker([poi.lat, poi.lng], { icon: poiIcon }).addTo(map);
      marker.on('click', () => {
        map.setView([poi.lat, poi.lng], 19, { animate: true });
      });
    });
  };

  // 줌인 (+)
  const handleZoomIn = () => {
    if (kakaoMapRef.current) {
      const currentLevel = kakaoMapRef.current.getLevel();
      kakaoMapRef.current.setLevel(Math.max(1, currentLevel - 1), { animate: true });
    } else if (leafletMapRef.current) {
      leafletMapRef.current.zoomIn();
    }
  };

  // 줌아웃 (-)
  const handleZoomOut = () => {
    if (kakaoMapRef.current) {
      const currentLevel = kakaoMapRef.current.getLevel();
      kakaoMapRef.current.setLevel(Math.min(14, currentLevel + 1), { animate: true });
    } else if (leafletMapRef.current) {
      leafletMapRef.current.zoomOut();
    }
  };

  // 중심 위치 복귀
  const handleResetCenter = () => {
    if (kakaoMapRef.current && window.kakao?.maps) {
      kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(targetLat, targetLng));
    } else if (leafletMapRef.current) {
      leafletMapRef.current.setView([targetLat, targetLng], 18, { animate: true });
    }
  };

  // 랜드마크 포커스 이동
  const handleFocusLandmark = (lat: number, lng: number) => {
    if (kakaoMapRef.current && window.kakao?.maps) {
      kakaoMapRef.current.panTo(new window.kakao.maps.LatLng(lat, lng));
    } else if (leafletMapRef.current) {
      leafletMapRef.current.setView([lat, lng], 19.5, { animate: true });
    }
  };

  // 일반지도 / 위성사진 / 지형도 3단 레이어 전환
  const handleSetMapType = (type: 'ROADMAP' | 'SKYVIEW' | 'TERRAIN') => {
    setMapType(type);
    if (leafletMapRef.current) {
      leafletMapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          leafletMapRef.current?.removeLayer(layer);
        }
      });

      let url = 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=ko';
      let maxNative = 20;

      if (type === 'SKYVIEW') {
        // 위성 하이브리드 레이어 (위성 사진 + 건물명/도로명 오버레이)
        url = 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=ko';
      } else if (type === 'TERRAIN') {
        // 지형 및 등고선 레이어
        url = 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&hl=ko';
        maxNative = 19;
      }

      L.tileLayer(url, {
        subdomains: ['0', '1', '2', '3'],
        maxZoom: 22,
        maxNativeZoom: maxNative
      }).addTo(leafletMapRef.current);
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

      {/* 4. 실제 인터랙티브 지도 렌더링 컨테이너 (340px로 시원하게 확장) */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '340px',
        background: '#F1F5F9',
        overflow: 'hidden',
        borderBottom: '1px solid #ECEFF2'
      }}>
        {/* 실제 인터랙티브 지도 DOM */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

        {/* 🗺️ 상단 좌측: 지도 모드 전환 버튼 (일반 / 위성 / 지형) */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          display: 'flex',
          background: '#FFFFFF',
          borderRadius: '8px',
          padding: '3px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          zIndex: 10,
          border: '1px solid #CBD5E1',
          gap: '2px'
        }}>
          <button
            type="button"
            onClick={() => handleSetMapType('ROADMAP')}
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: mapType === 'ROADMAP' ? 800 : 600,
              background: mapType === 'ROADMAP' ? '#0052FF' : 'transparent',
              color: mapType === 'ROADMAP' ? '#FFFFFF' : '#475569',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🗺️ 일반
          </button>
          <button
            type="button"
            onClick={() => handleSetMapType('SKYVIEW')}
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: mapType === 'SKYVIEW' ? 800 : 600,
              background: mapType === 'SKYVIEW' ? '#0052FF' : 'transparent',
              color: mapType === 'SKYVIEW' ? '#FFFFFF' : '#475569',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            🛰️ 위성
          </button>
          <button
            type="button"
            onClick={() => handleSetMapType('TERRAIN')}
            style={{
              padding: '5px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: mapType === 'TERRAIN' ? 800 : 600,
              background: mapType === 'TERRAIN' ? '#0052FF' : 'transparent',
              color: mapType === 'TERRAIN' ? '#FFFFFF' : '#475569',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ⛰️ 지형
          </button>
        </div>

        {/* 인터랙티브 줌 컨트롤 (+, -) & 센터 복귀 버튼 */}
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

      {/* 5. 인근 지하철역 & 주요 랜드마크 안내 카드 섹션 */}
      <div style={{
        background: '#F8FAFC',
        padding: '12px 18px',
        borderBottom: '1px solid #ECEFF2'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🚇</span> <span>주변 전철역 및 주요 빌딩</span>
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>클릭 시 지도 위치 이동</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {(kakaoPlaces.length > 0 ? kakaoPlaces : (nearbyLandmarks[locName] || nearbyLandmarks['파인에비뉴(카드)'])).map((poi: any, idx) => (
            <div
              key={idx}
              onClick={() => handleFocusLandmark(poi.lat, poi.lng)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                background: '#FFFFFF',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>{poi.category === 'SUBWAY' || poi.type === 'SUBWAY' ? '🚇' : '🏢'}</span>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E293B' }}>
                    {poi.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    {poi.address || poi.tag || '역세권'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: poi.category === 'SUBWAY' || poi.type === 'SUBWAY' ? '#059669' : '#0052FF',
                  background: poi.category === 'SUBWAY' || poi.type === 'SUBWAY' ? '#DCFCE7' : '#EFF6FF',
                  padding: '3px 7px',
                  borderRadius: '6px'
                }}>
                  {poi.distance || '인근'}
                </span>
                <span style={{ color: '#94A3B8', fontSize: '12px' }}>📍</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. 메모 섹션 */}
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
