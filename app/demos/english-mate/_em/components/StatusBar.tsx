"use client";

export function StatusBar({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="em-status-bar" aria-hidden="true">
      <span>9:41</span>
      <div className="em-status-icons">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <rect x="0" y="7" width="2.5" height="4" rx="0.7" />
          <rect x="4" y="5" width="2.5" height="6" rx="0.7" />
          <rect x="8" y="2.5" width="2.5" height="8.5" rx="0.7" />
          <rect x="12" y="0" width="2.5" height="11" rx="0.7" />
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1.5 3.6a10 10 0 0 1 12 0" />
          <path d="M3.8 6.3a6.5 6.5 0 0 1 7.4 0" />
          <circle cx="7.5" cy="9.2" r="1.1" fill="currentColor" stroke="none" />
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11" fill="none">
          <rect x="0.7" y="0.8" width="20" height="9.4" rx="2.4" stroke="currentColor" strokeWidth="1.1" />
          <rect x="2.5" y="2.5" width="16.4" height="6" rx="1.2" fill="currentColor" />
          <path d="M22 3.8v3.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
