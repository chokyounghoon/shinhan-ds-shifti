import React from 'react';
import { ShieldCheck, ShieldAlert, X, Radio, Wifi, Smartphone, Globe, Lock, Activity, CheckCircle2, AlertOctagon, RefreshCw } from 'lucide-react';
import { SpoofCheckResult } from '../../services/antiSpoofService';

interface AntiSpoofSecurityDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: SpoofCheckResult;
  onRevalidate: () => void;
  isLocating: boolean;
}

export const AntiSpoofSecurityDiagnosticModal: React.FC<AntiSpoofSecurityDiagnosticModalProps> = ({
  isOpen,
  onClose,
  result,
  onRevalidate,
  isLocating
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '20px',
        maxWidth: '520px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 모달 상단 헤더 */}
        <div style={{
          background: result.isSecure 
            ? 'linear-gradient(135deg, #0052FF 0%, #0036B3 100%)' 
            : 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
          color: '#FFFFFF',
          padding: '20px 24px',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              padding: '10px',
              display: 'flex'
            }}>
              {result.isSecure ? <ShieldCheck size={26} color="#FFFFFF" /> : <ShieldAlert size={26} color="#FFFFFF" />}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255, 255, 255, 0.85)', letterSpacing: '0.5px' }}>
                S-Sign ZERO-TRUST GEOLOCATION DEFENSE
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '2px 0 0 0' }}>
                {result.isSecure ? '7중 위치 무결성 & VPN 방어 가동' : '⚠️ 위치 조작 / VPN 우회 감지'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 본문 콘텐츠 */}
        <div style={{ padding: '20px 24px' }}>
          {/* 보안 종합 점수 바 */}
          <div style={{
            background: result.isSecure ? '#F0FDF4' : '#FEF2F2',
            border: result.isSecure ? '1.5px solid #BBF7D0' : '1.5px solid #FECACA',
            borderRadius: '12px',
            padding: '14px 16px',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: result.isSecure ? '#15803D' : '#B91C1C' }}>
                종합 보안 신뢰도 지수
              </div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: result.isSecure ? '#16A34A' : '#DC2626', marginTop: '2px' }}>
                {result.securityScore}<span style={{ fontSize: '14px', fontWeight: 700 }}> / 100 점</span>
                <span style={{ fontSize: '12px', marginLeft: '8px', fontWeight: 800 }}>
                  ({result.isSecure ? '✓ 위변조 불가 (정상)' : '⛔ 투입 차단'})
                </span>
              </div>
            </div>

            <button
              onClick={onRevalidate}
              disabled={isLocating}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#1E293B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={13} className={isLocating ? 'spinning' : ''} />
              <span>재검증</span>
            </button>
          </div>

          {/* 위협 감지 알림 (발생 시) */}
          {result.detectedThreats.length > 0 && (
            <div style={{
              background: '#FFF1F2',
              border: '1px solid #FDA4AF',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#BE123C', fontWeight: 800, fontSize: '13px', marginBottom: '6px' }}>
                <AlertOctagon size={16} />
                <span>차단된 위험 요소 ({result.detectedThreats.length}건)</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#9F1239', lineHeight: 1.6 }}>
                {result.detectedThreats.map((threat, idx) => (
                  <li key={idx} style={{ fontWeight: 700 }}>{threat}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 7대 무결성 방어 계층 상세 리스트 */}
          <div style={{ fontSize: '13.5px', fontWeight: 900, color: '#191F28', marginBottom: '10px' }}>
            🛡️ 7대 무결성 보안 방어 체계 실시간 현황
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            {result.defenseLayers && result.defenseLayers.map((layer, idx) => (
              <div key={idx} style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 800, color: '#1E293B' }}>
                    {idx + 1}. {layer.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                    {layer.description}
                  </div>
                </div>

                <div style={{
                  background: layer.status === 'PASS' ? '#DCFCE7' : '#FEE2E2',
                  color: layer.status === 'PASS' ? '#15803D' : '#B91C1C',
                  fontSize: '11px',
                  fontWeight: 900,
                  padding: '3px 8px',
                  borderRadius: '6px',
                  whiteSpace: 'nowrap',
                  marginLeft: '10px'
                }}>
                  {layer.status === 'PASS' ? '✓ 통과 (PASS)' : '⛔ 차단 (FAIL)'}
                </div>
              </div>
            ))}
          </div>

          {/* 단말 및 통신망 교차 검증 메타데이터 */}
          <div style={{
            background: '#F1F5F9',
            borderRadius: '12px',
            padding: '12px 14px',
            fontSize: '11.5px',
            color: '#475569',
            lineHeight: 1.6
          }}>
            <div style={{ fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>📡 실시간 보안 텔레메트리</div>
            <div>• 접속 공인 IP: <strong>{result.clientIpHash}</strong> ({result.country})</div>
            <div>• 확인된 통신망(ISP): <strong>{result.ispName}</strong></div>
            <div>• 일회용 서명 토큰: <code>{result.securityToken}</code></div>
            <div>• 검증 시각: {result.timestamp} (KST)</div>
          </div>
        </div>

        {/* 하단 닫기 버튼 */}
        <div style={{
          padding: '14px 24px 20px 24px',
          borderTop: '1px solid #E5E8EB',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#0052FF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '10px 22px',
              fontSize: '13.5px',
              fontWeight: 800,
              cursor: 'pointer',
              width: '100%'
            }}
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
