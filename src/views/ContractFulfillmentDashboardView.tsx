import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Download, 
  History, 
  Filter, 
  ArrowRight, 
  Clock, 
  Layers, 
  DollarSign, 
  Building2, 
  X,
  FileCheck2,
  Printer
} from 'lucide-react';
import { dbService } from '../services/db';
import { ManpowerInputRecord, PartFulfillmentSummary, AuditTrailLog, User } from '../types';

interface ContractFulfillmentDashboardViewProps {
  currentUser: User;
  themeMode: 'ddangyo' | 'shinhan';
}

export const ContractFulfillmentDashboardView: React.FC<ContractFulfillmentDashboardViewProps> = ({
  currentUser,
  themeMode
}) => {
  const [partSummaries, setPartSummaries] = useState<PartFulfillmentSummary[]>(dbService.getPartFulfillmentSummaries());
  const [selectedPartFilter, setSelectedPartFilter] = useState<string>('ALL');
  const [records, setRecords] = useState<ManpowerInputRecord[]>(dbService.getManpowerRecords());
  const [selectedRecordForAudit, setSelectedRecordForAudit] = useState<ManpowerInputRecord | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // 총 30인 투입 통계 계산
  const totalTargetHeadcount = partSummaries.reduce((sum, p) => sum + p.targetHeadcount, 0); // 30명
  const totalActiveHeadcount = partSummaries.reduce((sum, p) => sum + p.activeHeadcount, 0); // 29명
  const overallFulfillmentRate = ((totalActiveHeadcount / totalTargetHeadcount) * 100).toFixed(1); // 96.7%
  const totalSlaBreaches = partSummaries.reduce((sum, p) => sum + p.slaBreachCount, 0); // 1건

  const filteredRecords = records.filter(r => {
    if (selectedPartFilter === 'ALL') return true;
    return r.partName.includes(selectedPartFilter);
  });

  // DS 관리인의 [계약 투입 검수 완료] 처리
  const handleVerifyContract = (recordId: string) => {
    const updated = dbService.verifyAndConfirmContractFulfillment(recordId, '신한DS 도급 계약 기준에 따른 실투입 공수 최종 확인');
    if (updated) {
      setRecords([...dbService.getManpowerRecords()]);
      setToastMsg('🎉 [계약 투입 검수 완료] 도급 계약 기준에 따라 투입 공수가 최종 확정되었습니다.');
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '90px' }}>
      {/* 1. 상단 시스템 타이틀 & 법적 방어막 안내 배너 */}
      <div style={{
        background: '#0B2347',
        color: '#FFFFFF',
        borderRadius: '14px',
        padding: '18px',
        boxShadow: '0 4px 16px rgba(11, 35, 71, 0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '11.5px', color: '#82B1FF', fontWeight: 700, letterSpacing: '0.5px' }}>
              CONTRACT FULFILLMENT & MANPOWER VERIFICATION SYSTEM
            </div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, margin: '4px 0 0 0', color: '#FFFFFF' }}>
              도급 인력 투입 및 공정 검수 시스템
            </h2>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#00E5FF'
          }}>
            총 30인 도급 총괄
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '12px',
          color: '#E1E9F4',
          lineHeight: 1.45,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          🛡️ <strong>노란봉투법 & 파견법 방어 컴플라이언스</strong><br />
          본 시스템은 인사관리(HR)를 배제하고 도급 계약에 따른 <strong>'공수(Man-Month) 산정 및 SLA 이행 검수'</strong>를 목적으로 운영됩니다.
        </div>
      </div>

      {toastMsg && (
        <div style={{
          background: '#191F28',
          color: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {toastMsg}
        </div>
      )}

      {/* 2. 전체 투입 요약 KPI 그리드 (근태 ❌ ➔ 투입률 & SLA ⭕) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11.5px', color: '#6B7684', fontWeight: 600 }}>총 투입 인원 (30인)</div>
          <div style={{ fontSize: '19px', fontWeight: 800, color: '#191F28', marginTop: '4px' }}>
            <span style={{ color: '#0066FF' }}>{totalActiveHeadcount}</span> / {totalTargetHeadcount}명
          </div>
        </div>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11.5px', color: '#6B7684', fontWeight: 600 }}>전체 투입률 (%)</div>
          <div style={{ fontSize: '19px', fontWeight: 800, color: '#12B76A', marginTop: '4px' }}>
            {overallFulfillmentRate}%
          </div>
        </div>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11.5px', color: '#6B7684', fontWeight: 600 }}>SLA 미준수 건수</div>
          <div style={{ fontSize: '19px', fontWeight: 800, color: totalSlaBreaches > 0 ? '#F04438' : '#12B76A', marginTop: '4px' }}>
            {totalSlaBreaches}건
          </div>
        </div>
      </div>

      {/* 3. 파트별 인력 투입률(%) 메인 노출 영역 (Part 1, Part 2, Part 3 각 10명) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={18} color="#0066FF" />
            <span>파트별 실시간 인력 투입률 (Man-Power Fulfillment)</span>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#FFFFFF',
              border: '1px solid #DDE2E5',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#333D4B',
              cursor: 'pointer'
            }}
          >
            <FileText size={14} color="#0066FF" />
            <span>공수 미달 리포트(공문)</span>
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {partSummaries.map(part => (
            <div
              key={part.partId}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #ECEFF2',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#191F28' }}>
                    {part.partName}
                  </span>
                  <span style={{ fontSize: '12px', color: '#8B95A1', marginLeft: '6px' }}>
                    (현장대리인: {part.leaderName})
                  </span>
                </div>

                <span style={{
                  fontSize: '12px',
                  fontWeight: 800,
                  color: part.fulfillmentRate === 100 ? '#12B76A' : '#D9480F',
                  background: part.fulfillmentRate === 100 ? '#E8F8F0' : '#FFF4E6',
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  투입률 {part.fulfillmentRate}%
                </span>
              </div>

              {/* 투입 인원 게이지 */}
              <div style={{ background: '#F8F9FA', padding: '12px', borderRadius: '8px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                  <span style={{ color: '#4E5968' }}>
                    목표: <strong>{part.targetHeadcount}명 (약정 {part.targetManHours}h)</strong>
                  </span>
                  <span style={{ color: '#0066FF', fontWeight: 800 }}>
                    실투입: {part.activeHeadcount}명 ({part.actualManHours}h)
                  </span>
                </div>
                <div style={{ height: '7px', background: '#E5E8EB', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${part.fulfillmentRate}%`,
                    height: '100%',
                    background: part.fulfillmentRate === 100 ? '#12B76A' : '#FF9500',
                    borderRadius: '4px'
                  }} />
                </div>
              </div>

              {/* SLA 편차 및 도급비 감액 산정 내역 */}
              {part.slaBreachCount > 0 && (
                <div style={{
                  background: '#FFF9F5',
                  border: '1px solid #FFE8D6',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px'
                }}>
                  <span style={{ color: '#D9480F', fontWeight: 700 }}>
                    ⚠️ SLA 미준수 {part.slaBreachCount}건 (투입 지연 소명 접수됨)
                  </span>
                  <span style={{ color: '#D9480F', fontWeight: 800 }}>
                    정산 감액 산정: -₩{part.estimatedBillingDeduction.toLocaleString()}원
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. 3단계 워크플로우 (Approval Flow -> Work Verification Flow) */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '16px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1E293B', marginBottom: '10px' }}>
          🔄 도급 공정 3단계 검수 워크플로우 (Work Verification Flow)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', textAlign: 'center', fontSize: '11px' }}>
          <div style={{ background: '#FFFFFF', padding: '10px 6px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 800, color: '#0066FF', marginBottom: '2px' }}>1단계: 근로자</div>
            <div style={{ color: '#64748B' }}>출퇴근 투입 입력<br />작업 내용 등록</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '10px 6px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 800, color: '#D9480F', marginBottom: '2px' }}>2단계: 파트장</div>
            <div style={{ color: '#64748B' }}>1차 사실확인<br />예외상황 소명 상신</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '10px 6px', borderRadius: '8px', border: '1px solid #0066FF', boxShadow: '0 2px 4px rgba(0,102,255,0.08)' }}>
            <div style={{ fontWeight: 800, color: '#0066FF', marginBottom: '2px' }}>3단계: DS 관리인</div>
            <div style={{ color: '#0F172A', fontWeight: 700 }}>계약 투입 검수<br />공수 최종 확정</div>
          </div>
        </div>
      </div>

      {/* 5. 투입 인력 상세 검수 테이블 & [계약 투입 검수 완료] 버튼 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileCheck2 size={18} color="#0066FF" />
            <span>투입 인력 공수 검수 대상 (30인)</span>
          </div>

          {/* 파트 필터 탭 */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {['ALL', 'Part 1', 'Part 2', 'Part 3'].map(p => (
              <button
                key={p}
                onClick={() => setSelectedPartFilter(p)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: selectedPartFilter === p ? '1px solid #0066FF' : '1px solid #ECEFF2',
                  background: selectedPartFilter === p ? '#EDF3FF' : '#FFFFFF',
                  color: selectedPartFilter === p ? '#0066FF' : '#6B7684',
                  fontSize: '11.5px',
                  fontWeight: selectedPartFilter === p ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {filteredRecords.map(rec => (
          <div
            key={rec.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              padding: '16px',
              border: rec.isSlaBreach ? '1.5px solid #FFD8D4' : '1px solid #ECEFF2',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#191F28' }}>
                    {rec.workerName}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6B7684' }}>
                    ({rec.partName})
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#8B95A1', marginTop: '2px' }}>
                  투입시간: {rec.clockInTime} ~ {rec.clockOutTime} ({rec.actualInputHours}h / 약정 {rec.contractedHours}h)
                </div>
              </div>

              {/* 검수 상태 뱃지 */}
              <span style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: rec.verificationStatus === 'VERIFIED_ACCEPTED' ? '#12B76A' : '#FF9500',
                background: rec.verificationStatus === 'VERIFIED_ACCEPTED' ? '#E8F8F0' : '#FFF9E6',
                padding: '3px 8px',
                borderRadius: '4px'
              }}>
                {rec.verificationStatus === 'VERIFIED_ACCEPTED' ? '검수 완료 (공수 확정)' : '검수 대기중'}
              </span>
            </div>

            <div style={{ fontSize: '12.5px', color: '#333D4B', background: '#FAFAFA', padding: '8px 10px', borderRadius: '6px' }}>
              <strong>작업 내역</strong>: {rec.taskSummary}
            </div>

            {/* 파트장 1차 소명 내용 */}
            {rec.partnerClarification && (
              <div style={{
                background: '#FFF9F5',
                border: '1px solid #FFE8D6',
                borderRadius: '6px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#D9480F',
                lineHeight: 1.4
              }}>
                <strong>파트장(현장대리인) 1차 사실확인 소명</strong>:<br />
                {rec.partnerClarification}
              </div>
            )}

            {/* 하단 액션 바: Audit Trail 이력 보기 & [계약 투입 검수 완료] 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
              <button
                onClick={() => setSelectedRecordForAudit(rec)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: '#6B7684',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <History size={14} />
                <span>검수 이력 추적 ({rec.auditTrails.length}건)</span>
              </button>

              {rec.verificationStatus === 'SUBMITTED_TO_DS' && (
                <button
                  onClick={() => handleVerifyContract(rec.id)}
                  style={{
                    background: '#0066FF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>계약 투입 검수 완료</span>
                </button>
              )}
            </div>

            {/* 고정 법적 문구 (Legal Safeguard) */}
            <div style={{ fontSize: '11px', color: '#8B95A1', borderTop: '1px dashed #ECEFF2', paddingTop: '6px' }}>
              ⚖️ <em>"본 절차는 도급 계약 기반의 투입 공수 정산을 위한 확인 절차임"</em>
            </div>
          </div>
        ))}
      </div>

      {/* 6. 수정/검수 이력 추적 모달 (Audit Trail) */}
      {selectedRecordForAudit && (
        <div 
          className="modal-overlay"
          onClick={() => setSelectedRecordForAudit(null)}
          style={{ alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
        >
          <div 
            style={{
              width: '90%',
              maxWidth: '380px',
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '22px 20px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#191F28' }}>
                📜 투입 검수 이력 추적 (Audit Trail)
              </span>
              <button onClick={() => setSelectedRecordForAudit(null)} style={{ color: '#8B95A1' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0066FF', marginBottom: '12px' }}>
              대상자: {selectedRecordForAudit.workerName} ({selectedRecordForAudit.partName})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {selectedRecordForAudit.auditTrails.map((a, idx) => (
                <div key={a.id} style={{ background: '#F8F9FA', padding: '10px 12px', borderRadius: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8B95A1', marginBottom: '4px' }}>
                    <span>{a.timestamp}</span>
                    <span style={{ fontWeight: 700, color: '#191F28' }}>{a.actorName} ({a.actorRole})</span>
                  </div>
                  <div style={{ fontWeight: 800, color: '#0066FF', marginBottom: '2px' }}>{a.action}</div>
                  <div style={{ color: '#4E5968' }}>{a.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 7. 파트별 공수 미달 공식 리포트(공문) 모달 */}
      {isReportModalOpen && (
        <div 
          className="modal-overlay"
          onClick={() => setIsReportModalOpen(false)}
          style={{ alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 1000 }}
        >
          <div 
            style={{
              width: '92%',
              maxWidth: '420px',
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#191F28' }}>
                📑 파트별 공수 미달 공식 리포트
              </span>
              <button onClick={() => setIsReportModalOpen(false)} style={{ color: '#8B95A1' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: '#F8F9FA',
              border: '1px solid #ECEFF2',
              borderRadius: '8px',
              padding: '14px',
              fontSize: '12.5px',
              color: '#333D4B',
              lineHeight: 1.5,
              marginBottom: '16px'
            }}>
              <strong>문서번호</strong>: SHDS-CONT-2026-0816<br />
              <strong>수신</strong>: (주)협력아이티에스 대표이사 및 현장대리인<br />
              <strong>발신</strong>: (주)신한DS 도급사업 총괄 PM (조경훈)<br />
              <strong>제목</strong>: 2026년 8월 30인 도급 인력 투입 공수 편차 및 SLA 미준수 통지 건<br />
              <hr style={{ border: 'none', borderTop: '1px solid #E5E8EB', margin: '10px 0' }} />
              <strong>[파트별 투입 현황 요약]</strong><br />
              • Part 1 (카드IS): 약정 10명 / 실투입 9명 (투입률 90%) - <strong>SLA 미준수 1건</strong><br />
              • Part 2 (코어뱅킹): 약정 10명 / 실투입 10명 (투입률 100%) - 정상<br />
              • Part 3 (인프라): 약정 10명 / 실투입 10명 (투입률 100%) - 정상<br />
              <br />
              <strong>[도급비 정산 조치 사항]</strong><br />
              도급계약 제14조에 따라 Part 1 투입 지연에 따른 <strong>₩42,500원</strong> 감액 정산 확정 통지.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => {
                  alert('🖨️ 공식 도급 계약 이행 리포트(PDF)가 다운로드되었습니다.');
                  setIsReportModalOpen(false);
                }}
                style={{
                  padding: '10px 16px',
                  background: '#0066FF',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <Download size={15} />
                <span>공문 PDF 다운로드 및 협력사 발송</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const kpiBoxStyle: React.CSSProperties = {
  background: '#FFFFFF',
  padding: '14px 10px',
  borderRadius: '10px',
  border: '1px solid #ECEFF2',
  textAlign: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
};
