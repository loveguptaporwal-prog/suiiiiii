import React, { useState, useEffect, useRef, useCallback } from 'react';
import { worldEventBus } from '../systems/WorldEventBus.js';

export function MobileControlsOverlay() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [activePrompt, setActivePrompt] = useState(null);
  const [activeDirections, setActiveDirections] = useState({
    forward: false,
    backward: false,
    strafeLeft: false,
    strafeRight: false,
    turnLeft: false,
    turnRight: false,
  });

  // Track active direction state ref for zero-latency event emission
  const directionsRef = useRef({
    forward: false,
    backward: false,
    strafeLeft: false,
    strafeRight: false,
    turnLeft: false,
    turnRight: false,
  });

  // Device & orientation detection
  useEffect(() => {
    const updateDeviceInfo = () => {
      const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || window.innerWidth <= 1024;
      const portrait = window.innerHeight > window.innerWidth && window.innerWidth <= 900;
      setIsTouchDevice(hasTouch);
      setIsPortrait(portrait);
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    const unsubPrompt = worldEventBus.on('ACTIVE_PROMPT_STATE', (state) => {
      setActivePrompt(state);
    });

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
      unsubPrompt();
    };
  }, []);

  const emitMove = useCallback((newDirections) => {
    directionsRef.current = { ...directionsRef.current, ...newDirections };
    setActiveDirections({ ...directionsRef.current });
    worldEventBus.emit('MOBILE_MOVE', directionsRef.current);
  }, []);

  const startAction = useCallback((dir, e) => {
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    // Haptic feedback if supported
    if (navigator.vibrate) {
      try { navigator.vibrate(12); } catch (_) {}
    }
    emitMove({ [dir]: true });
  }, [emitMove]);

  const stopAction = useCallback((dir, e) => {
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    emitMove({ [dir]: false });
  }, [emitMove]);

  const handleEButtonClick = useCallback((e) => {
    if (e) {
      if (e.cancelable) e.preventDefault();
      e.stopPropagation();
    }
    if (navigator.vibrate) {
      try { navigator.vibrate(20); } catch (_) {}
    }
    worldEventBus.emit('MOBILE_TRIGGER_ACTION');
  }, []);

  // Do not render when in portrait mode (RotatePhoneOverlay handles portrait)
  // or on desktop environments without touch or responsive mobile screen
  if (!isTouchDevice || isPortrait) {
    return null;
  }

  const hasInteractiveAction = Boolean(activePrompt && activePrompt.canTrigger);

  return (
    <div
      data-touch-control="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* ---------------- LEFT CLUSTER: D-PAD & MOVEMENT BUTTONS ---------------- */}
      <div
        data-touch-control="true"
        style={{
          position: 'absolute',
          bottom: 'max(18px, env(safe-area-inset-bottom, 18px))',
          left: 'max(20px, env(safe-area-inset-left, 20px))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'auto',
        }}
      >
        {/* Quick Turn Row */}
        <div
          data-touch-control="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '2px',
          }}
        >
          <button
            data-touch-control="true"
            onPointerDown={(e) => startAction('turnLeft', e)}
            onPointerUp={(e) => stopAction('turnLeft', e)}
            onPointerCancel={(e) => stopAction('turnLeft', e)}
            style={{
              width: '40px',
              height: '32px',
              borderRadius: '16px',
              background: activeDirections.turnLeft
                ? 'rgba(216, 175, 80, 0.45)'
                : 'rgba(25, 10, 20, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${activeDirections.turnLeft ? '#F4CF7F' : 'rgba(244, 207, 127, 0.35)'}`,
              color: '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              cursor: 'pointer',
              touchAction: 'none',
              transform: activeDirections.turnLeft ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.08s ease, background 0.08s ease',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.35)',
            }}
            aria-label="Turn Left"
          >
            ⟲
          </button>
          <span style={{ fontSize: '10px', color: 'rgba(244, 207, 127, 0.65)', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>
            Move
          </span>
          <button
            data-touch-control="true"
            onPointerDown={(e) => startAction('turnRight', e)}
            onPointerUp={(e) => stopAction('turnRight', e)}
            onPointerCancel={(e) => stopAction('turnRight', e)}
            style={{
              width: '40px',
              height: '32px',
              borderRadius: '16px',
              background: activeDirections.turnRight
                ? 'rgba(216, 175, 80, 0.45)'
                : 'rgba(25, 10, 20, 0.65)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${activeDirections.turnRight ? '#F4CF7F' : 'rgba(244, 207, 127, 0.35)'}`,
              color: '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              cursor: 'pointer',
              touchAction: 'none',
              transform: activeDirections.turnRight ? 'scale(0.92)' : 'scale(1)',
              transition: 'transform 0.08s ease, background 0.08s ease',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.35)',
            }}
            aria-label="Turn Right"
          >
            ⟳
          </button>
        </div>

        {/* 4-Way Directional Cross (D-Pad) */}
        <div
          data-touch-control="true"
          style={{
            position: 'relative',
            width: '132px',
            height: '132px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, rgba(35, 12, 25, 0.82) 0%, rgba(18, 6, 14, 0.88) 100%)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(244, 207, 127, 0.35)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.55), inset 0 0 16px rgba(244, 207, 127, 0.10)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'none',
          }}
        >
          {/* FORWARD (▲) */}
          <button
            data-touch-control="true"
            onPointerDown={(e) => startAction('forward', e)}
            onPointerUp={(e) => stopAction('forward', e)}
            onPointerCancel={(e) => stopAction('forward', e)}
            style={{
              position: 'absolute',
              top: '6px',
              left: '50%',
              transform: `translateX(-50%) ${activeDirections.forward ? 'scale(0.92)' : 'scale(1)'}`,
              width: '42px',
              height: '40px',
              borderRadius: '12px',
              background: activeDirections.forward
                ? 'linear-gradient(180deg, #F4CF7F 0%, #D49D42 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${activeDirections.forward ? '#FFEAA7' : 'rgba(244, 207, 127, 0.4)'}`,
              color: activeDirections.forward ? '#2B1824' : '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'none',
              transition: 'transform 0.08s ease, background 0.08s ease',
            }}
            aria-label="Move Forward"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5l-8 8h5v6h6v-6h5z" />
            </svg>
          </button>

          {/* BACKWARD (▼) */}
          <button
            data-touch-control="true"
            onPointerDown={(e) => startAction('backward', e)}
            onPointerUp={(e) => stopAction('backward', e)}
            onPointerCancel={(e) => stopAction('backward', e)}
            style={{
              position: 'absolute',
              bottom: '6px',
              left: '50%',
              transform: `translateX(-50%) ${activeDirections.backward ? 'scale(0.92)' : 'scale(1)'}`,
              width: '42px',
              height: '40px',
              borderRadius: '12px',
              background: activeDirections.backward
                ? 'linear-gradient(180deg, #F4CF7F 0%, #D49D42 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${activeDirections.backward ? '#FFEAA7' : 'rgba(244, 207, 127, 0.4)'}`,
              color: activeDirections.backward ? '#2B1824' : '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'none',
              transition: 'transform 0.08s ease, background 0.08s ease',
            }}
            aria-label="Move Backward"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 19l8-8h-5v-6h-6v6h-5z" />
            </svg>
          </button>

          {/* MOVE LEFT (◄) */}
          <button
            data-touch-control="true"
            onPointerDown={(e) => startAction('strafeLeft', e)}
            onPointerUp={(e) => stopAction('strafeLeft', e)}
            onPointerCancel={(e) => stopAction('strafeLeft', e)}
            style={{
              position: 'absolute',
              left: '6px',
              top: '50%',
              transform: `translateY(-50%) ${activeDirections.strafeLeft ? 'scale(0.92)' : 'scale(1)'}`,
              width: '40px',
              height: '42px',
              borderRadius: '12px',
              background: activeDirections.strafeLeft
                ? 'linear-gradient(180deg, #F4CF7F 0%, #D49D42 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${activeDirections.strafeLeft ? '#FFEAA7' : 'rgba(244, 207, 127, 0.4)'}`,
              color: activeDirections.strafeLeft ? '#2B1824' : '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'none',
              transition: 'transform 0.08s ease, background 0.08s ease',
            }}
            aria-label="Move Left"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 12l8-8v5h6v6h-6v5z" />
            </svg>
          </button>

          {/* MOVE RIGHT (►) */}
          <button
            data-touch-control="true"
            onPointerDown={(e) => startAction('strafeRight', e)}
            onPointerUp={(e) => stopAction('strafeRight', e)}
            onPointerCancel={(e) => stopAction('strafeRight', e)}
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: `translateY(-50%) ${activeDirections.strafeRight ? 'scale(0.92)' : 'scale(1)'}`,
              width: '40px',
              height: '42px',
              borderRadius: '12px',
              background: activeDirections.strafeRight
                ? 'linear-gradient(180deg, #F4CF7F 0%, #D49D42 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              border: `1px solid ${activeDirections.strafeRight ? '#FFEAA7' : 'rgba(244, 207, 127, 0.4)'}`,
              color: activeDirections.strafeRight ? '#2B1824' : '#FFF8F2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'none',
              transition: 'transform 0.08s ease, background 0.08s ease',
            }}
            aria-label="Move Right"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 12l-8 8v-5h-6v-6h6v-5z" />
            </svg>
          </button>

          {/* Center Hub Indicator */}
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: 'rgba(244, 207, 127, 0.45)',
              boxShadow: '0 0 8px rgba(244, 207, 127, 0.5)',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>

      {/* ---------------- RIGHT CLUSTER: INTERACT "E" BUTTON & ACTION BADGE ---------------- */}
      <div
        data-touch-control="true"
        style={{
          position: 'absolute',
          bottom: 'max(18px, env(safe-area-inset-bottom, 18px))',
          right: 'max(20px, env(safe-area-inset-right, 20px))',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px',
          pointerEvents: 'auto',
        }}
      >
        {/* Contextual Action Prompt Banner (Shows current action title, e.g. "Light Candles", "Cut Cake") */}
        {hasInteractiveAction && (
          <div
            data-touch-control="true"
            onClick={handleEButtonClick}
            style={{
              background: 'linear-gradient(135deg, rgba(55, 12, 28, 0.95), rgba(28, 8, 18, 0.95))',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1.5px solid rgba(244, 207, 127, 0.75)',
              borderRadius: '20px',
              padding: '6px 14px',
              color: '#FFF8F2',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              boxShadow: '0 4px 18px rgba(216, 27, 96, 0.45), 0 0 12px rgba(244, 207, 127, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              touchAction: 'none',
              animation: 'bouncePrompt 1.6s ease-in-out infinite',
              maxWidth: '220px',
              textAlign: 'right',
            }}
          >
            <span style={{ color: '#F4CF7F', fontSize: '13px' }}>✦</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activePrompt.actionText}
            </span>
          </div>
        )}

        {/* The Big Tactile "E" Button */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Animated Gold Aura Ring when action is available */}
          {hasInteractiveAction && (
            <div
              style={{
                position: 'absolute',
                inset: '-8px',
                borderRadius: '50%',
                border: '2px dashed rgba(244, 207, 127, 0.75)',
                animation: 'spinRing 5s linear infinite',
                pointerEvents: 'none',
              }}
            />
          )}

          <button
            data-touch-control="true"
            onClick={handleEButtonClick}
            style={{
              position: 'relative',
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: hasInteractiveAction
                ? 'radial-gradient(circle at 35% 35%, #D81B60 0%, #7B0E32 100%)'
                : 'radial-gradient(circle at 35% 35%, rgba(45, 14, 28, 0.90) 0%, rgba(20, 6, 14, 0.94) 100%)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: hasInteractiveAction
                ? '2px solid #F4CF7F'
                : '1.5px solid rgba(244, 207, 127, 0.45)',
              boxShadow: hasInteractiveAction
                ? '0 0 24px rgba(244, 207, 127, 0.65), 0 8px 24px rgba(216, 27, 96, 0.55)'
                : '0 6px 18px rgba(0, 0, 0, 0.6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'none',
              transition: 'all 0.15s ease-out',
            }}
            aria-label="Interact E Button"
          >
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '28px',
                fontWeight: 700,
                color: hasInteractiveAction ? '#FFFFFF' : '#F4CF7F',
                lineHeight: 1,
                textShadow: hasInteractiveAction
                  ? '0 2px 8px rgba(0,0,0,0.5), 0 0 10px #F4CF7F'
                  : '0 1px 4px rgba(0,0,0,0.5)',
              }}
            >
              E
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.10em',
                color: hasInteractiveAction ? '#FFE4EB' : 'rgba(244, 207, 127, 0.70)',
                textTransform: 'uppercase',
                marginTop: '1px',
              }}
            >
              {hasInteractiveAction ? 'Action' : 'Interact'}
            </span>
          </button>
        </div>

        {/* Touch & Tap Guidance hint */}
        <div
          style={{
            fontSize: '10px',
            color: 'rgba(255, 240, 245, 0.65)',
            letterSpacing: '0.04em',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>👉</span>
          <span>Tap 3D objects or drag to look</span>
        </div>
      </div>

      {/* Embedded Animations */}
      <style>{`
        @keyframes spinRing {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bouncePrompt {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}
