/**
 * =========================================================
 * อาณาจักรของน้องอุ้ม - คณิตคิดไว
 * โจทย์แนวตั้งขนาดใหญ่ + ระบบแสดงจำนวนทด + สะสมครบ 30 ข้อ ขอให้ยายพาไปซื้อขนม
 * =========================================================
 */

(function () {
  'use strict';

  // เป้าหมายสะสมจำนวนข้อที่คิดเลขถูกต้อง (ขอให้ยายพาไปซื้อขนม)
  const TARGET_QUESTIONS = 30;

  // --- ตัวแปรสถานะของเกม (Game State) ---
  const state = {
    currentNum1: 0,
    currentNum2: 0,
    currentOp: '+',
    correctAnswer: 0,
    userAnswer: '',
    questionCount: 1,
    correctCount: 0, // จำนวนข้อที่ตอบถูก (เป้าหมาย 30 ข้อ)
    score: 0, // สะสมข้อละ 1 คะแนน
    combo: 0,
    bestScore: 0,
    hasCelebratedTarget: false, // ป้องกันการเด้งแจ้งเตือนซ้ำซ้อนเมื่อครบ 30 ข้อ
    maxLimit: 1000, // ค่าเริ่มต้น: ตัวเลขไม่เกิน 1,000 (เรียงจากมากไปน้อย: 1,000 -> 500 -> 100)
    soundEnabled: true,
    sfxVolume: 80, // ระดับเสียงเอฟเฟกต์ (0-100%)
    isProcessing: false // ป้องกันการกดย้ำขณะกำลังแสดงแอนิเมชันตอบถูก
  };

  // --- การอ้างอิง DOM Elements ---
  const dom = {
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

    // ระบบเป้าหมาย 30 ข้อ (ยายพาซื้อขนม)
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

    // Modal แจ้งเตือนรางวัล 30 ข้อ
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
    modalBestScoreVal: document.getElementById('modalBestScoreVal')
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

  // --- การสร้างโจทย์คณิตศาสตร์ ป.2 (การบวกและการลบแนวตั้ง ไม่เกิน 1,000) ---
  function generateMathProblem() {
    const isAddition = Math.random() < 0.5;
    state.currentOp = isAddition ? '+' : '-';

    let n1, n2, ans;

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

    state.currentNum1 = n1;
    state.currentNum2 = n2;
    state.correctAnswer = ans;
    state.userAnswer = '';

    // อัปเดตข้อมูลบนหน้าจอ
    dom.questionBadge.textContent = `ข้อที่ ${state.questionCount}`;
    dom.modeBadge.textContent = isAddition ? 'การบวกแนวตั้ง' : 'การลบแนวตั้ง';

    updateVerticalMathDisplay();
    updateAnswerUI();

    // รีเซ็ตหน้าตาสไลม์กลับสู่ปกติ
    setSlimeExpression('idle');

    const promptQuotes = [
      'ลุยเลยคนเก่ง! คิดจากหลักหน่วยก่อนนะจ๊ะ ✨',
      'สู้ๆ นะ! สไลม์เอาใจช่วย คิดให้ครบ 30 ข้อนะ 💖',
      'คิดเลขสนุกจัง! ค่อยๆ คิด ไม่ต้องรีบนะ 🍀',
      'ทำถูกข้อนี้รับไปเลย +1 คะแนนจ้า 🌟'
    ];
    setSlimeSpeech(getRandomItem(promptQuotes));
    dom.feedbackMsg.textContent = 'ใส่หลักหน่วยก่อนนะ (มีตัวทดจะลอยขึ้นมาให้เห็นเลย) ⬅️';
    dom.feedbackMsg.className = 'feedback-msg';
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

    // เมื่อพิมพ์จากขวาไปซ้าย:
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
    const isAdd = state.currentOp === '+';

    hideAllCarries();

    const u1 = n1 % 10;
    const t1 = Math.floor(n1 / 10) % 10;
    const h1 = Math.floor(n1 / 100) % 10;

    const u2 = n2 % 10;
    const t2 = Math.floor(n2 / 10) % 10;
    const h2 = Math.floor(n2 / 100) % 10;

    if (isAdd) {
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
    } else {
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
    }
  }

  function appendDigit(digit) {
    if (state.isProcessing) return;

    // จำกัดไม่ให้ยาวเกิน 4 หลัก (เพราะผลลัพธ์ไม่เกิน 1,000)
    if (state.userAnswer.length >= 4) return;

    // ใส่เลขจากขวาไปซ้าย: ตัวเลขใหม่จะถูกวางไว้ด้านหน้า (ซ้ายสุด) ของเลขเดิม
    // ตามหลักการคำนวณเลข ป.2 (หลักหน่วย -> หลักสิบ -> หลักร้อย)
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

  function backspaceDigit() {
    if (state.isProcessing) return;
    if (state.userAnswer.length > 0) {
      // ลบตัวเลขที่เพิ่งกรอกล่าสุด (ตัวซ้ายสุด)
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

  function clearAnswer() {
    if (state.isProcessing) return;
    state.userAnswer = '';
    playPopSound();
    updateAnswerUI();
    dom.feedbackMsg.textContent = 'ล้างคำตอบแล้ว เริ่มกรอกใหม่จากหลักหน่วยได้เลยจ้า ⬅️';
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

  // เมื่อตอบถูก: ปรับคะแนนเป็นข้อละ 1 คะแนน + ตรวจสอบเป้าหมายครบ 30 ข้อ
  function handleCorrectAnswer() {
    state.isProcessing = true;
    state.combo += 1;

    // ปรับคะแนนเป็นข้อละ 1 คะแนน และนับสะสมจำนวนข้อที่คิดถูก (เป้าหมาย 30 ข้อ)
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

    // ตรวจสอบรางวัลครบ 30 ข้อ (ขอให้ยายพาไปซื้อขนม)
    let isRewardTriggered = false;
    if (state.correctCount >= TARGET_QUESTIONS && !state.hasCelebratedTarget) {
      state.hasCelebratedTarget = true;
      isRewardTriggered = true;
      try {
        localStorage.setItem('slime_math_celebrated_target', 'true');
      } catch (e) {}
    }

    // ข้อความดีใจ
    const cheerMsgs = [
      'ว้าววว! ถูกต้องนะจ๊ะน้องอุ้ม! 🎉',
      'ยอดเยี่ยมมากเลย น้องอุ้มคนเก่ง! ⭐',
      'สุดยอด! น้องอุ้มเก่งที่สุดเลย! 💖',
      'เก่งจังเลย! สะสมให้ครบ 30 ข้อไปขอให้ยายพาไปซื้อขนมนะ! 🍦'
    ];
    setSlimeSpeech(getRandomItem(cheerMsgs));
    dom.feedbackMsg.textContent = `ถูกต้อง! +1 คะแนน ${state.combo > 1 ? `(คอมโบ x${state.combo}!)` : ''} 🌟`;
    dom.feedbackMsg.className = 'feedback-msg correct';

    // ถ้าทำถูกครบ 30 ข้อ ให้เด้งแจ้งเตือนรางวัล
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
  // ระบบเป้าหมาย 30 ข้อ & แจ้งเตือนรางวัล (ยายพาซื้อขนม)
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
      setSlimeSpeech('ไชโยยย! คิดถูกครบ 30 ข้อแล้วจ้า! รีบชวนคุณยายไปซื้อขนมเลยยย! 🍦🎉');
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
        ? '🏆 ภารกิจสำเร็จ! ครบ 30 ข้อ 🏆'
        : `🎯 เป้าหมาย: สะสมให้ครบ ${TARGET_QUESTIONS} ข้อ 🎯`;
    }

    if (dom.rewardTitle) {
      dom.rewardTitle.textContent = isCompleted
        ? 'ขอให้ยายพาไปซื้อขนมได้เลย! 🎉'
        : 'เป้าหมาย: ขอให้ยายพาไปซื้อขนม! 🍦🍭';
    }

    if (dom.rewardSubtitle) {
      dom.rewardSubtitle.textContent = isCompleted
        ? 'สุดยอดคนเก่ง! น้องอุ้มคิดเลขถูกต้องครบ 30 ข้อแล้วนะจ๊ะ'
        : `น้องอุ้มคิดถูกแล้ว ${state.correctCount}/${TARGET_QUESTIONS} ข้อ (อีก ${remaining} ข้อเท่านั้นจ้า สู้ๆ! 💪✨)`;
    }

    if (dom.rewardSpeechIntro) {
      dom.rewardSpeechIntro.textContent = isCompleted
        ? '📢 ยื่นหน้านี้ให้คุณยายดูได้เลยนะคนเก่ง:'
        : '🌟 รางวัลใหญ่ของคนเก่ง:';
    }

    if (dom.rewardSpeechQuote) {
      dom.rewardSpeechQuote.innerHTML = isCompleted
        ? '"ยายจ๋า... น้องอุ้มคิดเลขครบ 30 ข้อแล้ว<br><b>พาหนูไปซื้อขนมหน่อยนะคะ! 🍨🧁</b>"'
        : `"คิดเลขถูกสะสมครบ 30 ข้อเมื่อไหร่...<br><b>คุณยายจะพาไปซื้อขนมอร่อยๆ ทันทีเลย! 🍨🧁</b>"`;
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
      setSlimeSpeech('รีเซ็ตเริ่มต้นข้อ 1 ใหม่แล้วจ้า! มาสะสมให้ครบ 30 ข้อกันนะ สู้ๆ! 🌟');
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
        'มาคิดเลขสะสมให้ครบ 30 ข้อ ให้ยายพาไปซื้อขนมกันนะน้องอุ้ม! 🍦',
        'ข้าคือราชาสไลม์ใจดี ขอให้น้องอุ้มทำถูกครบ 30 ข้อไวๆ นะ 👑'
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
    }

    // ปุ่มสลับเลขบน-ล่าง
    if (dom.swapNumbersBtn) {
      dom.swapNumbersBtn.addEventListener('click', swapNumbers);
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

    // จัดการป๊อปอัปภาพรางวัลใหญ่ 30 ข้อ (ขยายเมื่อคลิกที่การ์ดเป้าหมาย)
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

    // โหลดจำนวนข้อที่ตอบถูกสะสม (เป้าหมาย 30 ข้อ)
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

    // โหลดสถานะการแจ้งเตือนรางวัล 30 ข้อ
    try {
      const savedCelebrated = localStorage.getItem('slime_math_celebrated_target') || localStorage.getItem('slime_math_celebrated_100');
      if (savedCelebrated === 'true') {
        state.hasCelebratedTarget = true;
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

    updateVolumeUI();

    updateTargetProgress();
    setupEventListeners();
    generateMathProblem();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
  } else {
    initGame();
  }
})();
