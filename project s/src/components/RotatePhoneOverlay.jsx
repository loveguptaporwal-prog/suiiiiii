import React, { useState, useEffect } from 'react';

export function RotatePhoneOverlay() {
  const [isPortrait, setIsPortrait] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // True if vertical / portrait orientation on mobile or narrow tablet window
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth <= 900;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleRequestLandscape = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      if (screen.orientation && screen.orientation.lock) {
        await screen.orientation.lock('landscape');
      }
    } catch (e) {
      console.log('Fullscreen/orientation lock not supported or user gesture required', e);
    }
  };

  if (!isPortrait) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(55, 12, 28, 0.94), rgba(24, 6, 14, 0.98))',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        color: '#FFF8F2',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        textAlign: 'center',
        animation: 'fadeIn 0.4s ease-out',
      }}
    >
      {/* Animated Phone Rotation Icon */}
      <div
        style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'rgba(216, 175, 80, 0.12)',
          border: '1.5px solid rgba(216, 175, 80, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '22px',
          boxShadow: '0 0 32px rgba(216, 175, 80, 0.25)',
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#F4CF7F"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: 'rotatePhone 2.4s ease-in-out infinite',
            transformOrigin: 'center center',
          }}
        >
          <rect x="5" y="2" width="14" height="20" rx="3" />
          <line x1="12" y1="18" x2="12" y2="18.01" />
        </svg>
      </div>

      {/* Main Title */}
      <div
        style={{
          fontSize: '19px',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#F4CF7F',
          marginBottom: '10px',
          textShadow: '0 2px 10px rgba(216, 175, 80, 0.3)',
        }}
      >
        ✦ Please Rotate Your Phone ✦
      </div>

      {/* Narrative Explanation */}
      <div
        style={{
          fontSize: '14.5px',
          lineHeight: '1.55',
          color: '#FFE4EB',
          maxWidth: '310px',
          marginBottom: '24px',
          fontWeight: 400,
        }}
      >
        This birthday celebration world is designed for a widescreen <strong>horizontal landscape</strong> experience, just like high-end 3D adventure games.
      </div>

      {/* Interactive Switch to Landscape Button */}
      <button
        onClick={handleRequestLandscape}
        style={{
          background: 'linear-gradient(135deg, #D81B60 0%, #8A1438 100%)',
          color: '#FFFDF9',
          border: '1px solid rgba(244, 207, 127, 0.5)',
          padding: '12px 24px',
          borderRadius: '24px',
          fontSize: '13.5px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(216, 27, 96, 0.4)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        Rotate & Play Landscape
      </button>

      {/* Embedded CSS Keyframes */}
      <style>{`
        @keyframes rotatePhone {
          0% { transform: rotate(0deg); }
          30% { transform: rotate(-90deg); }
          70% { transform: rotate(-90deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
