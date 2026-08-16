import React, { useState } from 'react';
import { ArrowLeft, Filter, Search, User as UserIcon, CheckCircle2, ChevronRight } from 'lucide-react';

export interface EmployeeItem {
  id: string;
  name: string;
  deptName: string;
  roleCategory: '최고관리자' | '총괄관리자' | '조직관리자' | '일반직원';
  email?: string;
  phone?: string;
  position?: string;
}

// 스크린샷과 100% 일치하는 직원 목록 데이터
export const defaultEmployees: EmployeeItem[] = [
  {
    id: 'emp-01',
    name: 'master',
    deptName: '신한DS',
    roleCategory: '최고관리자'
  },
  {
    id: 'emp-02',
    name: 'master2',
    deptName: '신한DS',
    roleCategory: '총괄관리자'
  },
  {
    id: 'emp-03',
    name: '김연섭',
    deptName: '카드개발팀',
    roleCategory: '조직관리자'
  },
  {
    id: 'emp-04',
    name: '김정림',
    deptName: '카드개발팀',
    roleCategory: '조직관리자'
  },
  {
    id: 'emp-05',
    name: '김종현',
    deptName: '카드개발팀',
    roleCategory: '조직관리자'
  },
  {
    id: 'emp-06',
    name: '김현석',
    deptName: '카드개발팀',
    roleCategory: '조직관리자'
  },
  {
    id: 'emp-07',
    name: '김현호',
    deptName: '카드개발팀',
    roleCategory: '조직관리자'
  },
  {
    id: 'emp-08',
    name: '김흥섭',
    deptName: '카드개발팀',
    roleCategory: '조직관리자'
  },
  {
    id: 'emp-09',
    name: '서성훈',
    deptName: '카드개발팀 (금융파트)',
    roleCategory: '조직관리자'
  },
  {
    id: 'emp-10',
    name: '이종민',
    deptName: '카드개발팀',
    roleCategory: '조직관리자'
  },
  {
    id: 'emp-11',
    name: '조경훈',
    deptName: '카드개발팀',
    roleCategory: '조직관리자'
  }
];

interface EmployeeManageViewProps {
  onBack: () => void;
  onSelectEmployee?: (emp: EmployeeItem) => void;
  themeMode: 'ddangyo' | 'shinhan';
}

export const EmployeeManageView: React.FC<EmployeeManageViewProps> = ({
  onBack,
  onSelectEmployee,
  themeMode
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'pending'>('current');

  const categories: Array<'최고관리자' | '총괄관리자' | '조직관리자'> = ['최고관리자', '총괄관리자', '조직관리자'];

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 직원 관리 | 필터) */}
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
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>직원 관리</span>
        </div>

        <button 
          onClick={() => alert('직원 필터: 권한별, 부서별(카드개발팀/금융본부/협력사) 필터링')}
          style={{ color: '#4E5968', display: 'flex', alignItems: 'center', padding: '4px' }}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* 2. 상단 탭 (현재직원 / 미합류) */}
      <div style={{ display: 'flex', borderBottom: '1px solid #ECEFF2', background: '#FFFFFF' }}>
        <button
          onClick={() => setActiveTab('current')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '15px',
            fontWeight: activeTab === 'current' ? 800 : 600,
            color: activeTab === 'current' ? '#191F28' : '#8B95A1',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <span>현재직원</span>
          {activeTab === 'current' && (
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
          onClick={() => setActiveTab('pending')}
          style={{
            flex: 1,
            padding: '14px 0',
            fontSize: '15px',
            fontWeight: activeTab === 'pending' ? 800 : 600,
            color: activeTab === 'pending' ? '#191F28' : '#8B95A1',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <span>미합류</span>
          {activeTab === 'pending' && (
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

      {/* 3. 직원 목록 (스크린샷 100% 일치) */}
      {activeTab === 'current' ? (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '70px' }}>
          {categories.map(category => {
            const employeesInCat = defaultEmployees.filter(e => e.roleCategory === category);
            if (employeesInCat.length === 0) return null;

            return (
              <div key={category} style={{ display: 'flex', flexDirection: 'column' }}>
                {/* 역할 카테고리 헤더 바 */}
                <div style={{
                  background: '#F8F9FA',
                  padding: '14px 18px 10px 18px',
                  fontSize: '13.5px',
                  fontWeight: 800,
                  color: '#191F28',
                  borderBottom: '1px solid #ECEFF2'
                }}>
                  {category}
                </div>

                {/* 해당 카테고리 직원 목록 */}
                {employeesInCat.map(emp => (
                  <div
                    key={emp.id}
                    onClick={() => {
                      if (onSelectEmployee) onSelectEmployee(emp);
                      else alert(`👤 ${emp.name} (${emp.deptName}) - ${emp.roleCategory}`);
                    }}
                    style={{
                      padding: '16px 18px',
                      borderBottom: '1px solid #ECEFF2',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      background: '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', minWidth: '60px' }}>
                      {emp.name}
                    </span>
                    {emp.deptName !== '신한DS' && (
                      <span style={{ fontSize: '14px', color: '#4E5968', fontWeight: 500 }}>
                        {emp.deptName}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#8B95A1', fontSize: '14px' }}>
          미합류 상태인 직원이 없습니다.
        </div>
      )}
    </div>
  );
};
