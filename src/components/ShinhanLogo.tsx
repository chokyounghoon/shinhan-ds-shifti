import React from 'react';

interface ShinhanLogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const ShinhanLogo: React.FC<ShinhanLogoProps> = ({
  size = 28,
  showText = true,
  textColor = '#0046FF',
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`shinhan-brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        ...style
      }}
    >
      {/* 신한금융그룹 정통 공식 심볼 마크 (S-자 유선형 리본 + 상우/좌하 3단 심볼 모티프) */}
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
      >
        {/* 외곽 링 및 신한 블루 베이스 */}
        <circle cx="50" cy="50" r="49" fill="#0046FF" />
        <circle cx="50" cy="50" r="47.5" stroke="#CBD5E1" strokeWidth="2.5" fill="none" />

        {/* 1. 중앙 굵고 매끄러운 'S' 형상 화이트 리본 */}
        <path 
          d="M 52 17 C 35 17 23 27 23 41 C 23 52 33 59 45 64 C 58 69 67 74 67 82 C 67 89 59 93 49 93 C 38 93 29 88 24 81 C 22 78 18 80 19 84 C 25 93 36 98 49 98 C 66 98 78 88 78 74 C 78 61 67 54 54 49 C 42 44 34 39 34 31 C 34 23 42 19 51 19 C 60 19 68 23 72 29 C 74 32 78 30 77 26 C 71 19 62 17 52 17 Z" 
          fill="#FFFFFF" 
        />

        {/* 2. 상단 우측 3단 비상 윙/스프라우트 심볼 */}
        <g fill="#FFFFFF" transform="translate(48, 14)">
          {/* 중앙 주 꽃잎/날개 */}
          <path d="M 18 10 C 23 5 28 12 25 18 C 22 23 18 18 18 10 Z" />
          {/* 좌측 꽃잎 */}
          <path d="M 11 15 C 15 11 20 16 17 21 C 14 24 10 20 11 15 Z" />
          {/* 우측 꽃잎 */}
          <path d="M 23 18 C 28 16 30 22 26 26 C 22 28 20 23 23 18 Z" />
        </g>

        {/* 3. 하단 좌측 3단 웨이브/뿌리 심볼 */}
        <g fill="#FFFFFF" transform="translate(14, 48)">
          {/* 중앙 주 꽃잎/날개 */}
          <path d="M 18 26 C 13 31 8 24 11 18 C 14 13 18 18 18 26 Z" />
          {/* 좌측 꽃잎 */}
          <path d="M 13 18 C 8 20 6 14 10 10 C 14 8 16 13 13 18 Z" />
          {/* 우측 꽃잎 */}
          <path d="M 25 21 C 21 25 16 20 19 15 C 22 12 26 16 25 21 Z" />
        </g>
      </svg>

      {/* 신한DS 텍스트 워드마크 */}
      {showText && (
        <span style={{ 
          fontWeight: 800, 
          fontSize: `${Math.round(size * 0.72)}px`, 
          letterSpacing: '-0.5px', 
          color: textColor,
          display: 'inline-flex',
          alignItems: 'center',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          flexShrink: 0,
          gap: '2px'
        }}>
          신한<span style={{ fontWeight: 900, color: textColor }}>DS</span>
        </span>
      )}
    </div>
  );
};
