/**
 * Screen 5: 全景合影 + 串场旁白 - Three.js 3D场景
 */
const Panorama = {
  scene: null,
  camera: null,
  renderer: null,
  planet: null,
  animationId: null,
  residents: [],
  _narrationTyped: null,
  _narrationTimeouts: [],

  async init() {
    // Three.js在进入Screen 5时才加载
  },

  async enter() {
    // 重置旁白和按钮状态（在 Three.js 加载之前，确保总是执行）
    const narrationOverlay = document.getElementById('narration-overlay');
    const videoBtn = document.getElementById('btn-watch-video');
    if (narrationOverlay) { narrationOverlay.style.display = 'none'; narrationOverlay.style.opacity = '0'; }
    if (videoBtn) videoBtn.style.display = 'none';

    // 绑定按钮
    document.getElementById('btn-save-planet').onclick = () => this._savePlanet();
    document.getElementById('btn-restart').onclick = () => location.reload();
    document.getElementById('btn-watch-video').onclick = () => App.goToScreen(6);

    // Three.js 3D 场景（允许失败，不影响旁白流程）
    try {
      if (typeof THREE === 'undefined') {
        await this._loadThreeJS();
      }
      this._setupScene();
      this._createPlanet();
      this._addResidents();
      this._addStars();
      this._animate();
    } catch (e) {
      console.warn('Three.js 场景加载失败，跳过3D渲染:', e);
    }

    this._showTitle();
    AudioManager.play('finale');

    // 标题显示4秒后开始旁白
    this._narrationTimeouts.push(setTimeout(() => {
      this._startNarration();
    }, 4000));
  },

  async _loadThreeJS() {
    return new Promise((resolve, reject) => {
      // 检查是否已有script标签
      if (document.querySelector('script[src*="three"]')) {
        // 等待加载完成
        const check = setInterval(() => {
          if (typeof THREE !== 'undefined') {
            clearInterval(check);
            resolve();
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
      script.onload = () => {
        // 加载OrbitControls（失败不阻断）
        const controlsScript = document.createElement('script');
        controlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/js/controls/OrbitControls.js';
        controlsScript.onload = resolve;
        controlsScript.onerror = () => {
          console.warn('OrbitControls 加载失败，跳过');
          resolve();
        };
        document.head.appendChild(controlsScript);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  _setupScene() {
    const container = document.getElementById('panorama-3d');
    const width = container.offsetWidth || window.innerWidth;
    const height = container.offsetHeight || window.innerHeight;

    // 场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060918);

    // 相机
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 6);

    // 渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // 控制器
    if (THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 1;
      this.controls.minDistance = 3;
      this.controls.maxDistance = 12;
    }

    // 灯光
    const ambientLight = new THREE.AmbientLight(0x404080, 0.6);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xfdcb6e, 1.5, 50);
    pointLight.position.set(5, 5, 5);
    this.scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x6c5ce7, 0.8, 50);
    pointLight2.position.set(-5, -3, 3);
    this.scene.add(pointLight2);

    // 响应窗口变化
    window.addEventListener('resize', () => {
      const w = container.offsetWidth || window.innerWidth;
      const h = container.offsetHeight || window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  },

  _createPlanet() {
    // 低多边形星球
    const geometry = new THREE.IcosahedronGeometry(1.5, 2);

    // 随机扰动顶点创建不规则表面
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const offset = 0.9 + Math.random() * 0.2;
      positions.setXYZ(i, x * offset, y * offset, z * offset);
    }
    geometry.computeVertexNormals();

    // 根据用户选择的色调设置颜色
    const hue = App.state.planetColor === 'pink' ? 0.95 : 0.6;
    const material = new THREE.MeshPhongMaterial({
      color: new THREE.Color().setHSL(hue, 0.5, 0.5),
      flatShading: true,
      shininess: 30
    });

    this.planet = new THREE.Mesh(geometry, material);
    this.scene.add(this.planet);

    // 大气光晕
    const glowGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.6, 0.6),
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.scene.add(glow);
  },

  _addResidents() {
    // 获取通过的角色和邀请的人
    const passed = (App.state.decisions || []).filter(d => d.action === 'pass');
    const invited = App.state.invitedPeople || [];
    const allResidents = [
      ...passed.map(d => ({ name: d.characterName, type: 'character', id: d.characterId })),
      ...invited.map(p => ({ name: p.name, type: 'invited', avatar: p.avatar }))
    ];

    allResidents.forEach((r, i) => {
      const angle = (Math.PI * 2 * i) / Math.max(allResidents.length, 1);
      const phi = Math.PI * 0.3 + Math.random() * Math.PI * 0.4;

      const x = 1.7 * Math.sin(phi) * Math.cos(angle);
      const y = 1.7 * Math.cos(phi);
      const z = 1.7 * Math.sin(phi) * Math.sin(angle);

      // 创建文字精灵
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');

      // 背景
      ctx.fillStyle = 'rgba(108, 92, 231, 0.6)';
      ctx.beginPath();
      ctx.roundRect(4, 4, 120, 56, 10);
      ctx.fill();

      // 名字
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.name, 64, 38);

      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(x, y, z);
      sprite.scale.set(0.6, 0.3, 1);

      this.scene.add(sprite);
      this.residents.push(sprite);
    });
  },

  _addStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starPositions = [];

    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      starPositions.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));

    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(stars);
  },

  _animate() {
    this.animationId = requestAnimationFrame(() => this._animate());

    if (this.planet) {
      this.planet.rotation.y += 0.002;
    }

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  },

  _showTitle() {
    const title = document.getElementById('panorama-title');
    const info = document.getElementById('panorama-info');
    const planetName = App.state.planetName || '未命名';

    const passedCount = (App.state.decisions || []).filter(d => d.action === 'pass').length;
    const invitedCount = (App.state.invitedPeople || []).length;

    new Typed('#panorama-title', {
      strings: [`${planetName}星球 · 诞生！`],
      typeSpeed: 60,
      showCursor: false
    });

    setTimeout(() => {
      info.textContent = `居民：${passedCount} 位角色 + ${invitedCount} 位特邀嘉宾`;
      anime({
        targets: info,
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 800
      });
    }, 2000);
  },

  // ====== 串场旁白 ======

  _getNarrationSegments() {
    const name = App.state.planetName || '未命名';
    return [
      `小王子有B612，我也有一颗自己的星球——${name}`,
      '为了挑选星球居民，我可是经历了层层选拔……',
      '招募可真累啊，不过我还有想邀请的特别嘉宾……',
      `相信在我和居民们共同的努力下，${name}会成为宇宙中最美好的星球`,
      '接下来，请观看属于你的星球纪录片——'
    ];
  },

  _startNarration() {
    const overlay = document.getElementById('narration-overlay');
    overlay.style.display = 'flex';
    anime({
      targets: overlay,
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutCubic'
    });

    this._playNarrationSegment(0);
  },

  _playNarrationSegment(index) {
    const segments = this._getNarrationSegments();
    if (index >= segments.length) {
      // 旁白结束，显示按钮
      this._showVideoButton();
      return;
    }

    const textEl = document.getElementById('narration-text');
    textEl.textContent = '';
    textEl.style.opacity = '1';

    // 销毁上一个 Typed 实例
    if (this._narrationTyped) {
      this._narrationTyped.destroy();
      this._narrationTyped = null;
    }

    this._narrationTyped = new Typed('#narration-text', {
      strings: [segments[index]],
      typeSpeed: 50,
      showCursor: true,
      cursorChar: '▍',
      onComplete: () => {
        // 打字完成后等1.5s，淡出，播下一段
        const t = setTimeout(() => {
          anime({
            targets: textEl,
            opacity: [1, 0],
            duration: 500,
            easing: 'easeInQuad',
            complete: () => {
              this._playNarrationSegment(index + 1);
            }
          });
        }, 1500);
        this._narrationTimeouts.push(t);
      }
    });
  },

  _showVideoButton() {
    const btn = document.getElementById('btn-watch-video');
    if (!btn || btn.style.display !== 'none') return;
    btn.style.display = 'inline-flex';
    anime({
      targets: btn,
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutBack'
    });
  },

  async _savePlanet() {
    // 使用html2canvas截图（简化版：直接用canvas toDataURL）
    try {
      const dataUrl = this.renderer.domElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${App.state.planetName || 'my-planet'}-星球合影.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Save failed:', e);
      alert('保存失败，请尝试截图保存');
    }
  },

  leave() {
    // 清理动画帧
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // 清理旁白
    if (this._narrationTyped) {
      this._narrationTyped.destroy();
      this._narrationTyped = null;
    }
    this._narrationTimeouts.forEach(t => clearTimeout(t));
    this._narrationTimeouts = [];
  }
};
