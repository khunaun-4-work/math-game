/**
 * =========================================================
 * อาณาจักรของน้องอุ้ม - คณิตคิดไว
 * โจทย์แนวตั้งขนาดใหญ่ + ระบบแสดงจำนวนทด + สะสมครบ 100 ข้อ ขอให้ยายพาไปซื้อขนม
 * =========================================================
 */

(function () {
  'use strict';

  // เป้าหมายสะสมจำนวนข้อที่คิดเลขถูกต้อง (ขอให้ยายพาไปซื้อขนม)
  const TARGET_QUESTIONS = 100;

  // --- ตัวแปรสถานะของเกม (Game State) ---
  const state = {
    currentNum1: 0,
    currentNum2: 0,
    currentOp: '+',
    correctAnswer: 0,
    userAnswer: '',
    questionCount: 1,
    correctCount: 0, // จำนวนข้อที่ตอบถูก (เป้าหมาย 100 ข้อ)
    score: 0, // สะสมข้อละ 1 คะแนน
    combo: 0,
    bestScore: 0,
    hasCelebratedTarget: false, // ป้องกันการเด้งแจ้งเตือนซ้ำซ้อนเมื่อครบ 100 ข้อ
    maxLimit: 1000, // ค่าเริ่มต้น: ตัวเลขไม่เกิน 1,000 (เรียงจากมากไปน้อย: 1,000 -> 500 -> 100)
    soundEnabled: true,
    sfxVolume: 80, // ระดับเสียงเอฟเฟกต์ (0-100%)
    isProcessing: false, // ป้องกันการกดย้ำขณะกำลังแสดงแอนิเมชันตอบถูก
    mathMode: 'add_sub', // 'add_sub' (การบวกและการลบ) หรือ 'mul_div' (การคูณและการหาร)
    currentView: 'home', // 'home' (หน้าแรก) หรือ 'game' (กระดานคิดเลข)
    showHintBox: false // เปิด/ปิด กล่องวิธีคิดแบบ Dropdown ใกล้ๆ ในโหมดคูณและหาร (เริ่มต้นปิดไว้)
  };

  // --- การอ้างอิง DOM Elements ---
  const dom = {
    // หน้าแรก (Home Screen) & ปุ่มเลือกหมวดหมู่ 2 หัวข้อ
    homeScreen: document.getElementById('homeScreen'),
    gameScreen: document.getElementById('gameScreen'),
    chooseAddSubBtn: document.getElementById('chooseAddSubBtn'),
    chooseMulDivBtn: document.getElementById('chooseMulDivBtn'),
    homeNavBtn: document.getElementById('homeNavBtn'),
    currentModeTag: document.getElementById('currentModeTag'),
    homeSlimeAvatar: document.getElementById('homeSlimeAvatar'),
    homeSpeechBubble: document.getElementById('homeSpeechBubble'),

    num1Text: document.getElementById('num1Text'),
    num2Text: document.getElementById('num2Text'),
    opText: document.getElementById('opText'),
    answerDisplay: document.getElementById('answerDisplay'),
    answerValue: document.getElementById('answerValue'),
    answerPlaceholder: document.getElementById('answerPlaceholder'),
    feedbackMsg: document.getElementById('feedbackMsg'),
    questionBadge: document.getElementById('questionBadge'),
    modeBadge: document.getElementById('modeBadge'),
    scoreText: document.getElementById('scoreText'),
    comboText: document.getElementById('comboText'),
    bestScoreText: document.getElementById('bestScoreText'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    soundIcon: document.getElementById('soundIcon'),
    slimeSpeech: document.getElementById('slimeSpeech'),
    slimeMascot: document.getElementById('slimeMascot'),
    slimeEyes: document.getElementById('slimeEyes'),
    slimeHappyEyes: document.getElementById('slimeHappyEyes'),
    slimeSadEyes: document.getElementById('slimeSadEyes'),
    slimeMouth: document.getElementById('slimeMouth'),
    gradStop1: document.getElementById('gradStop1'),
    gradStop2: document.getElementById('gradStop2'),
    gradStop3: document.getElementById('gradStop3'),
    particleContainer: document.getElementById('particleContainer'),
    submitBtn: document.getElementById('submitBtn'),
    newQuestionBtn: document.getElementById('newQuestionBtn'),
    changeQuestionBtn: document.getElementById('changeQuestionBtn'),
    swapNumbersBtn: document.getElementById('swapNumbersBtn'),
    toggleHintBtn: document.getElementById('toggleHintBtn'),
    hintCaret: document.getElementById('hintCaret'),
    mathHintDropdown: document.getElementById('mathHintDropdown'),
    hintBoxTitle: document.getElementById('hintBoxTitle'),
    closeHintBoxBtn: document.getElementById('closeHintBoxBtn'),
    hintStepsList: document.getElementById('hintStepsList'),
    sideComboCard: document.getElementById('sideComboCard'),
    levelTabs: document.querySelectorAll('.level-tab'),

    // ตารางโจทย์แนวตั้ง (Vertical Math Grid)
    topTh: document.getElementById('topTh'),
    topH: document.getElementById('topH'),
    topT: document.getElementById('topT'),
    topU: document.getElementById('topU'),
    botTh: document.getElementById('botTh'),
    botH: document.getElementById('botH'),
    botT: document.getElementById('botT'),
    botU: document.getElementById('botU'),
    vertOpText: document.getElementById('vertOpText'),

    // แถวจำนวนทด (Carry Row)
    carryTh: document.getElementById('carryTh'),
    carryH: document.getElementById('carryH'),
    carryT: document.getElementById('carryT'),

    // ช่องคำตอบแต่ละหลัก
    ansTh: document.getElementById('ansTh'),
    ansH: document.getElementById('ansH'),
    ansT: document.getElementById('ansT'),
    ansU: document.getElementById('ansU'),

    // ระบบเป้าหมาย 100 ข้อ (ยายพาซื้อขนม)
    targetStatCard: document.getElementById('targetStatCard'),
    targetProgressText: document.getElementById('targetProgressText'),
    targetProgressFill: document.getElementById('targetProgressFill'),
    targetHintText: document.getElementById('targetHintText'),

    // ปุ่มรีเซ็ตคะแนน
    resetScoreBtn: document.getElementById('resetScoreBtn'),

    // Modal ปรับระดับเสียง
    volumeModal: document.getElementById('volumeModal'),
    closeVolumeBtn: document.getElementById('closeVolumeBtn'),
    confirmVolumeBtn: document.getElementById('confirmVolumeBtn'),
    sfxVolumeSlider: document.getElementById('sfxVolumeSlider'),
    sfxVolumeVal: document.getElementById('sfxVolumeVal'),

    // Modal แจ้งเตือนรางวัล 100 ข้อ
    rewardModal: document.getElementById('rewardModal'),
    rewardBadge: document.getElementById('rewardBadge'),
    rewardTitle: document.getElementById('rewardTitle'),
    rewardSubtitle: document.getElementById('rewardSubtitle'),
    rewardSpeechIntro: document.getElementById('rewardSpeechIntro'),
    rewardSpeechQuote: document.getElementById('rewardSpeechQuote'),
    closeRewardBtn: document.getElementById('closeRewardBtn'),
    closeRewardBtnText: document.getElementById('closeRewardBtnText'),
    rewardCardCloseX: document.getElementById('rewardCardCloseX'),

    // Modal ยืนยันการรีเซ็ตคะแนน
    resetConfirmModal: document.getElementById('resetConfirmModal'),
    cancelResetBtn: document.getElementById('cancelResetBtn'),
    confirmResetBtn: document.getElementById('confirmResetBtn'),
    resetBestCheckbox: document.getElementById('resetBestCheckbox'),
    resetCheckboxLabel: document.getElementById('resetCheckboxLabel'),
    modalBestScoreVal: document.getElementById('modalBestScoreVal'),

    // Modal แนะนำวิธีติดตั้งลง iPad
    installGuideBtn: document.getElementById('installGuideBtn'),
    installGuideModal: document.getElementById('installGuideModal'),
    closeInstallGuideBtn: document.getElementById('closeInstallGuideBtn'),
    closeInstallGuideX: document.getElementById('closeInstallGuideX')
  };

  // --- ฟังก์ชันจัดรูปแบบคะแนน (เช่น 0.5, 1, 1.5, 100) ---
  function formatScore(num) {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return (num % 1 === 0) ? num.toString() : num.toFixed(1);
  }

  // --- ระบบเสียงจำลองด้วย Web Audio API (ไม่ต้องโหลดไฟล์ภายนอก เล่นออฟไลน์ได้ 100%) ---
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playPopSound() {
    if (!state.soundEnabled || !audioCtx || state.sfxVolume <= 0) return;
    const sfxScale = state.sfxVolume / 100;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.2 * sfxScale, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  function playCarrySound() {
    if (!state.soundEnabled || !audioCtx || state.sfxVolume <= 0) return;
    const sfxScale = state.sfxVolume / 100;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.25 * sfxScale, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  function playCorrectSound() {
    if (!state.soundEnabled || !audioCtx || state.sfxVolume <= 0) return;
    const sfxScale = state.sfxVolume / 100;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (เสียงเมโลดี้สดใส ชนะเลิศ)
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const startTime = audioCtx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.22 * sfxScale, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  function playCelebrationFanfare() {
    if (!state.soundEnabled || !audioCtx || state.sfxVolume <= 0) return;
    const sfxScale = state.sfxVolume / 100;
    try {
      const fanfare = [
        { freq: 523.25, time: 0, dur: 0.15 },
        { freq: 659.25, time: 0.15, dur: 0.15 },
        { freq: 783.99, time: 0.30, dur: 0.18 },
        { freq: 1046.50, time: 0.50, dur: 0.45 },
        { freq: 783.99, time: 0.98, dur: 0.15 },
        { freq: 1046.50, time: 1.15, dur: 0.65 }
      ];
      const now = audioCtx.currentTime;
      fanfare.forEach((n) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.freq, now + n.time);
        gain.gain.setValueAtTime(0.3 * sfxScale, now + n.time);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + n.time);
        osc.stop(now + n.time + n.dur);
      });
    } catch (e) {
      console.warn('Audio fanfare error', e);
    }
  }

  function playWrongSound() {
    if (!state.soundEnabled || !audioCtx || state.sfxVolume <= 0) return;
    const sfxScale = state.sfxVolume / 100;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.18 * sfxScale, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // =========================================================
  // ระบบปรับระดับเสียง (Volume Control System)
  // =========================================================
  function openVolumeModal() {
    initAudio();
    playPopSound();
    updateVolumeUI();
    if (dom.volumeModal) {
      dom.volumeModal.style.display = 'flex';
      dom.volumeModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeVolumeModal() {
    playPopSound();
    if (dom.volumeModal) {
      dom.volumeModal.style.display = 'none';
      dom.volumeModal.setAttribute('aria-hidden', 'true');
    }
  }

  function setSfxVolume(val, playPreview = true) {
    const vol = Math.min(100, Math.max(0, parseInt(val, 10) || 0));
    state.sfxVolume = vol;
    state.soundEnabled = vol > 0;
    try {
      localStorage.setItem('slime_math_sfx_volume', vol.toString());
    } catch (e) {}

    updateVolumeUI();

    if (playPreview && vol > 0) {
      playPopSound();
    }
  }

  function updateVolumeUI() {
    // อัปเดตข้อความและ Slider ของ SFX
    if (dom.sfxVolumeVal) {
      dom.sfxVolumeVal.textContent = `${state.sfxVolume}%`;
    }
    if (dom.sfxVolumeSlider) {
      dom.sfxVolumeSlider.value = state.sfxVolume;
    }



    // อัปเดตปุ่ม Presets (ไฮไลต์ค่าที่ตรงกัน)
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach((btn) => {
      const target = btn.getAttribute('data-target');
      const vol = parseInt(btn.getAttribute('data-vol'), 10);
      if (target === 'sfx') {
        btn.classList.toggle('active', vol === state.sfxVolume);
      }
    });

    // อัปเดตไอคอนเสียงที่แถบด้านข้าง (Sidebar Sound Icon)
    if (dom.soundIcon) {
      if (state.sfxVolume === 0 || !state.soundEnabled) {
        dom.soundIcon.textContent = '🔇';
      } else if (state.sfxVolume < 50) {
        dom.soundIcon.textContent = '🔉';
      } else {
        dom.soundIcon.textContent = '🔊';
      }
    }
  }

  // --- ฟังก์ชันสุ่มตัวเลข ---
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // --- การจัดการหน้าแรก (Home Screen) & สลับหมวดหมู่ ---
  function showHomeScreen() {
    initAudio();
    playPopSound();
    state.currentView = 'home';
    if (dom.homeScreen) dom.homeScreen.style.display = 'flex';
    if (dom.gameScreen) dom.gameScreen.style.display = 'none';

    if (dom.homeSpeechBubble) {
      dom.homeSpeechBubble.textContent = getRandomItem([
        'ยินดีต้อนรับจ้าน้องอุ้ม! วันนี้อยากฝึกคิดเลขเรื่องไหนดีเอ่ย? 💖',
        'เลือก "การบวกและการลบ" หรือ "การคูณและการหาร" ได้เลยนะจ๊ะ 🍦',
        'ราชาสไลม์เอาใจช่วยน้องอุ้ม คิดเลขสนุกทุกวันจ้า 👑✨'
      ]);
    }
  }

  function startMathMode(mode) {
    initAudio();
    playPopSound();
    state.mathMode = mode;
    state.currentView = 'game';
    state.showHintBox = false; // รีเซ็ต Dropdown วิธีคิดให้ปิดอยู่ตอนเริ่ม เพื่อความสะอาดตาและโจทย์อยู่ตรงกลางเป๊ะ

    try {
      localStorage.setItem('slime_math_selected_mode', mode);
    } catch (e) {}

    if (dom.homeScreen) dom.homeScreen.style.display = 'none';
    if (dom.gameScreen) dom.gameScreen.style.display = 'flex';

    if (dom.currentModeTag) {
      dom.currentModeTag.textContent = mode === 'add_sub' ? 'การบวกและการลบ' : 'การคูณและการหาร';
    }

    generateMathProblem();
  }

  // --- การสร้างโจทย์คณิตศาสตร์ (รองรับทั้ง 1. บวกและลบ  2. คูณและหาร) ---
  function generateMathProblem() {
    let n1, n2, ans, op;

    if (state.mathMode === 'mul_div') {
      const isMultiplication = Math.random() < 0.5;
      op = isMultiplication ? '×' : '÷';
      state.currentOp = op;

      if (isMultiplication) {
        if (state.maxLimit === 100) {
          // แม่สูตรคูณ ป.2 แม่ 2 ถึง แม่ 10 (ผลคูณไม่เกิน 100)
          n1 = getRandomInt(2, 10);
          n2 = getRandomInt(2, Math.min(10, Math.floor(100 / n1)));
        } else if (state.maxLimit === 500) {
          // ตัวเลข 2 หลัก คูณ 1 หลัก (ผลคูณไม่เกิน 500)
          n1 = getRandomInt(12, 55);
          n2 = getRandomInt(2, Math.min(9, Math.floor(500 / n1)));
        } else {
          // ไม่เกิน 1,000: ตัวเลข 2-3 หลัก คูณ 1 หลัก (ผลคูณไม่เกิน 1,000)
          n1 = getRandomInt(25, 120);
          n2 = getRandomInt(3, Math.min(9, Math.floor(1000 / n1)));
        }
        ans = n1 * n2;
      } else {
        // การหาร: ตัวตั้งหารด้วยตัวหารลงตัว 100% เสมอ (ไม่มีเศษ)
        if (state.maxLimit === 100) {
          n2 = getRandomInt(2, 9); // ตัวหาร
          ans = getRandomInt(2, Math.min(10, Math.floor(100 / n2))); // ผลหาร
          n1 = n2 * ans; // ตัวตั้ง
        } else if (state.maxLimit === 500) {
          n2 = getRandomInt(2, 8);
          ans = getRandomInt(11, Math.min(55, Math.floor(500 / n2)));
          n1 = n2 * ans;
        } else {
          n2 = getRandomInt(3, 9);
          ans = getRandomInt(20, Math.min(110, Math.floor(1000 / n2)));
          n1 = n2 * ans;
        }
      }
    } else {
      // โหมดการบวกและการลบ
      const isAddition = Math.random() < 0.5;
      op = isAddition ? '+' : '-';
      state.currentOp = op;

      if (isAddition) {
        if (state.maxLimit === 100) {
          n1 = getRandomInt(10, 85);
          n2 = getRandomInt(5, 95 - n1);
        } else if (state.maxLimit === 500) {
          n1 = getRandomInt(50, 420);
          n2 = getRandomInt(20, 490 - n1);
        } else {
          // ค่าเริ่มต้น: ไม่เกิน 1,000
          n1 = getRandomInt(100, 850);
          n2 = getRandomInt(35, 980 - n1);
        }
        ans = n1 + n2;
      } else {
        // การลบ: ตัวตั้งต้องมากกว่าตัวลบเสมอ และผลลัพธ์ไม่ติดลบ
        if (state.maxLimit === 100) {
          n1 = getRandomInt(25, 99);
          n2 = getRandomInt(10, n1 - 5);
        } else if (state.maxLimit === 500) {
          n1 = getRandomInt(120, 490);
          n2 = getRandomInt(30, n1 - 15);
        } else {
          n1 = getRandomInt(250, 990);
          n2 = getRandomInt(50, n1 - 30);
        }
        ans = n1 - n2;
      }
    }

    state.currentNum1 = n1;
    state.currentNum2 = n2;
    state.correctAnswer = ans;
    state.userAnswer = '';

    // อัปเดตข้อมูลบนหน้าจอ
    dom.questionBadge.textContent = `ข้อที่ ${state.questionCount}`;
    if (state.mathMode === 'mul_div') {
      dom.modeBadge.textContent = op === '×' ? 'การคูณแนวตั้ง' : 'การหารลงตัว';
    } else {
      dom.modeBadge.textContent = op === '+' ? 'การบวกแนวตั้ง' : 'การลบแนวตั้ง';
    }

    updateVerticalMathDisplay();
    updateAnswerUI();
    updateHintSidebox();

    // รีเซ็ตหน้าตาสไลม์กลับสู่ปกติ
    setSlimeExpression('idle');

    let promptQuotes;
    if (state.mathMode === 'mul_div') {
      promptQuotes = [
        'ท่องสูตรคูณแม่นยำ ลุยเลยน้องอุ้ม! ✨',
        'สู้ๆ นะ! สไลม์เอาใจช่วย คิดให้ครบ 100 ข้อนะ 💖',
        'ค่อยๆ คิดนะจ๊ะ ผลคูณผลหารไม่ยากเลย 🍀',
        'ทำถูกข้อนี้รับไปเลย +1 คะแนนจ้า 🌟'
      ];
      if (op === '×') {
        dom.feedbackMsg.textContent = 'ใส่หลักหน่วยก่อนนะ (ท่องแม่สูตรคูณได้เลย) ⬅️';
      } else {
        const expectedLen = ans.toString().length;
        const firstPlace = expectedLen === 3 ? 'หลักร้อย' : (expectedLen === 2 ? 'หลักสิบ' : 'หลักหน่วย');
        dom.feedbackMsg.textContent = `ใส่คำตอบจากซ้ายไปขวา (เริ่มที่${firstPlace}) ➡️`;
      }
    } else {
      promptQuotes = [
        'ลุยเลยคนเก่ง! คิดจากหลักหน่วยก่อนนะจ๊ะ ✨',
        'สู้ๆ นะ! สไลม์เอาใจช่วย คิดให้ครบ 100 ข้อนะ 💖',
        'คิดเลขสนุกจัง! ค่อยๆ คิด ไม่ต้องรีบนะ 🍀',
        'ทำถูกข้อนี้รับไปเลย +1 คะแนนจ้า 🌟'
      ];
      dom.feedbackMsg.textContent = 'ใส่หลักหน่วยก่อนนะ (มีตัวทดจะลอยขึ้นมาให้เห็นเลย) ⬅️';
    }
    setSlimeSpeech(getRandomItem(promptQuotes));
    dom.feedbackMsg.className = 'feedback-msg';
  }

  // --- ระบบกล่องวิธีคิดแบบ Dropdown ใกล้ๆ โจทย์ (Math Hint Dropdown) ---
  function updateHintVisibility() {
    if (!dom.mathHintDropdown || !dom.toggleHintBtn) return;

    if (state.mathMode === 'mul_div') {
      dom.toggleHintBtn.style.display = 'inline-flex';
      if (state.showHintBox) {
        dom.mathHintDropdown.style.display = 'flex';
        dom.toggleHintBtn.classList.add('active');
        if (dom.hintCaret) dom.hintCaret.textContent = '▲';
      } else {
        dom.mathHintDropdown.style.display = 'none';
        dom.toggleHintBtn.classList.remove('active');
        if (dom.hintCaret) dom.hintCaret.textContent = '▼';
      }
    } else {
      dom.toggleHintBtn.style.display = 'none';
      dom.mathHintDropdown.style.display = 'none';
      if (dom.hintCaret) dom.hintCaret.textContent = '▼';
    }
  }

  function updateHintSidebox() {
    updateHintVisibility();
    if (state.mathMode !== 'mul_div' || !dom.hintStepsList) return;

    const n1 = state.currentNum1;
    const n2 = state.currentNum2;
    const op = state.currentOp;
    const ans = state.correctAnswer;

    const steps = [];
    let title = op === '×' ? '💡 วิธีคิดการคูณ' : '💡 วิธีคิดการหาร';

    if (op === '×') {
      if (n1 < 10 && n2 < 10) {
        // ตัวเลขหลักเดียว คูณ หลักเดียว
        steps.push({
          label: `ขั้นที่ 1: ท่องสูตรคูณแม่ ${n2}`,
          math: `${n2} × ${n1} = ${ans}`,
          desc: `ท่องแม่ ${n2} (หรือแม่ ${n1}) จะได้คำตอบ ${ans} ทันทีจ้า`
        });
        if (n2 <= 5) {
          steps.push({
            label: 'ความหมายของการคูณ (การบวกซ้ำ)',
            math: `${Array(n2).fill(n1).join(' + ')} = ${ans}`,
            desc: `นำ ${n1} มาบวกกัน ${n2} ครั้ง เท่ากับ ${ans}`
          });
        }
      } else {
        // ตัวเลขหลายหลัก คูณ 1 หลัก
        const u1 = n1 % 10;
        const t1 = Math.floor(n1 / 10) % 10;
        const h1 = Math.floor(n1 / 100) % 10;
        const hasHundreds = n1 >= 100;

        // 1. หลักหน่วย
        const prodU = u1 * n2;
        const carryT = Math.floor(prodU / 10);
        const digitU = prodU % 10;
        steps.push({
          label: 'ขั้นที่ 1: คูณหลักหน่วย (ตัวหลังสุด)',
          math: `${u1} × ${n2} = ${prodU}`,
          desc: carryT > 0
            ? `ใส่เลข ${digitU} ที่หลักหน่วย แล้วทด ${carryT} ไปหลักสิบ`
            : `ใส่เลข ${digitU} ที่หลักหน่วย (ไม่มีตัวทด)`
        });

        // 2. หลักสิบ
        const prodT = t1 * n2;
        const totalT = prodT + carryT;
        const carryH = hasHundreds ? Math.floor(totalT / 10) : 0;
        const digitT = hasHundreds ? (totalT % 10) : totalT;

        let descT = '';
        let mathT = '';
        if (carryT > 0) {
          mathT = `(${t1} × ${n2}) + ทด ${carryT} = ${prodT} + ${carryT} = ${totalT}`;
          descT = hasHundreds && carryH > 0
            ? `ได้ ${totalT} ใส่เลข ${digitT} แล้วทด ${carryH} ไปหลักร้อย`
            : `นำผลคูณ ${prodT} บวกตัวทด ${carryT} ได้ ${totalT}`;
        } else {
          mathT = `${t1} × ${n2} = ${prodT}`;
          descT = hasHundreds && carryH > 0
            ? `ได้ ${totalT} ใส่เลข ${digitT} แล้วทด ${carryH} ไปหลักร้อย`
            : `ใส่เลข ${digitT} ในหลักสิบ`;
        }
        steps.push({
          label: 'ขั้นที่ 2: คูณหลักสิบ',
          math: mathT,
          desc: descT
        });

        // 3. หลักร้อย (ถ้ามี)
        if (hasHundreds) {
          const prodH = h1 * n2;
          const totalH = prodH + carryH;
          let mathH = '';
          let descH = '';
          if (carryH > 0) {
            mathH = `(${h1} × ${n2}) + ทด ${carryH} = ${prodH} + ${carryH} = ${totalH}`;
            descH = `นำผลคูณ ${prodH} บวกตัวทด ${carryH} ได้ ${totalH}`;
          } else {
            mathH = `${h1} × ${n2} = ${prodH}`;
            descH = `ได้ ${totalH} ใส่ในหลักร้อย`;
          }
          steps.push({
            label: 'ขั้นที่ 3: คูณหลักร้อย',
            math: mathH,
            desc: descH
          });
        }
      }
    } else if (op === '÷') {
      if (ans < 10) {
        // ผลหารเป็นเลขหลักเดียว
        steps.push({
          label: 'ขั้นที่ 1: คิดย้อนกลับจากสูตรคูณ',
          math: `${n2} × [ ? ] = ${n1}`,
          desc: `คิดว่า "${n2} คูณกับอะไรแล้วได้ ${n1}?"`
        });
        steps.push({
          label: `ขั้นที่ 2: ท่องสูตรคูณแม่ ${n2}`,
          math: `${n2} × ${ans} = ${n1}`,
          desc: `ท่องแม่ ${n2} จะพบว่า ${n2} × ${ans} = ${n1} พอดีเป๊ะ`
        });
      } else {
        // ผลหาร 2 หลักขึ้นไป
        steps.push({
          label: 'ขั้นที่ 1: คิดย้อนกลับจากสูตรคูณ',
          math: `${n2} × [ ? ] = ${n1}`,
          desc: `หาว่า ${n2} คูณกับจำนวนใดแล้วได้ ${n1}`
        });

        if (n1 < 100) {
          // ตัวตั้ง 2 หลัก เช่น 84 ÷ 4, 75 ÷ 3
          const t = Math.floor(n1 / 10);
          const u = n1 % 10;
          const qT = Math.floor(t / n2);
          const remT = t % n2;

          steps.push({
            label: 'ขั้นที่ 2: หารหลักสิบ',
            math: `${t} ÷ ${n2} = ${qT}${remT > 0 ? ` (เหลือเศษ ${remT})` : ' ลงตัว'}`,
            desc: remT > 0
              ? `หลักสิบได้ ${qT} เหลือเศษ ${remT} นำไปรวมกับหลักหน่วย`
              : `หลักสิบได้ ${qT} พอดี`
          });

          const combU = remT * 10 + u;
          const qU = Math.floor(combU / n2);
          steps.push({
            label: 'ขั้นที่ 3: หารหลักหน่วย',
            math: remT > 0 ? `รวมเศษเป็น ${combU} ÷ ${n2} = ${qU}` : `${u} ÷ ${n2} = ${qU}`,
            desc: `หลักหน่วยได้คำตอบคือ ${qU}`
          });
        } else {
          // ตัวตั้ง 3 หลัก เช่น 144 ÷ 6 หรือ 248 ÷ 2
          const h = Math.floor(n1 / 100);
          const t = Math.floor(n1 / 10) % 10;
          const u = n1 % 10;

          if (h < n2) {
            // ดู 2 หลักแรก
            const ht = h * 10 + t;
            const qHT = Math.floor(ht / n2);
            const remHT = ht % n2;
            steps.push({
              label: `ขั้นที่ 2: ดู 2 หลักแรก (${ht})`,
              math: `${ht} ÷ ${n2} = ${qHT}${remHT > 0 ? ` (เหลือเศษ ${remHT})` : ' ลงตัว'}`,
              desc: remHT > 0
                ? `นำ ${ht} หารด้วย ${n2} ได้ ${qHT} เหลือเศษ ${remHT}`
                : `นำ ${ht} หารด้วย ${n2} ได้ ${qHT} พอดี`
            });

            const combU = remHT * 10 + u;
            const qU = Math.floor(combU / n2);
            steps.push({
              label: 'ขั้นที่ 3: หารหลักหน่วย',
              math: remHT > 0 ? `รวมเศษเป็น ${combU} ÷ ${n2} = ${qU}` : `${u} ÷ ${n2} = ${qU}`,
              desc: `นำ ${combU} หารด้วย ${n2} ได้ ${qU}`
            });
          } else {
            const qH = Math.floor(h / n2);
            const remH = h % n2;
            steps.push({
              label: 'ขั้นที่ 2: หารหลักร้อย',
              math: `${h} ÷ ${n2} = ${qH}${remH > 0 ? ` (เหลือเศษ ${remH})` : ' ลงตัว'}`,
              desc: `หลักร้อยได้ ${qH}`
            });

            const combT = remH * 10 + t;
            const qT = Math.floor(combT / n2);
            const remT = combT % n2;
            steps.push({
              label: 'ขั้นที่ 3: หารหลักสิบ',
              math: remH > 0 ? `รวมเศษเป็น ${combT} ÷ ${n2} = ${qT}` : `${t} ÷ ${n2} = ${qT}`,
              desc: `หลักสิบได้ ${qT}`
            });

            const combU = remT * 10 + u;
            const qU = Math.floor(combU / n2);
            steps.push({
              label: 'ขั้นที่ 4: หารหลักหน่วย',
              math: remT > 0 ? `รวมเศษเป็น ${combU} ÷ ${n2} = ${qU}` : `${u} ÷ ${n2} = ${qU}`,
              desc: `หลักหน่วยได้คำตอบคือ ${qU}`
            });
          }
        }

        steps.push({
          label: 'ตรวจคำตอบด้วยการคูณ',
          math: `${n2} × ${ans} = ${n1}`,
          desc: `นำตัวหาร ${n2} คูณผลหาร ${ans} ได้ ${n1} พอดีเป๊ะ!`
        });
      }
    }

    if (dom.hintBoxTitle) {
      dom.hintBoxTitle.textContent = title;
    }

    let html = '';
    steps.forEach(st => {
      html += `
        <div class="hint-step-item">
          <span class="hint-step-label">${st.label}</span>
          <div class="hint-step-math">${st.math}</div>
          <span class="hint-step-desc">${st.desc}</span>
        </div>
      `;
    });
    html += `
      <div class="hint-summary-badge">
        ✨ สรุปคำตอบคือ ${ans}
      </div>
    `;

    dom.hintStepsList.innerHTML = html;
  }

  // --- แสดงผลโจทย์แนวตั้ง (Vertical Math Grid) ---
  function updateVerticalMathDisplay() {
    const n1 = state.currentNum1;
    const n2 = state.currentNum2;
    const op = state.currentOp;

    // แยกหลักตัวตั้ง (Top Number)
    const th1 = Math.floor(n1 / 1000) % 10;
    const h1 = Math.floor(n1 / 100) % 10;
    const t1 = Math.floor(n1 / 10) % 10;
    const u1 = n1 % 10;

    dom.topTh.textContent = n1 >= 1000 ? th1 : '';
    dom.topH.textContent = n1 >= 100 ? h1 : '';
    dom.topT.textContent = n1 >= 10 ? t1 : '';
    dom.topU.textContent = u1;

    // แยกหลักตัวบวก/ลบ (Bottom Number)
    const th2 = Math.floor(n2 / 1000) % 10;
    const h2 = Math.floor(n2 / 100) % 10;
    const t2 = Math.floor(n2 / 10) % 10;
    const u2 = n2 % 10;

    dom.botTh.textContent = n2 >= 1000 ? th2 : '';
    dom.botH.textContent = n2 >= 100 ? h2 : '';
    dom.botT.textContent = n2 >= 10 ? t2 : '';
    dom.botU.textContent = u2;

    dom.vertOpText.textContent = op;

    hideAllCarries();
  }

  function hideAllCarries() {
    if (dom.carryTh) dom.carryTh.style.display = 'none';
    if (dom.carryH) dom.carryH.style.display = 'none';
    if (dom.carryT) dom.carryT.style.display = 'none';
  }

  // --- การจัดการช่องคำตอบ (Answer UI) & คำนวณจำนวนทด (Carries) ---
  function updateAnswerUI() {
    const ans = state.userAnswer;
    const len = ans.length;

    // สำหรับการหาร: แสดงผลและเคอร์เซอร์จากซ้ายไปขวา (Left to Right)
    if (state.currentOp === '÷') {
      const expectedLen = state.correctAnswer.toString().length;
      const allSlots = [
        { slot: dom.ansTh, key: 'th' },
        { slot: dom.ansH, key: 'h' },
        { slot: dom.ansT, key: 't' },
        { slot: dom.ansU, key: 'u' }
      ];

      // รีเซ็ตทุกช่องก่อน
      allSlots.forEach(({ slot, key }) => {
        if (!slot) return;
        slot.textContent = '';
        slot.className = `grid-cell ${key}-slot ans-slot`;
      });

      // ลิสต์ช่องคำตอบที่ต้องใช้ตามจำนวนหลักของผลหาร เรียงจากซ้ายไปขวา
      let activeSlots = [];
      if (expectedLen === 1) {
        activeSlots = [{ slot: dom.ansU, key: 'u' }];
      } else if (expectedLen === 2) {
        activeSlots = [{ slot: dom.ansT, key: 't' }, { slot: dom.ansU, key: 'u' }];
      } else if (expectedLen === 3) {
        activeSlots = [{ slot: dom.ansH, key: 'h' }, { slot: dom.ansT, key: 't' }, { slot: dom.ansU, key: 'u' }];
      } else {
        activeSlots = allSlots;
      }

      // ใส่ตัวเลขและเคอร์เซอร์จากซ้ายไปขวา
      activeSlots.forEach(({ slot, key }, i) => {
        if (!slot) return;
        if (i < len) {
          slot.textContent = ans[i];
          slot.className = `grid-cell ${key}-slot ans-slot has-val`;
        } else if (i === len) {
          slot.innerHTML = '<span class="slot-cursor">|</span>';
          slot.className = `grid-cell ${key}-slot ans-slot active`;
        } else {
          slot.textContent = '';
          slot.className = `grid-cell ${key}-slot ans-slot`;
        }
      });

      hideAllCarries();
      return;
    }

    // เมื่อพิมพ์จากขวาไปซ้าย (สำหรับการบวก, การลบ, การคูณ):
    // ตัวที่พิมพ์แรกสุด (หลักหน่วย) = ans[len - 1]
    // ตัวที่สอง (หลักสิบ) = ans[len - 2]
    // ตัวที่สาม (หลักร้อย) = ans[len - 3]
    // ตัวที่สี่ (หลักพัน) = ans[len - 4]
    const uVal = len >= 1 ? ans[len - 1] : '';
    const tVal = len >= 2 ? ans[len - 2] : '';
    const hVal = len >= 3 ? ans[len - 3] : '';
    const thVal = len >= 4 ? ans[len - 4] : '';

    // อัปเดตช่องหลักหน่วย
    if (len >= 1) {
      dom.ansU.textContent = uVal;
      dom.ansU.className = 'grid-cell u-slot ans-slot has-val';
    } else {
      dom.ansU.innerHTML = '<span class="slot-cursor">|</span>';
      dom.ansU.className = 'grid-cell u-slot ans-slot active';
    }

    // อัปเดตช่องหลักสิบ
    if (len >= 2) {
      dom.ansT.textContent = tVal;
      dom.ansT.className = 'grid-cell t-slot ans-slot has-val';
    } else if (len === 1) {
      dom.ansT.innerHTML = '<span class="slot-cursor">|</span>';
      dom.ansT.className = 'grid-cell t-slot ans-slot active';
    } else {
      dom.ansT.textContent = '';
      dom.ansT.className = 'grid-cell t-slot ans-slot';
    }

    // อัปเดตช่องหลักร้อย
    if (len >= 3) {
      dom.ansH.textContent = hVal;
      dom.ansH.className = 'grid-cell h-slot ans-slot has-val';
    } else if (len === 2) {
      dom.ansH.innerHTML = '<span class="slot-cursor">|</span>';
      dom.ansH.className = 'grid-cell h-slot ans-slot active';
    } else {
      dom.ansH.textContent = '';
      dom.ansH.className = 'grid-cell h-slot ans-slot';
    }

    // อัปเดตช่องหลักพัน
    if (len >= 4) {
      dom.ansTh.textContent = thVal;
      dom.ansTh.className = 'grid-cell th-slot ans-slot has-val';
    } else if (len === 3) {
      dom.ansTh.innerHTML = '<span class="slot-cursor">|</span>';
      dom.ansTh.className = 'grid-cell th-slot ans-slot active';
    } else {
      dom.ansTh.textContent = '';
      dom.ansTh.className = 'grid-cell th-slot ans-slot';
    }

    // อัปเดตแสดงจำนวนทด (Carry Row)
    updateCarriesDisplay(len);
  }

  // --- แสดงจำนวนทด (Carry Indicator) แต่ละขั้นตอนการคิดเลข ---
  function updateCarriesDisplay(len) {
    const n1 = state.currentNum1;
    const n2 = state.currentNum2;
    const op = state.currentOp;

    hideAllCarries();

    const u1 = n1 % 10;
    const t1 = Math.floor(n1 / 10) % 10;
    const h1 = Math.floor(n1 / 100) % 10;

    const u2 = n2 % 10;
    const t2 = Math.floor(n2 / 10) % 10;
    const h2 = Math.floor(n2 / 100) % 10;

    if (op === '+') {
      // สำหรับการบวก:
      // หลักหน่วยบวกกัน: ถ้าเกินหรือเท่ากับ 10 จะมีตัวทดไปหลักสิบ
      const sumU = u1 + u2;
      const carryToTens = sumU >= 10 ? 1 : 0;

      // เมื่อพิมพ์หลักหน่วยแล้ว (len >= 1) และมีตัวทดไปหลักสิบ
      if (len >= 1 && carryToTens > 0) {
        dom.carryT.textContent = '1';
        dom.carryT.style.display = 'flex';
      }

      // หลักสิบบวกกัน (รวมตัวทดจากหลักหน่วย): ถ้าเกิน 10 จะมีตัวทดไปหลักร้อย
      const sumT = t1 + t2 + carryToTens;
      const carryToHundreds = sumT >= 10 ? 1 : 0;

      // เมื่อพิมพ์หลักสิบแล้ว (len >= 2) และมีตัวทดไปหลักร้อย
      if (len >= 2 && carryToHundreds > 0) {
        dom.carryH.textContent = '1';
        dom.carryH.style.display = 'flex';
      }

      // หลักร้อยบวกกัน (รวมตัวทดจากหลักสิบ): ถ้าเกิน 10 จะมีตัวทดไปหลักพัน
      const sumH = h1 + h2 + carryToHundreds;
      const carryToThousands = sumH >= 10 ? 1 : 0;

      // เมื่อพิมพ์หลักร้อยแล้ว (len >= 3) และมีตัวทดไปหลักพัน
      if (len >= 3 && carryToThousands > 0) {
        dom.carryTh.textContent = '1';
        dom.carryTh.style.display = 'flex';
      }

      // แจ้งเตือนด้วยคำพูดสไลม์น่ารักๆ เมื่อมีตัวทด
      if (len === 1 && carryToTens > 0) {
        setSlimeSpeech(`มีทด ${carryToTens} ที่หลักสิบ อย่าลืมบวกตัวทดนะจ๊ะ! 💖`);
        playCarrySound();
      } else if (len === 2 && carryToHundreds > 0) {
        setSlimeSpeech(`มีทด ${carryToHundreds} ที่หลักร้อยต่อจ้า เก่งมาก! 🌟`);
        playCarrySound();
      }
    } else if (op === '-') {
      // สำหรับการลบ: แสดงการกระจาย/การยืม (Borrowing)
      const borrowFromTens = u1 < u2 ? 1 : 0;
      if (len >= 1 && borrowFromTens > 0) {
        dom.carryT.textContent = '1';
        dom.carryT.style.display = 'flex';
      }

      const effectiveT1 = t1 - borrowFromTens;
      const borrowFromHundreds = effectiveT1 < t2 ? 1 : 0;
      if (len >= 2 && borrowFromHundreds > 0) {
        dom.carryH.textContent = '1';
        dom.carryH.style.display = 'flex';
      }

      if (len === 1 && borrowFromTens > 0) {
        setSlimeSpeech('หลักหน่วยยืมหลักสิบมา 1 นะจ๊ะ สู้ๆ! 💖');
        playCarrySound();
      }
    } else if (op === '×') {
      // สำหรับการคูณ: คำนวณตัวทดเมื่อคูณตัวเลขหลักเดียว
      if (n2 < 10) {
        const prodU = u1 * n2;
        const carryToTens = Math.floor(prodU / 10);
        if (len >= 1 && carryToTens > 0) {
          dom.carryT.textContent = carryToTens.toString();
          dom.carryT.style.display = 'flex';
        }

        const prodT = t1 * n2 + carryToTens;
        const carryToHundreds = Math.floor(prodT / 10);
        if (len >= 2 && carryToHundreds > 0) {
          dom.carryH.textContent = carryToHundreds.toString();
          dom.carryH.style.display = 'flex';
        }

        if (len === 1 && carryToTens > 0) {
          setSlimeSpeech(`คูณหลักหน่วยแล้วมีทด ${carryToTens} ที่หลักสิบนะจ๊ะ! 💖`);
          playCarrySound();
        }
      }
    } else {
      // การหาร: ไม่แสดงตัวทด
      hideAllCarries();
    }
  }

  function appendDigit(digit) {
    if (state.isProcessing) return;

    if (state.currentOp === '÷') {
      // สำหรับการหาร: ใส่คำตอบจากซ้ายไปขวา (Left to Right)
      const expectedLen = state.correctAnswer.toString().length;
      if (state.userAnswer.length >= expectedLen) return;

      // เพิ่มตัวเลขต่อท้ายทางขวา
      state.userAnswer = state.userAnswer + digit;

      playPopSound();
      updateAnswerUI();

      // แสดงคำแนะนำหลักถัดไป
      if (state.userAnswer.length < expectedLen) {
        dom.feedbackMsg.textContent = 'ใส่หลักถัดไปทางขวา ➡️ หรือกดส่งคำตอบ';
      } else {
        dom.feedbackMsg.textContent = 'กดปุ่ม "🚀 ส่งคำตอบ" ได้เลยจ้า!';
      }
      dom.feedbackMsg.className = 'feedback-msg';
    } else {
      // สำหรับการบวก, ลบ, คูณ: ใส่เลขจากขวาไปซ้าย (Right to Left: หลักหน่วย -> หลักสิบ -> หลักร้อย)
      if (state.userAnswer.length >= 4) return;

      state.userAnswer = digit + state.userAnswer;

      playPopSound();
      updateAnswerUI();

      // แสดงคำแนะนำหลักถัดไปเพื่อช่วยเด็กๆ
      const placeNames = ['หลักหน่วย', 'หลักสิบ', 'หลักร้อย', 'หลักพัน'];
      const nextPlace = placeNames[state.userAnswer.length];
      if (nextPlace) {
        dom.feedbackMsg.textContent = `ใส่ ${nextPlace} ต่อทางซ้าย ⬅️ หรือกดส่งคำตอบ`;
      } else {
        dom.feedbackMsg.textContent = 'กดปุ่ม "🚀 ส่งคำตอบ" ได้เลยจ้า!';
      }
      dom.feedbackMsg.className = 'feedback-msg';
    }
  }

  function backspaceDigit() {
    if (state.isProcessing) return;
    if (state.userAnswer.length > 0) {
      if (state.currentOp === '÷') {
        // สำหรับการหาร: ลบตัวเลขขวาสุดที่เพิ่งพิมพ์
        state.userAnswer = state.userAnswer.slice(0, -1);
        playPopSound();
        updateAnswerUI();

        if (state.userAnswer.length === 0) {
          const expectedLen = state.correctAnswer.toString().length;
          const firstPlace = expectedLen === 3 ? 'หลักร้อย' : (expectedLen === 2 ? 'หลักสิบ' : 'หลักหน่วย');
          dom.feedbackMsg.textContent = `ใส่คำตอบจากซ้ายไปขวา (เริ่มที่${firstPlace}) ➡️`;
        } else {
          dom.feedbackMsg.textContent = 'ใส่หลักถัดไปทางขวา ➡️ หรือกดส่งคำตอบ';
        }
        dom.feedbackMsg.className = 'feedback-msg';
      } else {
        // สำหรับการบวก, ลบ, คูณ: ลบตัวเลขที่เพิ่งกรอกล่าสุด (ตัวซ้ายสุด)
        state.userAnswer = state.userAnswer.substring(1);
        playPopSound();
        updateAnswerUI();

        if (state.userAnswer.length === 0) {
          dom.feedbackMsg.textContent = 'ใส่หลักหน่วยก่อนนะ (มีตัวทดจะลอยขึ้นมาให้เห็นเลย) ⬅️';
        } else {
          const placeNames = ['หลักหน่วย', 'หลักสิบ', 'หลักร้อย', 'หลักพัน'];
          const nextPlace = placeNames[state.userAnswer.length];
          dom.feedbackMsg.textContent = `ใส่ ${nextPlace} ต่อทางซ้าย ⬅️ หรือกดส่งคำตอบ`;
        }
        dom.feedbackMsg.className = 'feedback-msg';
      }
    }
  }

  function clearAnswer() {
    if (state.isProcessing) return;
    state.userAnswer = '';
    playPopSound();
    updateAnswerUI();
    if (state.currentOp === '÷') {
      const expectedLen = state.correctAnswer.toString().length;
      const firstPlace = expectedLen === 3 ? 'หลักร้อย' : (expectedLen === 2 ? 'หลักสิบ' : 'หลักหน่วย');
      dom.feedbackMsg.textContent = `ล้างคำตอบแล้ว เริ่มกรอกใหม่จากซ้ายไปขวา (${firstPlace}) ➡️`;
    } else {
      dom.feedbackMsg.textContent = 'ล้างคำตอบแล้ว เริ่มกรอกใหม่จากหลักหน่วยได้เลยจ้า ⬅️';
    }
    dom.feedbackMsg.className = 'feedback-msg';
  }

  // --- ตรวจคำตอบ (Submit Answer Logic) ---
  function checkAnswer() {
    if (state.isProcessing) return;

    if (state.userAnswer === '') {
      dom.feedbackMsg.textContent = '⚠️ ใส่ตัวเลขคำตอบก่อนนะจ๊ะ!';
      dom.feedbackMsg.className = 'feedback-msg wrong';
      setSlimeSpeech('ยังไม่ได้ใส่คำตอบเลยจ้า ลองกดตัวเลขดูนะ 🐾');
      return;
    }

    const numericAnswer = parseInt(state.userAnswer, 10);

    if (numericAnswer === state.correctAnswer) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  }

  // เมื่อตอบถูก: ปรับคะแนนเป็นข้อละ 1 คะแนน + ตรวจสอบเป้าหมายครบ 100 ข้อ
  function handleCorrectAnswer() {
    state.isProcessing = true;
    state.combo += 1;

    // ปรับคะแนนเป็นข้อละ 1 คะแนน และนับสะสมจำนวนข้อที่คิดถูก (เป้าหมาย 100 ข้อ)
    const earnedScore = 1;
    state.score = Math.round(state.score + earnedScore);
    state.correctCount += 1;

    if (state.score > state.bestScore) {
      state.bestScore = state.score;
      try {
        localStorage.setItem('slime_math_best_score', state.bestScore.toString());
      } catch (e) {
        console.warn('Save best score error', e);
      }
    }

    // บันทึกคะแนนสะสมและจำนวนข้อที่ถูกต้องปัจจุบันลง LocalStorage ป้องกันข้อมูลหาย
    try {
      localStorage.setItem('slime_math_current_score', state.score.toString());
      localStorage.setItem('slime_math_correct_count', state.correctCount.toString());
    } catch (e) {
      console.warn('Save current score error', e);
    }

    // อัปเดตข้อมูลคะแนนบนหน้าจอ
    dom.scoreText.textContent = formatScore(state.score);
    dom.comboText.textContent = `x${state.combo}`;
    dom.bestScoreText.textContent = formatScore(state.bestScore);
    updateTargetProgress();

    if (dom.sideComboCard) {
      dom.sideComboCard.classList.add('active');
    }

    // เล่นเสียง
    playCorrectSound();

    // แสดงแอนิเมชันสไลม์ดีใจ (สีเขียวมรกต)
    setSlimeExpression('happy');
    createParticles();

    // เอฟเฟกต์ช่องคำตอบสีเขียว
    dom.answerDisplay.classList.remove('wrong-shake');
    dom.answerDisplay.classList.add('correct-glow');

    // ตรวจสอบรางวัลครบ 100 ข้อ (ขอให้ยายพาไปซื้อขนม)
    let isRewardTriggered = false;
    if (state.correctCount >= TARGET_QUESTIONS && !state.hasCelebratedTarget) {
      state.hasCelebratedTarget = true;
      isRewardTriggered = true;
      try {
        localStorage.setItem('slime_math_celebrated_target', 'true');
        localStorage.setItem('slime_math_celebrated_100', 'true');
      } catch (e) {}
    }

    // ข้อความดีใจ
    const cheerMsgs = [
      'ว้าววว! ถูกต้องนะจ๊ะน้องอุ้ม! 🎉',
      'ยอดเยี่ยมมากเลย น้องอุ้มคนเก่ง! ⭐',
      'สุดยอด! น้องอุ้มเก่งที่สุดเลย! 💖',
      'เก่งจังเลย! สะสมให้ครบ 100 ข้อไปขอให้ยายพาไปซื้อขนมนะ! 🍦'
    ];
    setSlimeSpeech(getRandomItem(cheerMsgs));
    dom.feedbackMsg.textContent = `ถูกต้อง! +1 คะแนน ${state.combo > 1 ? `(คอมโบ x${state.combo}!)` : ''} 🌟`;
    dom.feedbackMsg.className = 'feedback-msg correct';

    // ถ้าทำถูกครบ 100 ข้อ ให้เด้งแจ้งเตือนรางวัล
    if (isRewardTriggered) {
      setTimeout(() => {
        triggerTargetCelebration();
      }, 550);
    }

    // ไปข้อถัดไปหลังจากหน่วงเวลา 1.1 วินาที
    setTimeout(() => {
      dom.answerDisplay.classList.remove('correct-glow');
      state.questionCount += 1;
      state.isProcessing = false;
      generateMathProblem();
    }, 1100);
  }

  // เมื่อตอบผิด: ล้างช่องคำตอบ, แสดงเอฟเฟกต์สีแดง และให้ลองคิดใหม่
  function handleWrongAnswer() {
    // รีเซ็ตคอมโบ
    state.combo = 0;
    dom.comboText.textContent = 'x0';
    if (dom.sideComboCard) {
      dom.sideComboCard.classList.remove('active');
    }

    playWrongSound();

    // ล้างช่องคำตอบทันทีตามโจทย์
    state.userAnswer = '';
    updateAnswerUI();

    // แสดงเอฟเฟกต์สีแดงที่ช่องคำตอบ
    dom.answerDisplay.classList.remove('correct-glow');
    dom.answerDisplay.classList.remove('wrong-shake');
    void dom.answerDisplay.offsetWidth; // Force Reflow
    dom.answerDisplay.classList.add('wrong-shake');

    // แสดงสไลม์สีแดง/ส่ายหัว
    setSlimeExpression('sad');

    const encourageMsgs = [
      'ยังไม่ถูกนะ ลองคิดใหม่อีกทีนะ สู้ๆ! 💪',
      'อุ๊ย! เกือบถูกแล้ว ลองคำนวณอีกรอบนะ 🍀',
      'ไม่เป็นไรนะ ลองคิดช้าๆ ดูอีกครั้งจ้า ❤️',
      'สู้ๆ นะ เจ้าหนูคนเก่งทำได้แน่นอน! ✨'
    ];
    setSlimeSpeech(getRandomItem(encourageMsgs));
    dom.feedbackMsg.textContent = 'ยังไม่ถูกต้อง... สไลม์ล้างช่องคำตอบให้แล้ว ลองคิดใหม่อีกรอบนะ!';
    dom.feedbackMsg.className = 'feedback-msg wrong';

    // หลังจากเล่นแอนิเมชันเสร็จ ให้สไลม์กลับมาหน้าปกติพร้อมรอคำตอบใหม่
    setTimeout(() => {
      dom.answerDisplay.classList.remove('wrong-shake');
      setSlimeExpression('idle');
    }, 900);
  }

  // --- ปรับเปลี่ยนหน้าตาและสีของน้องสไลม์ ---
  function setSlimeExpression(type) {
    dom.slimeMascot.classList.remove('happy', 'sad', 'idle');

    if (type === 'happy') {
      dom.slimeMascot.classList.add('happy');
      dom.slimeEyes.style.display = 'none';
      dom.slimeHappyEyes.style.display = 'block';
      dom.slimeSadEyes.style.display = 'none';
      dom.slimeMouth.setAttribute('d', 'M88,114 Q100,136 112,114');

      dom.gradStop1.setAttribute('stop-color', '#55efc4');
      dom.gradStop2.setAttribute('stop-color', '#00b894');
      dom.gradStop3.setAttribute('stop-color', '#009472');

    } else if (type === 'sad') {
      dom.slimeMascot.classList.add('sad');
      dom.slimeEyes.style.display = 'none';
      dom.slimeHappyEyes.style.display = 'none';
      dom.slimeSadEyes.style.display = 'block';
      dom.slimeMouth.setAttribute('d', 'M92,126 Q100,116 108,126');

      dom.gradStop1.setAttribute('stop-color', '#ff7675');
      dom.gradStop2.setAttribute('stop-color', '#d63031');
      dom.gradStop3.setAttribute('stop-color', '#b71540');

    } else {
      dom.slimeMascot.classList.add('idle');
      dom.slimeEyes.style.display = 'block';
      dom.slimeHappyEyes.style.display = 'none';
      dom.slimeSadEyes.style.display = 'none';
      dom.slimeMouth.setAttribute('d', 'M92,118 Q100,128 108,118');

      dom.gradStop1.setAttribute('stop-color', '#72f790');
      dom.gradStop2.setAttribute('stop-color', '#2ecc71');
      dom.gradStop3.setAttribute('stop-color', '#1b9e52');
    }
  }

  function setSlimeSpeech(text) {
    dom.slimeSpeech.textContent = text;
  }

  // --- เอฟเฟกต์ละอองดาว/หัวใจ กระจายรอบสไลม์ (Confetti Particles) ---
  function createParticles() {
    dom.particleContainer.innerHTML = '';
    const icons = ['✨', '⭐', '🌟', '💖', '🍀', '🎉', '🍦', '🍭'];

    for (let i = 0; i < 14; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.textContent = getRandomItem(icons);

      const angle = (i / 14) * 2 * Math.PI;
      const dist = getRandomInt(35, 75);
      const tx = Math.cos(angle) * dist + 'px';
      const ty = (Math.sin(angle) * dist - 15) + 'px';
      const rot = getRandomInt(-90, 90) + 'deg';

      p.style.setProperty('--tx', tx);
      p.style.setProperty('--ty', ty);
      p.style.setProperty('--rot', rot);
      p.style.left = '50%';
      p.style.top = '50%';

      dom.particleContainer.appendChild(p);

      setTimeout(() => {
        if (p.parentNode) p.remove();
      }, 850);
    }
  }

  // =========================================================
  // ระบบเป้าหมาย 100 ข้อ & แจ้งเตือนรางวัล (ยายพาซื้อขนม)
  // =========================================================

  function updateTargetProgress() {
    if (!dom.targetProgressText || !dom.targetProgressFill) return;
    const current = state.correctCount;
    dom.targetProgressText.textContent = `${current}/${TARGET_QUESTIONS}`;
    const pct = Math.min(100, Math.max(0, Math.round((current / TARGET_QUESTIONS) * 100)));
    dom.targetProgressFill.style.width = `${pct}%`;

    if (dom.targetHintText) {
      if (current >= TARGET_QUESTIONS) {
        dom.targetHintText.textContent = 'ครบแล้ว! ไปซื้อขนม 🍦';
        dom.targetHintText.style.background = '#e8f8f5';
        dom.targetHintText.style.color = '#00b894';
      } else {
        dom.targetHintText.textContent = 'ยายพาซื้อขนม 👵';
        dom.targetHintText.style.background = '#fef3c7';
        dom.targetHintText.style.color = '#b7791f';
      }
    }
  }

  function openRewardModal(isManualClick = false) {
    initAudio();
    const isCompleted = state.correctCount >= TARGET_QUESTIONS;

    if (isCompleted) {
      playCelebrationFanfare();
      setSlimeExpression('happy');
      createParticles();
      setSlimeSpeech('ไชโยยย! คิดถูกครบ 100 ข้อแล้วจ้า! รีบชวนคุณยายไปซื้อขนมเลยยย! 🍦🎉');
    } else {
      playPopSound();
      const remaining = TARGET_QUESTIONS - state.correctCount;
      setSlimeSpeech(`สู้ๆ นะจ๊ะน้องอุ้ม! ขาดอีกแค่ ${remaining} ข้อ คุณยายจะพาไปซื้อขนมแล้ว! 🍨✨`);
    }

    updateRewardModalContent();

    if (dom.rewardModal) {
      dom.rewardModal.style.display = 'flex';
      dom.rewardModal.setAttribute('aria-hidden', 'false');
    }
  }

  function triggerTargetCelebration() {
    openRewardModal(false);
  }

  function updateRewardModalContent() {
    const isCompleted = state.correctCount >= TARGET_QUESTIONS;
    const remaining = Math.max(0, TARGET_QUESTIONS - state.correctCount);

    if (dom.rewardBadge) {
      dom.rewardBadge.textContent = isCompleted
        ? '🏆 ภารกิจสำเร็จ! ครบ 100 ข้อ 🏆'
        : `🎯 เป้าหมาย: สะสมให้ครบ ${TARGET_QUESTIONS} ข้อ 🎯`;
    }

    if (dom.rewardTitle) {
      dom.rewardTitle.textContent = isCompleted
        ? 'ขอให้ยายพาไปซื้อขนมได้เลย! 🎉'
        : 'เป้าหมาย: ขอให้ยายพาไปซื้อขนม! 🍦🍭';
    }

    if (dom.rewardSubtitle) {
      dom.rewardSubtitle.textContent = isCompleted
        ? 'สุดยอดคนเก่ง! น้องอุ้มคิดเลขถูกต้องครบ 100 ข้อแล้วนะจ๊ะ'
        : `น้องอุ้มคิดถูกแล้ว ${state.correctCount}/${TARGET_QUESTIONS} ข้อ (อีก ${remaining} ข้อเท่านั้นจ้า สู้ๆ! 💪✨)`;
    }

    if (dom.rewardSpeechIntro) {
      dom.rewardSpeechIntro.textContent = isCompleted
        ? '📢 ยื่นหน้านี้ให้คุณยายดูได้เลยนะคนเก่ง:'
        : '🌟 รางวัลใหญ่ของคนเก่ง:';
    }

    if (dom.rewardSpeechQuote) {
      dom.rewardSpeechQuote.innerHTML = isCompleted
        ? '"ยายจ๋า... น้องอุ้มคิดเลขครบ 100 ข้อแล้ว<br><b>พาหนูไปซื้อขนมหน่อยนะคะ! 🍨🧁</b>"'
        : `"คิดเลขถูกสะสมครบ 100 ข้อเมื่อไหร่...<br><b>คุณยายจะพาไปซื้อขนมอร่อยๆ ทันทีเลย! 🍨🧁</b>"`;
    }

    if (dom.closeRewardBtnText) {
      dom.closeRewardBtnText.textContent = isCompleted
        ? '🎒 เย้! ขอบคุณคุณยาย / เล่นสะสมต่อเลย ✨'
        : `🚀 ลุยคิดเลขต่อเลย! (ขาดอีก ${remaining} ข้อ ✨)`;
    }
  }

  function closeRewardModal() {
    playPopSound();
    if (dom.rewardModal) {
      dom.rewardModal.style.display = 'none';
      dom.rewardModal.setAttribute('aria-hidden', 'true');
    }
  }

  // =========================================================
  // ระบบรีเซ็ตคะแนน (Reset Score System)
  // =========================================================

  function openResetConfirmModal() {
    initAudio();
    playPopSound();
    if (dom.resetBestCheckbox) {
      dom.resetBestCheckbox.checked = false;
    }
    if (dom.resetCheckboxLabel) {
      dom.resetCheckboxLabel.classList.remove('checked');
    }
    if (dom.modalBestScoreVal) {
      dom.modalBestScoreVal.textContent = formatScore(state.bestScore);
    }
    if (dom.resetConfirmModal) {
      dom.resetConfirmModal.style.display = 'flex';
      dom.resetConfirmModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeResetConfirmModal() {
    playPopSound();
    if (dom.resetConfirmModal) {
      dom.resetConfirmModal.style.display = 'none';
      dom.resetConfirmModal.setAttribute('aria-hidden', 'true');
    }
  }

  function confirmResetScore() {
    initAudio();
    playPopSound();

    const shouldResetBest = dom.resetBestCheckbox ? dom.resetBestCheckbox.checked : false;

    state.score = 0;
    state.correctCount = 0;
    state.combo = 0;
    state.questionCount = 1;
    state.hasCelebratedTarget = false;
    state.isProcessing = false;

    try {
      localStorage.removeItem('slime_math_current_score');
      localStorage.removeItem('slime_math_correct_count');
      localStorage.removeItem('slime_math_celebrated_target');
      localStorage.removeItem('slime_math_celebrated_100');
    } catch (e) {
      console.warn('Reset local storage error', e);
    }

    if (shouldResetBest) {
      state.bestScore = 0;
      try {
        localStorage.removeItem('slime_math_best_score');
      } catch (e) {
        console.warn('Reset best score error', e);
      }
      dom.bestScoreText.textContent = '0';
    }

    dom.scoreText.textContent = '0';
    dom.comboText.textContent = 'x0';
    if (dom.sideComboCard) {
      dom.sideComboCard.classList.remove('active');
    }

    if (dom.answerDisplay) {
      dom.answerDisplay.classList.remove('correct-glow', 'wrong-shake');
    }

    updateTargetProgress();
    closeResetConfirmModal();

    // สร้างโจทย์ใหม่และเริ่มนับเป็นข้อที่ 1 ทันที
    generateMathProblem();

    if (shouldResetBest) {
      setSlimeSpeech('รีเซ็ตคะแนนและแต้มสูงสุดเป็น 0 แล้วจ้า! มาเริ่มสะสมใหม่กันนะ 🌟');
      dom.feedbackMsg.textContent = 'รีเซ็ตคะแนนทั้งหมดรวมแต้มสูงสุด และเริ่มข้อที่ 1 ใหม่เรียบร้อยแล้ว!';
    } else {
      setSlimeSpeech('รีเซ็ตเริ่มต้นข้อ 1 ใหม่แล้วจ้า! มาสะสมให้ครบ 100 ข้อกันนะ สู้ๆ! 🌟');
      dom.feedbackMsg.textContent = 'รีเซ็ตคะแนนและเริ่มข้อที่ 1 ใหม่เรียบร้อยแล้ว!';
    }
    dom.feedbackMsg.className = 'feedback-msg';
  }

  // --- การผูก Event Listeners สำหรับ On-screen Numpad & ปุ่มคำสั่ง ---
  function setupEventListeners() {
    // แป้นพิมพ์ On-Screen Numpad
    const padButtons = document.querySelectorAll('.pad-btn');
    padButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        initAudio();

        const key = btn.getAttribute('data-key');
        const action = btn.getAttribute('data-action');

        if (key !== null) {
          appendDigit(key);
        } else if (action === 'backspace') {
          backspaceDigit();
        } else if (action === 'clear') {
          clearAnswer();
        } else if (action === 'submit') {
          checkAnswer();
        }
      });
    });

    // กดที่ตัวน้องสไลม์เพื่อเล่น
    dom.slimeMascot.addEventListener('click', () => {
      initAudio();
      playPopSound();
      setSlimeSpeech(getRandomItem([
        'ดึ๋งๆ! สไลม์คู่ใจของน้องอุ้มมาแล้วจ้า 💖',
        'มาคิดเลขสะสมให้ครบ 100 ข้อ ให้ยายพาไปซื้อขนมกันนะน้องอุ้ม! 🍦',
        'ข้าคือราชาสไลม์ใจดี ขอให้น้องอุ้มทำถูกครบ 100 ข้อไวๆ นะ 👑'
      ]));
    });

    // ปุ่มเปลี่ยนโจทย์ (ข้ามข้อ)
    dom.newQuestionBtn.addEventListener('click', () => {
      initAudio();
      playPopSound();
      state.combo = 0;
      dom.comboText.textContent = 'x0';
      if (dom.sideComboCard) {
        dom.sideComboCard.classList.remove('active');
      }
      generateMathProblem();
    });

    // ฟังก์ชันสลับตัวเลขบน-ล่าง
    function swapNumbers() {
      initAudio();
      playPopSound();

      if (state.currentOp === '+') {
        const temp = state.currentNum1;
        state.currentNum1 = state.currentNum2;
        state.currentNum2 = temp;
        state.correctAnswer = state.currentNum1 + state.currentNum2;
        state.userAnswer = '';
        updateVerticalMathDisplay();
        updateAnswerUI();
        setSlimeExpression('happy');
        setSlimeSpeech('สลับตัวตั้งกับตัวบวกแล้วจ้า! ผลลัพธ์เท่าเดิมนะ 💖');
        dom.feedbackMsg.textContent = 'สลับตัวเลขบน-ล่างแล้ว คิดจากหลักหน่วยก่อนนะ ⬅️';
      } else if (state.currentOp === '×') {
        const temp = state.currentNum1;
        state.currentNum1 = state.currentNum2;
        state.currentNum2 = temp;
        state.correctAnswer = state.currentNum1 * state.currentNum2;
        state.userAnswer = '';
        updateVerticalMathDisplay();
        updateAnswerUI();
        setSlimeExpression('happy');
        setSlimeSpeech('สลับตัวตั้งกับตัวคูณแล้วจ้า! ผลลัพธ์เท่าเดิมนะ 💖');
        dom.feedbackMsg.textContent = 'สลับตัวเลขบน-ล่างแล้ว ท่องสูตรคูณได้เลยจ้า 🌟';
      } else if (state.currentOp === '÷') {
        // สำหรับการหาร: สลับตัวตั้งกับตัวหาร และเปลี่ยนเป็นโจทย์คูณ
        const temp = state.currentNum1;
        state.currentNum1 = state.currentNum2;
        state.currentNum2 = temp;
        state.currentOp = '×';
        state.correctAnswer = state.currentNum1 * state.currentNum2;
        state.userAnswer = '';
        dom.modeBadge.textContent = 'การคูณแนวตั้ง';
        updateVerticalMathDisplay();
        updateAnswerUI();
        setSlimeExpression('happy');
        setSlimeSpeech('การหารสลับที่ไม่ได้จ้า ข้าเปลี่ยนเป็นโจทย์คูณให้แทนนะ! 🌟');
        dom.feedbackMsg.textContent = 'สลับตัวเลขและเปลี่ยนเป็นโจทย์คูณให้แล้วนะ ⬅️';
      } else {
        // สำหรับการลบ: สลับตัวตั้งกับตัวลบ และเปลี่ยนเป็นโจทย์บวก (เพื่อไม่ให้ผลลัพธ์ติดลบ)
        const temp = state.currentNum1;
        state.currentNum1 = state.currentNum2;
        state.currentNum2 = temp;
        state.currentOp = '+';
        state.correctAnswer = state.currentNum1 + state.currentNum2;
        state.userAnswer = '';
        dom.modeBadge.textContent = 'การบวกแนวตั้ง';
        updateVerticalMathDisplay();
        updateAnswerUI();
        setSlimeExpression('happy');
        setSlimeSpeech('การลบสลับที่ไม่ได้จ้า ข้าเปลี่ยนเป็นโจทย์บวกให้แทนนะ! 🌟');
        dom.feedbackMsg.textContent = 'สลับตัวเลขและเปลี่ยนเป็นโจทย์บวกให้แล้วนะ ⬅️';
      }

      updateHintSidebox();
    }

    // ปุ่มสลับเลขบน-ล่าง
    if (dom.swapNumbersBtn) {
      dom.swapNumbersBtn.addEventListener('click', swapNumbers);
    }

    // ปุ่มเปิด/ปิด กล่องวิธีคิดข้างๆ
    if (dom.toggleHintBtn) {
      dom.toggleHintBtn.addEventListener('click', () => {
        initAudio();
        playPopSound();
        state.showHintBox = !state.showHintBox;
        updateHintVisibility();
      });
    }

    // ปุ่มกากบาทปิดกล่องวิธีคิด
    if (dom.closeHintBoxBtn) {
      dom.closeHintBoxBtn.addEventListener('click', () => {
        initAudio();
        playPopSound();
        state.showHintBox = false;
        updateHintVisibility();
      });
    }

    // ปิด Dropdown วิธีคิดเมื่อคลิกพื้นที่อื่นภายนอก
    document.addEventListener('click', (e) => {
      if (state.showHintBox && dom.mathHintDropdown && dom.toggleHintBtn) {
        if (!dom.mathHintDropdown.contains(e.target) && !dom.toggleHintBtn.contains(e.target)) {
          state.showHintBox = false;
          updateHintVisibility();
        }
      }
    });

    // ปุ่มเลือกหมวดหมู่ที่หน้าแรก (ตามที่วาด: 1. บวกและลบ  2. คูณและหาร)
    if (dom.chooseAddSubBtn) {
      dom.chooseAddSubBtn.addEventListener('click', () => {
        startMathMode('add_sub');
      });
    }

    if (dom.chooseMulDivBtn) {
      dom.chooseMulDivBtn.addEventListener('click', () => {
        startMathMode('mul_div');
      });
    }

    // ปุ่มกลับหน้าแรกจากแถบหัวเรื่อง
    if (dom.homeNavBtn) {
      dom.homeNavBtn.addEventListener('click', showHomeScreen);
    }

    // แตะน้องสไลม์ที่หน้าแรก
    if (dom.homeSlimeAvatar) {
      dom.homeSlimeAvatar.addEventListener('click', () => {
        initAudio();
        playPopSound();
        if (dom.homeSpeechBubble) {
          dom.homeSpeechBubble.textContent = getRandomItem([
            'ดึ๋งๆ! น้องอุ้มอยากฝึก "บวก/ลบ" หรือ "คูณ/หาร" กดเลือกได้เลยจ้า 💖',
            'สไลม์พร้อมแล้ว! วันนี้มาฝึกคิดเลขให้เก่งที่สุดในโลกกันนะ 👑',
            'ครบ 100 ข้อเมื่อไหร่ คุณยายพาไปซื้อขนมแสนอร่อยแน่นอน! 🍦🍨'
          ]);
        }
      });
    }

    // ปุ่มเปลี่ยนโจทย์ข้อใหม่
    if (dom.changeQuestionBtn) {
      dom.changeQuestionBtn.addEventListener('click', () => {
        initAudio();
        playPopSound();
        state.combo = 0;
        dom.comboText.textContent = 'x0';
        if (dom.sideComboCard) {
          dom.sideComboCard.classList.remove('active');
        }
        generateMathProblem();
        setSlimeSpeech('เปลี่ยนโจทย์ข้อใหม่เรียบร้อยแล้วจ้า ลุยเลย! 🌟');
      });
    }

    // ปุ่มเปิดหน้าต่างปรับระดับเสียง (จากแถบด้านข้าง)
    if (dom.soundToggleBtn) {
      dom.soundToggleBtn.addEventListener('click', openVolumeModal);
    }

    // ปุ่มปิดหน้าต่างปรับระดับเสียง
    if (dom.closeVolumeBtn) {
      dom.closeVolumeBtn.addEventListener('click', closeVolumeModal);
    }

    if (dom.confirmVolumeBtn) {
      dom.confirmVolumeBtn.addEventListener('click', closeVolumeModal);
    }

    if (dom.volumeModal) {
      dom.volumeModal.addEventListener('click', (e) => {
        if (e.target === dom.volumeModal) {
          closeVolumeModal();
        }
      });
    }

    // สไลเดอร์ปรับระดับเสียงเอฟเฟกต์ SFX
    if (dom.sfxVolumeSlider) {
      dom.sfxVolumeSlider.addEventListener('input', (e) => {
        setSfxVolume(e.target.value, false);
      });
      dom.sfxVolumeSlider.addEventListener('change', (e) => {
        setSfxVolume(e.target.value, true);
      });
    }

    // ปุ่มลัด Presets เลือกระดับเสียงแบบรวดเร็ว
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const target = btn.getAttribute('data-target');
        const vol = parseInt(btn.getAttribute('data-vol'), 10);
        if (target === 'sfx') {
          setSfxVolume(vol, true);
        }
      });
    });

    // ปุ่มเลือกระดับความยาก
    dom.levelTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        initAudio();
        playPopSound();
        dom.levelTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const newLimit = parseInt(tab.getAttribute('data-max'), 10);
        state.maxLimit = newLimit;
        state.questionCount = 1;
        generateMathProblem();
      });
    });

    // ปุ่มรีเซ็ตคะแนน
    if (dom.resetScoreBtn) {
      dom.resetScoreBtn.addEventListener('click', openResetConfirmModal);
    }

    if (dom.cancelResetBtn) {
      dom.cancelResetBtn.addEventListener('click', closeResetConfirmModal);
    }

    if (dom.confirmResetBtn) {
      dom.confirmResetBtn.addEventListener('click', confirmResetScore);
    }

    if (dom.resetConfirmModal) {
      dom.resetConfirmModal.addEventListener('click', (e) => {
        if (e.target === dom.resetConfirmModal) {
          closeResetConfirmModal();
        }
      });
    }

    // สลับสถานะตัวเลือกรีเซ็ตแต้มสูงสุด
    if (dom.resetBestCheckbox) {
      dom.resetBestCheckbox.addEventListener('change', () => {
        initAudio();
        playPopSound();
        if (dom.resetCheckboxLabel) {
          dom.resetCheckboxLabel.classList.toggle('checked', dom.resetBestCheckbox.checked);
        }
      });
    }

    // จัดการป๊อปอัปภาพรางวัลใหญ่ 100 ข้อ (ขยายเมื่อคลิกที่การ์ดเป้าหมาย)
    if (dom.targetStatCard) {
      dom.targetStatCard.addEventListener('click', () => {
        openRewardModal(true);
      });
    }

    if (dom.closeRewardBtn) {
      dom.closeRewardBtn.addEventListener('click', closeRewardModal);
    }

    if (dom.rewardCardCloseX) {
      dom.rewardCardCloseX.addEventListener('click', closeRewardModal);
    }

    if (dom.rewardModal) {
      dom.rewardModal.addEventListener('click', (e) => {
        if (e.target === dom.rewardModal) {
          closeRewardModal();
        }
      });
    }

    // Modal แนะนำวิธีติดตั้งลง iPad
    function closeInstallGuide() {
      playPopSound();
      if (dom.installGuideModal) {
        dom.installGuideModal.style.display = 'none';
        dom.installGuideModal.setAttribute('aria-hidden', 'true');
      }
    }

    if (dom.installGuideBtn) {
      dom.installGuideBtn.addEventListener('click', () => {
        initAudio();
        playPopSound();
        if (dom.installGuideModal) {
          dom.installGuideModal.style.display = 'flex';
          dom.installGuideModal.setAttribute('aria-hidden', 'false');
        }
      });
    }

    if (dom.closeInstallGuideBtn) {
      dom.closeInstallGuideBtn.addEventListener('click', closeInstallGuide);
    }

    if (dom.closeInstallGuideX) {
      dom.closeInstallGuideX.addEventListener('click', closeInstallGuide);
    }

    if (dom.installGuideModal) {
      dom.installGuideModal.addEventListener('click', (e) => {
        if (e.target === dom.installGuideModal) {
          closeInstallGuide();
        }
      });
    }

    // รองรับแป้นพิมพ์กายภาพบนคอมพิวเตอร์
    window.addEventListener('keydown', (e) => {
      if (e.key >= '0' && e.key <= '9') {
        appendDigit(e.key);
      } else if (e.key === 'Backspace') {
        backspaceDigit();
      } else if (e.key === 'Escape' || e.key === 'Delete') {
        clearAnswer();
      } else if (e.key === 'Enter') {
        checkAnswer();
      }
    });
  }

  // --- เริ่มต้นเกม (Initialize Game) ---
  function initGame() {
    // โหลดคะแนนสูงสุด
    try {
      const savedBest = localStorage.getItem('slime_math_best_score');
      if (savedBest) {
        state.bestScore = parseFloat(savedBest) || 0;
        dom.bestScoreText.textContent = formatScore(state.bestScore);
      }
    } catch (e) {
      console.warn('Load best score error', e);
    }

    // โหลดคะแนนปัจจุบันที่สะสมไว้
    try {
      const savedScore = localStorage.getItem('slime_math_current_score');
      if (savedScore) {
        state.score = parseFloat(savedScore) || 0;
        dom.scoreText.textContent = formatScore(state.score);
      }
    } catch (e) {
      console.warn('Load current score error', e);
    }

    // โหลดจำนวนข้อที่ตอบถูกสะสม (เป้าหมาย 100 ข้อ)
    try {
      const savedCount = localStorage.getItem('slime_math_correct_count');
      if (savedCount !== null) {
        state.correctCount = parseInt(savedCount, 10) || 0;
      } else {
        // Fallback: คำนวณจากคะแนนเดิม (ข้อละ 1 คะแนน)
        state.correctCount = Math.round(state.score) || 0;
      }
    } catch (e) {
      console.warn('Load correct count error', e);
      state.correctCount = 0;
    }

    // โหลดสถานะการแจ้งเตือนรางวัล 100 ข้อ
    try {
      const savedCelebrated = localStorage.getItem('slime_math_celebrated_100');
      if (savedCelebrated === 'true' && state.correctCount >= TARGET_QUESTIONS) {
        state.hasCelebratedTarget = true;
      } else {
        state.hasCelebratedTarget = false;
      }
    } catch (e) {
      console.warn('Load celebration flag error', e);
    }

    // ตั้งค่าระดับความยากจากแท็บที่กำลัง active ใน HTML
    const activeTab = document.querySelector('.level-tab.active');
    if (activeTab) {
      const parsedLimit = parseInt(activeTab.getAttribute('data-max'), 10);
      if (parsedLimit) state.maxLimit = parsedLimit;
    }

    // โหลดระดับเสียงเอฟเฟกต์ (SFX) ที่บันทึกไว้
    try {
      const savedSfxVol = localStorage.getItem('slime_math_sfx_volume');
      if (savedSfxVol !== null) {
        state.sfxVolume = Math.min(100, Math.max(0, parseInt(savedSfxVol, 10) || 0));
        state.soundEnabled = state.sfxVolume > 0;
      }
    } catch (e) {
      console.warn('Load SFX volume error', e);
    }

    // โหลดโหมดที่เลือกไว้ล่าสุด
    try {
      const savedMode = localStorage.getItem('slime_math_selected_mode');
      if (savedMode === 'mul_div' || savedMode === 'add_sub') {
        state.mathMode = savedMode;
      }
    } catch (e) {}

    if (dom.currentModeTag) {
      dom.currentModeTag.textContent = state.mathMode === 'add_sub' ? 'การบวกและการลบ' : 'การคูณและการหาร';
    }

    updateVolumeUI();

    updateTargetProgress();
    setupEventListeners();
    generateMathProblem();

    // แสดงหน้าแรก (Home Screen) ตั้งแต่เปิดเว็บ
    showHomeScreen();

    // ตรวจสอบว่าเปิดในโหมดแอปเต็มจอของ iPad (Standalone) แล้วหรือไม่ หากติดตั้งแล้วจะซ่อนปุ่มแนะนำ
    try {
      const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
      if (isStandalone && dom.installGuideBtn) {
        dom.installGuideBtn.style.display = 'none';
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }
})();
