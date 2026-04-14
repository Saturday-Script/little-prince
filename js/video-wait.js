/**
 * Screen 5: 视频等待页
 * 纪录片生成等待状态，浮动粒子 + 星球轨道动画
 */
const VideoWait = {
  init() {
    const btn = document.getElementById('btn-restart');
    if (btn) btn.addEventListener('click', () => location.reload());
  },

  enter() {
    // 设置星球图片匹配用户选择
    const img = document.getElementById('s5v-planet-img');
    const planetImg = document.getElementById('planet-img');
    if (img && planetImg) {
      img.src = planetImg.src;
    }

    // 生成浮动粒子
    this._generateParticles();

    // Typed.js 标题
    const titleEl = document.getElementById('s5v-title');
    if (titleEl) titleEl.textContent = '';

    new Typed('#s5v-title', {
      strings: ['你的专属星球纪录片正在生成中'],
      typeSpeed: 50,
      showCursor: false,
      onComplete: () => {
        const subtitle = document.getElementById('s5v-subtitle');
        if (subtitle) {
          subtitle.textContent = '我们正在将你的星球故事制作成一段独一无二的视频';
          anime({
            targets: subtitle,
            opacity: [0, 1],
            translateY: [10, 0],
            duration: 800,
            easing: 'easeOutCubic'
          });
        }
      }
    });
  },

  leave() {
    const container = document.getElementById('s5v-particles');
    if (container) container.innerHTML = '';
  },

  _generateParticles() {
    const container = document.getElementById('s5v-particles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 's5v-particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (8 + Math.random() * 12) + 's';
      p.style.animationDelay = (Math.random() * 10) + 's';
      const size = 2 + Math.random() * 4;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.opacity = 0.2 + Math.random() * 0.5;
      container.appendChild(p);
    }
  }
};
