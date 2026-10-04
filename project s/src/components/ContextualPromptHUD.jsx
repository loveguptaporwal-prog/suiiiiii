import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { worldEventBus } from '../systems/WorldEventBus.js';

/**
 * Minimalist Contextual HUD -- game-like E-key interaction system.
 * Physical object -> approach -> proximity hint -> E -> physical response.
 *
 * Ceremony flow:
 *   1. Light the candles  (CANDLES_LIT)
 *   2. Make a wish / blow out  (CANDLES_BLOWN)
 *   3. Take the knife  (KNIFE_PICKED_UP)
 *   4. Cut the cake  (REQUEST_CUT_CAKE -> CAKE_CUT)
 *   5. Take the slice  (SLICE_PICKED_UP)
 *   6. Give to family / eat yourself  (REQUEST_SERVE_SLICE / REQUEST_EAT_SLICE)
 */
// Preset inspiring wishes
const BIRTHDAY_WISHES = [
  { id: 'joy', title: 'Everlasting Joy & Good Health', desc: 'A year filled with vibrant health, peace of mind, and radiant happiness.' },
  { id: 'success', title: 'Grand Success & Big Ambitions', desc: 'Unstoppable progress, career triumph, and dreams coming true.' },
  { id: 'love', title: 'Deep Love & Cherished Memories', desc: 'Warmth, love, and unforgettable laughter with family and best friends.' },
  { id: 'custom', title: 'Secret Personal Wish...', desc: 'Type your own personal heartfelt birthday wish.' },
];

