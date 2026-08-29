import React, { useState } from 'react';
import { TrendingUp, Users, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';

interface InteractiveAnalyticsChartsProps {
  weeklyData?: { day: string; plannedHours: number; actualHours: number; rate: number }[];
  partData?: { part: string; memberCount: number; deliveryRate: number; slaBreaches: number }[];
  themeMode?: 'ddangyo' | 'shinhan';
}

export const InteractiveAnalyticsCharts: React.FC<InteractiveAnalyticsChartsProps> = ({
  weeklyData = [
    { day: '월(8/11)', plannedHours: 64, actualHours: 64, rate: 100 },
    { day: '화(8/12)', plannedHours: 64, actualHours: 63.5, rate: 99.2 },
    { day: '수(8/13)', plannedHours: 64, actualHours: 64, rate: 100 },
    { day: '목(8/14)', plannedHours: 64, actualHours: 62.0, rate: 96.8 },
    { day: '금(8/15)', plannedHours: 0, actualHours: 0, rate: 100 },
    { day: '월(8/18)', plannedHours: 64, actualHours: 64, rate: 100 },
    { day: '화(8/19)', plannedHours: 64, actualHours: 64, rate: 100 }
  ],
  partData = [
    { part: '상담', memberCount: 8, deliveryRate: 99.4, slaBreaches: 1 },
    { part: '국제', memberCount: 1, deliveryRate: 100.0, slaBreaches: 0 },
    { part: '오토금융', memberCount: 10, deliveryRate: 98.8, slaBreaches: 0 },
    { part: '승인', memberCount: 4, deliveryRate: 100.0, slaBreaches: 0 },
    { part: '마케팅', memberCount: 3, deliveryRate: 97.5, slaBreaches: 1 }
  ],
  themeMode = 'shinhan'
}) => {
  const [activeBarIndex, setActiveBarIndex] = useState<number | null>(null);
  const primaryColor = themeMode === 'ddangyo' ? '#FF462D' : '#0066FF';

  // SVG Area Chart 치수 계산
  const width = 500;
  const height = 160;
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const points = weeklyData.map((d, index) => {
    const x = padding + (index / (weeklyData.length - 1)) * chartWidth;
    const y = height - padding - (d.rate / 100) * chartHeight;
    return { x, y, ...d };
  });

  const pathD = points.length > 0 
    ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. 주간 도급 공정 투입률 추이 그래프 (Area Line Chart) */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color={primaryColor} />
            <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              일별 도급 공수 이행률 추이 (Weekly Delivery Rate)
            </h4>
          </div>
          <span style={{
            fontSize: '12px',
            fontWeight: 800,
            color: '#00A859',
            background: '#E6F9F0',
            padding: '2px 8px',
            borderRadius: '12px'
          }}>
            평균 99.4% 완수
          </span>
        </div>

        {/* SVG Area 차트 */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: '320px' }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primaryColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={primaryColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* 그리드 라인 */}
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#F1F5F9" strokeDasharray="3 3" />
            <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#F1F5F9" strokeDasharray="3 3" />
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#CBD5E1" strokeWidth="1" />

            {/* Area & Line */}
            <path d={areaD} fill="url(#areaGradient)" />
            <path d={pathD} fill="none" stroke={primaryColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {/* 포인트 닷 */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={4.5}
                  fill="#FFFFFF"
                  stroke={primaryColor}
                  strokeWidth="2.5"
                  style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
                />
                <text
                  x={p.x}
                  y={height - 10}
                  fontSize="10"
                  textAnchor="middle"
                  fill="#64748B"
                  fontWeight="600"
                >
                  {p.day.split('(')[0]}
                </text>
                <text
                  x={p.x}
                  y={p.y - 8}
                  fontSize="9.5"
                  textAnchor="middle"
                  fill="#0F172A"
                  fontWeight="700"
                >
                  {p.rate}%
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* 2. 10-PM 파트별 도급 공정 완수도 비교 바 차트 */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color={primaryColor} />
            <h4 style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              파트별 도급 투입 공수 & SLA 달성도
            </h4>
          </div>
          <span style={{ fontSize: '11.5px', color: '#64748B' }}>10개 파트 실시간 집계</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {partData.map((part, index) => {
            const isHovered = activeBarIndex === index;
            return (
              <div
                key={part.part}
                onMouseEnter={() => setActiveBarIndex(index)}
                onMouseLeave={() => setActiveBarIndex(null)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: isHovered ? '#F8FAFC' : 'transparent',
                  transition: 'background 0.15s ease',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                    {part.part} 파트 ({part.memberCount}명)
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {part.slaBreaches > 0 && (
                      <span style={{ fontSize: '11px', color: '#FF3B30', background: '#FFEBEB', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                        SLA지연 {part.slaBreaches}건
                      </span>
                    )}
                    <span style={{ fontSize: '13px', fontWeight: 800, color: primaryColor }}>
                      {part.deliveryRate}%
                    </span>
                  </div>
                </div>

                {/* 프로그레스 바 */}
                <div style={{
                  width: '100%',
                  height: '8px',
                  background: '#E2E8F0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${part.deliveryRate}%`,
                    height: '100%',
                    background: part.deliveryRate >= 99 ? '#00A859' : part.deliveryRate >= 95 ? primaryColor : '#FF9500',
                    borderRadius: '4px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
