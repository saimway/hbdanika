/* app.js: main controller for Anika's birthday universe.
   Lock screen, wax-seal letter, scrapbook, candle blowing, final letter. */
document.addEventListener('DOMContentLoaded', () => {
  const particleCanvas = new ParticleCanvas('particleCanvas');
  const $ = (id) => document.getElementById(id);

  const lockScreen = $('lockScreen'), lockShackle = $('lockShackle'), lockStatus = $('lockStatus'), lockIcon = document.querySelector('.lock-icon-glow');
  const dateSlots = document.querySelectorAll('.pin-slot');
  const dateDividers = document.querySelectorAll('.date-divider');
  const keypadButtons = document.querySelectorAll('.keypad-btn');
  const dateDisplayContainer = $('dateDisplayContainer');
  const mainExperience = $('mainExperience');
  const audioWidget = $('audioWidget'), musicDisc = $('musicDisc'), musicLabel = $('musicLabel');
  const firstEnvelope = $('firstEnvelope'), waxSeal = $('waxSeal'), firstLetter = $('firstLetter');
  const mailTapPrompt = $('mailTapPrompt'), letterPeeking = $('letterPeeking');
  const foldNoteCard = $('foldNoteCard');
  const starButtons = document.querySelectorAll('.wish-star-btn');
  const wishRevealedText = $('wishRevealedText');
  const polaroids = document.querySelectorAll('.polaroid-card');
  const appreciationItems = document.querySelectorAll('.appreciation-item');
  const cakeStage = $('cakeStage'), candles = document.querySelectorAll('.candle');
  const blowCakeBtn = $('blowCakeBtn'), blowBtnLabel = $('blowBtnLabel');
  const micBlowToggle = $('micBlowToggle'), micLabel = $('micLabel');
  const micLevelMeter = $('micLevelMeter'), micLevelBar = $('micLevelBar');
  const wishToast = $('wishToast');
  const finalMailModal = $('finalMailModal'), modalCloseBtn = $('modalCloseBtn');
  const floatingMailBtn = $('floatingMailBtn'), hugBtn = $('hugBtn'), copyBtn = $('copyBtn'), replayBtn = $('replayBtn');
  const heartFlyContainer = $('heartFlyContainer'), finalLetterBody = $('finalLetterBody'), actionToast = $('actionToast');

  let enteredPin = "";
  const VALID_PINS = ["04102008", "10042008"];
  let isLocked = true, isVerifying = false, isFirstMailOpen = false;
  let areCandlesBlown = false, isBlowingInProgress = false, blownCandleCount = 0;
  let isMicListening = false, micAudioContext = null, micStream = null, micAnimationId = null;
  let toastTimer = null, blowTimeoutId = null, autoPopupTimer = null, copyTimer = null, isHugging = false;

  function showActionToast(msg) {
    if (!actionToast) return;
    actionToast.textContent = msg;
    actionToast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => actionToast.classList.remove('show'), 2600);
  }

  const wishes = [
    "May this year bring you so much happiness that you laugh out loud without even knowing why.",
    "May the big dreams you're scared to say out loud come true. You're more able than you think.",
    "May your deen be stronger than ever this year, filling your soul with calm, strength and blessings.",
    "May little magic moments find you this year: the right song at the right time, and good news when you least expect it.",
    "May you see yourself, just for a few seconds, the way I see you. Then you'd never doubt yourself again.",
    "May you always feel safe and deeply valued, wherever you are and wherever you go."
  ];

  /* ---------- 1. Music widget ---------- */
  audioWidget.addEventListener('click', () => {
    window.soundEngine.init();
    const isPlaying = window.soundEngine.toggleBgm();
    musicDisc.classList.toggle('playing', isPlaying);
    musicLabel.textContent = isPlaying ? "Music: On" : "Music: Off";
  });

  /* ---------- 2. Lock screen keypad ---------- */
  function updatePinDisplay() {
    if (lockIcon) lockIcon.style.setProperty('--p', enteredPin.length / 8);
    for (let i = 0; i < dateSlots.length; i++) {
      const slot = dateSlots[i];
      slot.textContent = i < enteredPin.length ? enteredPin[i] : "";
      slot.classList.toggle('filled', i < enteredPin.length);
      slot.classList.toggle('cursor-active', i === enteredPin.length);
    }
    if (dateDividers.length >= 2) {
      dateDividers[0].classList.toggle('active', enteredPin.length >= 2);
      dateDividers[1].classList.toggle('active', enteredPin.length >= 4);
    }
  }
  function handleKeyPress(value) {
    if (!isLocked || isVerifying) return;
    window.soundEngine.init();
    if (navigator.vibrate) { try { navigator.vibrate(12); } catch (e) {} }
    if (value === 'backspace') {
      if (enteredPin.length > 0) {
        enteredPin = enteredPin.slice(0, -1);
        window.soundEngine.playKeypadDelete();
        updatePinDisplay();
      }
      return;
    }
    if (value === 'clear') {
      enteredPin = "";
      window.soundEngine.playKeypadDelete();
      updatePinDisplay();
      return;
    }
    if (enteredPin.length < 8) {
      enteredPin += value;
      lockStatus.classList.remove('show');
      window.soundEngine.playKeypadClick(1 + enteredPin.length * 0.07);
      updatePinDisplay();
      if (enteredPin.length === 8) {
        isVerifying = true;
        setTimeout(verifyPin, 140);
      }
    }
  }
  function verifyPin() {
    if (VALID_PINS.includes(enteredPin)) {
      isLocked = false; isVerifying = false;
      lockStatus.textContent = 'There you are, Anika.'; lockStatus.classList.add('ok', 'show');
      lockScreen.classList.add('shackle-open');
      window.soundEngine.playLockShackle();
      if (navigator.vibrate) { try { navigator.vibrate([60, 40, 100]); } catch (e) {} }
      setTimeout(() => {
        window.soundEngine.playUnlock();
        particleCanvas.createConfetti(innerWidth / 2, innerHeight * 0.32, 110);
        particleCanvas.createPetals(innerWidth / 2, innerHeight * 0.25, 26);
      }, 160);
      setTimeout(() => {
        window.soundEngine.startBgm();
        musicDisc.classList.add('playing');
        musicLabel.textContent = "Music: On";
      }, 750);
      setTimeout(() => {
        lockScreen.classList.add('unlocked');
        setTimeout(() => {
          lockScreen.style.display = 'none';
          mainExperience.removeAttribute('inert');
          mainExperience.removeAttribute('aria-hidden');
          mainExperience.classList.add('visible');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 750);
      }, 450);
    } else {
      window.soundEngine.playError();
      lockStatus.textContent = 'Not quite. Think of the day the world got a little brighter.'; lockStatus.classList.add('show');
      dateDisplayContainer.classList.add('pin-error-wobble');
      dateSlots.forEach(s => s.classList.add('error'));
      if (navigator.vibrate) { try { navigator.vibrate([40, 60, 40]); } catch (e) {} }
      setTimeout(() => {
        dateDisplayContainer.classList.remove('pin-error-wobble');
        dateSlots.forEach(s => s.classList.remove('error'));
        enteredPin = ""; isVerifying = false; updatePinDisplay();
      }, 650);
    }
  }
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('i'); s.className = 'lk-spark';
    s.style.cssText = `left:${Math.random() * 100}%;--s:${(2 + Math.random() * 3).toFixed(1)}px;animation-duration:${9 + Math.random() * 9}s;animation-delay:${-Math.random() * 14}s`;
    lockScreen.appendChild(s);
  }
  let lastTouchPress = 0;
  keypadButtons.forEach(btn => {
    const val = btn.getAttribute('data-value');
    btn.addEventListener('pointerdown', (e) => {
      if (e.button && e.button !== 0) return;
      if (e.cancelable) e.preventDefault();
      lastTouchPress = Date.now();
      handleKeyPress(val);
    }, { passive: false });

    btn.addEventListener('click', (e) => {
      if (Date.now() - lastTouchPress < 350) return;
      handleKeyPress(val);
    });
  });
  window.addEventListener('keydown', (e) => {
    if (!isLocked) return;
    if (e.key >= '0' && e.key <= '9') handleKeyPress(e.key);
    else if (e.key === 'Backspace' || e.key === 'Delete') handleKeyPress('backspace');
    else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') handleKeyPress('clear');
  });

  /* ---------- 3. First mail ---------- */
  function openFirstEnvelope() {
    if (isFirstMailOpen) return;
    isFirstMailOpen = true;
    window.soundEngine.init();
    window.soundEngine.playWaxCrack();
    setTimeout(() => window.soundEngine.playPaperRustle(), 250);
    if (navigator.vibrate) { try { navigator.vibrate([40, 30, 60]); } catch (e) {} }
    firstEnvelope.classList.add('open');
    if (mailTapPrompt) mailTapPrompt.style.display = 'none';
    const rect = waxSeal.getBoundingClientRect();
    particleCanvas.createWaxCrumbBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
    particleCanvas.createConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
    setTimeout(() => {
      if (letterPeeking) { letterPeeking.style.transform = 'translateY(-110px) scale(1.05)'; letterPeeking.style.opacity = '0'; }
    }, 350);
    setTimeout(() => {
      firstLetter.classList.add('active');
      firstLetter.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 620);
  }
  firstEnvelope.addEventListener('click', openFirstEnvelope);
  waxSeal.addEventListener('click', openFirstEnvelope);
  if (mailTapPrompt) mailTapPrompt.addEventListener('click', openFirstEnvelope);

  /* ---------- 4. Scrapbook ---------- */
  if (foldNoteCard) {
    foldNoteCard.addEventListener('click', () => {
      window.soundEngine.init();
      window.soundEngine.playPaperRustle();
      const unfolded = foldNoteCard.classList.toggle('unfolded');
      const ribbonSpan = foldNoteCard.querySelector('.fold-ribbon span');
      if (ribbonSpan) ribbonSpan.textContent = unfolded ? "Little things · unfolded" : "Secret · tap to unfold";
      if (navigator.vibrate) { try { navigator.vibrate(30); } catch (e) {} }
      if (unfolded) {
        const r = foldNoteCard.getBoundingClientRect();
        particleCanvas.createPetals(r.left + r.width / 2, r.top + r.height / 2, 10);
      }
    });
  }
  polaroids.forEach((card) => {
    card.addEventListener('click', () => {
      window.soundEngine.init();
      window.soundEngine.playCameraShutter();
      card.classList.add('card-tapped');
      setTimeout(() => card.classList.remove('card-tapped'), 450);
      const flash = card.querySelector('.camera-flash-overlay');
      if (flash) { flash.classList.add('flashing'); setTimeout(() => flash.classList.remove('flashing'), 70); }
      if (navigator.vibrate) { try { navigator.vibrate(25); } catch (e) {} }
      const r = card.getBoundingClientRect();
      particleCanvas.createShootingStar(r.left + r.width / 2, r.top + r.height / 2);
    });
  });
  appreciationItems.forEach((item) => {
    item.addEventListener('click', () => {
      window.soundEngine.init();
      window.soundEngine.playKeypadClick(1.6);
      item.classList.toggle('highlighted');
      if (navigator.vibrate) { try { navigator.vibrate(20); } catch (e) {} }
      const r = item.getBoundingClientRect();
      particleCanvas.createShootingStar(r.left + 24, r.top + r.height / 2);
    });
  });
  starButtons.forEach((starBtn, idx) => {
    starBtn.addEventListener('click', () => {
      window.soundEngine.init();
      window.soundEngine.playStarTwinkle();
      if (navigator.vibrate) { try { navigator.vibrate(25); } catch (e) {} }
      starButtons.forEach(b => b.classList.remove('revealed'));
      starBtn.classList.add('revealed');
      const wish = wishes[idx % wishes.length];
      wishRevealedText.innerHTML = `<svg class="star-icon-revealed" viewBox="0 0 24 24" width="18" height="18" fill="#e8c476"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg><span><em>"${wish}"</em></span>`;
      wishRevealedText.style.animation = 'none';
      wishRevealedText.offsetHeight;
      wishRevealedText.style.animation = 'unfoldLetter 0.4s ease';
      const r = starBtn.getBoundingClientRect();
      particleCanvas.createShootingStar(r.left + r.width / 2, r.top + r.height / 2);
      particleCanvas.createConfetti(r.left + r.width / 2, r.top + r.height / 2, 18);
    });
  });

  /* ---------- 5. Cake & candles ---------- */
  function blowCandleSingle(candle) {
    if (candle.classList.contains('blown') || areCandlesBlown || isBlowingInProgress) return;
    candle.classList.add('blown');
    blownCandleCount++;
    window.soundEngine.init();
    window.soundEngine.duckBgm(true);
    window.soundEngine.playBlowSound();
    const r = candle.getBoundingClientRect();
    particleCanvas.createCandleSmoke(r.left + r.width / 2, r.top + 6, 22);
    if (blownCandleCount >= candles.length && !areCandlesBlown) completeCandleBlow();
  }
  function completeCandleBlow() {
    if (areCandlesBlown) return;
    areCandlesBlown = true; isBlowingInProgress = false;
    stopMicListening();
    window.soundEngine.duckBgm(true);
    cakeStage.classList.add('blown');
    blowCakeBtn.hidden = true;
    micBlowToggle.classList.add('disabled');
    micLabel.textContent = "Wish made. Candles out.";
    wishToast.classList.add('visible');
    candles.forEach((candle) => {
      if (!candle.classList.contains('blown')) {
        candle.classList.add('blown');
        const r = candle.getBoundingClientRect();
        particleCanvas.createCandleSmoke(r.left + r.width / 2, r.top + 6, 22);
      }
    });
    if (navigator.vibrate) { try { navigator.vibrate([100, 50, 150]); } catch (e) {} }
    setTimeout(() => {
      window.soundEngine.playCelebration();
      particleCanvas.createConfetti(innerWidth / 2, innerHeight * 0.4, 130);
      particleCanvas.createPetals(innerWidth / 2, innerHeight * 0.3, 22);
    }, 450);
    if (autoPopupTimer) clearTimeout(autoPopupTimer);
    autoPopupTimer = setTimeout(showFinalMail, 3400);
  }
  function blowAllCandles() {
    if (areCandlesBlown || isBlowingInProgress) return;
    isBlowingInProgress = true;
    window.soundEngine.duckBgm(true);
    blowCakeBtn.classList.add('disabled');
    window.soundEngine.init();
    window.soundEngine.playBlowSound();
    const delay = 90;
    candles.forEach((candle, i) => {
      setTimeout(() => {
        if (!candle.classList.contains('blown')) {
          candle.classList.add('blown');
          blownCandleCount++;
          const r = candle.getBoundingClientRect();
          particleCanvas.createCandleSmoke(r.left + r.width / 2, r.top + 6, 24);
        }
      }, i * delay);
    });
    if (blowTimeoutId) clearTimeout(blowTimeoutId);
    blowTimeoutId = setTimeout(completeCandleBlow, candles.length * delay + 120);
  }
  blowCakeBtn.addEventListener('click', blowAllCandles);
  candles.forEach(c => c.addEventListener('click', () => { if (!areCandlesBlown) blowCandleSingle(c); }));

  /* ---------- Microphone breath detection ---------- */
  async function startMicListening() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStream = stream;
      const AC = window.AudioContext || window.webkitAudioContext;
      micAudioContext = new AC();
      if (micAudioContext.state === 'suspended') await micAudioContext.resume();
      const source = micAudioContext.createMediaStreamSource(stream);
      const analyser = micAudioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      isMicListening = true;
      micBlowToggle.classList.add('active');
      micLabel.textContent = "Listening… blow into your mic";
      if (micLevelMeter) micLevelMeter.classList.add('active');

      let blowFrames = 0;
      let warmupFrames = 0; // Ignore initial mic activation noise (~400ms)
      const BLOW_THRESHOLD = 82; // Requires a deliberate, strong blow
      const REQUIRED_FRAMES = 8; // Requires sustained breath (~130ms)

      function checkAudio() {
        if (!isMicListening || areCandlesBlown) return;
        analyser.getByteFrequencyData(dataArray);
        let low = 0;
        for (let i = 0; i < 9; i++) low += dataArray[i];
        const avg = low / 9;

        if (micLevelBar) {
          const percent = Math.min(100, Math.max(0, Math.round((avg / BLOW_THRESHOLD) * 100)));
          micLevelBar.style.width = percent + '%';
        }

        // Wait for microphone hardware auto-gain to stabilize before detecting breath
        if (warmupFrames < 25) {
          warmupFrames++;
          micAnimationId = requestAnimationFrame(checkAudio);
          return;
        }

        if (avg >= BLOW_THRESHOLD) {
          blowFrames++;
          if (micLabel && blowFrames >= 3) micLabel.textContent = "Keep blowing…";
          if (blowFrames >= REQUIRED_FRAMES) {
            blowAllCandles();
            return;
          }
        } else {
          blowFrames = Math.max(0, blowFrames - 2);
          if (micLabel && blowFrames === 0) micLabel.textContent = "Listening… blow into your mic";
        }
        micAnimationId = requestAnimationFrame(checkAudio);
      }
      checkAudio();
    } catch (err) {
      isMicListening = false;
      micBlowToggle.classList.remove('active');
      if (micLevelMeter) micLevelMeter.classList.remove('active');
      micLabel.textContent = "Mic unavailable. Use the tap below";
    }
  }
  function stopMicListening() {
    isMicListening = false;
    if (micAnimationId) { cancelAnimationFrame(micAnimationId); micAnimationId = null; }
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    if (micAudioContext) { try { micAudioContext.close(); } catch (e) {} micAudioContext = null; }
    micBlowToggle.classList.remove('active');
    if (micLevelMeter) micLevelMeter.classList.remove('active');
    if (micLevelBar) micLevelBar.style.width = '0%';
    micLabel.textContent = "Blow out the candles";
  }
  micBlowToggle.addEventListener('click', () => {
    if (areCandlesBlown) return;
    isMicListening ? stopMicListening() : startMicListening();
  });

  /* ---------- 6. Final letter ---------- */
  function showFinalMail() {
    finalMailModal.classList.add('show');
    floatingMailBtn.classList.remove('visible');
    window.soundEngine.playPaperRustle();
    if (navigator.vibrate) { try { navigator.vibrate([50, 40, 90]); } catch (e) {} }
    particleCanvas.createConfetti(innerWidth / 2, innerHeight * 0.3, 90);
    particleCanvas.createPetals(innerWidth / 2, innerHeight * 0.2, 20);
  }
  function closeFinalMail() {
    finalMailModal.classList.remove('show');
    floatingMailBtn.classList.add('visible');
  }
  modalCloseBtn.addEventListener('click', closeFinalMail);
  floatingMailBtn.addEventListener('click', showFinalMail);
  finalMailModal.addEventListener('click', (e) => { if (e.target === finalMailModal) closeFinalMail(); });

  function copyTextToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.focus(); ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('copy failed'));
      } catch (e) { reject(e); }
    });
  }

  const flyingIcons = [
    `<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#ff5d7d"/></svg>`,
    `<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><circle cx="12" cy="12" r="4.5" fill="#e8c476"/><path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4M4.6 4.6l2.8 2.8M16.6 16.6l2.8 2.8M19.4 4.6l-2.8 2.8M7.4 16.6l-2.8 2.8" stroke="#e8c476" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><path d="M12 2C8 6 6 11 8 16c2 5 7 6 9 3 2-3 1-8-2-12-1-2-2-4-3-5z" fill="#ffb3c1"/><circle cx="12" cy="14" r="2" fill="#e8c476"/></svg>`,
    `<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><circle cx="12" cy="10" r="6" fill="#ff758f"/><circle cx="12" cy="10" r="3.4" fill="#ff9ebb"/><circle cx="12" cy="10" r="1.4" fill="#e8c476"/><path d="M12 16v5M9 19l3 2 3-2" stroke="#7fb069" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    `<svg viewBox="0 0 24 24" width="26" height="26" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" fill="#fffaf0" stroke="#b5383a" stroke-width="1.4"/><path d="M3 7l9 6 9-6" stroke="#b5383a" stroke-width="1.4"/></svg>`
  ];
  hugBtn.addEventListener('click', () => {
    if (isHugging) return;
    isHugging = true;
    setTimeout(() => { isHugging = false; }, 650);
    window.soundEngine.init();
    window.soundEngine.playHarpFlourish();
    if (navigator.vibrate) { try { navigator.vibrate([30, 40, 60]); } catch (e) {} }
    showActionToast("Hug sent. It's already wrapped around you.");
    for (let i = 0; i < 18; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'flying-heart';
        el.innerHTML = flyingIcons[Math.floor(Math.random() * flyingIcons.length)];
        el.style.left = (Math.random() * 80 + 10) + 'vw';
        el.style.bottom = (Math.random() * 20 + 10) + 'vh';
        heartFlyContainer.appendChild(el);
        setTimeout(() => el.remove(), 2300);
      }, i * 65);
    }
  });

  copyBtn.addEventListener('click', () => {
    window.soundEngine.init();
    window.soundEngine.playKeypadClick(1.5);
    const body = (finalLetterBody.innerText || finalLetterBody.textContent || "").trim();
    const keepsake = `For Anika: what I really feel\n\n${body}\n\nAlways, from far away,\nSaim`;
    const savedHtml = `<svg class="action-btn-svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span>Kept safe</span>`;
    const originalHtml = copyBtn.innerHTML;
    const done = () => {
      copyBtn.innerHTML = savedHtml;
      showActionToast("Saved to your heart. Keep it safe.");
      if (copyTimer) clearTimeout(copyTimer);
      copyTimer = setTimeout(() => { copyBtn.innerHTML = originalHtml; }, 2000);
    };
    copyTextToClipboard(keepsake).then(done).catch(done);
  });

  replayBtn.addEventListener('click', () => {
    window.soundEngine.init();
    window.soundEngine.playKeypadClick(1.2);
    window.soundEngine.playSparkleRelight();
    closeFinalMail();
    floatingMailBtn.classList.remove('visible');
    if (blowTimeoutId) clearTimeout(blowTimeoutId);
    if (autoPopupTimer) clearTimeout(autoPopupTimer);
    areCandlesBlown = false; isBlowingInProgress = false; blownCandleCount = 0;
    cakeStage.classList.remove('blown');
    candles.forEach(c => c.classList.remove('blown'));
    blowCakeBtn.classList.remove('disabled');
    blowBtnLabel.textContent = "no mic? just tap to blow"; blowCakeBtn.hidden = false;
    micBlowToggle.classList.remove('disabled'); micLabel.textContent = "Blow out the candles";
    wishToast.classList.remove('visible');
    const r = cakeStage.getBoundingClientRect();
    particleCanvas.createConfetti(r.left + r.width / 2, r.top + 50, 45);
    cakeStage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  updatePinDisplay();
});