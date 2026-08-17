import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ReportCard } from './components/ReportCard';
import { MissedPunchCard } from './components/MissedPunchCard';
import { TodayWorkCard } from './components/TodayWorkCard';
import { WeeklyScheduleCard } from './components/WeeklyScheduleCard';
import { CurrentStatusCard } from './components/CurrentStatusCard';
import { BottomNavigation, TabType } from './components/BottomNavigation';
import { DrawerMenu } from './components/DrawerMenu';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';

// Views
import { SGuardLoginView } from './views/SGuardLoginView';
import { SGuardMyPageView } from './views/SGuardMyPageView';
import { ContractFulfillmentDashboardView } from './views/ContractFulfillmentDashboardView';
import { RequestsView } from './views/RequestsView';
import { ScheduleView } from './views/ScheduleView';
import { LogsView } from './views/LogsView';
import { VacationView } from './views/VacationView';
import { VacationTypeSelectView } from './views/VacationTypeSelectView';
import { AccountSettingsView } from './views/AccountSettingsView';
import { ProfileEditView } from './views/ProfileEditView';
import { PartnerManagerPortalView } from './views/PartnerManagerPortalView';
import { PrincipalInspectionPortalView } from './views/PrincipalInspectionPortalView';
import { WorkLocationSelectView, defaultWorkLocations, WorkLocation } from './views/WorkLocationSelectView';
import { WorkLocationDetailView } from './views/WorkLocationDetailView';
import { OrganizationManageView, defaultOrgUnits, OrgUnit } from './views/OrganizationManageView';
import { OrganizationDetailView } from './views/OrganizationDetailView';
import { EmployeeManageView, EmployeeItem } from './views/EmployeeManageView';
import { ScheduleTemplateManageView, defaultScheduleTemplates, ScheduleTemplateItem } from './views/ScheduleTemplateManageView';
import { AttendanceReportView } from './views/AttendanceReportView';
import { MissedPunchRecordsView } from './views/MissedPunchRecordsView';
import { CurrentWorkStatusDetailView } from './views/CurrentWorkStatusDetailView';
import { CreateScheduleRequestView } from './views/CreateScheduleRequestView';
import { EditScheduleRequestView } from './views/EditScheduleRequestView';
import { AddScheduleTemplateView } from './views/AddScheduleTemplateView';

// Modals
import { RequestModal } from './components/modals/RequestModal';
import { RequestActionSheetModal } from './components/modals/RequestActionSheetModal';
import { NoScheduleModal } from './components/modals/NoScheduleModal';
import { QRScannerModal } from './components/modals/QRScannerModal';
import { DayDetailModal } from './components/modals/DayDetailModal';
import { VacationRegistrationModal } from './components/modals/VacationRegistrationModal';

// DB & Types
import { dbService } from './services/db';
import { User, DaySchedule, AttendanceRequest, WeeklyWorkStat } from './types';
import './styles/theme.css';

type PageView = 
  | TabType 
  | 'account_settings' 
  | 'profile_edit' 
  | 'partner_portal' 
  | 'principal_portal' 
  | 'work_locations' 
  | 'location_detail' 
  | 'organizations' 
  | 'org_detail' 
  | 'employees' 
  | 'schedule_templates' 
  | 'attendance_report' 
  | 'missed_punch_records' 
  | 'current_status_detail' 
  | 'create_schedule_request' 
  | 'edit_schedule_request'
  | 'add_schedule_template'
  | 'vacation_type_select';

const SESSION_STORAGE_KEY = 'SGUARD_AUTH_SESSION';

