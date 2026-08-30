/**
 * 한국 표준시 (KST, Asia/Seoul, UTC+9) 공통 시간 유틸리티
 */

// 현재 한국 시간 (KST) 문자열 생성 (YYYY-MM-DD HH:mm:ss)
export const getKstNowString = (): string => {
  const d = new Date(Date.now() + 9 * 3600000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const min = String(d.getUTCMinutes()).padStart(2, '0');
  const ss = String(d.getUTCSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};

// 현재 한국 일자 (YYYY-MM-DD)
export const getKstTodayString = (): string => {
  const d = new Date(Date.now() + 9 * 3600000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// 임의의 일시/타임스탬프를 한국 표준시 (YYYY-MM-DD HH:mm:ss)로 정밀 변환
export const formatKstDateTime = (dateStr?: string | null): string => {
  if (!dateStr) return '-';
  try {
    const raw = String(dateStr).trim();
    if (!raw) return '-';

    // 1) 이미 'YYYY-MM-DD HH:mm:ss' 포맷인 경우 (서버에서 KST로 생성된 경우)
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(raw)) {
      return raw;
    }

    // 2) ISO 포맷 ('T', 'Z' 포함) 또는 타임스탬프인 경우 KST(+9) 변환
    if (raw.includes('T') || raw.includes('Z') || raw.includes('+')) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        const kstDate = new Date(d.getTime() + 9 * 3600000);
        const yyyy = kstDate.getUTCFullYear();
        const mm = String(kstDate.getUTCMonth() + 1).padStart(2, '0');
        const dd = String(kstDate.getUTCDate()).padStart(2, '0');
        const hh = String(kstDate.getUTCHours()).padStart(2, '0');
        const min = String(kstDate.getUTCMinutes()).padStart(2, '0');
        const ss = String(kstDate.getUTCSeconds()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
      }
    }

    // 3) 'YYYY-MM-DD' 또는 'YYYY-MM-DD HH:mm' 인 경우
    const s = raw.replace('T', ' ').slice(0, 19);
    if (s.length === 10) return `${s} 09:00:00`;
    if (s.length === 16) return `${s}:00`;
    return s;
  } catch {
    return dateStr;
  }
};