export function ContextualPromptHUD() {
  const [pos, setPos] = useState({ x: 0, y: 1.22, z: 5.25 });
  const [knifePickedUp, setKnifePickedUp] = useState(false);
  const [slicesCutCount, setSlicesCutCount] = useState(0);
  const [slicesTakenCount, setSlicesTakenCount] = useState(0);
  const [sliceHeld, setSliceHeld] = useState(false);
  const [servedRecipients, setServedRecipients] = useState([]);
  // Candles start OFF -- player lights them as the very first ceremony interaction
  const [candlesLit, setCandlesLit] = useState(false);
  // Gates the knife/cut flow -- must have made a wish first
  const [candlesEverBlown, setCandlesEverBlown] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  // Cinematic Make a Wish Modal State
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  const [selectedWishId, setSelectedWishId] = useState('joy');
  const [customWishText, setCustomWishText] = useState('');

  const triggerBriefFeedback = (msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback((prev) => (prev === msg ? null : prev)), 2200);
  };

  const handleConfirmWishAndBlow = useCallback(() => {
    setIsWishModalOpen(false);
    worldEventBus.emit('CANDLES_BLOWN');
    const selectedItem = BIRTHDAY_WISHES.find((w) => w.id === selectedWishId);
    const wishLabel = selectedWishId === 'custom' && customWishText.trim()
      ? customWishText.trim()
      : (selectedItem ? selectedItem.title : 'Happy Birthday!');
    triggerBriefFeedback(`✨ Wish Made: "${wishLabel}" 🎉`);
  }, [selectedWishId, customWishText]);

  useEffect(() => {
    const unsubs = [];

    unsubs.push(
      worldEventBus.on('CAMERA_POSITION', (coords) => setPos(coords))
    );
    unsubs.push(
      worldEventBus.on('CANDLES_LIT', () => {
        setCandlesLit(true);
        triggerBriefFeedback('Candles lit warm & bright! Make a wish ✨');
      })
    );
    unsubs.push(
      worldEventBus.on('REQUEST_MAKE_WISH', () => {
        setIsWishModalOpen(true);
      })
    );
    unsubs.push(
      worldEventBus.on('CANDLES_BLOWN', () => {
        setCandlesLit(false);
        setCandlesEverBlown(true);
        triggerBriefFeedback('Happy Birthday Sneha! 🎉');
      })
    );
    unsubs.push(
      worldEventBus.on('KNIFE_PICKED_UP', () => {
        setKnifePickedUp(true);
        triggerBriefFeedback('Knife ready');
      })
    );
    unsubs.push(
      worldEventBus.on('CAKE_CUT', () => {
        setSlicesCutCount((prev) => prev + 1);
        setKnifePickedUp(false);
        triggerBriefFeedback('Cake sliced!');
      })
    );
    unsubs.push(
      worldEventBus.on('SLICE_PICKED_UP', () => {
        setSlicesTakenCount((prev) => prev + 1);
        setSliceHeld(true);
        triggerBriefFeedback('Slice in hand');
      })
    );
    unsubs.push(
      worldEventBus.on('SLICE_SERVED', (data) => {
        setSliceHeld(false);
        setServedRecipients((prev) => [...prev, data.recipientId]);
        triggerBriefFeedback(data.recipientId === 'self' ? 'Enjoyed delicious cake!' : 'Served slice to family!');
      })
    );
    unsubs.push(
      worldEventBus.on('FAMILY_MEMBER_CLICKED', (data) => {
        if (sliceHeld) {
          worldEventBus.emit('REQUEST_SERVE_SLICE', { recipientId: data.targetId });
        }
      })
    );

    unsubs.push(
      worldEventBus.on('RESET_CAKE', () => {
        setSlicesCutCount(0);
        setSlicesTakenCount(0);
        setKnifePickedUp(false);
        setServedRecipients([]);
        setSliceHeld(false);
        setIsWishModalOpen(false);
        triggerBriefFeedback('Fresh celebration cake ready!');
      })
    );

    return () => unsubs.forEach((u) => u && u());
  }, [sliceHeld]);

  const { x, z } = pos;

  // Proximity zones
  const isAtCuttingSide    = z <= -8.45 && z >= -9.85 && Math.abs(x) < 1.55;
  const isNearTableGeneral = z >= -9.85 && z <= -6.0  && Math.abs(x) < 2.5;
  const isNearGate         = z >= 1.5   && z <= 3.6   && Math.abs(x) < 1.5;
  const isNearMusic        = x >= 4.0   && x <= 6.8   && z >= -9.5  && z <= -6.0;
  const isNearGallery      = z <= -11.5 && Math.abs(x) < 5.0;

  // 3 Themed Rooms & Doorways Proximities
  const distWestDoor = Math.hypot(x - (-6.92), z - (-4.5));
  const distEastDoor = Math.hypot(x - 6.92, z - (-4.5));
  const distNorthDoor = Math.hypot(x - (-5.2), z - (-13.42));

  const isInsideGiftLounge = x < -7.0 && z >= -7.0 && z <= -2.0;
  const isInsideDanceClub = x > 7.0 && z >= -7.0 && z <= -2.0;
  const isInsideTerrace = z < -13.5 && x >= -10.3 && x <= -0.1;

  const isNearWestDoor = distWestDoor < 2.0 && !isInsideGiftLounge;
  const isNearEastDoor = distEastDoor < 2.0 && !isInsideDanceClub;
  const isNearNorthDoor = distNorthDoor < 2.0;

  // Distances to the 4 family members for slice serving
  const distMom       = Math.hypot(x - (-1.70), z - (-6.15));
  const distLittleBoy = Math.hypot(x - (-0.60), z - (-5.95));
  const distBro       = Math.hypot(x - 0.60,   z - (-5.95));
  const distDad       = Math.hypot(x - 1.70,   z - (-6.15));

  // Closest family member when holding slice (within 3.2 units) — prioritizes unserved members
  const closestPerson = useMemo(() => {
    if (!sliceHeld) return null;
    const candidates = [
      { id: 'mom',        label: 'Mother',        dist: distMom },
      { id: 'little_boy', label: 'Little Brother', dist: distLittleBoy },
      { id: 'brother',    label: 'Brother',        dist: distBro },
      { id: 'dad',        label: 'Father',         dist: distDad },
    ];
    candidates.sort((a, b) => {
      const aServed = servedRecipients.includes(a.id);
      const bServed = servedRecipients.includes(b.id);
      if (aServed !== bServed) return aServed ? 1 : -1;
      return a.dist - b.dist;
    });
    return candidates[0].dist < 3.2 ? candidates[0] : null;
  }, [sliceHeld, distMom, distLittleBoy, distBro, distDad, servedRecipients]);

  // Active contextual prompt -- game-like E-key hints, cleanly positioned at bottom
  const activePrompt = useMemo(() => {
    // 1. HOLDING CAKE SLICE
    if (sliceHeld) {
      if (closestPerson) {
        const isSecondServing = servedRecipients.includes(closestPerson.id);
        return {
          keyLabel: 'E',
          actionText: isSecondServing ? `Give another slice to ${closestPerson.label}` : `Give cake to ${closestPerson.label}`,
          onTrigger: () => worldEventBus.emit('REQUEST_SERVE_SLICE', { recipientId: closestPerson.id }),
        };
      }
      return {
        keyLabel: 'E',
        actionText: 'Eat delicious cake slice',
        onTrigger: () => worldEventBus.emit('REQUEST_EAT_SLICE'),
      };
    }

    // 2. NEAR CAKE TABLE (any side)
    if (isNearTableGeneral || isAtCuttingSide) {
      // STEP 1: Light candles
      if (!candlesLit && !candlesEverBlown) {
        return {
          keyLabel: 'E',
          actionText: 'Light the candles',
          onTrigger: () => worldEventBus.emit('CANDLES_LIT'),
        };
      }

      // STEP 2: Make a wish
      if (candlesLit) {
        return {
          keyLabel: 'E',
          actionText: 'Make a wish ✨',
          onTrigger: () => setIsWishModalOpen(true),
        };
      }

      // STEPS AFTER WISH: Multi-slice cutting and serving loop
      if (candlesEverBlown) {
        // A cut slice is on the platter waiting to be picked up
        if (slicesCutCount > slicesTakenCount) {
          return {
            keyLabel: 'E',
            actionText: 'Take the cut slice',
            onTrigger: () => worldEventBus.emit('SLICE_PICKED_UP'),
          };
        }

        // More slices can be cut (up to 6)
        if (slicesCutCount < 12) {
          if (!knifePickedUp && slicesCutCount > 0) {
            const nextSlice = slicesCutCount + 1;
            return {
              keyLabel: 'E',
              actionText: `Take knife to cut slice ${nextSlice}`,
              onTrigger: () => worldEventBus.emit('KNIFE_PICKED_UP'),
            };
          }
          return {
            keyLabel: 'E',
            actionText: slicesCutCount === 0 ? 'Cut the Birthday Cake!' : 'Cut another slice',
            onTrigger: () => {
              if (!knifePickedUp) {
                worldEventBus.emit('KNIFE_PICKED_UP');
                setTimeout(() => worldEventBus.emit('REQUEST_CUT_CAKE'), 150);
              } else {
                worldEventBus.emit('REQUEST_CUT_CAKE');
              }
            },
          };
        }

        // All 12 slices cut and enjoyed -> allow bringing another fresh celebration cake!
        return {
          keyLabel: 'E',
          actionText: 'Bring another celebration cake!',
          onTrigger: () => {
            worldEventBus.emit('RESET_CAKE');
            setSlicesCutCount(0);
            setSlicesTakenCount(0);
            setKnifePickedUp(false);
            setServedRecipients([]);
          },
        };
      }
    }

    // 3. INTERACTIVE ROOM DOORS
    if (isNearWestDoor) {
      return {
        keyLabel: 'E',
        actionText: 'Toggle Door: VIP Gift Lounge',
        onTrigger: () => worldEventBus.emit('REQUEST_TOGGLE_DOOR', { doorId: 'west_corridor_door' }),
      };
    }

    if (isNearEastDoor) {
      return {
        keyLabel: 'E',
        actionText: 'Toggle Door: Disco Dance Club',
        onTrigger: () => worldEventBus.emit('REQUEST_TOGGLE_DOOR', { doorId: 'east_corridor_door' }),
      };
    }

    if (isNearNorthDoor) {
      return {
        keyLabel: 'E',
        actionText: 'Toggle Door: Memory Gallery',
        onTrigger: () => worldEventBus.emit('REQUEST_TOGGLE_DOOR', { doorId: 'north_corridor_door' }),
      };
    }

    // 4. INSIDE THE THREE THEMED ROOMS
    if (isInsideGiftLounge) {
      return {
        keyLabel: 'Click',
        actionText: 'Click gift boxes to unwrap surprises!',
        onTrigger: null,
      };
    }

    if (isInsideDanceClub) {
      return {
        keyLabel: 'E',
        actionText: 'Drop disco beat on turntables!',
        onTrigger: () => soundEngine.playDanceBeat(),
      };
    }

    if (isInsideTerrace) {
      return {
        keyLabel: 'Click',
        actionText: 'Explore memories · click a video to play or pause',
        onTrigger: null,
      };
    }

    // OTHER ZONES
    if (isNearGate) {
      return {
        keyLabel: 'Push',
        actionText: 'Walk through the doors',
        onTrigger: null,
      };
    }

    if (isNearMusic) {
      return {
        keyLabel: 'E',
        actionText: 'Play the turntable',
        onTrigger: null,
      };
    }

    if (isNearGallery) {
      return {
        keyLabel: 'E',
        actionText: 'Inspect the family memories',
        onTrigger: null,
      };
    }

    return null;
  }, [
    sliceHeld,
    closestPerson,
    isAtCuttingSide,
    isNearTableGeneral,
    isNearWestDoor,
    isNearEastDoor,
    isNearNorthDoor,
    isInsideGiftLounge,
    isInsideDanceClub,
    isInsideTerrace,
    isNearGate,
    isNearMusic,
    isNearGallery,
    slicesCutCount,
    slicesTakenCount,
    knifePickedUp,
    candlesLit,
    candlesEverBlown,
  ]);

  // Global keyboard handler -- E triggers contextual action
  const handleKeyDown = useCallback((e) => {
    if (e.repeat) return;
    const key = (e.key || '').toLowerCase();

    // When Wish Modal is open
    if (isWishModalOpen) {
      if (key === 'escape') {
        e.preventDefault();
        setIsWishModalOpen(false);
      } else if (key === 'enter') {
        e.preventDefault();
        handleConfirmWishAndBlow();
      }
      return;
    }

    if (key === 'e') {
      if (activePrompt && activePrompt.onTrigger) {
        e.preventDefault();
        activePrompt.onTrigger();
      }
    }
  }, [activePrompt, isWishModalOpen, handleConfirmWishAndBlow]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Listen to mobile action trigger from touch E button
  useEffect(() => {
    const unsubMobileAction = worldEventBus.on('MOBILE_TRIGGER_ACTION', () => {
      if (activePrompt && activePrompt.onTrigger) {
        activePrompt.onTrigger();
      }
    });
    return () => unsubMobileAction();
  }, [activePrompt]);

  // Broadcast prompt state so mobile E button can highlight and display label
  useEffect(() => {
    worldEventBus.emit('ACTIVE_PROMPT_STATE', activePrompt ? {
      keyLabel: activePrompt.keyLabel,
      actionText: activePrompt.actionText,
      canTrigger: Boolean(activePrompt.onTrigger),
    } : null);
  }, [activePrompt]);

  const hasInteractiveTarget = Boolean(activePrompt && activePrompt.onTrigger);

  return (
    <>
      {/* 1. CENTER RETICLE */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: hasInteractiveTarget ? '#FFF8E7' : 'rgba(255, 255, 255, 0.70)',
            boxShadow: hasInteractiveTarget
              ? '0 0 8px rgba(244, 207, 127, 0.9), 0 0 2px #FFFFFF'
              : '0 0 3px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.18s ease-out',
          }}
        />
        {hasInteractiveTarget && (
          <div
            style={{
              position: 'absolute',
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              border: '1.5px solid rgba(244, 207, 127, 0.75)',
              boxShadow: '0 0 6px rgba(244, 207, 127, 0.35)',
              animation: 'reticlePulse 1.8s infinite ease-in-out',
            }}
          />
        )}
      </div>

      {/* 2. CONTEXTUAL ACTION PILL -- tiny, game-like, never obtrusive */}
      {activePrompt && (
        <div
          data-touch-control="true"
          onClick={activePrompt.onTrigger || undefined}
          style={{
            position: 'fixed',
            bottom: '48px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 45,
            pointerEvents: activePrompt.onTrigger ? 'auto' : 'none',
            cursor: activePrompt.onTrigger ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(18, 8, 14, 0.78)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(244, 207, 127, 0.35)',
            borderRadius: '16px',
            padding: '5px 14px',
            color: '#FFF8F2',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: '12.5px',
            fontWeight: 500,
            letterSpacing: '0.02em',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
            userSelect: 'none',
            transition: 'all 0.15s ease-out',
          }}
        >
          {activePrompt.keyLabel && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '18px',
                height: '18px',
                padding: '0 4px',
                borderRadius: '4px',
                background: 'rgba(244, 207, 127, 0.22)',
                border: '1px solid rgba(244, 207, 127, 0.65)',
                color: '#FFE082',
                fontSize: '10.5px',
                fontWeight: 700,
              }}
            >
              {activePrompt.keyLabel}
            </span>
          )}
          <span>{activePrompt.actionText}</span>
        </div>
      )}

      {/* 3. BRIEF STATUS TOAST -- auto-dismisses after 2.2s */}
      {actionFeedback && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 42,
            pointerEvents: 'none',
            background: 'rgba(12, 6, 9, 0.82)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(244, 207, 127, 0.3)',
            borderRadius: '20px',
            padding: '5px 16px',
            color: '#FFE8B2',
            fontSize: '11.5px',
            letterSpacing: '0.04em',
            fontWeight: 600,
            boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {actionFeedback}
        </div>
      )}

      {/* 4. CINEMATIC MAKE A BIRTHDAY WISH MODAL */}
      {isWishModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(8, 3, 12, 0.78)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '16px',
            animation: 'fadeIn 0.22s ease-out',
          }}
          onClick={() => {}}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '510px',
              borderRadius: '24px',
              background: 'linear-gradient(145deg, rgba(32, 14, 26, 0.96), rgba(18, 9, 18, 0.98))',
              border: '1.5px solid rgba(244, 207, 127, 0.48)',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85), 0 0 32px rgba(244, 207, 127, 0.22)',
              padding: '28px 30px',
              color: '#FFF8F2',
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              textAlign: 'center',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            {/* Candlelight Warmth Top Glow */}
            <div
              style={{
                position: 'absolute',
                top: '-45px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '200px',
                height: '90px',
                background: 'radial-gradient(circle, rgba(255, 179, 0, 0.40) 0%, rgba(255, 179, 0, 0) 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Glowing Icon & Header */}
            <div style={{ fontSize: '38px', marginBottom: '8px', filter: 'drop-shadow(0 0 14px rgba(255, 179, 0, 0.85))' }}>
              🎂
            </div>
            <h2
              style={{
                margin: '0 0 8px 0',
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                background: 'linear-gradient(135deg, #FFF9E6 20%, #FFE082 60%, #FFB300 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Make a Birthday Wish ✨
            </h2>
            <p
              style={{
                margin: '0 0 20px 0',
                fontSize: '13px',
                color: '#E0D0C0',
                lineHeight: 1.5,
              }}
            >
              Close your eyes, breathe in the warm candlelight, and make your secret wish before blowing out the candles!
            </p>

            {/* Wish Options Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', marginBottom: '22px' }}>
              {BIRTHDAY_WISHES.map((wish) => {
                const isSelected = selectedWishId === wish.id;
                return (
                  <div
                    key={wish.id}
                    onClick={() => setSelectedWishId(wish.id)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '1.5px solid #FFD54F' : '1px solid rgba(244, 207, 127, 0.20)',
                      background: isSelected ? 'rgba(255, 213, 79, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                      boxShadow: isSelected ? '0 0 14px rgba(255, 213, 79, 0.25)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease-out',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: isSelected ? '#FFE082' : '#FFF5EB' }}>
                        {wish.title}
                      </span>
                      <span
                        style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          border: isSelected ? '4px solid #FFD54F' : '1.5px solid rgba(244, 207, 127, 0.4)',
                          background: isSelected ? '#FFF8E7' : 'transparent',
                          transition: 'all 0.15s ease-out',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#BCAAA4', marginTop: '3px', lineHeight: 1.35 }}>
                      {wish.desc}
                    </div>

                    {/* Custom Input Field if custom is active */}
                    {wish.id === 'custom' && isSelected && (
                      <input
                        type="text"
                        autoFocus
                        placeholder="Type your dream or wish here..."
                        value={customWishText}
                        onChange={(e) => setCustomWishText(e.target.value)}
                        onKeyDown={(e) => {
                          e.stopPropagation();
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleConfirmWishAndBlow();
                          }
                        }}
                        style={{
                          width: '100%',
                          marginTop: '8px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: '1px solid rgba(255, 213, 79, 0.5)',
                          background: 'rgba(10, 4, 10, 0.8)',
                          color: '#FFF8F0',
                          fontSize: '12px',
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleConfirmWishAndBlow}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #FFE082 0%, #FFB300 50%, #FFA000 100%)',
                  color: '#3E2723',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 18px rgba(255, 179, 0, 0.45)',
                  transition: 'transform 0.12s ease-out, box-shadow 0.12s ease-out',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 179, 0, 0.65)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 4px 18px rgba(255, 179, 0, 0.45)';
                }}
              >
                <span>🌬️ Blow Out Candles & Cut Cake!</span>
                <span
                  style={{
                    fontSize: '10.5px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(62, 39, 35, 0.18)',
                    border: '1px solid rgba(62, 39, 35, 0.35)',
                    fontWeight: 800,
                  }}
                >
                  Enter / E
                </span>
              </button>

              <button
                onClick={() => setIsWishModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#A1887F',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  padding: '4px',
                  textDecoration: 'underline',
                  opacity: 0.85,
                }}
              >
                Keep admiring the candles [Esc]
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
