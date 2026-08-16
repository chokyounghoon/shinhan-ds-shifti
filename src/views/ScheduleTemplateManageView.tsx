import React, { useState } from 'react';
import { ArrowLeft, Clock, Check, Plus } from 'lucide-react';

export interface ScheduleTemplateItem {
  id: string;
  name: string; // e.g. 08~17
  timeRange: string; // e.g. 08:00 - 17:00
  scope: string; // e.g. (모든 조직) / CEO직속, 부서장, 팀원
  color: string;
  isActive: boolean;
}

// 스크린샷과 100% 일치하는 근무일정 템플릿 목록
export const defaultScheduleTemplates: ScheduleTemplateItem[] = [
  {
    id: 'tmpl-01',
    name: '08~17',
    timeRange: '08:00 - 17:00',
    scope: '(모든 조직) / CEO직속, 부서장, 팀원',
    color: '#8C531B',
    isActive: true
  },
  {
    id: 'tmpl-02',
    name: '09~18',
    timeRange: '09:00 - 18:00',
    scope: '(모든 조직) / CEO직속, 부서장, 팀원',
    color: '#38424E',
    isActive: true
  },
  {
    id: 'tmpl-03',
    name: '교대(야간)',
    timeRange: '[교대제(야간)] 18:00 - 09:00',
    scope: '(모든 조직) / 교대제',
    color: '#404B59',
    isActive: true
  },
  {
    id: 'tmpl-04',
    name: '교대(전일)',
    timeRange: '[교대제(전일)] 09:00 - 09:00',
    scope: '(모든 조직) / 교대제',
    color: '#707E91',
    isActive: true
  },
  {
    id: 'tmpl-05',
    name: '교대(주간)',
    timeRange: '[교대제(주간)] 09:00 - 18:00',
    scope: '(모든 조직) / 교대제',
    color: '#B0B9C6',
    isActive: true
  }
];

interface ScheduleTemplateManageViewProps {
  onBack: () => void;
  onOpenAddTemplate?: () => void;
  templatesList?: ScheduleTemplateItem[];
  themeMode: 'ddangyo' | 'shinhan';
}

export const ScheduleTemplateManageView: React.FC<ScheduleTemplateManageViewProps> = ({
  onBack,
  onOpenAddTemplate,
  templatesList = defaultScheduleTemplates,
  themeMode
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [templates, setTemplates] = useState<ScheduleTemplateItem[]>(templatesList);

  const filteredTemplates = templates.filter(t => activeTab === 'active' ? t.isActive : !t.isActive);

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 근무일정 템플릿 관리 | + 추가) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>근무일정 템플릿 관리</span>
        </div>

        {onOpenAddTemplate && (
          <button
            onClick={onOpenAddTemplate}
            style={{
              color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
            title="내 템플릿 추가"
          >
            <Plus size={22} strokeWidth={2.4} />
          </button>
        )}
      </div>

      {/* 2. 상단 탭 (활성 / 비활성) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ECEFF2', background: '#FFFFFF' }}>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '15px',
            fontWeight: activeTab === 'active' ? 800 : 600,
            color: activeTab === 'active' ? '#191F28' : '#8B95A1',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <span>활성</span>
          {activeTab === 'active' && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '25%',
              right: '25%',
              height: '2.5px',
              background: '#191F28'
            }} />
          )}
        </button>

        <button
          onClick={() => setActiveTab('inactive')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '15px',
            fontWeight: activeTab === 'inactive' ? 800 : 600,
            color: activeTab === 'inactive' ? '#191F28' : '#8B95A1',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <span>비활성</span>
          {activeTab === 'inactive' && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '25%',
              right: '25%',
              height: '2.5px',
              background: '#191F28'
            }} />
          )}
        </button>
      </div>

      {/* 3. 템플릿 목록 (스크린샷 100% 일치) */}
      {activeTab === 'active' ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '70px' }}>
          {filteredTemplates.map(tmpl => (
            <div
              key={tmpl.id}
              onClick={() => alert(`📑 [${tmpl.name}] 템플릿 (${tmpl.timeRange})\n적용 대상: ${tmpl.scope}`)}
              style={{
                padding: '16px 18px',
                borderBottom: '1px solid #ECEFF2',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                background: '#FFFFFF',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              {/* 좌측 컬러 스퀘어 박스 */}
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '4px',
                background: tmpl.color,
                marginTop: '3px',
                flexShrink: 0
              }} />

              {/* 템플릿 세부 내용 */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginBottom: '2px' }}>
                  {tmpl.name}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#191F28', marginBottom: '3px' }}>
                  {tmpl.timeRange}
                </div>
                <div style={{ fontSize: '13px', color: '#6B7684' }}>
                  {tmpl.scope}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8B95A1', fontSize: '14px' }}>
          비활성 상태인 템플릿이 없습니다.
        </div>
      )}
    </div>
  );
};
