import React, { useRef, useState, useEffect } from 'react';
import { X, RotateCcw, Check, PenTool, ShieldCheck } from 'lucide-react';

interface ElectronicSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSignature: (signatureDataUrl: string, signerName: string) => void;
  title?: string;
  defaultSignerName?: string;
  themeMode?: 'ddangyo' | 'shinhan';
}

export const ElectronicSignatureModal: React.FC<ElectronicSignatureModalProps> = ({
  isOpen,
  onClose,
  onSaveSignature,
  title = '도급 기성 검수 전자 서명',
  defaultSignerName = '조경훈 (원청 수석PM)',
  themeMode = 'shinhan'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState(defaultSignerName);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0F172A';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // 배경 초기화
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      setHasSignature(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirm = () => {
    if (!hasSignature) {
      alert('서명 패드에 서명을 입력해 주세요.');
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSaveSignature(dataUrl, signerName);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PenTool size={20} color={themeMode === 'ddangyo' ? '#FF462D' : '#0066FF'} />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              {title}
            </h3>
          </div>
          <button onClick={onClose} style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* 바디 */}
        <div style={{ padding: '20px' }}>
          {/* 서명자 이름 입력 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
              검수/승인자 성명 및 직책
            </label>
            <input
              type="text"
              value={signerName}
              onChange={e => setSignerName(e.target.value)}
              placeholder="예: 조경훈 (신한DS 수석PM)"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1E293B',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* 서명 캔버스 */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
                서명 날인 (마우스 또는 터치)
              </span>
              <button
                onClick={clearCanvas}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: '#64748B',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                <RotateCcw size={13} />
                다시 쓰기
              </button>
            </div>

            <div style={{
              border: '2px dashed #94A3B8',
              borderRadius: '10px',
              background: '#FFFFFF',
              touchAction: 'none',
              overflow: 'hidden'
            }}>
              <canvas
                ref={canvasRef}
                width={400}
                height={180}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ width: '100%', height: '180px', display: 'block', cursor: 'crosshair' }}
              />
            </div>
          </div>

          {/* 법적 컴플라이언스 안내 문구 */}
          <div style={{
            padding: '10px 12px',
            background: '#F1F5F9',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <ShieldCheck size={16} color="#0066FF" style={{ marginTop: '2px', flexShrink: 0 }} />
            <p style={{ fontSize: '11.5px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
              본 전자 서명은 「전자서명법」 및 「하도급거래 공정화에 관한 법률」에 따라 도급 계약 공정 이행 및 검수 확인 증빙으로 법적 효력을 갖습니다.
            </p>
          </div>
        </div>

        {/* 푸터 버튼 */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          background: '#F8FAFC'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#475569',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF',
              color: '#FFFFFF',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)'
            }}
          >
            <Check size={16} />
            전자 서명 확정
          </button>
        </div>
      </div>
    </div>
  );
};
