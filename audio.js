/* audio.js: pure Web Audio synthesizer. Every sound is generated live.
   Music box voicing: soft sine fundamental + octave shimmer + warm bass. */
class SoundEngine {
  constructor() {
    this.ctx = null; this.master = null; this.bgmGain = null;
    this.isMuted = false; this.isBgmPlaying = false; this.isBgmDucked = false;
    this.isCelebrationPlaying = false; this.celebrationTimer = null;
    this.wasBgmPlaying = false;
    this.bgmTimer = null; this.bgmNoteIndex = 0;
  }
  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.92;
      this.master.connect(this.ctx.destination);
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.value = 1;
      this.bgmGain.connect(this.master);
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }
  out() { return this.master || this.ctx.destination; }
  note(freq, start, dur, vol = 0.15, type = 'sine', shimmer = true, dest = null) {
    if (!this.ctx || this.isMuted) return;
    const target = dest || this.out();
    try {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(vol, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.connect(g); g.connect(target);
      o.start(start); o.stop(start + dur + 0.05);
      if (shimmer) {
        const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
        o2.type = 'sine'; o2.frequency.setValueAtTime(freq * 2, start);
        g2.gain.setValueAtTime(0.0001, start);
        g2.gain.linearRampToValueAtTime(vol * 0.18, start + 0.015);
        g2.gain.exponentialRampToValueAtTime(0.0001, start + dur * 0.6);
        o2.connect(g2); g2.connect(target);
        o2.start(start); o2.stop(start + dur);
      }
    } catch (e) {}
  }
  bass(freq, start, dur, vol = 0.06, dest = null) {
    if (!this.ctx || this.isMuted) return;
    const target = dest || this.out();
    try {
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(freq, start);
      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      o.connect(g); g.connect(target);
      o.start(start); o.stop(start + dur + 0.05);
    } catch (e) {}
  }
  playKeypadClick(pitch = 1) {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(440 * pitch, now);
      o.frequency.exponentialRampToValueAtTime(140 * pitch, now + 0.05);
      g.gain.setValueAtTime(0.17, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      o.connect(g); g.connect(this.out());
      o.start(now); o.stop(now + 0.055);
    } catch (e) {}
  }
  playKeypadDelete() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(320, now);
      o.frequency.exponentialRampToValueAtTime(110, now + 0.06);
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      o.connect(g); g.connect(this.out());
      o.start(now); o.stop(now + 0.065);
    } catch (e) {}
  }
  playError() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(220, now);
      o.frequency.setValueAtTime(185, now + 0.09);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      o.connect(g); g.connect(this.out());
      o.start(now); o.stop(now + 0.29);
    } catch (e) {}
  }
  playUnlock() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [587.33, 739.99, 880, 1174.66, 1479.98, 1760].forEach((f, i) => this.note(f, now + i * 0.07, 0.7, 0.2));
    this.bass(146.83, now, 1.6, 0.05);
  }
  playWaxCrack() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(1200, now);
      o.frequency.exponentialRampToValueAtTime(280, now + 0.04);
      g.gain.setValueAtTime(0.28, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      o.connect(g); g.connect(this.out());
      o.start(now); o.stop(now + 0.045);
    } catch (e) {}
  }
  playPaperRustle() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    try {
      const dur = 0.28;
      const size = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * 0.7;
      const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(2600, this.ctx.currentTime + 0.2);
      filter.Q.value = 1.8;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.01, this.ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.13, this.ctx.currentTime + 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.27);
      noise.connect(filter); filter.connect(g); g.connect(this.out());
      noise.start();
    } catch (e) {}
  }
  playBlowSound() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime, dur = 0.65;
      const size = Math.floor(this.ctx.sampleRate * dur);
      const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * 0.8;
      const noise = this.ctx.createBufferSource(); noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + dur);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.01, now);
      g.gain.linearRampToValueAtTime(0.34, now + 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);
      noise.connect(filter); filter.connect(g); g.connect(this.out());
      noise.start(now);
    } catch (e) {}
  }
  playCelebration() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    this.wasBgmPlaying = this.isBgmPlaying;
    this.isCelebrationPlaying = true;
    this.duckBgm(true);
    if (this.celebrationTimer) { clearTimeout(this.celebrationTimer); this.celebrationTimer = null; }
    const beat = 0.46, now = this.ctx.currentTime + 0.06;
    const song = [
      [523.25,.75],[523.25,.25],[587.33,1],[523.25,1],[698.46,1],[659.25,2],
      [523.25,.75],[523.25,.25],[587.33,1],[523.25,1],[783.99,1],[698.46,2],
      [523.25,.75],[523.25,.25],[1046.5,1],[880,1],[698.46,1],[659.25,1],[587.33,2],
      [932.33,.75],[932.33,.25],[880,1],[698.46,1],[783.99,1],[698.46,2.5]
    ];
    let t = 0;
    song.forEach(([f, d]) => {
      this.note(f, now + t, d * beat * 0.95, 0.17, 'triangle');
      t += d * beat;
    });
    this.bass(261.63, now, 2.6, 0.05);
    this.bass(261.63, now + beat * 6, 2.6, 0.05);
    this.bass(261.63, now + beat * 12, 2.6, 0.05);
    this.bass(233.08, now + beat * 18, 2.6, 0.05);
    [1046.5, 1318.51, 1567.98, 2093].forEach((f, i) => this.note(f, now + t + 0.15 + i * 0.09, 0.7, 0.13));
    this.celebrationTimer = setTimeout(() => {
      this.isCelebrationPlaying = false;
      this.celebrationTimer = null;
      if (this.wasBgmPlaying) {
        this.duckBgm(false);
      }
    }, 13000);
  }
  playSparkleRelight() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    this.isCelebrationPlaying = false;
    if (this.celebrationTimer) { clearTimeout(this.celebrationTimer); this.celebrationTimer = null; }
    const now = this.ctx.currentTime;
    [659.25, 783.99, 987.77, 1318.51].forEach((f, i) => this.note(f, now + i * 0.05, 0.45, 0.17));
    if (this.wasBgmPlaying) {
      this.duckBgm(false);
    }
  }
  playLockShackle() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(880, now);
      o.frequency.exponentialRampToValueAtTime(320, now + 0.05);
      g.gain.setValueAtTime(0.17, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      o.connect(g); g.connect(this.out());
      o.start(now); o.stop(now + 0.055);
    } catch (e) {}
  }
  playCameraShutter() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const o1 = this.ctx.createOscillator(), g1 = this.ctx.createGain();
      o1.type = 'triangle';
      o1.frequency.setValueAtTime(650, now);
      o1.frequency.exponentialRampToValueAtTime(150, now + 0.035);
      g1.gain.setValueAtTime(0.2, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      o1.connect(g1); g1.connect(this.out());
      o1.start(now); o1.stop(now + 0.04);
      const o2 = this.ctx.createOscillator(), g2 = this.ctx.createGain();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(1200, now + 0.045);
      o2.frequency.exponentialRampToValueAtTime(200, now + 0.09);
      g2.gain.setValueAtTime(0.22, now + 0.045);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      o2.connect(g2); g2.connect(this.out());
      o2.start(now + 0.045); o2.stop(now + 0.095);
    } catch (e) {}
  }
  playStarTwinkle() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [1046.5, 1318.51, 1567.98, 2093].forEach((f, i) => this.note(f, now + i * 0.05, 0.48, 0.17));
  }
  playHarpFlourish() {
    if (this.isMuted) return; this.init(); if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760].forEach((f, i) => this.note(f, now + i * 0.06, 0.65, 0.14, 'triangle'));
    this.bass(220, now, 1.4, 0.05);
  }
  startBgm() {
    if (this.isCelebrationPlaying) return;
    this.init();
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(1, this.ctx.currentTime);
    }
    this.isBgmDucked = false;
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    this.scheduleNextBgmNote();
  }
  stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmTimer) { clearTimeout(this.bgmTimer); this.bgmTimer = null; }
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
  }
  toggleBgm() {
    if (this.isCelebrationPlaying) return false;
    if (this.isBgmPlaying) { this.stopBgm(); return false; }
    this.startBgm(); return true;
  }
  duckBgm(duck = true) {
    this.isBgmDucked = duck;
    if (duck) {
      if (this.bgmTimer) { clearTimeout(this.bgmTimer); this.bgmTimer = null; }
      if (this.bgmGain && this.ctx) {
        this.bgmGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else {
      if (this.isCelebrationPlaying) return;
      if (this.bgmGain && this.ctx) {
        this.bgmGain.gain.setValueAtTime(1, this.ctx.currentTime);
      }
      if (this.isBgmPlaying && !this.bgmTimer) this.scheduleNextBgmNote();
    }
  }
  scheduleNextBgmNote() {
    if (!this.isBgmPlaying || this.isBgmDucked || this.isCelebrationPlaying) return;
    /* A slow, tender waltz in D, written for her. Bass on each bar's downbeat. */
    const P = [
      { f: 587.33, d: 400, b: 146.83 }, { f: 739.99, d: 400 }, { f: 880, d: 400 },
      { f: 987.77, d: 400, b: 123.47 }, { f: 880, d: 400 }, { f: 739.99, d: 400 },
      { f: 783.99, d: 400, b: 98 }, { f: 987.77, d: 400 }, { f: 1174.66, d: 400 },
      { f: 1108.73, d: 400, b: 110 }, { f: 987.77, d: 400 }, { f: 880, d: 400 },
      { f: 1174.66, d: 430, b: 146.83 }, { f: 880, d: 430 }, { f: 739.99, d: 430 },
      { f: 987.77, d: 430, b: 123.47 }, { f: 739.99, d: 430 }, { f: 587.33, d: 430 },
      { f: 659.25, d: 430, b: 164.81 }, { f: 783.99, d: 430 }, { f: 987.77, d: 430 },
      { f: 880, d: 430, b: 110 }, { f: 739.99, d: 430 }, { f: 587.33, d: 950 }
    ];
    const cur = P[this.bgmNoteIndex % P.length];
    this.bgmNoteIndex++;
    if (this.ctx && !this.isMuted) {
      const now = this.ctx.currentTime;
      const dest = this.bgmGain || this.out();
      if (cur.b) this.bass(cur.b, now, 1.5, 0.055, dest);
      this.note(cur.f, now, 0.9, 0.11, 'sine', true, dest);
    }
    this.bgmTimer = setTimeout(() => this.scheduleNextBgmNote(), cur.d);
  }
}
window.soundEngine = new SoundEngine();
