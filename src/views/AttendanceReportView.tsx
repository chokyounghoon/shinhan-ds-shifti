import React, { useState } from 'react';
import { ArrowLeft, Filter, Search, Calendar, ChevronDown, ChevronRight, User as UserIcon, Building2, ShieldCheck, CheckCircle2, AlertTriangle, FileSpreadsheet, Download, BarChart2, List, Sparkles } from 'lucide-react';
import { User } from '../types';
import { dbService, DbManpowerInput } from '../services/db';
import { InteractiveAnalyticsCharts } from '../components/charts/InteractiveAnalyticsCharts';
import { excelService } from '../services/excelService';

export interface EmployeeManpowerSummary {
  id: string;
  name: string;
  partnerCompany: string;
  deptName: string;
  contractedHours: string; // 약정 공수 (e.g. 160h)
  actualHours: string;     // 실투입 공수 (e.g. 160h, 152h)
  statusText: string;      // 정산 상태
  isWarning?: boolean;
}

interface AttendanceReportViewProps {
  onBack: () => void;
  themeMode: 'ddangyo' | 'shinhan';
  currentUser?: User;
  onOpenAiStats?: () => void;
}

export const AttendanceReportView: React.FC<AttendanceReportViewProps> = ({
  onBack,
  themeMode,
  currentUser = dbService.getCurrentUser(),
  onOpenAiStats
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('08.01 - 08.31');
  const [selectedPartner, setSelectedPartner] = useState<string>(currentUser.partnerCompany || '유브갓');
  const [selectedWorkerDetail, setSelectedWorkerDetail] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');

  // 역할 판정: 개인 근로자 vs 협력사 관리인/영업대표 vs 원청 PM
  const isIndividual = currentUser.role === 'PARTNER_WORKER' || currentUser.role === 'PARTNER_EMPLOYEE';
  const isPartnerManager = currentUser.role === 'PARTNER_PART_LEADER' || currentUser.role === 'PARTNER_SITE_MANAGER';

  // DB에서 데이터 로드
  const [allInputs, setAllInputs] = useState<DbManpowerInput[]>(dbService.getManpowerInputs());

  React.useEffect(() => {
    dbService.fetchManpowerFromD1(currentUser.partName).then(records => {
      setAllInputs(dbService.getManpowerInputs());
    });
  }, [currentUser.partName]);

  // 협력사별 인력 풀
  const partnerCompanies = ['유브갓', '(주)협력아이티에스', '현대IT솔루션', '오토시스', '파이낸스ITS'];

  const handleExportCsv = () => {
    if (allInputs && allInputs.length > 0) {
      excelService.exportManpowerRecords(allInputs, selectedPartner);
    } else {
      excelService.exportAttendanceStats(partnerWorkers, dateRange);
    }
  };

  // 1. 개인 근로자용 일일 투입 내역 (8월 기준)
  const personalDailyLogs = [
    { date: '08.15 (금)', start: '08:50', end: '18:00', hours: '8.0h', status: '자동 정산 확정', isNormal: true },
    { date: '08.14 (목)', start: '08:45', end: '18:00', hours: '8.0h', status: '자동 정산 확정', isNormal: true },
    { date: '08.13 (수)', start: '08:50', end: '18:00', hours: '8.0h', status: '자동 정산 확정', isNormal: true },
    { date: '08.12 (화)', start: '08:48', end: '18:00', hours: '8.0h', status: '자동 정산 확정', isNormal: true },
    { date: '08.11 (월)', start: '08:52', end: '18:00', hours: '8.0h', status: '자동 정산 확정', isNormal: true },
    { date: '08.08 (금)', start: '08:50', end: '18:00', hours: '8.0h', status: '자동 정산 확정', isNormal: true },
    { date: '08.07 (목)', start: '08:40', end: '18:00', hours: '8.0h', status: '자동 정산 확정', isNormal: true },
    { date: '08.06 (수)', start: '08:50', end: '18:00', hours: '8.0h', status: '자동 정산 확정', isNormal: true },
    { date: '08.05 (화)', start: '08:55', end: '18:00', hours: '8.0h', status: '자동 정산 확정', isNormal: true },
    { date: '08.04 (월)', start: '08:50', end: '18:00', hours: '8.0h', status: '자동 정산 확정', isNormal: true },
  ];

  // 2. 협력사 관리인용 소속 근로자 목록
  const partnerWorkers: EmployeeManpowerSummary[] = [
    { id: 'w-01', name: '송무준', partnerCompany: '유브갓', deptName: '상담 공정 (인바운드)', contractedHours: '160h', actualHours: '160h', statusText: '정산 확정 100%' },
    { id: 'w-02', name: '김성훈', partnerCompany: '유브갓', deptName: '상담 공정 (분실/도난)', contractedHours: '160h', actualHours: '160h', statusText: '정산 확정 100%' },
    { id: 'w-03', name: '김흥섭', partnerCompany: '유브갓', deptName: '상담 공정 (한도심사)', contractedHours: '160h', actualHours: '160h', statusText: '정산 확정 100%' },
    { id: 'w-04', name: '최진영', partnerCompany: '유브갓', deptName: '상담 공정 (해외승인)', contractedHours: '160h', actualHours: '160h', statusText: '정산 확정 100%' },
    { id: 'w-05', name: '이하은', partnerCompany: '유브갓', deptName: '상담 공정 (모바일배정)', contractedHours: '160h', actualHours: '152h', statusText: '소명서 검토대기', isWarning: true },
    { id: 'w-06', name: '강동현', partnerCompany: '유브갓', deptName: '상담 공정 (가맹점정산)', contractedHours: '160h', actualHours: '160h', statusText: '정산 확정 100%' },
    { id: 'w-07', name: '윤서아', partnerCompany: '유브갓', deptName: '상담 공정 (발급심사)', contractedHours: '160h', actualHours: '160h', statusText: '정산 확정 100%' },
    { id: 'w-08', name: '배지훈', partnerCompany: '유브갓', deptName: '상담 공정 (VIP상담)', contractedHours: '160h', actualHours: '160h', statusText: '정산 확정 100%' },

    // 타사 인력 샘플
    { id: 'w-11', name: '이제성', partnerCompany: '(주)협력아이티에스', deptName: 'CTI 연동/분배', contractedHours: '160h', actualHours: '160h', statusText: '정산 확정 100%' },
    { id: 'w-12', name: '정재호', partnerCompany: '(주)협력아이티에스', deptName: '우수회원 데스크', contractedHours: '160h', actualHours: '160h', statusText: '정산 확정 100%' },
    { id: 'w-21', name: '박민우', partnerCompany: '현대IT솔루션', deptName: '본인인증 트러블슈팅', contractedHours: '160h', actualHours: '160h', statusText: '정산 확정 100%' },
    { id: 'w-22', name: '한동훈', partnerCompany: '현대IT솔루션', deptName: '카드 기간계 유지보수', contractedHours: '160h', actualHours: '160h', statusText: '정산 확정 100%' },
  ];

  const filteredPartnerWorkers = partnerWorkers.filter(w => 
    w.partnerCompany === selectedPartner &&
    (w.name.includes(searchQuery) || w.deptName.includes(searchQuery))
  );

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>
            {isIndividual ? '내 도급 투입 실적 리포트' : '협력사 소속 인력 도급 리포트'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* 뷰 모드 토글 (목록 / 차트) */}
          <div style={{ display: 'flex', background: '#F1F3F5', borderRadius: '8px', padding: '2px' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'list' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'list' ? '#191F28' : '#8B95A1',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <List size={14} />
              <span>목록</span>
            </button>
            <button
              onClick={() => setViewMode('chart')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: 'none',
                background: viewMode === 'chart' ? '#FFFFFF' : 'transparent',
                color: viewMode === 'chart' ? '#0066FF' : '#8B95A1',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: viewMode === 'chart' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <BarChart2 size={14} />
              <span>차트</span>
            </button>
          </div>

          {onOpenAiStats && (
            <button 
              onClick={onOpenAiStats}
              title="AI 도급 공정 통계 & 시뮬레이터"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                padding: '6px 10px', 
                background: 'linear-gradient(135deg, #312E81 0%, #4338CA 100%)', 
                color: '#FFFFFF', 
                borderRadius: '6px', 
                border: 'none', 
                fontSize: '12px', 
                fontWeight: 800, 
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(67, 56, 202, 0.3)'
              }}
            >
              <Sparkles size={13} color="#A5B4FC" />
              <span>AI 통계</span>
            </button>
          )}

          <button 
            onClick={handleExportCsv}
            title="엑셀(CSV) 다운로드"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              padding: '6px 10px', 
              background: '#00A859', 
              color: '#FFFFFF', 
              borderRadius: '6px', 
              border: 'none', 
              fontSize: '12px', 
              fontWeight: 700, 
              cursor: 'pointer' 
            }}
          >
            <Download size={14} />
            <span>엑셀</span>
          </button>
        </div>
      </div>

      {/* 2. 기간 선택기 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px 8px 18px'
      }}>
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
          onClick={() => alert('조회 기간 변경: 2026.08.01 ~ 2026.08.31')}
        >
          <Calendar size={17} color="#333D4B" />
          <span style={{ fontSize: '15px', fontWeight: 700, color: '#191F28' }}>{dateRange}</span>
          <ChevronDown size={16} color="#6B7684" />
        </div>

        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#0052FF',
          background: 'rgba(0, 82, 255, 0.08)',
          padding: '4px 8px',
          borderRadius: '6px'
        }}>
          {isIndividual ? '개인 투입 확정' : `${selectedPartner} 영업대표 전용`}
        </div>
      </div>

      {/* 차트 뷰 모드 표출 */}
      {viewMode === 'chart' && (
        <div style={{ padding: '12px 18px' }}>
          <InteractiveAnalyticsCharts themeMode={themeMode} />
        </div>
      )}

      {/* 목록 뷰 모드 표출 */}
      {viewMode === 'list' && (
        isIndividual ? (
          <div style={{ padding: '8px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* 본인 요약 카드 */}
            <div style={{
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
              borderRadius: '16px',
              padding: '18px',
              color: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>도급 계약자 실적</div>
                <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#FFFFFF', margin: '2px 0 0 0' }}>
                  {currentUser.name || '송무준'}
                </h3>
                <div style={{ fontSize: '12px', color: '#38BDF8', marginTop: '2px' }}>
                  소속: {currentUser.partnerCompany || '유브갓'} · {currentUser.deptName || '상담 공정'}
                </div>
              </div>

              <div style={{
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#38BDF8'
              }}>
                정산율 100%
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>월간 약정 공수</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>160.0h</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>누적 실투입 공수</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: '#4ADE80', marginTop: '2px' }}>160.0h</div>
              </div>
            </div>
          </div>

          {/* 일자별 투입 내역 테이블 */}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#191F28', marginBottom: '8px' }}>
              8월 일일 투입 공수 내역서
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {personalDailyLogs.map((log, idx) => (
                <div key={idx} style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B' }}>
                      {log.date}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
                      GPS 투입 인증: {log.start} (1 M/D 확정)
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '15px', fontWeight: 900, color: '#0052FF' }}>
                      {log.hours}
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#16A34A', fontWeight: 700, marginTop: '2px' }}>
                      ✓ {log.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 법적 격리 고지 */}
          <div style={{
            padding: '10px 12px',
            background: '#EFF6FF',
            borderRadius: '8px',
            fontSize: '11px',
            color: '#1E40AF',
            lineHeight: 1.4
          }}>
            ※ 도급 계약 보안 지침에 따라 본인에게 부여된 일일 투입 실적만 조회 가능합니다.
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3-B. [협력사 관리인 탭] : 해당 업체 영업대표/관리인 전용 리포트 화면 */
        /* ========================================================================= */
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* 업체 선택 칩 바 */}
          <div style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            padding: '0 18px 10px 18px',
            scrollbarWidth: 'none'
          }}>
            {partnerCompanies.map((comp) => (
              <button
                key={comp}
                type="button"
                onClick={() => setSelectedPartner(comp)}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: selectedPartner === comp ? '1.5px solid #0052FF' : '1px solid #E2E8F0',
                  background: selectedPartner === comp ? '#0052FF' : '#F8FAFC',
                  color: selectedPartner === comp ? '#FFFFFF' : '#64748B',
                  fontSize: '12px',
                  fontWeight: selectedPartner === comp ? 800 : 600,
                  cursor: 'pointer'
                }}
              >
                {comp}
              </button>
            ))}
          </div>

          {/* 검색창 */}
          <div style={{ padding: '0 18px 10px 18px' }}>
            <div style={{
              height: '38px',
              background: '#F1F3F5',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              gap: '8px'
            }}>
              <Search size={16} color="#8B95A1" />
              <input
                type="text"
                placeholder={`${selectedPartner} 소속 인원 검색`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13.5px',
                  color: '#191F28',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* 컬럼 헤더 (대체휴가 산정시간 완전 삭제! -> 약정 공수, 실투입 공수, 도급 검수상태) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
            alignItems: 'center',
            padding: '9px 18px',
            background: '#F8FAFC',
            borderTop: '1px solid #ECEFF2',
            borderBottom: '1px solid #ECEFF2',
            fontSize: '11.5px',
            fontWeight: 800,
            color: '#475569',
            textAlign: 'right'
          }}>
            <div style={{ textAlign: 'left' }}>성명 / 공정</div>
            <div>약정 공수</div>
            <div style={{ color: '#0052FF' }}>실투입 공수</div>
            <div>검수 상태</div>
          </div>

          {/* 인원별 행 리스트 */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredPartnerWorkers.map((worker) => (
              <div
                key={worker.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
                  alignItems: 'center',
                  padding: '13px 18px',
                  borderBottom: '1px solid #F1F3F5',
                  fontSize: '12.5px',
                  textAlign: 'right'
                }}
              >
                {/* 1. 성명 및 공정 */}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#191F28' }}>
                    {worker.name}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748B', marginTop: '1px' }}>
                    {worker.deptName}
                  </div>
                </div>

                {/* 2. 약정 공수 */}
                <div style={{ fontWeight: 700, color: '#475569' }}>
                  {worker.contractedHours}
                </div>

                {/* 3. 실투입 공수 */}
                <div style={{ fontWeight: 900, color: worker.isWarning ? '#E11D48' : '#0052FF' }}>
                  {worker.actualHours}
                </div>

                {/* 4. 검수 상태 */}
                <div>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 800,
                    color: worker.isWarning ? '#E11D48' : '#16A34A',
                    background: worker.isWarning ? '#FFE4E6' : '#DCFCE7',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {worker.statusText}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 하단 집계 요약 바 */}
          <div style={{
            margin: '16px 18px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{selectedPartner} 총 투입 인원</div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', marginTop: '2px' }}>
                {filteredPartnerWorkers.length}명
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>월간 총 확정 공수</div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#0052FF', marginTop: '2px' }}>
                {(filteredPartnerWorkers.length * 160).toLocaleString()} Man-Hour
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

