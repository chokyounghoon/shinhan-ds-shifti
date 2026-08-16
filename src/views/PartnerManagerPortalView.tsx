import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, Users, Clock, FileText, Send, AlertTriangle } from 'lucide-react';
import { dbService } from '../services/db';
import { AttendanceRequest } from '../types';

interface PartnerManagerPortalViewProps {
  themeMode: 'ddangyo' | 'shinhan';
  onRequestUpdated: () => void;
}

export const PartnerManagerPortalView: React.FC<PartnerManagerPortalViewProps> = ({
  themeMode,
  onRequestUpdated
}) => {
  const [requests, setRequests] = useState<AttendanceRequest[]>(dbService.getRequests());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleApprove = (reqId: string) => {
    dbService.approvePartnerRequest(reqId, '현장대리인 김협력 승인 완료');
    setRequests(dbService.getRequests());
    onRequestUpdated();
    setToastMsg('✅ 소속 직원 근태 신청이 승인되었습니다. (원청 개입 없이 협력사 독자 처리)');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleReject = (reqId: string) => {
    const reason = prompt('반려 사유를 입력하세요 (협력사 내부 복무규정 기준):', '프로젝트 집중 개발 일정으로 인한 일정 조율 필요');
    if (reason) {
      dbService.rejectPartnerRequest(reqId, reason);
      setRequests(dbService.getRequests());
      onRequestUpdated();
      setToastMsg('❌ 신청이 반려 처리되었습니다.');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingBottom: '80px' }}>
      {/* 1. 컴플라이언스 보호 안내 배너 */}
      <div style={{
        background: '#E8F8F0',
        border: '1px solid #B7EB8F',
        borderRadius: '12px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#135200', fontSize: '13px', fontWeight: 800 }}>
          <ShieldCheck size={18} color="#52C41A" />
          <span>파견법·노란봉투법 대응 협력사 전용 노무관리 포털</span>
        </div>
        <p style={{ fontSize: '11.5px', color: '#389E0D', lineHeight: 1.4 }}>
          본 포털의 모든 결재 권한은 <strong>협력사 현장대리인(김협력 PM)</strong>에게 독점 귀속되며, 발주사(신한DS)의 직접적인 지휘·명령은 시스템적으로 원천 차단됩니다.
        </p>
      </div>

      {toastMsg && (
        <div style={{
          background: '#191F28',
          color: '#FFFFFF',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '12.5px',
          fontWeight: 600
        }}>
          {toastMsg}
        </div>
      )}

      {/* 2. 협력사 인력 및 공수 KPI 현황 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>소속 상주인력</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#191F28', marginTop: '4px' }}>8명</div>
        </div>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>결재 대기</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF', marginTop: '4px' }}>
            {requests.filter(r => r.status === 'PENDING').length}건
          </div>
        </div>
        <div style={kpiBoxStyle}>
          <div style={{ fontSize: '11px', color: '#6B7684', fontWeight: 600 }}>금월 투입공수</div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#12B76A', marginTop: '4px' }}>11.9 M/M</div>
        </div>
      </div>

      {/* 3. 소속 직원 근태 신청 결재 대기 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={18} color="#4E5968" />
          <span>소속 직원 근태 결재 목록 (현장대리인 전결)</span>
        </div>

        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', background: '#FFFFFF', borderRadius: '12px', color: '#8B95A1', fontSize: '13px' }}>
            결재 대상 신청 내역이 없습니다.
          </div>
        ) : (
          requests.map(req => (
            <div
              key={req.id}
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #ECEFF2',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#191F28' }}>{req.userName}</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: req.requestType === 'VACATION' ? '#0066FF' : '#FF462D',
                    background: req.requestType === 'VACATION' ? '#EDF3FF' : '#FFF0ED',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {req.requestType === 'VACATION' ? '휴가 신청' : req.requestType === 'OVERTIME' ? '연장근무 신청' : '누락 소명'}
                  </span>
                </div>

                <span style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: req.status === 'APPROVED' ? '#12B76A' : req.status === 'REJECTED' ? '#F04438' : '#FF9500'
                }}>
                  {req.status === 'APPROVED' ? '● 승인완료' : req.status === 'REJECTED' ? '● 반려' : '● 현장대리인 결재대기'}
                </span>
              </div>

              <div style={{ fontSize: '13px', color: '#333D4B', marginBottom: '4px' }}>
                <strong>신청 사유:</strong> {req.reason}
              </div>

              <div style={{ fontSize: '12px', color: '#6B7684' }}>
                대상 일자: {req.targetDate} {req.startTime ? `(${req.startTime} ~ ${req.endTime})` : ''}
              </div>

              {req.approvalMemo && (
                <div style={{ fontSize: '11.5px', color: '#12B76A', marginTop: '6px', background: '#F8F9FA', padding: '6px 8px', borderRadius: '6px' }}>
                  결재 의견: {req.approvalMemo}
                </div>
              )}

              {/* 결재 버튼 영역 */}
              {req.status === 'PENDING' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F1F3F5' }}>
                  <button
                    onClick={() => handleReject(req.id)}
                    style={{
                      height: '38px',
                      background: '#FFF1F0',
                      border: '1px solid #FFA39E',
                      borderRadius: '8px',
                      color: '#F5222D',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <XCircle size={16} />
                    <span>반려</span>
                  </button>

                  <button
                    onClick={() => handleApprove(req.id)}
                    style={{
                      height: '38px',
                      background: '#12B76A',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>승인 확정</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 4. 원청 제출용 도급 이행 실적 리포트 생성 버튼 */}
      <button
        onClick={() => alert('📄 2026년 8월 협력사 도급 이행 공수(Man-Month: 11.9 M/M) 보고서가 원청(신한DS) 검수함으로 안전하게 제출되었습니다.')}
        style={{
          height: '48px',
          background: themeMode === 'ddangyo' ? 'linear-gradient(135deg, #FF5538 0%, #FF381E 100%)' : '#19315A',
          color: '#FFFFFF',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '6px'
        }}
      >
        <FileText size={18} />
        <span>원청(신한DS) 제출용 월간 도급 공수 실적서 생성</span>
      </button>
    </div>
  );
};

const kpiBoxStyle: React.CSSProperties = {
  background: '#FFFFFF',
  padding: '12px 10px',
  borderRadius: '10px',
  border: '1px solid #ECEFF2',
  textAlign: 'center'
};
