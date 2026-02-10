import React from 'react';
import { Link } from 'react-router-dom';

interface LegalLinksProps {
  className?: string;
  linkClassName?: string;
  onPrivacyClick?: () => void;
  onTermsClick?: () => void;
}

const LegalLinks: React.FC<LegalLinksProps> = ({
  className,
  linkClassName,
  onPrivacyClick,
  onTermsClick,
}) => {
  const linkStyle = linkClassName ?? 'text-slate-500 hover:text-white transition-colors';

  return (
    <div className={className ?? ''}>
      {onPrivacyClick ? (
        <button type="button" onClick={onPrivacyClick} className={linkStyle}>
          개인정보 처리방침
        </button>
      ) : (
        <Link to="/privacy-policy" className={linkStyle}>
          개인정보 처리방침
        </Link>
      )}
      {onTermsClick ? (
        <button type="button" onClick={onTermsClick} className={linkStyle}>
          이용약관
        </button>
      ) : (
        <Link to="/terms-of-service" className={linkStyle}>
          이용약관
        </Link>
      )}
    </div>
  );
};

export default LegalLinks;
