// Cloudflare Turnstile 인증 위젯 컴포넌트입니다.
import React, { useEffect, useRef, useState } from 'react';

type TurnstileRenderOptions = {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
let turnstileScriptPromise: Promise<void> | null = null;

const loadTurnstileScript = (): Promise<void> => {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    turnstileScriptPromise = new Promise((resolve, reject) => {
      if (window.turnstile) {
        resolve();
        return;
      }
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Turnstile script failed to load.')), { once: true });
    });
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Turnstile script failed to load.'));
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
};

type TurnstileWidgetProps = {
  onVerify: (token: string) => void;
  siteKey?: string;
  className?: string;
};

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({ onVerify, siteKey, className }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const [error, setError] = useState<string | null>(null);
  const resolvedSiteKey = siteKey ?? import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    onVerifyRef.current = onVerify;
  }, [onVerify]);

  useEffect(() => {
    let isActive = true;

    if (!resolvedSiteKey) {
      setError('Turnstile 사이트 키가 설정되지 않았습니다.');
      return undefined;
    }

    setError(null);

    loadTurnstileScript()
      .then(() => {
        if (!isActive) return;
        if (!containerRef.current) return;
        if (!window.turnstile) {
          setError('Turnstile을 불러오지 못했습니다.');
          return;
        }
        if (widgetIdRef.current) return;

        const widgetId = window.turnstile.render(containerRef.current, {
          sitekey: resolvedSiteKey,
          callback: (token) => {
            onVerifyRef.current(token);
            setError(null);
          },
          'error-callback': () => setError('Turnstile 인증에 실패했습니다.'),
          'expired-callback': () => {
            onVerifyRef.current('');
            setError('Turnstile 인증이 만료되었습니다. 다시 시도해 주세요.');
          },
        });

        widgetIdRef.current = widgetId;
      })
      .catch(() => {
        if (isActive) {
          setError('Turnstile 스크립트를 불러오지 못했습니다.');
        }
      });

    return () => {
      isActive = false;
      if (widgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = null;
    };
  }, [resolvedSiteKey]);

  return (
    <div className={className}>
      <div ref={containerRef} />
      {error && (
        <p className="mt-2 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};

export default TurnstileWidget;
