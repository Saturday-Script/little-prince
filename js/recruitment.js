/**
 * Screen 2: 发布招募令
 * 流程：星球亮相+字幕旁白 → 信号发射+星球缩小 → 卷轴广播 → 进入Screen 3
 */
const Recruitment = {
  typed: null,
  _typedContent: null,
  _typedSubtitle: null,

  init() {},

  enter() {
    this._resetElements();
    this._showHeroPlanet();
    // 星球亮相后直接发信号+播招募令，跳过过渡旁白
    setTimeout(() => this._sendSignal(), 1000);
  },

  _resetElements() {
    const scroll = document.getElementById('scroll-container');
    const subtitle = document.getElementById('narrator-subtitle');
    const hero = document.getElementById('s2-hero-planet');

    scroll.style.display = 'none';
    scroll.style.opacity = '1';
    subtitle.style.display = 'none';

    hero.style.opacity = '0';
    hero.style.top = '';
    hero.style.transform = '';

    document.getElementById('scroll-title').textContent = '';
    document.getElementById('scroll-content').innerHTML = '';
    document.getElementById('narrator-subtitle-text').textContent = '';
    document.getElementById('s2-signal-rings').innerHTML = '';

    document.getElementById('scroll-body').classList.remove('unrolled');
  },

  _showHeroPlanet() {
    const hero = document.getElementById('s2-hero-planet');
    const img = document.getElementById('s2-hero-planet-img');
    const nameEl = document.getElementById('s2-hero-planet-name');

    if (typeof PlanetDIY !== 'undefined') {
      img.src = PlanetDIY._getCurrentImageSrc();
    }
    nameEl.textContent = (App.state.planetName || '未命名') + '星球';

    // 重置为居中初始位置
    hero.style.top = '15vh';
    hero.style.transform = 'translateX(-50%)';

    anime({
      targets: hero,
      opacity: [0, 1],
      scale: [0.6, 1],
      duration: 800,
      easing: 'easeOutCubic'
    });
  },

  _playNarratorWithSubtitle() {
    const subtitle = document.getElementById('narrator-subtitle');
    const textEl = document.getElementById('narrator-subtitle-text');
    subtitle.style.display = '';
    subtitle.style.opacity = '0';
    textEl.textContent = '';

    anime({
      targets: subtitle,
      opacity: [0, 1],
      duration: 400,
      delay: 600,
      easing: 'easeOutCubic'
    });

    const narratorText = '漂亮！你的星球已经在全宇宙亮起来了，\n让我们向全宇宙发一封移民招募令，\n邀请大家来入住吧！';

    this._typedSubtitle = new Typed('#narrator-subtitle-text', {
      strings: [narratorText],
      typeSpeed: 65,
      startDelay: 600,
      showCursor: true,
      cursorChar: '▍'
    });

    const onNarratorDone = () => {
      if (this._narratorDone) return;
      this._narratorDone = true;
      if (this._typedSubtitle) {
        this._typedSubtitle.destroy();
        this._typedSubtitle = null;
      }
      anime({
        targets: subtitle,
        opacity: [1, 0],
        duration: 400,
        easing: 'easeInCubic',
        complete: () => {
          subtitle.style.display = 'none';
          this._sendSignal();
        }
      });
    };

    this._narratorDone = false;
    AudioManager.playNarrator('narratorRecruitment', onNarratorDone);

    // 兜底：没有旁白音频时按打字时长自动推进
    if (!AudioManager.sounds || !AudioManager.sounds['narratorRecruitment']) {
      setTimeout(onNarratorDone, 4500);
    }
  },

  // 信号发射 + 星球缩小 + 卷轴同步展开
  _sendSignal() {
    const ringsContainer = document.getElementById('s2-signal-rings');
    ringsContainer.innerHTML = '';
    const hero = document.getElementById('s2-hero-planet');

    AudioManager.play('publish');

    // 波纹扩散（视觉装饰，不阻塞流程）
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.className = 's2-signal-ring';
      ringsContainer.appendChild(ring);

      anime({
        targets: ring,
        width: [60, 500],
        height: [60, 500],
        opacity: [0.8, 0],
        borderWidth: [2, 0.5],
        duration: 1000,
        delay: i * 200,
        easing: 'easeOutQuad'
      });
    }

    // 星球缩小上移，同时准备卷轴
    anime({
      targets: hero,
      top: ['15vh', '3vh'],
      scale: [1, 0.4],
      duration: 700,
      easing: 'easeInOutCubic',
      complete: () => {
        this._startBroadcast();
      }
    });
  },

  _startBroadcast() {
    const scroll = document.getElementById('scroll-container');
    scroll.style.display = '';

    const scrollBody = document.getElementById('scroll-body');
    AudioManager.play('scrollOpen');
    scrollBody.classList.add('unrolled');

    const planetName = App.state.planetName || '未命名';

    // 标题打完后同步播放音频+内容打字
    this._scrollDone = false;
    const onScrollDone = () => {
      if (this._scrollDone) return;
      this._scrollDone = true;
      this._fadeOutAndNext();
    };

    this.typed = new Typed('#scroll-title', {
      strings: [`✦ ${planetName}星球 · 移民招募令`],
      typeSpeed: 60,
      showCursor: false,
      onComplete: () => {
        AudioManager.playNarrator('narratorScrollContent', onScrollDone);
        this._typeContent();
        // 兜底：没有旁白音频时按内容打字时长推进
        if (!AudioManager.sounds || !AudioManager.sounds['narratorScrollContent']) {
          setTimeout(onScrollDone, 6000);
        }
      }
    });
  },

  _typeContent() {
    const planetName = App.state.planetName || '未命名';
    const content = [
      `${planetName}星球正式开放移民通道！`,
      '名额有限，走过路过不要错过。',
      '快来星球移民审核官处接受审核吧！'
    ].join('<br>');

    this._typedContent = new Typed('#scroll-content', {
      strings: [content],
      typeSpeed: 140,
      showCursor: false
    });
  },

  // 淡出全部 → 直接进入 S3
  _fadeOutAndNext() {
    const scroll = document.getElementById('scroll-container');
    const hero = document.getElementById('s2-hero-planet');

    anime({
      targets: [scroll, hero],
      opacity: [1, 0],
      duration: 600,
      easing: 'easeInCubic',
      complete: () => {
        scroll.style.display = 'none';
        App.goToScreen(3);
      }
    });
  },

  leave() {
    if (this.typed) { this.typed.destroy(); this.typed = null; }
    if (this._typedContent) { this._typedContent.destroy(); this._typedContent = null; }
    if (this._typedSubtitle) { this._typedSubtitle.destroy(); this._typedSubtitle = null; }
    AudioManager.stopNarrator('narratorRecruitment');
    AudioManager.stopNarrator('narratorScrollContent');
  }
};
