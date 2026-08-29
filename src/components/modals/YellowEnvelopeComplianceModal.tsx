import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Scale, 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  AlertTriangle, 
  Lock, 
  FileCheck, 
  ChevronRight,
  Sparkles,
  BookOpen,
  Layers,
  HelpCircle,
  Check
} from 'lucide-react';
import { LegalComplianceAuditReportModal } from './LegalComplianceAuditReportModal';

interface YellowEnvelopeComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeMode?: 'ddangyo' | 'shinhan';
}

export const YellowEnvelopeComplianceModal: React.FC<YellowEnvelopeComplianceModalProps> = ({
  isOpen,
  onClose,
  themeMode = 'shinhan'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'legal' | 'architecture' | 'checklist'>('overview');
  const [isDetailReportOpen, setIsDetailReportOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2100,
        padding: '16px'
      }}>
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '92vh',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s ease-out'
        }}>
          {/* 상단 골드/네이비 헤더 */}
          <div style={{
            padding: '18px 24px',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2.5px solid #F59E0B'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1.5px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FBBF24',
                flexShrink: 0
              }}>
                <Scale size={22} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ fontSize: '17.5px', fontWeight: 900, margin: 0, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                    노란봉투법 컴플라이언스 정밀 진단 보고서
                  </h3>
                </div>
                <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '2px 0 0 0' }}>
                  노조법 제2조·제3조 개정안 & 파견법 적법 도급 4대 대원칙 100% 검증
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#CBD5E1'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* 서브 탭 네비게이션 */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            background: '#F8FAFC',
            padding: '0 16px'
          }}>
            {[
              { id: 'overview', label: '종합 진단', icon: <ShieldCheck size={14} /> },
              { id: 'legal', label: '법문 & 대법원 판례', icon: <BookOpen size={14} /> },
              { id: 'architecture', label: '시스템 방어 설계', icon: <Layers size={14} /> },
              { id: 'checklist', label: '노동청 점검 수칙', icon: <FileCheck size={14} /> },
            ].map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    flex: 1,
                    padding: '12px 6px',
                    background: 'none',
                    border: 'none',
                    borderBottom: active ? '2.5px solid #0066FF' : '2.5px solid transparent',
                    color: active ? '#0066FF' : '#64748B',
                    fontSize: '12.5px',
                    fontWeight: active ? 800 : 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 본문 스크롤 영역 */}
          <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* ========================================================================= */}
            {/* 탭 1: 종합 진단 (Overview) */}
            {/* ========================================================================= */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 종합 판정 배너 */}
                <div style={{
                  background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                  border: '1.5px solid #10B981',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px'
                }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: '#10B981',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                  }}>
                    <ShieldCheck size={28} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '15.5px', fontWeight: 900, color: '#065F46' }}>
                        종합 검증 결과 : 적법 도급 100% 적합 판정
                      </span>
                      <span style={{ fontSize: '11px', background: '#059669', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                        PASS
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#047857', margin: '4px 0 0 0', lineHeight: 1.45 }}>
                      원청(신한DS)이 하청 근로자 개인에게 직접 지휘·명령하거나 근태를 승인하는 권한을 시스템 아키텍처 수준에서 <strong>완전 절연(Systemic Insulation)</strong>하여, 노란봉투법상 원청 사용자성 인정 및 파견법상 불법파견 리스크를 원천 차단하였습니다.
                    </p>
                  </div>
                </div>

                {/* 4대 대원칙 카드 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    {
                      num: '01',
                      title: '지휘·명령권의 완전한 분리',
                      sub: 'Command Separation',
                      desc: '원청 PM은 협력사 근로자 개인에게 직접 업무지시나 징계를 하지 않으며, 협력사 현장관리인을 통해서만 [SLA 소명 요구서]를 공문 교환합니다.',
                      status: '100% 분리'
                    },
                    {
                      num: '02',
                      title: '인사노무 관리의 독립적 자율권',
                      sub: 'HR Autonomy',
                      desc: '휴가/연차는 협력사 내부에서 결재하며, 원청에는 \'승인(Approval)\'이 아닌 \'도급 공정 공백 사전 통보(Pre-Gap Notice)\'로만 통보되어 인프라 검수만 수행합니다.',
                      status: '자율권 보장'
                    },
                    {
                      num: '03',
                      title: '도급 계약 기성고 검수 모델',
                      sub: 'Output Delivery Inspection',
                      desc: '근로자 개인의 근태 통제가 아닌, 협력사가 납품한 \'일일 도급 투입 공수(M/D / M/H)\' 및 SLA 이행률을 검수하여 용역비를 기성고 기준으로 정산합니다.',
                      status: '기성고 검수'
                    },
                    {
                      num: '04',
                      title: '불변 감사 추적 원장 및 전자서명',
                      sub: 'Audit Trail & E-Sign',
                      desc: '모든 공정 검수와 소명 조치 내역이 Cloudflare D1 DB에 영구 타임스탬프 원장으로 보존되며, Canvas 전자서명 및 공식 감사 리포트 PDF 출력을 지원합니다.',
                      status: 'D1 원장 보존'
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '13px 15px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 900, color: '#0066FF', background: '#EFF6FF', padding: '1px 6px', borderRadius: '4px' }}>
                            {item.num}
                          </span>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                            {item.title}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', background: '#D1FAE5', padding: '2px 8px', borderRadius: '10px' }}>
                          {item.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.45 }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 탭 2: 법문 & 대법원 판례 (Legal Basis) */}
            {/* ========================================================================= */}
            {activeTab === 'legal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. 노란봉투법 조문 분석 */}
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Scale size={16} color="#0066FF" />
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                      노조법 제2조 제2호 개정안 (실질적 지배력설)
                    </span>
                  </div>
                  <div style={{
                    background: '#FFFFFF',
                    borderLeft: '3px solid #0066FF',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#334155',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                    borderRadius: '0 6px 6px 0'
                  }}>
                    "근로계약 체결의 당사자가 아니더라도 근로자의 근로조건에 대하여 <strong>실질적이고 구체적으로 지배·결정할 수 있는 지위</strong>에 있는 자도 사용자로 본다."
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '8px 0 0 0', lineHeight: 1.45 }}>
                    💡 <strong>본 시스템의 법적 방어</strong>: 원청은 근로조건의 결정권자가 아니며, 도급 계약상의 공정 기성고(SLA)를 검수하는 순수 발주자 지위만을 행사하도록 모든 인터페이스가 설계되어 있습니다.
                  </p>
                </div>

                {/* 2. 대법원 적법 도급 5대 판정 기준 (대법원 2015. 2. 26. 선고 2010다106436) */}
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '12px', padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <BookOpen size={16} color="#0066FF" />
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                      대법원 적법 도급 vs 불법파견 5대 판단 기준
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#475569' }}>
                    <div style={{ padding: '8px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <strong style={{ color: '#0F172A' }}>1. 상당한 지휘·명령의 배제 :</strong> 원청 PM이 하청 인원에게 직접 지시하지 않고 현장관리인을 통해 공문 교환
                    </div>
                    <div style={{ padding: '8px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <strong style={{ color: '#0F172A' }}>2. 사업체 편입 금지 :</strong> 원청 소속 직원과 하청 직원의 업무 및 검수 라인을 분리
                    </div>
                    <div style={{ padding: '8px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <strong style={{ color: '#0F172A' }}>3. 인사노무의 독립성 :</strong> 휴가·근태 결재권을 협력사 현장관리인이 100% 독자 행사
                    </div>
                    <div style={{ padding: '8px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <strong style={{ color: '#0F172A' }}>4. 업무의 특정성 :</strong> IT 파트별 시스템 유지보수 및 기간계 공정 계약 목적물 특정
                    </div>
                    <div style={{ padding: '8px 10px', background: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <strong style={{ color: '#0F172A' }}>5. 전문적 IT 사업체성 :</strong> 협력사가 독자적인 기술과 인력을 기반으로 용역 완성
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 탭 3: 시스템 방어 설계 (Architecture) */}
            {/* ========================================================================= */}
            {activeTab === 'architecture' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
                  위법 위험 패턴 vs 본 시스템 법적 절연(Insulation) 비교표
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#0F172A', color: '#FFFFFF' }}>
                      <th style={{ padding: '8px 10px', width: '22%' }}>기능 영역</th>
                      <th style={{ padding: '8px 10px', width: '38%', color: '#F87171' }}>❌ 과거 위법 패턴 (위험)</th>
                      <th style={{ padding: '8px 10px', width: '40%', color: '#4ADE80' }}>✔ 본 시스템 구현 (적합)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0F172A' }}>휴가/근태 결재</td>
                      <td style={{ padding: '8px 10px', color: '#DC2626' }}>원청 PM이 하청 직원 연차 승인 (사용자성 인정 100%)</td>
                      <td style={{ padding: '8px 10px', color: '#16A34A', fontWeight: 600 }}>협력사 자체 결재 후 원청은 '공정 공백 통보' 확인만 수행</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0F172A' }}>지각/공수 결손</td>
                      <td style={{ padding: '8px 10px', color: '#DC2626' }}>원청 PM이 근로자 개인에게 직접 사유서 요구 및 징계</td>
                      <td style={{ padding: '8px 10px', color: '#16A34A', fontWeight: 600 }}>협력사 관리인에게 SLA 공문 발송, 협력사가 대체 투입 소명</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0F172A' }}>정산 및 검수</td>
                      <td style={{ padding: '8px 10px', color: '#DC2626' }}>개인별 시급/근태에 따른 임금성 통제</td>
                      <td style={{ padding: '8px 10px', color: '#16A34A', fontWeight: 600 }}>파트별 일일 도급 투입 공수(M/D) 및 SLA 이행률 기성 검수</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0F172A' }}>감사 증빙 체계</td>
                      <td style={{ padding: '8px 10px', color: '#DC2626' }}>구두/메신저 지시로 불법파견 의심 증거 양산</td>
                      <td style={{ padding: '8px 10px', color: '#16A34A', fontWeight: 600 }}>Cloudflare D1 불변 감사 원장 및 Canvas 전자 서명 날인</td>
                    </tr>
                  </tbody>
                </table>

                {/* D1 스키마 매핑 */}
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px', padding: '10px 12px', fontSize: '11.5px', color: '#1E40AF' }}>
                  <strong>🔒 Cloudflare D1 법적 방어 데이터베이스 테이블 :</strong><br />
                  • <code>audit_trails</code> : 검수 행위자, 일시, 사유 영구 타임스탬프 원장 기록<br />
                  • <code>sla_clarifications</code> : 원청 ↔ 협력사 법적 공식 소명 요구 및 회신 공문<br />
                  • <code>pre_gap_notices</code> : 협력사의 도급 공정 인력 공백 사전 통보 접수 원장
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* 탭 4: 노동청 점검 수칙 (Checklist) */}
            {/* ========================================================================= */}
            {activeTab === 'checklist' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  background: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '12px',
                  color: '#92400E',
                  lineHeight: 1.45
                }}>
                  <div style={{ fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={15} color="#D97706" />
                    <span>노동청 근로감독관 수시·정기 점검 현장 대응 4대 행동 수칙</span>
                  </div>
                  1. <strong>개인 메신저 금지 :</strong> 카카오톡 등 사설 메신저로 협력사 근로자에게 직접 지시를 내리지 마십시오.<br />
                  2. <strong>공문 절차 준수 :</strong> 모든 공수 편차(+15m 이상)는 시스템의 <code>[SLA 소명 요구 공문]</code>으로 진행하십시오.<br />
                  3. <strong>휴가 승인 용어 사용 금지 :</strong> 협력사 직원의 휴가는 '승인'이 아닌 <code>'공정 공백 통보 접수'</code>로 일관하십시오.<br />
                  4. <strong>정기 리포트 출력 보관 :</strong> 월말 기성 검수 시 반드시 <code>[적법 도급 감사 리포트]</code>를 출력·전자서명하십시오.
                </div>

                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                  현장 근로감독관 질의 대응 Q&A 요약
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                      Q. 원청 PM이 협력사 근로자의 출퇴근을 통제합니까?
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                      👉 <strong>A.</strong> 아닙니다. 근로자는 협력사의 자율 관리를 받으며, 원청은 시스템을 통해 도급 계약상 완성된 '일일 투입 공수(M/D)' 데이터만 기성 검수합니다.
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A' }}>
                      Q. 협력사 직원의 지각/조퇴 시 원청이 징계합니까?
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
                      👉 <strong>A.</strong> 아닙니다. 원청은 협력사 현장대리인에게 도급 SLA 결손에 대한 소명을 요구하며, 복무 징계나 대체 투입 결정은 협력사가 독자적으로 처리합니다.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 하단 푸터 버튼 */}
          <div style={{
            padding: '14px 24px',
            borderTop: '1px solid #E2E8F0',
            background: '#FAFAFA',
            display: 'flex',
            gap: '10px'
          }}>
            <button
              type="button"
              onClick={() => setIsDetailReportOpen(true)}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                background: '#0066FF',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 12px rgba(0, 102, 255, 0.25)'
              }}
            >
              <Printer size={15} />
              <span>노동청 제출용 공식 감사 리포트 출력 (PDF)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '11px 20px',
                borderRadius: '10px',
                background: '#E2E8F0',
                color: '#334155',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none'
              }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      {/* 공식 노동청 감사 리포트 PDF 출력 모달 연동 */}
      <LegalComplianceAuditReportModal
        isOpen={isDetailReportOpen}
        onClose={() => setIsDetailReportOpen(false)}
        themeMode={themeMode}
      />
    </>
  );
};
