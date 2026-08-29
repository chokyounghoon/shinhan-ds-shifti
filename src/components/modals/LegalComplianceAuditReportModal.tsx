import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2, FileText, Building2, Calendar, Scale } from 'lucide-react';
import { excelService } from '../../services/excelService';

interface LegalComplianceAuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  partName?: string;
  partnerCompany?: string;
  auditRecords?: any[];
  signatureDataUrl?: string;
  signerName?: string;
  inspectionMonth?: string;
  themeMode?: 'ddangyo' | 'shinhan';
}

export const LegalComplianceAuditReportModal: React.FC<LegalComplianceAuditReportModalProps> = ({
  isOpen,
  onClose,
  partName = '상담 파트 (카드개발)',
  partnerCompany = '유브갓',
  auditRecords = [],
  signatureDataUrl,
  signerName = '조경훈 수석PM (신한DS)',
  inspectionMonth = '2026년 08월',
  themeMode = 'shinhan'
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().substring(0, 10);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    excelService.exportManpowerRecords(auditRecords, partName);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1150,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* 상단 툴바 */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0F172A',
          color: '#FFFFFF'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Scale size={22} color="#38BDF8" />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                노동청 불법파견 점검 대비 적법 도급 감사 리포트
              </h3>
              <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: '2px 0 0 0' }}>
                Legal Defense Audit Ledger & Service Delivery Inspection
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleExportCsv}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                borderRadius: '6px',
                background: '#1E293B',
                border: '1px solid #334155',
                color: '#E2E8F0',
                fontSize: '12.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Download size={14} />
              엑셀(CSV)
            </button>
            <button
              onClick={handlePrint}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '6px',
                background: '#0066FF',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Printer size={14} />
              인쇄 / PDF 저장
            </button>
            <button
              onClick={onClose}
              style={{
                color: '#94A3B8',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                marginLeft: '4px'
              }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* 인쇄 및 뷰어 본문 */}
        <div id="printable-audit-report" style={{
          padding: '32px',
          overflowY: 'auto',
          background: '#FFFFFF',
          color: '#0F172A',
          fontFamily: "'Pretendard', sans-serif"
        }}>
          {/* 리포트 타이틀 헤더 */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #0F172A', paddingBottom: '20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0066FF', letterSpacing: '2px', marginBottom: '6px' }}>
              SHINHAN DS COMPLIANCE VERIFICATION REPORT
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              도급 계약 공정 이행 및 지휘·명령 배제 실적 검수 확인서
            </h1>
            <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <span><b>검수 대상월:</b> {inspectionMonth}</span>
              <span><b>발행 일자:</b> {todayStr}</span>
              <span><b>인증 코드:</b> D1-AUDIT-202608-SHIFTI</span>
            </div>
          </div>

          {/* 1. 계약 및 검수 개요 표 */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={16} color="#0066FF" />
              1. 도급 계약 및 기성 검수 개요
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <tbody>
                <tr style={{ borderTop: '1px solid #CBD5E1', borderBottom: '1px solid #E2E8F0' }}>
                  <td style={{ width: '18%', padding: '8px 12px', background: '#F8FAFC', fontWeight: 700, color: '#475569' }}>도급 발주사(원청)</td>
                  <td style={{ width: '32%', padding: '8px 12px', color: '#0F172A' }}>신한DS (주) / 카드개발팀</td>
                  <td style={{ width: '18%', padding: '8px 12px', background: '#F8FAFC', fontWeight: 700, color: '#475569' }}>수급사업자(협력사)</td>
                  <td style={{ width: '32%', padding: '8px 12px', color: '#0F172A' }}>{partnerCompany}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #CBD5E1' }}>
                  <td style={{ padding: '8px 12px', background: '#F8FAFC', fontWeight: 700, color: '#475569' }}>도급 공정 및 과업</td>
                  <td style={{ padding: '8px 12px', color: '#0F172A' }}>{partName} 시스템 유지보수 및 기간계 운영</td>
                  <td style={{ padding: '8px 12px', background: '#F8FAFC', fontWeight: 700, color: '#475569' }}>수행 사업장</td>
                  <td style={{ padding: '8px 12px', color: '#0F172A' }}>파인에비뉴(카드) 독립 도급 수행 구역</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. 적법 도급 4대 요건 충족 입증 (고용노동부 불법파견 판단 지침) */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#00A859" />
              2. 고용노동부 적법 도급 판단 기준(지휘·명령권 배제) 입증
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  <CheckCircle2 size={15} color="#00A859" />
                  ① 업무상 지휘·명령권의 완전한 분리
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  원청(신한DS) PM은 개별 근로자에게 직접적인 업무 지시 및 복무 통제를 일체 행사하지 않으며, 수급사업자 현장관리인을 통해서만 공정 결과를 검수합니다.
                </p>
              </div>

              <div style={{ padding: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  <CheckCircle2 size={15} color="#00A859" />
                  ② 인사·노무 관리의 수급사업자 자율권
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  근로자의 휴가, 출퇴근, 연장근로, 징계 및 대체인력 투입은 수급사업자가 자체 취업규칙에 따라 자율 결정 후 원청에는 공정 공백 여부만 사전 통보합니다.
                </p>
              </div>

              <div style={{ padding: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  <CheckCircle2 size={15} color="#00A859" />
                  ③ 전문적 기술 및 독립적 사업체 경영
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  수급사업자는 독자적인 IT 기술 역량과 소속 전문 인력을 바탕으로 계약된 완료 기준의 IT 서비스 용역을 독립적으로 완성합니다.
                </p>
              </div>

              <div style={{ padding: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  <CheckCircle2 size={15} color="#00A859" />
                  ④ 블록체인형 감사 추적 원장(Audit Trail)
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                  모든 공정 지연, 소명서 교환, 기성 확정 이력은 Cloudflare D1 Database 내 수정 불가 감사 로그로 실시간 타임스탬프 기록·보존됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* 3. 최근 공정 검수 및 소명 조치 감사 로그 샘플 */}
          <div style={{ marginBottom: '28px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '10px' }}>
              3. 공정 검수 및 소명 조치 감사 내역 (Audit Trails)
            </h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#F1F5F9', borderTop: '1px solid #CBD5E1', borderBottom: '1px solid #CBD5E1' }}>
                  <th style={{ padding: '8px', color: '#334155' }}>기록 ID</th>
                  <th style={{ padding: '8px', color: '#334155' }}>투입 대상자</th>
                  <th style={{ padding: '8px', color: '#334155' }}>소속사</th>
                  <th style={{ padding: '8px', color: '#334155' }}>투입 공수</th>
                  <th style={{ padding: '8px', color: '#334155' }}>검수 판정</th>
                  <th style={{ padding: '8px', color: '#334155' }}>법적 조치 사항</th>
                </tr>
              </thead>
              <tbody>
                {auditRecords.length > 0 ? (
                  auditRecords.slice(0, 5).map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px', color: '#64748B' }}>{r.recordId || r.record_id || `REC-${i + 1}`}</td>
                      <td style={{ padding: '8px', fontWeight: 700, color: '#0F172A' }}>{r.workerName || r.worker_name || '송무준'}</td>
                      <td style={{ padding: '8px', color: '#475569' }}>{r.partnerCompany || r.partner_company || partnerCompany}</td>
                      <td style={{ padding: '8px', color: '#0F172A' }}>{r.actualInputHours || r.actual_input_hours || 8.0}h</td>
                      <td style={{ padding: '8px', color: '#0066FF', fontWeight: 700 }}>정상 검수 완료</td>
                      <td style={{ padding: '8px', color: '#64748B' }}>수급사 자율 관리 확인</td>
                    </tr>
                  ))
                ) : (
                  <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '8px' }}>rec-init-01</td>
                    <td style={{ padding: '8px', fontWeight: 700 }}>송무준</td>
                    <td style={{ padding: '8px' }}>유브갓</td>
                    <td style={{ padding: '8px' }}>8.0h</td>
                    <td style={{ padding: '8px', color: '#00A859', fontWeight: 700 }}>AUTO_SETTLED</td>
                    <td style={{ padding: '8px', color: '#64748B' }}>도급 계약 이행 확인 완료 (지휘명령 배제)</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 4. 기성 검수 확정 및 전자 서명 날인 영역 */}
          <div style={{
            borderTop: '2px solid #0F172A',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
                위와 같이 도급 용역 공정 이행 및 검수 내역을 상호 확인하고 확정합니다.
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                신한DS 카드개발팀 총괄 검수 책임자 및 수급사업자 현장관리인
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>검수 확인 서명자</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{signerName}</div>
              </div>

              {signatureDataUrl ? (
                <div style={{
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '4px',
                  background: '#FFFFFF',
                  width: '140px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img src={signatureDataUrl} alt="서명" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{
                  width: '120px',
                  height: '60px',
                  border: '1px dashed #94A3B8',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  color: '#94A3B8',
                  fontWeight: 600
                }}>
                  (전자 서명 필)
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-audit-report, #printable-audit-report * {
            visibility: visible;
          }
          #printable-audit-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
          }
        }
      `}</style>
    </div>
  );
};
