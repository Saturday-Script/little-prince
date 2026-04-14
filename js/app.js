/**
 * 主应用控制器
 * 管理全局状态、Screen切换、初始化
 */
const App = {
  currentScreen: 1,
  state: {
    planetName: '',
    planetColor: 'blue',
    planetDeco: '',
    decisions: [],
    invitedPeople: []
  },

  async init() {
    // 生成 CSS 星空
    this._generateStars();

    // 初始化粒子背景（作为备选，CSS 星空优先）
    await ParticlesConfig.init();

    // 初始化音效管理器
    AudioManager.init();

    // 初始化各模块
    PlanetDIY.init();
    Recruitment.init();
    Review.init();
    Invite.init();
    VideoWait.init();

    // BGM 已禁用

    // 等待用户点击开始覆盖层，解锁音频后播放倒计时 → 开场旁白 + 入场动画
    this.introNarratorDone = false;
    const startOverlay = document.getElementById('start-overlay');
    startOverlay.addEventListener('click', () => {
      // 1. 在用户点击回调内解锁 Howler AudioContext
      Howler.ctx && Howler.ctx.resume();
      // 播一个极短的静音音效确保 AudioContext 被解锁
      AudioManager.play('click');

      // 2. 强制预加载第一段旁白（load() 确保 html5 模式下开始缓冲）
      if (AudioManager.sounds.narratorIntro) {
        AudioManager.sounds.narratorIntro.load();
      }

      // 3. 隐藏提示文字，显示倒计时
      document.getElementById('start-hint').style.display = 'none';
      const countdownContainer = document.getElementById('countdown-container');
      countdownContainer.style.display = 'block';

      // 4. 启动倒计时
      this._startCountdown(5, () => {
        // 倒计时结束 → 淡出覆盖层
        startOverlay.classList.add('hidden');
        // 播放开场旁白
        AudioManager.playNarrator('narratorIntro', () => {
          this.introNarratorDone = true;
        });
        // 启动入场动画
        this._playIntro();
      });
    }, { once: true });
  },

  // 生成 CSS 星星（来自星球图 2）
  _generateStars() {
    const sc = document.getElementById('stars');
    if (!sc) return;
    const starTypes = ['star-warm', 'star-cool'];
    for (let i = 0; i < 120; i++) {
      const s = document.createElement('div');
      const isBright = Math.random() < 0.12;
      const type = starTypes[Math.floor(Math.random() * starTypes.length)];
      s.className = 'star ' + (isBright ? 'star-bright' : type);
      const size = isBright ? (Math.random() * 3 + 2.5) : (Math.random() * 2 + 1);
      s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${Math.random()*3+1.5}s;animation-delay:${Math.random()*5}s;`;
      sc.appendChild(s);
    }
  },

  _startCountdown(seconds, onComplete) {
    const numEl = document.getElementById('countdown-number');
    const ringEl = document.getElementById('countdown-ring-progress');
    const circumference = 2 * Math.PI * 54; // r=54
    let remaining = seconds;

    numEl.textContent = remaining;

    const tick = () => {
      remaining--;
      if (remaining <= 0) {
        onComplete();
        return;
      }
      // 更新数字 + pop 动画
      numEl.textContent = remaining;
      numEl.classList.remove('pop');
      void numEl.offsetWidth;
      numEl.classList.add('pop');
      // 更新环形进度（从满到空）
      const progress = remaining / seconds;
      ringEl.style.strokeDashoffset = circumference * (1 - progress);
    };

    // 初始 pop
    numEl.classList.add('pop');
    // 初始环形（满圆）
    ringEl.style.strokeDashoffset = 0;

    // 每秒倒数
    const timer = setInterval(() => {
      tick();
      if (remaining <= 0) clearInterval(timer);
    }, 1000);
  },

  _playIntro() {
    // Screen 1 入场动画
    const elements = [
      '.title-glow',
      '.subtitle',
      '.planet-stage',
      '.diy-panel',
      '#btn-create-planet'
    ];

    anime({
      targets: elements.join(', '),
      opacity: [0, 1],
      translateY: [40, 0],
      delay: anime.stagger(200, { start: 300 }),
      duration: 800,
      easing: 'easeOutCubic'
    });
  },

  goToScreen(targetScreen) {
    if (targetScreen === this.currentScreen) return;

    const currentEl = document.getElementById(`screen-${this.currentScreen}`);
    const targetEl = document.getElementById(`screen-${targetScreen}`);
    const overlay = document.getElementById('transition-overlay');

    if (!currentEl || !targetEl) return;

    // 离开当前screen的清理
    this._leaveScreen(this.currentScreen);

    // 转场动画
    anime.timeline({})
      .add({
        targets: overlay,
        opacity: [0, 1],
        duration: 400,
        easing: 'easeInQuad',
        begin: () => {
          overlay.style.pointerEvents = 'all';
        }
      })
      .add({
        targets: overlay,
        opacity: [1, 0],
        duration: 400,
        easing: 'easeOutQuad',
        begin: () => {
          currentEl.classList.remove('active');
          targetEl.classList.add('active');
          this.currentScreen = targetScreen;

          // 进入新screen
          this._enterScreen(targetScreen);
        },
        complete: () => {
          overlay.style.pointerEvents = 'none';
        }
      });
  },

  _enterScreen(screen) {
    switch (screen) {
      case 2:
        Recruitment.enter();
        break;
      case 3:
        Review.enter();
        break;
      case 4:
        Invite.enter();
        break;
      case 5:
        VideoWait.enter();
        break;
    }

    // 通用入场动画
    const content = document.querySelector(`#screen-${screen} .screen-content`);
    if (content) {
      anime({
        targets: content,
        opacity: [0, 1],
        duration: 500,
        easing: 'easeOutCubic'
      });
    }
  },

  _leaveScreen(screen) {
    switch (screen) {
      case 1:
        // 用户可能还没听完就点了创建，停掉S1所有旁白
        AudioManager.stopNarrator('narratorIntro');
        AudioManager.stopNarrator('narratorNaming');
        AudioManager.stopNarrator('narratorDecorate');
        break;
      case 2:
        Recruitment.leave();
        break;
      case 3:
        Review.leave();
        break;
      case 5:
        VideoWait.leave();
        break;
    }
  }
};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
