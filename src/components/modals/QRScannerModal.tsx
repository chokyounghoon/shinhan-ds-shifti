import React, { useState } from 'react';
import { X, QrCode, CheckCircle2, RefreshCw } from 'lucide-react';
import { dbService } from '../../services/db';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagged: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onTagged,
  themeMode
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [tagSuccess, setTagSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setTagSuccess(true);
      dbService.clockIn('신한DS 3F 게이트 QR 태그');
      onTagged();

      setTimeout(() => {
        setTagSuccess(false);
        onClose();
      }, 1400);
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'center' }}>
      <div 
        style={{
          width: '340px',
          maxWidth: '90vw',
          background: '#FFFFFF',
          borderRadius: '20px',
          padding: '24px 20px',
          textAlign: 'center',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', color: '#8B95A1' }}
        >
          <X size={22} />
        </button>

        <div style={{ fontSize: '18px', fontWeight: 800, color: '#191F28', marginBottom: '4px' }}>
          QR 근태 태그
        </div>
        <p style={{ fontSize: '12px', color: '#6B7684', marginBottom: '20px' }}>
          신한DS 게이트 및 땡겨요 오피스 QR을 스캔하세요
        </p>

        {/* QR 뷰파인더 박스 */}
        <div style={{
          width: '200px',
          height: '200px',
          margin: '0 auto 20px auto',
          background: '#191F28',
          borderRadius: '16px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: `3px solid ${themeMode === 'ddangyo' ? '#FF462D' : '#0046FF'}`
        }}>
          {tagSuccess ? (
            <div style={{ color: '#00C48C', animation: 'scaleUp 0.3s ease' }}>
              <CheckCircle2 size={64} />
              <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 700, marginTop: '8px' }}>
                인증 성공!
              </div>
            </div>
          ) : (
            <>
              <QrCode size={120} color="rgba(255, 255, 255, 0.4)" />
              {isScanning && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: themeMode === 'ddangyo' ? '#FF462D' : '#0046FF',
                  boxShadow: '0 0 10px #FF462D',
                  animation: 'scannerLaser 1.5s infinite linear'
                }} />
              )}
            </>
          )}
        </div>

        <button
          onClick={handleSimulateScan}
          disabled={isScanning || tagSuccess}
          style={{
            width: '100%',
            height: '46px',
            background: themeMode === 'ddangyo' ? 'linear-gradient(135deg, #FF5538 0%, #FF381E 100%)' : '#0046FF',
            color: '#FFFFFF',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          {isScanning ? <RefreshCw size={18} className="spinning" /> : <QrCode size={18} />}
          <span>{isScanning ? 'QR 태그 스캔 중...' : 'QR 태깅 시뮬레이션'}</span>
        </button>
      </div>

      <style>{`
        @keyframes scannerLaser {
          0% { top: 0%; }
          50% { top: 96%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
};