export function App() {
  // 세션 연결 여부 검사 (세션이 있으면 바로 메인화면, 없으면 로그인 화면 우선 표출)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      return !!savedSession;
    } catch (e) {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        dbService.setCurrentUser(parsed);
        return parsed;
      }
    } catch (e) {}
    return dbService.getCurrentUser();
  });
  const [schedules, setSchedules] = useState<DaySchedule[]>(dbService.getWeeklySchedules());
  const [requests, setRequests] = useState<AttendanceRequest[]>(dbService.getRequests());
  const [stats, setStats] = useState<WeeklyWorkStat>(dbService.getWeeklyStats());
  const [themeMode, setThemeMode] = useState<'ddangyo' | 'shinhan'>(dbService.getThemeMode());
  const [isMobileFrame, setIsMobileFrame] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<WorkLocation>(defaultWorkLocations[0]);
  const [inspectingLocation, setInspectingLocation] = useState<WorkLocation>(defaultWorkLocations[0]);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<OrgUnit | null>(null);
  const [templatesList, setTemplatesList] = useState<ScheduleTemplateItem[]>(defaultScheduleTemplates);
  const [hasScheduleToday, setHasScheduleToday] = useState(false);

  // S-GUARD 회원 정보 관리(마이페이지) 모달 상태
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);

  // Tab & Page Navigation (초기 기본값: 메인 홈 화면)
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRequestActionSheetOpen, setIsRequestActionSheetOpen] = useState(false);
  const [isNoScheduleModalOpen, setIsNoScheduleModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedDaySchedule, setSelectedDaySchedule] = useState<DaySchedule | null>(null);

  const refreshData = () => {
    setCurrentUser(dbService.getCurrentUser());
    setSchedules(dbService.getWeeklySchedules());
    setRequests(dbService.getRequests());
    setStats(dbService.getWeeklyStats());
  };

  // [개발 모드] 역할 시뮬레이션: 실제 로그인 사용자 이름/정보는 그대로 유지하고 role + page만 변경
  const handleSwitchUser = (roleKey: 'PARTNER' | 'PARTNER_MANAGER' | 'DS_PM') => {
    const base = { ...currentUser }; // 로그인한 실제 사용자 정보 보존
    if (roleKey === 'DS_PM') {
      const switched: User = {
        ...base,
        role: 'DS_PRINCIPAL_PM',
        roleTitle: '신한DS 현장대리인 (PM)'
      };
      dbService.setCurrentUser(switched);
      setCurrentUser(switched);
      setCurrentPage('principal_portal');
    } else if (roleKey === 'PARTNER_MANAGER') {
      const switched: User = {
        ...base,
        role: 'PARTNER_PART_LEADER',
        roleTitle: '협력사 현장관리인',
        isPartnerManager: true
      };
      dbService.setCurrentUser(switched);
      setCurrentUser(switched);
      setCurrentPage('partner_portal');
    } else {
      const switched: User = {
        ...base,
        role: 'PARTNER_WORKER',
        roleTitle: '협력사 투입 인력',
        isPartnerManager: false
      };
      dbService.setCurrentUser(switched);
      setCurrentUser(switched);
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {}
    setIsLoggedIn(false);
    setIsMyPageOpen(false);
    setIsDrawerOpen(false);
    setCurrentPage('home');
  };

  const handleToggleTheme = () => {
    const newMode = themeMode === 'ddangyo' ? 'shinhan' : 'ddangyo';
    setThemeMode(newMode);
    dbService.setThemeMode(newMode);
  };

  const isTabActive = ['home', 'request', 'schedule', 'logs', 'vacation'].includes(currentPage);
  const hideHeaderPages = [
    'account_settings', 
    'profile_edit', 
    'work_locations', 
    'location_detail', 
    'organizations', 
    'org_detail', 
    'employees', 
    'schedule_templates', 
    'attendance_report', 
    'missed_punch_records', 
    'current_status_detail', 
    'create_schedule_request', 
    'edit_schedule_request', 
    'add_schedule_template', 
    'vacation_type_select'
  ];

  return (
    <div className="app-container">
      <div className={`mobile-frame ${!isMobileFrame ? 'fullscreen-mode' : ''}`}>
        {/* S-GUARD 2FA 로그인 화면 (비로그인 상태일 때) */}
        {!isLoggedIn ? (
          <SGuardLoginView
            onLoginSuccess={(user) => {
              try {
                // 1년(365일) 장기 영구 세션 토큰 보관
                const sessionPayload = {
                  ...user,
                  token: (user as any).token || `SGUARD-PERM-TOKEN-${Date.now()}`,
                  expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000,
                  sessionDuration: '1_YEAR_EXTENDED'
                };
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionPayload));
              } catch (e) {}
              setIsLoggedIn(true);
              setCurrentUser(user);
              if (user.role === 'DS_PRINCIPAL_PM') {
                setCurrentPage('principal_portal');
              } else if (user.role === 'PARTNER_PART_LEADER' || (user as any).role === 'PARTNER_MANAGER') {
                setCurrentPage('partner_portal');
              } else {
                setCurrentPage('home');
              }
            }}
            themeMode={themeMode}
          />
        ) : (
          <>
            {/* 상단 3개 권한/역할 스위처 툴바 */}
            <RoleSwitcherBar
              currentUser={currentUser}
              onSwitchUser={handleSwitchUser}
              themeMode={themeMode}
            />

            {/* 상단 네비게이션 헤더 */}
            {!hideHeaderPages.includes(currentPage) && (
              <Header
                onOpenDrawer={() => setIsDrawerOpen(true)}
                onOpenMessages={() => setCurrentPage('request')}
                onOpenNotifications={() => alert('신규 공지: 2026년 8월 30인 도급 공정 검수 및 SLA 기준이 업데이트되었습니다.')}
                onOpenMyPage={() => setIsMyPageOpen(true)}
                currentUser={currentUser}
                themeMode={themeMode}
              />
            )}

            {/* 본문 탭 및 역할별 뷰 영역 */}
            <main className="main-content" style={!isTabActive ? { padding: hideHeaderPages.includes(currentPage) ? 0 : '14px' } : undefined}>
              {/* 1. 신한DS 총괄 PM 도급 계약 이행 및 30인 공정 검수 대시보드 (User 뷰) */}
              {currentPage === 'principal_portal' && (
                <ContractFulfillmentDashboardView
                  currentUser={currentUser}
                  themeMode={themeMode}
                />
              )}

              {/* 2. 협력사 파트장(현장대리인) 포털 */}
              {currentPage === 'partner_portal' && (
                <PartnerManagerPortalView
                  themeMode={themeMode}
                  onRequestUpdated={refreshData}
                />
              )}

              {/* 3. 협력사 근로자 기본 홈 화면 */}
              {currentPage === 'home' && (
                <>
                  {/* 상단 리포트 & 누락기록 퀵 카드 */}
                  <ReportCard onClick={() => setCurrentPage('attendance_report')} />
                  <MissedPunchCard onClick={() => setCurrentPage('missed_punch_records')} />

                  {/* 오늘 근무 히어로 카드 */}
                  <TodayWorkCard
                    onOpenRequest={() => setIsRequestActionSheetOpen(true)}
                    onOpenNoScheduleModal={() => setIsNoScheduleModalOpen(true)}
                    selectedLocation={selectedLocation}
                    hasScheduleToday={hasScheduleToday}
                    themeMode={themeMode}
                    onLogUpdated={refreshData}
                  />

                  {/* 이번주 근무 카드 (스크린샷 일치) */}
                  <WeeklyScheduleCard
                    schedules={schedules}
                    onSelectDay={day => setSelectedDaySchedule(day)}
                    onOpenVacationModal={() => setIsVacationModalOpen(true)}
                    themeMode={themeMode}
                  />

                  {/* 현재 근무 상황 카드 */}
                  <CurrentStatusCard
                    stats={stats}
                    onOpenDetail={() => setCurrentPage('current_status_detail')}
                    onOpenInfo={() => alert('근무 상황 기준: 근로기준법 제53조에 따라 주 최대 52시간(소정 40시간 + 연장 12시간)이 적용됩니다.')}
                    themeMode={themeMode}
                  />
                </>
              )}

              {/* 4. 하단 탭 서브 화면들 */}
              {currentPage === 'request' && (
                <RequestsView
                  requests={requests}
                  onOpenNewRequest={(initialType, actionName) => {
                    if (actionName === '근무일정 생성' || initialType === 'SCHEDULE') {
                      setCurrentPage('create_schedule_request');
                    } else if (actionName === '근무일정 수정') {
                      setCurrentPage('edit_schedule_request');
                    } else if (initialType === 'VACATION') {
                      setCurrentPage('vacation_type_select');
                    } else {
                      setIsRequestModalOpen(true);
                    }
                  }}
                  themeMode={themeMode}
                />
              )}

              {currentPage === 'schedule' && (
                <ScheduleView
                  user={currentUser}
                  onOpenNewScheduleRequest={() => setCurrentPage('create_schedule_request')}
                  themeMode={themeMode}
                />
              )}

              {currentPage === 'logs' && (
                <LogsView
                  user={currentUser}
                  themeMode={themeMode}
                  onOpenNewPunchRequest={() => setIsRequestModalOpen(true)}
                />
              )}

              {currentPage === 'vacation' && (
                <VacationView
                  user={currentUser}
                  onOpenTypeSelect={() => setCurrentPage('vacation_type_select')}
                  onOpenRequest={() => setIsRequestModalOpen(true)}
                  themeMode={themeMode}
                />
              )}

              {/* 5. 휴가 항목 선택 화면 */}
              {currentPage === 'vacation_type_select' && (
                <VacationTypeSelectView
                  onBack={() => setCurrentPage('vacation')}
                  onSelectType={typeName => {
                    alert(`✈️ [${typeName}] 휴가 신청서 작성으로 이동합니다.`);
                    setIsRequestModalOpen(true);
                    setCurrentPage('vacation');
                  }}
                  themeMode={themeMode}
                />
              )}

              {/* 6. 근무일정 생성 요청 화면 */}
              {currentPage === 'create_schedule_request' && (
                <CreateScheduleRequestView
                  onBack={() => setCurrentPage('request')}
                  onSubmitted={() => {
                    setHasScheduleToday(true);
                    setCurrentPage('request');
                    refreshData();
                  }}
                  themeMode={themeMode}
                />
              )}

              {/* 7. 근무일정 수정 요청 화면 */}
              {currentPage === 'edit_schedule_request' && (
                <EditScheduleRequestView
                  onBack={() => setCurrentPage('request')}
                  onSubmitted={() => {
                    setCurrentPage('request');
                    refreshData();
                  }}
                  themeMode={themeMode}
                />
              )}

              {/* 8. 내 템플릿 추가 화면 */}
              {currentPage === 'add_schedule_template' && (
                <AddScheduleTemplateView
                  onBack={() => setCurrentPage('schedule_templates')}
                  onSaveTemplate={newTmpl => {
                    setTemplatesList([newTmpl, ...templatesList]);
                  }}
                  themeMode={themeMode}
                />
              )}

              {/* 9. 내 계정 설정 및 프로필 편집 ➔ S-GUARD 회원 정보 관리 모달로 연결 */}
              {currentPage === 'account_settings' && (
                <AccountSettingsView
                  onBack={() => setCurrentPage('home')}
                  onNavigateToProfileEdit={() => setIsMyPageOpen(true)}
                  themeMode={themeMode}
                />
              )}

              {currentPage === 'profile_edit' && (
                <ProfileEditView
                  onBack={() => setCurrentPage('account_settings')}
                  user={currentUser}
                  onUserUpdated={u => setCurrentUser(u)}
                  themeMode={themeMode}
                />
              )}

              {/* 10. 리포트 테이블 화면 */}
              {currentPage === 'attendance_report' && (
                <AttendanceReportView
                  onBack={() => setCurrentPage('home')}
                  themeMode={themeMode}
                  currentUser={currentUser}
                />
              )}

              {/* 11. 출근/퇴근 누락 기록 화면 */}
              {currentPage === 'missed_punch_records' && (
                <MissedPunchRecordsView
                  onBack={() => setCurrentPage('home')}
                  themeMode={themeMode}
                />
              )}

              {/* 12. 현재 근무 상황 상세 화면 */}
              {currentPage === 'current_status_detail' && (
                <CurrentWorkStatusDetailView
                  onBack={() => setCurrentPage('home')}
                  themeMode={themeMode}
                />
              )}

              {/* 13. 출퇴근 장소 목록 관리 */}
              {currentPage === 'work_locations' && (
                <WorkLocationSelectView
                  onBack={() => setCurrentPage('home')}
                  selectedLocationId={selectedLocation.id}
                  onSelectLocation={loc => setSelectedLocation(loc)}
                  onOpenDetail={loc => {
                    setInspectingLocation(loc);
                    setCurrentPage('location_detail');
                  }}
                  themeMode={themeMode}
                />
              )}

              {/* 14. 출퇴근 장소 상세 화면 (지도 & 지오펜스 100m) */}
              {currentPage === 'location_detail' && (
                <WorkLocationDetailView
                  location={inspectingLocation}
                  onBack={() => setCurrentPage('work_locations')}
                  themeMode={themeMode}
                />
              )}

              {/* 15. 조직 관리 화면 */}
              {/* 15. 조직 관리 화면 */}
              {currentPage === 'organizations' && (
                <OrganizationManageView
                  onBack={() => setCurrentPage('home')}
                  onSelectOrg={org => {
                    setSelectedOrgUnit(org);
                    setCurrentPage('org_detail');
                  }}
                  onNavigateToLocationDetail={locName => {
                    const targetLoc = defaultWorkLocations.find(l => l.name.includes(locName) || locName.includes(l.name.replace('[좌표] ', ''))) || defaultWorkLocations[0];
                    setInspectingLocation(targetLoc);
                    setCurrentPage('location_detail');
                  }}
                  themeMode={themeMode}
                />
              )}

              {/* 16. 조직 상세 및 출퇴근 장소 화면 */}
              {currentPage === 'org_detail' && (
                <OrganizationDetailView
                  orgUnit={selectedOrgUnit}
                  onBack={() => setCurrentPage('organizations')}
                  onSelectWorkLocation={loc => {
                    setInspectingLocation(loc);
                    setCurrentPage('location_detail');
                  }}
                  themeMode={themeMode}
                />
              )}

              {/* 17. 직원 관리 화면 */}
              {currentPage === 'employees' && (
                <EmployeeManageView
                  onBack={() => setCurrentPage('home')}
                  onSelectEmployee={emp => alert(`👤 ${emp.name} (${emp.company} / ${emp.team} ${emp.part}파트) - ${emp.position}`)}
                  themeMode={themeMode}
                />
              )}

              {/* 18. 근무일정 템플릿 관리 화면 */}
              {currentPage === 'schedule_templates' && (
                <ScheduleTemplateManageView
                  onBack={() => setCurrentPage('home')}
                  onOpenAddTemplate={() => setCurrentPage('add_schedule_template')}
                  templatesList={templatesList}
                  themeMode={themeMode}
                />
              )}
            </main>

            {/* 하단 네비게이션 바 (개인 근로자 전용: 협력사 관리인 및 DS PM 포털에서는 숨김) */}
            {currentUser.role === 'PARTNER_WORKER' && (isTabActive || hideHeaderPages.includes(currentPage)) && (
              <BottomNavigation
                activeTab={isTabActive ? (currentPage as TabType) : 'home'}
                onTabChange={tab => setCurrentPage(tab)}
                onOpenQR={() => setIsQRModalOpen(true)}
                requestCount={requests.filter(r => r.status === 'PENDING').length}
                themeMode={themeMode}
              />
            )}

            {/* 사이드 드로어 메뉴 */}
            <DrawerMenu
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              user={currentUser}
              themeMode={themeMode}
              onToggleTheme={handleToggleTheme}
              isMobileFrame={isMobileFrame}
              onToggleFrame={() => setIsMobileFrame(!isMobileFrame)}
              onLogout={handleLogout}
              onOpenReport={() => setCurrentPage('attendance_report')}
              onOpenMissedPunch={() => setCurrentPage('missed_punch_records')}
              onOpenRequests={() => setCurrentPage('request')}
              onOpenAccountSettings={() => setIsMyPageOpen(true)}
              onOpenWorkLocations={() => setCurrentPage('work_locations')}
              onOpenOrganizations={() => setCurrentPage('organizations')}
              onOpenEmployees={() => setCurrentPage('employees')}
              onOpenScheduleTemplates={() => setCurrentPage('schedule_templates')}
              onOpenVacation={() => setIsVacationModalOpen(true)}
            />

            {/* S-GUARD 회원 정보 관리(마이페이지) 모달 (스크린샷 100% 일치) */}
            {isMyPageOpen && (
              <SGuardMyPageView
                user={currentUser}
                onClose={() => setIsMyPageOpen(false)}
                onLogout={handleLogout}
                onUserUpdated={(updated) => {
                  setCurrentUser(updated);
                  refreshData();
                }}
                themeMode={themeMode}
              />
            )}

            {/* 오늘 근무 요청 단축키 바텀 액션 시트 모달 */}
            <RequestActionSheetModal
              isOpen={isRequestActionSheetOpen}
              onClose={() => setIsRequestActionSheetOpen(false)}
              onSelectAction={actionName => {
                setIsRequestActionSheetOpen(false);
                if (actionName === '근무일정 생성') {
                  setCurrentPage('create_schedule_request');
                } else if (actionName === '근무일정 수정') {
                  setCurrentPage('edit_schedule_request');
                } else if (actionName === '휴가 생성') {
                  setCurrentPage('vacation_type_select');
                } else {
                  setIsRequestModalOpen(true);
                }
              }}
              themeMode={themeMode}
            />

            {/* 출근 가능한 근무일정 없음 모달 */}
            <NoScheduleModal
              isOpen={isNoScheduleModalOpen}
              onClose={() => setIsNoScheduleModalOpen(false)}
              onRequestSchedule={() => {
                setIsNoScheduleModalOpen(false);
                setCurrentPage('create_schedule_request');
              }}
              themeMode={themeMode}
            />

            {/* 신규 요청 상신 작성 모달 */}
            <RequestModal
              isOpen={isRequestModalOpen}
              onClose={() => setIsRequestModalOpen(false)}
              onRequestSubmitted={() => {
                setHasScheduleToday(true);
                refreshData();
              }}
              themeMode={themeMode}
            />

            <QRScannerModal
              isOpen={isQRModalOpen}
              onClose={() => setIsQRModalOpen(false)}
              onTagged={refreshData}
              themeMode={themeMode}
            />

            <DayDetailModal
              schedule={selectedDaySchedule}
              onClose={() => setSelectedDaySchedule(null)}
              onOpenRequest={() => setIsRequestModalOpen(true)}
              themeMode={themeMode}
            />

            {/* 휴가 / 사전 공수 제외 등록 모달 */}
            <VacationRegistrationModal
              isOpen={isVacationModalOpen}
              onClose={() => setIsVacationModalOpen(false)}
              onSuccess={(type, range) => {
                refreshData();
              }}
              currentUser={currentUser}
              themeMode={themeMode}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
