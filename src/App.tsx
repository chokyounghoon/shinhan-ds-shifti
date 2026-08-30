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
import { AiStatsAnalyticsView } from './views/AiStatsAnalyticsView';

// Modals
import { RequestModal } from './components/modals/RequestModal';
import { RequestActionSheetModal } from './components/modals/RequestActionSheetModal';
import { NoScheduleModal } from './components/modals/NoScheduleModal';
import { QRScannerModal } from './components/modals/QRScannerModal';
import { DayDetailModal } from './components/modals/DayDetailModal';
import { VacationRegistrationModal } from './components/modals/VacationRegistrationModal';
import { NotificationListModal } from './components/modals/NotificationListModal';
import { MessagesListModal } from './components/modals/MessagesListModal';

// DB & Types
import { dbService, DbAppNotification, DbAppMessage } from './services/db';
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
  | 'vacation_type_select'
  | 'ai_stats';

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

  // S-Sign 회원 정보 관리(마이페이지) 모달 상태
  const [isMyPageOpen, setIsMyPageOpen] = useState(false);

  // Tab & Page Navigation (초기 기본값: 메인 홈 화면)
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRequestActionSheetOpen, setIsRequestActionSheetOpen] = useState(false);
  const [isNoScheduleModalOpen, setIsNoScheduleModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isVacationModalOpen, setIsVacationModalOpen] = useState(false);
  const [selectedVacationType, setSelectedVacationType] = useState<string>('연차');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedDaySchedule, setSelectedDaySchedule] = useState<DaySchedule | null>(null);

  // 실시간 알림 & 메시지 센터 상태 (Cloudflare D1 연동)
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<DbAppNotification[]>([]);
  const [messagesList, setMessagesList] = useState<DbAppMessage[]>([]);

  // 🛡️ 노란봉투법/파견법 준수: 각 단계에 맞는 사용자/관리인에게만 실시간 알림 건수 및 목록 표시
  const filteredNotifications = notifications.filter(n => {
    const role = (currentUser?.role as string) || 'PARTNER_WORKER';
    const targetRole = n.targetRole || (n as any).target_role || 'ALL';

    if (role === 'PARTNER_WORKER' || role === 'PARTNER_EMPLOYEE') {
      // 일반 직원은 관리인용 결재 요청 알림 제외, 본인 대상(PARTNER_WORKER, ALL) 알림만 수신
      if (targetRole === 'PARTNER_MANAGER' || targetRole === 'PARTNER_PART_LEADER' || targetRole === 'DS_PRINCIPAL_PM') return false;
      if (n.type === 'APPROVAL_REQUEST' || n.type === 'INSPECTION_REQUEST') return false;
      return true;
    } else if (role === 'PARTNER_PART_LEADER' || role === 'PARTNER_SITE_MANAGER' || role === 'PARTNER_MANAGER' || (currentUser as any)?.isPartnerManager) {
      // 협력사 관리인은 1차 결재 요청 및 DS PM의 보완요청, 소속사 알림만 수신 (원청 2차 검수 알림 제외)
      if (targetRole === 'DS_PRINCIPAL_PM') return false;
      if (n.type === 'INSPECTION_REQUEST') return false;
      return targetRole === 'PARTNER_MANAGER' || targetRole === 'PARTNER_PART_LEADER' || targetRole === 'ALL';
    } else if (role === 'DS_PRINCIPAL_PM' || role === 'PRINCIPAL_INSPECTOR' || role === 'DS_DIRECTOR' || role === 'DS_PM') {
      // 🛡️ 신한DS 현장대리인(PM): 협력사 관리인이 1차 승인 완료하여 올라온 2차 검수 요청(INSPECTION_REQUEST) 및 SLA/정산/최종결과 알림만 수신
      // ❌ 직원이 협력사 관리인에게 상신한 1차 휴가 신청, 근태 신청, 소명 접수 알림은 절대 차단 (법적 지휘명령 분리)
      if (targetRole === 'PARTNER_MANAGER' || targetRole === 'PARTNER_PART_LEADER' || targetRole === 'PARTNER_WORKER' || targetRole === 'PARTNER_SITE_MANAGER') return false;
      if (n.type === 'APPROVAL_REQUEST' || n.type === 'GAP_NOTICE') return false;
      if (n.title?.includes('[결재 요청]') || n.title?.includes('[근태 신청]') || n.title?.includes('[휴가 신청]') || n.title?.includes('[소명 접수]') || n.content?.includes('1차 결재') || n.content?.includes('1차 승인이 필요')) return false;
      
      // 오직 협력사 1차 승인 완료된 2차 검수 요청(INSPECTION_REQUEST) 또는 공정 SLA/정산 알림만 통과
      if (n.type === 'INSPECTION_REQUEST') return true;
      if (targetRole === 'DS_PRINCIPAL_PM' || targetRole === 'DS_PM') return true;
      if (targetRole === 'ALL') {
        return n.type === 'SLA_ALERT' || n.type === 'CONTRACT_SETTLE' || n.type === 'APPROVAL_COMPLETED';
      }
      return false;
    }
    return true;
  }).sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const unreadNotificationCount = filteredNotifications.filter(n => !n.isRead).length;
  const unreadMessageCount = messagesList.filter(m => !m.isRead).length;

  // D1 DB 실시간 데이터 로드 & 폴링 동기화
  useEffect(() => {
    const loadD1Data = async () => {
      const part = currentUser?.partName || '상담';
      const role = currentUser?.role || 'DS_PRINCIPAL_PM';
      const [notis, msgs] = await Promise.all([
        dbService.fetchNotificationsFromD1(role, part),
        dbService.fetchMessagesFromD1(role, part),
        dbService.fetchUsersFromD1(),
        dbService.fetchManpowerFromD1(part)
      ]);
      setNotifications(notis);
      setMessagesList(msgs);
    };

    loadD1Data();
    // 15초마다 실시간 D1 폴링 동기화 (PC와 모바일 간 데이터 실시간 동기 유지)
    const interval = setInterval(loadD1Data, 15000);

    const handleNotiUpdate = () => {
      setNotifications([...dbService.getNotifications()]);
    };
    window.addEventListener('notification_updated', handleNotiUpdate);
    window.addEventListener('attendance_request_updated', handleNotiUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notification_updated', handleNotiUpdate);
      window.removeEventListener('attendance_request_updated', handleNotiUpdate);
    };
  }, [currentUser?.role, currentUser?.partName]);

  const handleMarkNotificationRead = async (id: string) => {
    await dbService.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotificationsRead = async () => {
    await dbService.markAllNotificationsAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkMessageRead = async (id: string) => {
    await dbService.markMessageAsRead(id);
    setMessagesList(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const handleSendReply = async (id: string, replyContent: string) => {
    await dbService.sendReplyInD1(id, replyContent);
    setMessagesList(prev => prev.map(m => m.id === id ? { ...m, isRead: true, replyStatus: 'COMPLETED', replyContent } : m));
  };

  const handleMarkAllMessagesRead = async () => {
    await dbService.markAllMessagesAsRead();
    setMessagesList(prev => prev.map(m => ({ ...m, isRead: true })));
  };

  const [partnerPortalTab, setPartnerPortalTab] = useState<'roster' | 'approvals' | 'clarifications' | 'gap_notices'>('roster');
  const [principalPortalTab, setPrincipalPortalTab] = useState<'monitoring' | 'roster' | 'dashboard' | 'report' | 'approvals' | 'evidences'>('monitoring');

  // 🌟 알림 클릭 시 해당 결재/관리 화면으로 즉시 텔레포트 이동 (역할 스위칭 + 탭 포커싱)
  const handleNotificationNavigate = (noti: DbAppNotification) => {
    const title = noti.title || '';
    const content = noti.content || '';
    const type = noti.type || '';

    // 1. [결재 요청] 연차/휴가 결재 요청 ➔ 협력사 관리인 [승인관리] 탭
    if (title.includes('결재 요청') || title.includes('연차') || title.includes('휴가') || type === 'APPROVAL_REQUEST' || content.includes('협력사 관리인')) {
      handleSwitchUser('PARTNER_MANAGER');
      setPartnerPortalTab('approvals');
      setCurrentPage('partner_portal');
      return;
    }

    // 2. [소명 요구] 원청 DS PM의 소명 요구 공문 ➔ 협력사 관리인 [소명관리] 탭
    if (title.includes('소명 요구') || (title.includes('소명') && title.includes('공문')) || type === 'DS_DEMANDED') {
      handleSwitchUser('PARTNER_MANAGER');
      setPartnerPortalTab('clarifications');
      setCurrentPage('partner_portal');
      return;
    }

    // 3. [소명서 작성 요청] 관리인이 소속 직원에게 전달한 소명 요청 ➔ 개인 홈 화면
    if (title.includes('소명서 작성') || title.includes('소명 전달') || type === 'FORWARDED_TO_WORKER') {
      handleSwitchUser('PARTNER');
      setCurrentPage('home');
      return;
    }

    // 4. [원청 상신/검수] 협력사 1차 승인 완료 ➔ 신한DS PM [승인관리] 탭
    if (title.includes('SLA 소명 상신') || title.includes('공백 사전 통보') || title.includes('원청') || type === 'PENDING_DS' || type === 'INSPECTION_REQUEST') {
      handleSwitchUser('DS_PM');
      setPrincipalPortalTab('approvals');
      setCurrentPage('principal_portal');
      return;
    }

    // 5. [최종 승인/반려] ➔ 개인 요청 현황 탭
    if (title.includes('승인 완료') || title.includes('반려') || type === 'APPROVED' || type === 'REJECTED') {
      handleSwitchUser('PARTNER');
      setCurrentPage('request');
      return;
    }

    // fallback: linkUrl 또는 협력사 승인관리
    if (noti.linkUrl) {
      setCurrentPage(noti.linkUrl as PageView);
    } else {
      handleSwitchUser('PARTNER_MANAGER');
      setPartnerPortalTab('approvals');
      setCurrentPage('partner_portal');
    }
  };

  // D1 DB 실시간 프로필 사진 & 정보 동기화
  useEffect(() => {
    const syncProfileFromD1 = async () => {
      const empId = (currentUser?.id || (currentUser as any)?.employeeId || 'S01832').toUpperCase().trim();
      const targetId = empId === '01832' ? 'S01832' : empId;
      try {
        const res = await fetch(`/api/users/${targetId}`);
        if (res.ok) {
          const json = await res.json();
          const dbUser = json.data || json;
          if (dbUser && (dbUser.profile_picture || dbUser.name)) {
            const pic = dbUser.profile_picture;
            setCurrentUser(prev => {
              const updated = {
                ...prev,
                name: prev.name || dbUser.name,
                partName: prev.partName || dbUser.part || '상담',
                avatarUrl: pic || prev.avatarUrl,
                profileImage: pic || prev.profileImage,
                profile_picture: pic || (prev as any).profile_picture
              } as User;
              dbService.setCurrentUser(updated);
              try {
                const saved = localStorage.getItem(SESSION_STORAGE_KEY);
                if (saved) {
                  const parsed = JSON.parse(saved);
                  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ ...parsed, ...updated }));
                }
              } catch (e) {}
              return updated;
            });
          }
        }
      } catch (err) {
        console.warn('Profile sync from D1 error:', err);
      }
    };

    syncProfileFromD1();
  }, []);

  const refreshData = () => {
    setCurrentUser(dbService.getCurrentUser());
    setSchedules(dbService.getWeeklySchedules());
    setRequests(dbService.getRequests());
    setStats(dbService.getWeeklyStats());
    setNotifications([...dbService.getNotifications()]);
    setMessagesList([...dbService.getMessages()]);
  };

  // [개발 모드] 역할 시뮬레이션: 실제 로그인 사용자 이름/정보는 그대로 유지하고 role + page만 변경
  const handleSwitchUser = (roleKey: 'PARTNER' | 'PARTNER_MANAGER' | 'DS_PM' | 'DS_DIRECTOR') => {
    const base = { ...currentUser }; // 로그인한 실제 사용자 정보 보존
    if (roleKey === 'DS_DIRECTOR') {
      const switched: User = {
        ...base,
        role: 'DS_DIRECTOR',
        roleTitle: '신한DS IT도급 총괄담당자 (부서장)'
      };
      dbService.setCurrentUser(switched);
      setCurrentUser(switched);
      setCurrentPage('principal_portal');
    } else if (roleKey === 'DS_PM') {
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
              if (user.role === 'DS_PRINCIPAL_PM' || user.role === 'DS_DIRECTOR') {
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
            {/* 📌 상단 고정 영역: 역할 시뮬레이터 바 + 헤더 (스크롤 시 고정) */}
            <div className="sticky-header-container" style={{
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              background: '#FFFFFF',
              width: '100%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
            }}>
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
                  onOpenMessages={() => setIsMessagesModalOpen(true)}
                  onOpenNotifications={() => setIsNotificationModalOpen(true)}
                  onOpenAiStats={currentUser.role === 'DS_PRINCIPAL_PM' ? () => setCurrentPage('ai_stats') : undefined}
                  onOpenMyPage={() => setIsMyPageOpen(true)}
                  currentUser={currentUser}
                  themeMode={themeMode}
                  unreadMessageCount={unreadMessageCount}
                  unreadNotificationCount={unreadNotificationCount}
                />
              )}
            </div>

            {/* 본문 탭 및 역할별 뷰 영역 */}
            <main className="main-content" style={!isTabActive ? { padding: hideHeaderPages.includes(currentPage) ? 0 : '14px' } : undefined}>
              {/* 1. 신한DS 현장대리인 / DS총괄담당자 도급 공정 검수 포털 (투입현황 / 검수포털 / 실적리포트 / 승인관리 / 법적증빙) */}
              {currentPage === 'principal_portal' && (
                <PrincipalInspectionPortalView
                  themeMode={themeMode}
                  initialTab={principalPortalTab}
                />
              )}

              {/* 2. 협력사 파트장(현장대리인) 포털 */}
              {currentPage === 'partner_portal' && (
                <PartnerManagerPortalView
                  themeMode={themeMode}
                  onRequestUpdated={refreshData}
                  initialTab={partnerPortalTab}
                />
              )}

              {/* 3. 협력사 근로자 기본 홈 화면 */}
              {currentPage === 'home' && (
                <>
                  {/* 상단 누락기록 퀵 카드 */}
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
                    setSelectedVacationType(typeName);
                    setIsVacationModalOpen(true);
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
                  onOpenAiStats={currentUser.role === 'DS_PRINCIPAL_PM' ? () => setCurrentPage('ai_stats') : undefined}
                />
              )}

              {/* 10-2. AI 도급 공정 통계 & 시뮬레이터 화면 */}
              {currentPage === 'ai_stats' && (
                <AiStatsAnalyticsView
                  onBack={() => setCurrentPage('home')}
                  themeMode={themeMode}
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
                  onBack={() => {
                    if (currentUser.role === 'DS_PRINCIPAL_PM' || currentUser.role === 'PRINCIPAL_INSPECTOR') {
                      setCurrentPage('principal_portal');
                    } else if (currentUser.role === 'PARTNER_SITE_MANAGER' || currentUser.role === 'PARTNER_PART_LEADER') {
                      setCurrentPage('partner_portal');
                    } else {
                      setCurrentPage('home');
                    }
                  }}
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
              onOpenAiStats={currentUser.role === 'DS_PRINCIPAL_PM' ? () => setCurrentPage('ai_stats') : undefined}
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

            {/* 소속사 휴가 신청 모달 (D1 DB attendance_requests 연동) */}
            <VacationRegistrationModal
              isOpen={isVacationModalOpen}
              onClose={() => setIsVacationModalOpen(false)}
              onSuccess={(type, dateRange) => {
                setIsVacationModalOpen(false);
                refreshData();
              }}
              currentUser={currentUser}
              isManagerMode={currentUser.role === 'PARTNER_PART_LEADER' || (currentUser as any).isPartnerManager}
              initialType={selectedVacationType}
              themeMode={themeMode}
            />

            <DayDetailModal
              schedule={selectedDaySchedule}
              onClose={() => setSelectedDaySchedule(null)}
              onOpenRequest={() => setIsRequestModalOpen(true)}
              themeMode={themeMode}
            />

            {/* 실시간 공정/SLA 알림 센터 모달 */}
            <NotificationListModal
              isOpen={isNotificationModalOpen}
              onClose={() => setIsNotificationModalOpen(false)}
              notifications={filteredNotifications}
              onMarkRead={handleMarkNotificationRead}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onNavigate={(url) => {
                if (url) setCurrentPage(url as PageView);
              }}
              onNavigateNotification={handleNotificationNavigate}
            />

            {/* 도급 소통 / 메시지 및 소명 센터 모달 (Cloudflare D1 연동) */}
            <MessagesListModal
              isOpen={isMessagesModalOpen}
              onClose={() => setIsMessagesModalOpen(false)}
              messages={messagesList}
              onMarkRead={handleMarkMessageRead}
              onMarkAllRead={handleMarkAllMessagesRead}
              onSendReply={handleSendReply}
              currentUserRole={currentUser?.role}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
