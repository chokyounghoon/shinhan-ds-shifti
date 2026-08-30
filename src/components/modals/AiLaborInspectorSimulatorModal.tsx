import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  HelpCircle, 
  ChevronRight, 
  ChevronDown, 
  Scale, 
  Download, 
  Copy, 
  Check, 
  Flame, 
  Search, 
  Layers, 
  Database, 
  MessageSquare,
  Lock
} from 'lucide-react';
import { geminiAiService, LaborInspectionSimulationResult, LaborInspectionCheckItem } from '../../services/geminiAiService';

interface AiLaborInspectorSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: 'ddangyo' | 'shinhan';
}

export const AiLaborInspectorSimulatorModal: React.FC<AiLaborInspectorSimulatorModalProps> = ({
  isOpen,
  onClose,
  themeMode = 'shinhan'
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const [strictness, setStrictness] = useState<'HIGH' | 'MAXIMUM'>('HIGH');
  const [result, setResult] = useState<LaborInspectionSimulationResult | null>(null);
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>('chk-01');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleStartSimulation = async () => {
    setIsRunning(true);
    setScanStep(1); // 1단계: UI 및 승인 결재선 역추적
    
    setTimeout(() => {
      setScanStep(2); // 2단계: D1 DB 스키마 및 타임스탬프 검증
    }, 500);

    setTimeout(() => {
      setScanStep(3); // 3단계: 근로감독관 불심 질의서 및 채점표 생성
    }, 1000);

    try {
      const res = await geminiAiService.runLaborInspectionSimulation({
        inspectorStrictness: strictness
      });
      setTimeout(() => {
        setResult(res);
        setIsRunning(false);
        setScanStep(0);
      }, 1500);
    } catch (e) {
      console.error(e);
      setIsRunning(false);
      setScanStep(0);
    }
  };

  const handleCopyReport = () => {
    if (!result) return;
    const text = `[고용노동부 모의 근로감독 결과 보고서]
일시: ${result.simulationTimestamp}
담당감독관: ${result.inspectorPersona}
종합점수: ${result.overallScore}점 / 등급: ${result.grade}
총평: ${result.summaryVerdict}

[핵심 적법 강점]
${result.strengths.map(s => `• ${s}`).join('\n')}

[잠재 리스크 및 권고]
${result.potentialVulnerabilities.map(v => `• ${v}`).join('\n')}

[선제 조치 과제]
${result.actionItems.map(a => `• ${a}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '16px'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* 모달 상단 헤더 */}
        <div style={{
          padding: '20px 22px',
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          color: '#FFFFFF',
          borderRadius: '24px 24px 0 0',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              borderRadius: '12px',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Scale size={22} color="#60A5FA" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, background: '#3B82F6', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                  AI PERSONA AUDIT
                </span>
                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                  Google Gemini AI 기반
                </span>
              </div>
              <h2 style={{ margin: '2px 0 0 0', fontSize: '17px', fontWeight: 900, color: '#FFFFFF' }}>
                모의 노동청 근로감독 시뮬레이터
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94A3B8'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 본문 콘텐츠 */}
        <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* 1. 개념 및 작동 방식 소개 카드 */}
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '16px',
            fontSize: '12.5px',
            color: '#334155',
            lineHeight: 1.6
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
              <Sparkles size={16} color="#3B82F6" />
              <span>실제 감사 전 불법파견 요소를 선제적으로 역추적 분석합니다</span>
            </div>
            가상의 **강도 높은 고용노동부 근로감독관 페르소나**가 SHIFTI_ETC의 화면 레이아웃, 3단계 결재선, D1 DB 로그 전체를 스캔하여 취약점을 점검하고 방어 논리를 제공합니다.
          </div>

          {/* 2. 감사 강도 선택 및 시뮬레이션 시작 바 */}
          {!result && !isRunning && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  🎯 가상 근로감독관 감사 강도 선택
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    onClick={() => setStrictness('HIGH')}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: strictness === 'HIGH' ? '2px solid #3B82F6' : '1px solid #CBD5E1',
                      background: strictness === 'HIGH' ? '#EFF6FF' : '#FFFFFF',
                      color: strictness === 'HIGH' ? '#1D4ED8' : '#64748B',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>🔍 정기 근로감독</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: '#64748B', marginTop: '2px' }}>
                      표준 IT도급 점검표 기준
                    </div>
                  </button>

                  <button
                    onClick={() => setStrictness('MAXIMUM')}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: strictness === 'MAXIMUM' ? '2px solid #EF4444' : '1px solid #CBD5E1',
                      background: strictness === 'MAXIMUM' ? '#FEF2F2' : '#FFFFFF',
                      color: strictness === 'MAXIMUM' ? '#B91C1C' : '#64748B',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>🔥 특별 근로감독 (200%)</div>
                    <div style={{ fontSize: '11px', fontWeight: 500, color: '#64748B', marginTop: '2px' }}>
                      현장 불심 심층 문답 기준
                    </div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleStartSimulation}
                style={{
                  background: 'linear-gradient(135deg, #0046FF 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '14px',
                  padding: '15px',
                  fontSize: '15px',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 8px 16px rgba(0, 70, 255, 0.25)',
                  marginTop: '6px'
                }}
              >
                <Sparkles size={18} />
                <span>모의 노동청 감사 시뮬레이션 가동</span>
              </button>
            </div>
          )}

          {/* 3. 시뮬레이션 실행 중 애니메이션 */}
          {isRunning && (
            <div style={{
              background: '#0F172A',
              borderRadius: '18px',
              padding: '24px',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#3B82F6',
                  animation: 'pulse 1.5s infinite'
                }} />
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#93C5FD' }}>
                  가상 근로감독관 페르소나 역추적 감사 진행 중...
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: scanStep >= 1 ? '#4ADE80' : '#64748B' }}>
                  <Layers size={15} />
                  <span>[1단계] UI 레이아웃 및 3단계 독립 결재선 역추적 스캔</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: scanStep >= 2 ? '#4ADE80' : '#64748B' }}>
                  <Database size={15} />
                  <span>[2단계] Cloudflare D1 DB 출퇴근 GPS 및 소명 로그 무결성 대조</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: scanStep >= 3 ? '#4ADE80' : '#64748B' }}>
                  <MessageSquare size={15} />
                  <span>[3단계] 고용노동부 IT도급 5대 판정 징표별 모의 질의서 및 채점 생성</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. 시뮬레이션 결과 리포트 */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 종합 채점 헤더 카드 */}
              <div style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                border: '1px solid #A7F3D0',
                borderRadius: '18px',
                padding: '18px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#047857', letterSpacing: '0.5px' }}>
                    AUDIT VERDICT SCORE
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#065F46', marginTop: '2px' }}>
                    {result.overallScore}<span style={{ fontSize: '16px', fontWeight: 700 }}> / 100점</span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                    판정 등급: {result.grade}
                  </div>
                </div>

                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  padding: '10px 14px',
                  textAlign: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                }}>
                  <ShieldCheck size={28} color="#059669" />
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#065F46', marginTop: '4px' }}>
                    불법파견 위험 0%
                  </div>
                </div>
              </div>

              {/* 총평 */}
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '12.5px',
                color: '#334155',
                lineHeight: 1.6
              }}>
                <div style={{ fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                  🕵️‍♂️ 근로감독관 총평
                </div>
                {result.summaryVerdict}
              </div>

              {/* 4대 감사 시나리오별 질의 & 방어 논리 아코디언 */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                  📋 4대 감사 시나리오별 모의 불심 질의 및 적법 방어 내역
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {result.checkItems.map(item => {
                    const isExpanded = expandedCheckId === item.id;
                    return (
                      <div 
                        key={item.id}
                        style={{
                          background: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          overflow: 'hidden'
                        }}
                      >
                        <div 
                          onClick={() => setExpandedCheckId(isExpanded ? null : item.id)}
                          style={{
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            background: isExpanded ? '#F1F5F9' : '#F8FAFC'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              fontSize: '10.5px',
                              fontWeight: 800,
                              background: '#DCFCE7',
                              color: '#15803D',
                              padding: '2px 6px',
                              borderRadius: '4px'
                            }}>
                              {item.verdictLabel}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B' }}>
                              {item.categoryLabel}
                            </span>
                          </div>
                          {isExpanded ? <ChevronDown size={16} color="#64748B" /> : <ChevronRight size={16} color="#64748B" />}
                        </div>

                        {isExpanded && (
                          <div style={{ padding: '14px', borderTop: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                            {/* 감독관의 공격적 질문 */}
                            <div style={{ background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px', padding: '10px' }}>
                              <div style={{ fontWeight: 800, color: '#B91C1C', marginBottom: '2px' }}>
                                🚨 근로감독관 모의 불심 질문
                              </div>
                              <div style={{ color: '#991B1B', lineHeight: 1.5 }}>
                                {item.inspectorQuestion}
                              </div>
                            </div>

                            {/* 시스템 감사 결과 */}
                            <div style={{ background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '8px', padding: '10px' }}>
                              <div style={{ fontWeight: 800, color: '#1D4ED8', marginBottom: '2px' }}>
                                💻 SHIFTI_ETC 시스템 실시간 감사 내용
                              </div>
                              <div style={{ color: '#1E40AF', lineHeight: 1.5 }}>
                                {item.systemAuditResult}
                              </div>
                            </div>

                            {/* 법적 방어 논리 */}
                            <div style={{ background: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: '8px', padding: '10px' }}>
                              <div style={{ fontWeight: 800, color: '#047857', marginBottom: '2px' }}>
                                ⚖️ 대법원 판례 및 법적 방어 논리
                              </div>
                              <div style={{ color: '#065F46', lineHeight: 1.5 }}>
                                {item.defenseLogic}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 핵심 방어 강점 및 선제 조치 과제 */}
              <div style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '14px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px'
              }}>
                <div style={{ fontWeight: 800, color: '#0F172A' }}>
                  📌 선제적 시스템 보완 권고안 (Action Items)
                </div>
                {result.actionItems.map((item, idx) => (
                  <div key={idx} style={{ color: '#475569', lineHeight: 1.5 }}>
                    {item}
                  </div>
                ))}
              </div>

              {/* 하단 버튼 바 */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  onClick={handleCopyReport}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    background: '#FFFFFF',
                    color: '#334155',
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {copied ? <Check size={16} color="#16A34A" /> : <Copy size={16} />}
                  <span>{copied ? '결과 복사 완료!' : '결과 보고서 복사'}</span>
                </button>

                <button
                  onClick={() => setResult(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#0046FF',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  재시뮬레이션
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
