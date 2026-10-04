// Project S — Web Audio API Synthesized Sound System
// Pure programmatic spatial audio for candle light, blowout, knife pickup, cake slicing, serving, eating, and celebration

class BirthdayAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.55;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 1. Candle Ignition (Friction strike + warm flame flare)
  playCandleIgnite() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Match strike scratch (noise burst)
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, t);
    filter.Q.setValueAtTime(3.0, t);

    const strikeGain = this.ctx.createGain();
    strikeGain.gain.setValueAtTime(0.4, t);
    strikeGain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

    noise.connect(filter);
    filter.connect(strikeGain);
    strikeGain.connect(this.masterGain);
    noise.start(t);

    // Warm flame whoosh / flare chord
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(360, t + 0.18);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.45);

    oscGain.gain.setValueAtTime(0.01, t + 0.04);
    oscGain.gain.linearRampToValueAtTime(0.28, t + 0.14);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t + 0.04);
    osc.stop(t + 0.6);
  }

  // 2. Candle Extinguish / Blowout (Gentle breath puff + vanishing sizzle)
  playCandleBlowout() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(280, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  // 3. Knife Pickup (Polished metallic ring & silver sheen)
  playKnifePickup() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const frequencies = [1200, 2400, 3600];

    frequencies.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + 0.25);

      gain.gain.setValueAtTime(0.18 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  // 4. Cake Cutting (Velvety soft sponge slice + cream texture)
  playCakeCut() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Soft friction noise of blade through buttercream and sponge
    const bufferSize = this.ctx.sampleRate * 0.42;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.65));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.frequency.exponentialRampToValueAtTime(800, t + 0.42);
    filter.Q.setValueAtTime(2.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.24, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);

    // Warm deep thud as blade meets the platter base
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(95, t + 0.25);
    thud.frequency.exponentialRampToValueAtTime(45, t + 0.45);
    thudGain.gain.setValueAtTime(0.2, t + 0.25);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    thud.connect(thudGain);
    thudGain.connect(this.masterGain);
    thud.start(t + 0.25);
    thud.stop(t + 0.55);
  }

  // 5. Slice Lift / Separation (Subtle porcelain plate chime)
  playSliceLift() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.15); // E5

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  // 6. Celebration Chord & Joyous Fanfare
  playCelebration() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Harmonious major 7th birthday fanfare chord: F4, A4, C5, E5, G5
    const chord = [349.23, 440.0, 523.25, 659.25, 783.99];

    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.01, t + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.12, t + idx * 0.04 + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.4);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.04);
      osc.stop(t + 1.5);
    });
  }

  // 6b. Joyous Crowd Cheering & Rhythmic Applause Clapping
  playApplauseAndCheer() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const ctx = this.ctx;

    // 1. Crowd hand claps (20 randomized rhythmic bursts over 2.4 seconds)
    for (let c = 0; c < 20; c++) {
      const clapTime = t + 0.04 + c * 0.11 + (Math.random() - 0.5) * 0.04;
      const clapLen = Math.floor(ctx.sampleRate * 0.045);
      const clapBuf = ctx.createBuffer(1, clapLen, ctx.sampleRate);
      const clapData = clapBuf.getChannelData(0);
      for (let j = 0; j < clapLen; j++) {
        clapData[j] = (Math.random() * 2 - 1) * Math.exp(-j / (clapLen * 0.28));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = clapBuf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1050 + Math.random() * 450, clapTime);
      filter.Q.setValueAtTime(2.2, clapTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18 + Math.random() * 0.08, clapTime);
      gain.gain.exponentialRampToValueAtTime(0.001, clapTime + 0.042);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      noise.start(clapTime);
    }

    // 2. Warm vocal cheering harmonics ("Woohoo! Yay!")
    const cheerTones = [523.25, 659.25, 783.99, 1046.5];
    cheerTones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.96, t + 0.12 + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.08, t + 0.45 + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 1.2);

      gain.gain.setValueAtTime(0.001, t + 0.12 + idx * 0.04);
      gain.gain.linearRampToValueAtTime(0.07 / (idx + 1), t + 0.32);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + 0.12 + idx * 0.04);
      osc.stop(t + 1.9);
    });
  }

  // 7. Delicious Bite Crunch & Sweet Sparkle
  playBite() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Soft sweet crumb crunch
    const bufferSize = this.ctx.sampleRate * 0.14;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.Q.setValueAtTime(2.0, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);

    // Sparkle chime
    [880, 1320, 1760].forEach((freq, i) => {
      const chime = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(freq, t + 0.08 + i * 0.04);

      chimeGain.gain.setValueAtTime(0.1, t + 0.08 + i * 0.04);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      chime.connect(chimeGain);
      chimeGain.connect(this.masterGain);
      chime.start(t + 0.08 + i * 0.04);
      chime.stop(t + 0.5);
    });
  }

  // 7b. Realistic Balloon Pop / Blast (Rubber snap + air explosion + confetti sparkle)
  playBalloonPop() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // 1. Sharp latex rubber snap (high frequency crack)
    const snapSize = Math.floor(this.ctx.sampleRate * 0.04);
    const snapBuffer = this.ctx.createBuffer(1, snapSize, this.ctx.sampleRate);
    const snapData = snapBuffer.getChannelData(0);
    for (let i = 0; i < snapSize; i++) {
      snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapSize * 0.2));
    }
    const snap = this.ctx.createBufferSource();
    snap.buffer = snapBuffer;

    const snapFilter = this.ctx.createBiquadFilter();
    snapFilter.type = 'highpass';
    snapFilter.frequency.setValueAtTime(1400, t);

    const snapGain = this.ctx.createGain();
    snapGain.gain.setValueAtTime(0.55, t);
    snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    snap.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(this.masterGain);
    snap.start(t);

    // 2. Air blast resonant pressure drop (deep pop thud)
    const popOsc = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    popOsc.type = 'sine';
    popOsc.frequency.setValueAtTime(420, t);
    popOsc.frequency.exponentialRampToValueAtTime(50, t + 0.12);

    popGain.gain.setValueAtTime(0.48, t);
    popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    popOsc.connect(popGain);
    popGain.connect(this.masterGain);
    popOsc.start(t);
    popOsc.stop(t + 0.15);

    // 3. Shimmering confetti sparkle burst
    [1760, 2640, 3520].forEach((freq, idx) => {
      const sparkle = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      sparkle.type = 'sine';
      sparkle.frequency.setValueAtTime(freq, t + idx * 0.02);

      sGain.gain.setValueAtTime(0.08 / (idx + 1), t + idx * 0.02);
      sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35 + idx * 0.04);

      sparkle.connect(sGain);
      sGain.connect(this.masterGain);
      sparkle.start(t + idx * 0.02);
      sparkle.stop(t + 0.42);
    });
  }

  // 7c. Solid Architectural Door Opening (Handle latch click + wooden swing)
  playDoorOpen() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Brass latch release clicks
    [0, 0.03].forEach((offset) => {
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(1200, t + offset);
      click.frequency.exponentialRampToValueAtTime(400, t + offset + 0.02);

      clickGain.gain.setValueAtTime(0.18, t + offset);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.025);

      click.connect(clickGain);
      clickGain.connect(this.masterGain);
      click.start(t + offset);
      click.stop(t + offset + 0.03);
    });

    // Smooth wooden hinge swing resonance
    const swing = this.ctx.createOscillator();
    const swingGain = this.ctx.createGain();
    swing.type = 'sine';
    swing.frequency.setValueAtTime(140, t + 0.05);
    swing.frequency.linearRampToValueAtTime(95, t + 0.45);

    swingGain.gain.setValueAtTime(0.001, t + 0.05);
    swingGain.gain.linearRampToValueAtTime(0.10, t + 0.15);
    swingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.50);

    swing.connect(swingGain);
    swingGain.connect(this.masterGain);
    swing.start(t + 0.05);
    swing.stop(t + 0.55);
  }

  // 7d. Solid Architectural Door Closing (Gentle latch clack)
  playDoorClose() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(110, t);
    thud.frequency.exponentialRampToValueAtTime(45, t + 0.15);

    thudGain.gain.setValueAtTime(0.24, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    thud.connect(thudGain);
    thudGain.connect(this.masterGain);
    thud.start(t);
    thud.stop(t + 0.20);
  }

  // 7e. Gift Box Unwrapping / Mystery Opening
  playGiftUnwrap() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Satin ribbon paper rustle
    const size = Math.floor(this.ctx.sampleRate * 0.22);
    const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < size; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (size * 0.5));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2800, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);

    // Magical chime sparkle
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const chime = this.ctx.createOscillator();
      const cGain = this.ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(freq, t + 0.05 + idx * 0.06);

      cGain.gain.setValueAtTime(0.12, t + 0.05 + idx * 0.06);
      cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6 + idx * 0.08);

      chime.connect(cGain);
      cGain.connect(this.masterGain);
      chime.start(t + 0.05 + idx * 0.06);
      chime.stop(t + 0.7);
    });
  }

  // 7f. Camera Shutter Snapshot Click for Photo Booth
  playCameraClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Mechanical shutter double-click
    [0, 0.08].forEach((offset, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(idx === 0 ? 1800 : 1200, t + offset);
      osc.frequency.exponentialRampToValueAtTime(300, t + offset + 0.025);

      gain.gain.setValueAtTime(0.35, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.03);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + offset);
      osc.stop(t + offset + 0.035);
    });
  }

  // 7g. Upbeat Disco Club Groove & Synth Bass for Dance Room
  playDanceBeat() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Punchy 4-on-the-floor electro kick drum
    const kick = this.ctx.createOscillator();
    const kickGain = this.ctx.createGain();
    kick.type = 'sine';
    kick.frequency.setValueAtTime(150, t);
    kick.frequency.exponentialRampToValueAtTime(38, t + 0.18);

    kickGain.gain.setValueAtTime(0.55, t);
    kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    kick.connect(kickGain);
    kickGain.connect(this.masterGain);
    kick.start(t);
    kick.stop(t + 0.25);

    // Funky disco synth chord stab
    [261.63, 329.63, 392.00, 523.25].forEach((f, i) => {
      const synth = this.ctx.createOscillator();
      const sGain = this.ctx.createGain();
      synth.type = 'sawtooth';
      synth.frequency.setValueAtTime(f, t + 0.05);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, t + 0.05);
      filter.frequency.exponentialRampToValueAtTime(600, t + 0.35);

      sGain.gain.setValueAtTime(0.06, t + 0.05);
      sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      synth.connect(filter);
      filter.connect(sGain);
      sGain.connect(this.masterGain);
      synth.start(t + 0.05);
      synth.stop(t + 0.38);
    });
  }
  // 8. Ambient audio - safe no-op (eliminates annoying "hmmmmmm" drone)
  playAmbientLoop() {
    // Disabled to prevent unwanted continuous low-frequency humming/buzzing
    if (this._ambientGain && this.ctx) {
      try {
        this._ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  stopAmbientLoop() {
    try {
      if (this._ambientGain && this.ctx) {
        this._ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      this._ambientOscillators && this._ambientOscillators.forEach((o) => {
        try { o.stop(); } catch (e) {}
      });
      this._ambientNoise && this._ambientNoise.stop();
    } catch (e) {}
    this._ambientPlaying = false;
  }

  // 9. Full Happy Birthday Anthem & Grand Celebration Fanfare (~18-20 seconds)
  playHappyBirthdayMelody() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    // Clean up any previously active melody oscillators
    if (this._melodyOscillators) {
      this._melodyOscillators.forEach((o) => {
        try { o.stop(); } catch (e) {}
      });
    }
    this._melodyOscillators = [];

    const ctx = this.ctx;
    const startTime = ctx.currentTime + 0.35;

    // Full 4-Line Happy Birthday Song Sequence
    const melodyNotes = [
      // Line 1: "Happy Birthday to you" (0.0s - 3.4s)
      { f: 261.63, d: 0.34, gap: 0.06 }, // Hap- (C4)
      { f: 261.63, d: 0.22, gap: 0.06 }, // py (C4)
      { f: 293.66, d: 0.52, gap: 0.06 }, // Birth- (D4)
      { f: 261.63, d: 0.52, gap: 0.06 }, // day (C4)
      { f: 349.23, d: 0.54, gap: 0.06 }, // to (F4)
      { f: 329.63, d: 0.90, gap: 0.30 }, // you... (E4)

      // Line 2: "Happy Birthday to you" (3.4s - 6.8s)
      { f: 261.63, d: 0.34, gap: 0.06 }, // Hap-
      { f: 261.63, d: 0.22, gap: 0.06 }, // py
      { f: 293.66, d: 0.52, gap: 0.06 }, // Birth-
      { f: 261.63, d: 0.52, gap: 0.06 }, // day
      { f: 392.00, d: 0.54, gap: 0.06 }, // to (G4)
      { f: 349.23, d: 0.90, gap: 0.30 }, // you... (F4)

      // Line 3: "Happy Birthday dear Sneha" (6.8s - 10.6s)
      { f: 261.63, d: 0.34, gap: 0.06 }, // Hap-
      { f: 261.63, d: 0.22, gap: 0.06 }, // py
      { f: 523.25, d: 0.52, gap: 0.06 }, // Birth- (high C5)
      { f: 440.00, d: 0.52, gap: 0.06 }, // day (A4)
      { f: 349.23, d: 0.52, gap: 0.06 }, // dear (F4)
      { f: 329.63, d: 0.52, gap: 0.06 }, // Ab- (E4)
      { f: 293.66, d: 0.92, gap: 0.30 }, // hay! (D4)

      // Line 4: "Happy Birthday to you!" (10.6s - 14.6s)
      { f: 466.16, d: 0.34, gap: 0.06 }, // Hap- (Bb4)
      { f: 466.16, d: 0.22, gap: 0.06 }, // py (Bb4)
      { f: 440.00, d: 0.52, gap: 0.06 }, // Birth- (A4)
      { f: 349.23, d: 0.52, gap: 0.06 }, // day (F4)
      { f: 392.00, d: 0.54, gap: 0.06 }, // to (G4)
      { f: 349.23, d: 1.35, gap: 0.40 }, // you!!! (F4, triumphantly held)
    ];

    // Warm Harmonic Bass notes underpinning each phrase (F, C, Bb chords)
    const bassline = [
      { t: 0.0, f: 174.61, d: 1.6 },  // F3
      { t: 1.6, f: 130.81, d: 1.6 },  // C3
      { t: 3.4, f: 130.81, d: 1.6 },  // C3
      { t: 5.0, f: 174.61, d: 1.6 },  // F3
      { t: 6.8, f: 174.61, d: 1.6 },  // F3
      { t: 8.4, f: 116.54, d: 1.8 },  // Bb2
      { t: 10.6, f: 116.54, d: 1.6 }, // Bb2
      { t: 12.2, f: 130.81, d: 1.2 }, // C3
      { t: 13.4, f: 87.31, d: 2.4 },  // F2 deep root
    ];

    // Schedule Lead Melody + Crystalline Music-Box Overtone
    let currentT = startTime;
    melodyNotes.forEach(({ f, d, gap }) => {
      // 1. Primary Melody Tone (Warm singing music box triangle)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, currentT);

      gain.gain.setValueAtTime(0.001, currentT);
      gain.gain.linearRampToValueAtTime(0.14, currentT + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, currentT + d * 0.94);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(currentT);
      osc.stop(currentT + d);
      this._melodyOscillators.push(osc);

      // 2. Sparkling high octave bell chime (subtle shimmer)
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = 'sine';
      chime.frequency.setValueAtTime(f * 2, currentT);

      chimeGain.gain.setValueAtTime(0.001, currentT);
      chimeGain.gain.linearRampToValueAtTime(0.032, currentT + 0.02);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, currentT + d * 0.75);

      chime.connect(chimeGain);
      chimeGain.connect(this.masterGain);
      chime.start(currentT);
      chime.stop(currentT + d);
      this._melodyOscillators.push(chime);

      currentT += d + gap;
    });

    // Schedule Bass Accompaniment
    bassline.forEach(({ t, f, d }) => {
      const bTime = startTime + t;
      const bOsc = ctx.createOscillator();
      const bGain = ctx.createGain();
      bOsc.type = 'sine';
      bOsc.frequency.setValueAtTime(f, bTime);

      bGain.gain.setValueAtTime(0.001, bTime);
      bGain.gain.linearRampToValueAtTime(0.09, bTime + 0.08);
      bGain.gain.exponentialRampToValueAtTime(0.001, bTime + d * 0.95);

      bOsc.connect(bGain);
      bGain.connect(this.masterGain);
      bOsc.start(bTime);
      bOsc.stop(bTime + d);
      this._melodyOscillators.push(bOsc);
    });

    // Grand Celebration Fanfare & Sparkle Coda (14.6s - 19.5s)
    const codaStart = currentT + 0.2;
    // Cascading sparkle chimes
    const fanfareArp = [
      { t: 0.00, f: 349.23 }, // F4
      { t: 0.12, f: 440.00 }, // A4
      { t: 0.24, f: 523.25 }, // C5
      { t: 0.36, f: 698.46 }, // F5
      { t: 0.48, f: 880.00 }, // A5
      { t: 0.60, f: 1046.5 }, // C6
      { t: 0.72, f: 1396.9 }, // F6
    ];

    fanfareArp.forEach(({ t, f }) => {
      const fTime = codaStart + t;
      const fOsc = ctx.createOscillator();
      const fGain = ctx.createGain();
      fOsc.type = 'sine';
      fOsc.frequency.setValueAtTime(f, fTime);

      fGain.gain.setValueAtTime(0.001, fTime);
      fGain.gain.linearRampToValueAtTime(0.08, fTime + 0.03);
      fGain.gain.exponentialRampToValueAtTime(0.001, fTime + 0.85);

      fOsc.connect(fGain);
      fGain.connect(this.masterGain);
      fOsc.start(fTime);
      fOsc.stop(fTime + 0.9);
      this._melodyOscillators.push(fOsc);
    });

    // Sustained Joyful Celebration Final Chord (F-Major 7: F3, A3, C4, E4, F4)
    const finalChord = [174.61, 220.00, 261.63, 329.63, 349.23];
    const chordTime = codaStart + 0.85;
    finalChord.forEach((f, i) => {
      const cOsc = ctx.createOscillator();
      const cGain = ctx.createGain();
      cOsc.type = 'triangle';
      cOsc.frequency.setValueAtTime(f, chordTime);

      cGain.gain.setValueAtTime(0.001, chordTime);
      cGain.gain.linearRampToValueAtTime(0.07 / (1 + i * 0.15), chordTime + 0.15);
      cGain.gain.exponentialRampToValueAtTime(0.0005, chordTime + 3.8); // rings out gently until ~19.5s

      cOsc.connect(cGain);
      cGain.connect(this.masterGain);
      cOsc.start(chordTime);
      cOsc.stop(chordTime + 4.0);
      this._melodyOscillators.push(cOsc);
    });
  }
}

export const soundEngine = new BirthdayAudioEngine();
