import React, { useState } from 'react';
import { ArrowLeft, ChevronRight, Check, X } from 'lucide-react';
import { dbService } from '../services/db';

interface ScheduleItem {
  id: string;
  dateLabel: string; // e.g. 8/17 (월)
  timeRange: string; // e.g. 09:00 - 18:00
}

interface EditScheduleRequestViewProps {
  onBack: () => void;
  onSubmitted: () => void;
  themeMode: 'ddangyo' | 'shinhan';
}

const initialOriginalSchedules: ScheduleItem[] = [
  { id: 'sch-1', dateLabel: '8/17 (월)', timeRange: '09:00 - 18:00' },
  { id: 'sch-2', dateLabel: '8/18 (화)', timeRange: '09:00 - 18:00' },
  { id: 'sch-3', dateLabel: '8/19 (수)', timeRange: '09:00 - 18:00' },
  { id: 'sch-4', dateLabel: '8/20 (목)', timeRange: '09:00 - 18:00' },
  { id: 'sch-5', dateLabel: '8/21 (금)', timeRange: '09:00 - 18:00' },
];

export const EditScheduleRequestView: React.FC<EditScheduleRequestViewProps> = ({
  onBack,
  onSubmitted,
  themeMode
}) => {
  const [period, setPeriod] = useState('08.16 - 08.22');
  const [originalSchedules, setOriginalSchedules] = useState<ScheduleItem[]>(initialOriginalSchedules);
  const [modifiedSchedules, setModifiedSchedules] = useState<ScheduleItem[]>([]);
  const [editingTarget, setEditingTarget] = useState<ScheduleItem | null>(null);
  const [editingTime, setEditingTime] = useState('10:00 - 19:00');
  const [step, setStep] = useState<'edit' | 'confirm'>('edit');
  const [reason, setReason] = useState('고객사 요구사항 긴급 반영을 위한 근무시간 조정');

  const handleOpenEditItem = (item: ScheduleItem) => {
    setEditingTarget(item);
    setEditingTime(item.timeRange === '09:00 - 18:00' ? '10:00 - 19:00' : item.timeRange);
  };

  const handleSaveModification = () => {
    if (!editingTarget) return;

    const updatedMod = modifiedSchedules.filter(m => m.id !== editingTarget.id);
    updatedMod.push({
      id: editingTarget.id,
      dateLabel: editingTarget.dateLabel,
      timeRange: editingTime
    });

    setModifiedSchedules(updatedMod);
    setEditingTarget(null);
  };

  const handleNextOrSubmit = () => {
    if (modifiedSchedules.length === 0) {
      alert('수정할 근무일정을 아래 [근무일정 (수정 전)] 목록에서 선택해주세요.');
      return;
    }

    if (step === 'edit') {
      setStep('confirm');
    } else {
      // 협력사 현장대리인 결재로 상신 (노란봉투법 세이프가드)
      modifiedSchedules.forEach(mod => {
        dbService.addRequest({
          requestType: 'SCHEDULE_CHANGE',
          targetDate: `2026-08-${mod.dateLabel.split('/')[1]?.split(' ')[0]}`,
          startTime: mod.timeRange.split(' - ')[0] || '10:00',
          endTime: mod.timeRange.split(' - ')[1] || '19:00',
          reason: reason
        });
      });

      alert(`✅ [근무일정 수정 요청]이 협력사 현장대리인(김협력 PM)에게 성공적으로 상신되었습니다.\n• 수정 건수: ${modifiedSchedules.length}건`);
      onSubmitted();
    }
  };

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. 상단 헤더 (← 근무일정 수정 요청 | 다음) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 18px',
        borderBottom: '1px solid #ECEFF2',
        background: '#FFFFFF'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button onClick={step === 'confirm' ? () => setStep('edit') : onBack} style={{ color: '#191F28', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#191F28' }}>
            {step === 'edit' ? '근무일정 수정 요청' : '수정 내역 확인 및 상신'}
          </span>
        </div>

        <button
          onClick={handleNextOrSubmit}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '16px',
            fontWeight: 800,
            color: modifiedSchedules.length > 0 ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF') : '#8B95A1',
            cursor: 'pointer'
          }}
        >
          {step === 'edit' ? '다음' : '상신하기'}
        </button>
      </div>

      {step === 'edit' ? (
        <>
          {/* 2. 기간 선택 행 (스크린샷 일치) */}
          <div 
            onClick={() => alert('조회 기간 변경: 2026.08.16 ~ 2026.08.22')}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 18px',
              borderBottom: '1px solid #ECEFF2',
              cursor: 'pointer'
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#191F28' }}>기간</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#191F28' }}>{period}</span>
              <ChevronRight size={18} color="#8B95A1" />
            </div>
          </div>

          {/* 3. 섹션: 근무일정 (수정 후) (스크린샷 일치) */}
          <div style={{
            background: '#F8F9FA',
            padding: '14px 18px 10px 18px',
            fontSize: '13.5px',
            fontWeight: 800,
            color: '#191F28',
            borderBottom: '1px solid #ECEFF2'
          }}>
            근무일정 (수정 후)
          </div>

          {modifiedSchedules.length === 0 ? (
            <div style={{
              padding: '24px 18px',
              textAlign: 'center',
              fontSize: '15px',
              fontWeight: 600,
              color: '#333D4B',
              borderBottom: '1px solid #ECEFF2'
            }}>
              수정된 근무일정이 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #ECEFF2' }}>
              {modifiedSchedules.map(item => (
                <div
                  key={item.id}
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #F1F3F5',
                    background: themeMode === 'ddangyo' ? '#FFF5F2' : '#F0F5FF'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#191F28', marginRight: '8px' }}>
                      {item.dateLabel}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF' }}>
                      {item.timeRange}
                    </span>
                  </div>
                  <button
                    onClick={() => setModifiedSchedules(modifiedSchedules.filter(m => m.id !== item.id))}
                    style={{ color: '#8B95A1', padding: '4px' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 4. 섹션: 근무일정 (수정 전) (스크린샷 100% 일치) */}
          <div style={{
            background: '#F8F9FA',
            padding: '14px 18px 10px 18px',
            fontSize: '13.5px',
            fontWeight: 800,
            color: '#191F28',
            borderBottom: '1px solid #ECEFF2'
          }}>
            근무일정 (수정 전)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingBottom: '70px' }}>
            {originalSchedules.map(item => {
              const isModified = modifiedSchedules.some(m => m.id === item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => handleOpenEditItem(item)}
                  style={{
                    padding: '16px 18px',
                    borderBottom: '1px solid #ECEFF2',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    background: isModified ? '#FAFAFA' : '#FFFFFF'
                  }}
                >
                  <div style={{ fontSize: '15px', fontWeight: 700, color: isModified ? '#8B95A1' : '#191F28' }}>
                    {item.dateLabel} &nbsp; {item.timeRange}
                  </div>
                  <ChevronRight size={18} color="#8B95A1" />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        /* 2단계: 사유 입력 및 결재선 확인 (노란봉투법 세이프가드) */
        <div style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#F8F9FA',
            borderRadius: '10px',
            padding: '16px',
            border: '1px solid #ECEFF2'
          }}>
            <div style={{ fontSize: '13px', color: '#8B95A1', marginBottom: '6px' }}>수정 대상 요약</div>
            {modifiedSchedules.map(m => (
              <div key={m.id} style={{ fontSize: '14.5px', fontWeight: 700, color: '#191F28', marginBottom: '4px' }}>
                • {m.dateLabel}: <strong>{m.timeRange}</strong> (수정)
              </div>
            ))}
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: 700, color: '#191F28', marginBottom: '8px', display: 'block' }}>
              수정 신청 사유
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #DDE2E5',
                fontSize: '14px',
                outline: 'none',
                resize: 'none'
              }}
            />
          </div>

          <div style={{
            background: '#FFF5F2',
            border: '1px solid #FFE0D9',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '12.5px',
            color: '#B42318',
            lineHeight: 1.4
          }}>
            ⚖️ <strong>노란봉투법 & 파견법 컴플라이언스</strong><br />
            본 근무일정 수정 신청서는 원청(신한DS)이 아닌 <strong>협력사 현장대리인(김협력 PM)</strong>의 독자적 노무지휘권 하에서 전결 승인됩니다.
          </div>
        </div>
      )}

      {/* 5. 근무 시간 수정 팝업 다이얼로그 */}
      {editingTarget && (
        <div 
          className="modal-overlay" 
          onClick={() => setEditingTarget(null)}
          style={{ alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', zIndex: 1000 }}
        >
          <div 
            style={{
              width: '88%',
              maxWidth: '340px',
              background: '#FFFFFF',
              borderRadius: '14px',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#191F28', marginBottom: '14px' }}>
              {editingTarget.dateLabel} 근무 시간 수정
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {['08:00 - 17:00', '09:00 - 18:00', '10:00 - 19:00', '13:00 - 22:00'].map(t => (
                <button
                  key={t}
                  onClick={() => setEditingTime(t)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: editingTime === t 
                      ? (themeMode === 'ddangyo' ? '1.5px solid #FF462D' : '1.5px solid #0066FF')
                      : '1px solid #ECEFF2',
                    background: editingTime === t 
                      ? (themeMode === 'ddangyo' ? '#FFF5F2' : '#F0F5FF')
                      : '#FFFFFF',
                    color: editingTime === t 
                      ? (themeMode === 'ddangyo' ? '#FF462D' : '#0066FF')
                      : '#191F28',
                    fontSize: '14.5px',
                    fontWeight: editingTime === t ? 800 : 600,
                    textAlign: 'left'
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setEditingTarget(null)}
                style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 700, color: '#8B95A1', cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={handleSaveModification}
                style={{ background: 'none', border: 'none', fontSize: '14px', fontWeight: 800, color: themeMode === 'ddangyo' ? '#FF462D' : '#0066FF', cursor: 'pointer' }}
              >
                반영
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
