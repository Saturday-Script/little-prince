/**
 * Screen 1: 星球DIY
 * 通过切换图片实现色调和装饰的组合
 * 风格来源：星球图 2
 */
const PlanetDIY = {
  planetName: '',
  planetColor: '',        // '' | 'blue' | 'pink'
  planetDeco: '',         // '' | 'cloud' | 'ring' | 'asteroid'

  // 图片映射表：color → { base, cloud, ring, asteroid }
  planetImages: {
    blue: {
      base: 'assets/images/planet/planet-blue.webp',
      cloud: 'assets/images/planet/planet-blue-cloud.webp',
      ring: 'assets/images/planet/planet-blue-ring.webp',
      asteroid: 'assets/images/planet/planet-blue-asteroid.webp'
    },
    pink: {
      base: 'assets/images/planet/planet-pink.webp',
      cloud: 'assets/images/planet/planet-pink-cloud.webp',
      ring: 'assets/images/planet/planet-pink-ring.webp',
      asteroid: 'assets/images/planet/planet-pink-asteroid.webp'
    }
  },

  init() {
    this._bindNameInput();
    this._bindColorPicker();
    this._bindDecorations();
    this._bindCreateButton();
    this._updatePlanetImage();
  },

  _getCurrentImageSrc() {
    if (!this.planetColor) return 'assets/images/planet/planet-base.webp';
    const map = this.planetImages[this.planetColor];
    return this.planetDeco ? (map[this.planetDeco] || map.base) : map.base;
  },

  _updatePlanetImage() {
    const planetImg = document.getElementById('planet-img');
    const src = this._getCurrentImageSrc();
    if (planetImg.src !== src) {
      planetImg.src = src;
      if (typeof anime !== 'undefined') {
        anime({
          targets: planetImg,
          scale: [0.95, 1],
          duration: 400,
          easing: 'easeOutElastic(1, .6)'
        });
      }
    }
  },

  _namingNarratorPlayed: false,

  _bindNameInput() {
    const input = document.getElementById('planet-name-input');
    const createBtn = document.getElementById('btn-create-planet');

    // 聚焦输入框时播放"起名"旁白（仅一次，等开场旁白结束）
    input.addEventListener('focus', () => {
      if (this._namingNarratorPlayed) return;
      this._namingNarratorPlayed = true;
      if (App.introNarratorDone) {
        AudioManager.playNarrator('narratorNaming');
      } else {
        // 开场旁白还在播，等它结束再播起名旁白
        const wait = setInterval(() => {
          if (App.introNarratorDone) {
            clearInterval(wait);
            AudioManager.playNarrator('narratorNaming');
          }
        }, 200);
      }
    });

    input.addEventListener('input', (e) => {
      this.planetName = e.target.value.trim();
      createBtn.disabled = !this.planetName;
      AudioManager.play('type');
    });
  },

  _decorateNarratorPlayed: false,

  _bindColorPicker() {
    const buttons = document.querySelectorAll('.color-btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        this.planetColor = btn.dataset.color;
        this._updatePlanetImage();
        AudioManager.play('click');

        // 首次选色时播放"装扮星球"旁白
        if (!this._decorateNarratorPlayed) {
          this._decorateNarratorPlayed = true;
          AudioManager.playNarrator('narratorDecorate');
        }
      });
    });
  },

  _bindDecorations() {
    const buttons = document.querySelectorAll('.deco-btn');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const deco = btn.dataset.deco;

        // 单选切换：再次点击取消选择
        if (this.planetDeco === deco) {
          this.planetDeco = '';
          btn.classList.remove('active');
        } else {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.planetDeco = deco;
        }

        this._updatePlanetImage();
        AudioManager.play('deco');
      });
    });
  },

  _bindCreateButton() {
    const btn = document.getElementById('btn-create-planet');
    btn.addEventListener('click', () => {
      if (!this.planetName) return;

      AudioManager.play('create');

      const planetContainer = document.querySelector('.planet-container');

      anime({
        targets: planetContainer,
        rotate: '0.5turn',
        scale: [1, 1.15, 1],
        duration: 600,
        easing: 'easeInOutQuad',
        complete: () => {
          App.state.planetName = this.planetName;
          App.state.planetColor = this.planetColor;
          App.state.planetDeco = this.planetDeco;
          this._updateOtherScreens();
          App.goToScreen(2);
        }
      });
    });
  },

  _updateOtherScreens() {
    // 获取当前星球图片路径
    const src = this._getCurrentImageSrc();

    // 更新mini-planet名称
    const miniNames = document.querySelectorAll('.mini-planet-name');
    miniNames.forEach(el => el.textContent = this.planetName);

    // 更新所有其他screen的星球图片（直接换src，不用滤镜）
    const allPlanetImgs = document.querySelectorAll('.mini-planet-img, .review-planet-img');
    allPlanetImgs.forEach(img => {
      img.src = src;
      img.style.filter = 'none';
    });

    // 更新星球名称标签
    const labels = document.querySelectorAll('#planet-label-3');
    labels.forEach(el => el.textContent = `${this.planetName}星球`);
  }
};
