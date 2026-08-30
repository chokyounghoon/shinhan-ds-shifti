/**
 * 웹 푸시 및 브라우저 네이티브 알림 (Push Notification) 유틸리티
 */

export const requestPushPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendWebPushNotification = (title: string, options?: {
  body?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  onClick?: () => void;
}) => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      const noti = new Notification(title, {
        body: options?.body || '',
        icon: options?.icon || 'https://shifti.pages.dev/favicon.ico',
        tag: options?.tag || `shifti-push-${Date.now()}`
      });

      if (options?.onClick) {
        noti.onclick = () => {
          window.focus();
          options.onClick?.();
        };
      }
    } catch (e) {
      console.warn('Native notification trigger failed:', e);
    }
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        try {
          new Notification(title, {
            body: options?.body || '',
            icon: options?.icon || 'https://shifti.pages.dev/favicon.ico'
          });
        } catch (_) {}
      }
    });
  }
};
