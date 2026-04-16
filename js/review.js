/**
 * Screen 3: 移民面试
 * 流程：4角色同时登场（带简历）→ 学生点击选1个 → 角色居中 + 录音说理由 → 过渡到环节四
 */
const Review = {
  selectedCharacter: null,
  currentTyped: null,
  _fakeRecording: false,

  init() {
    this._bindRecordButton();
  },

  enter() {
    this.selectedCharacter = null;
    this._fakeRecording = false;
    this._hideAssistantBar();
    this._hideSelectedPhase();

    // 欢迎旁白
    this._showAssistantMessage('欢迎来到移民审核办公室！看看这些申请者的简历，选一个你最想要的居民吧！');

    AudioManager.playNarrator('narratorS3Welcome', () => {
      setTimeout(() => this._renderCandidates(), 300);
    });

    // 兜底：没有旁白音频时直接渲染
    if (!AudioManager.sounds || !AudioManager.sounds['narratorS3Welcome']) {
      setTimeout(() => this._renderCandidates(), 1500);
    }
  },

  // ============ 渲染候选人网格 ============

  _renderCandidates() {
    const grid = document.getElementById('candidates-grid');
    if (grid.children.length > 0) return;

    grid.innerHTML = '';
    grid.style.display = '';
    grid.style.opacity = '1';

    Characters.list.forEach(char => {
      const card = document.createElement('div');
      card.className = 'candidate-card';
      card.dataset.charId = char.id;
      card.innerHTML = `
        <div class="candidate-img-wrap">
          <img src="${char.image}" alt="${char.name}">
        </div>
        <div class="candidate-resume">
          <div class="resume-header">
            <span class="resume-title">📋 移民申请档案</span>
          </div>
          <div class="resume-body">
            <div class="resume-field">
              <span class="resume-label">姓名</span>
              <span class="resume-value">${char.name}</span>
            </div>
            <div class="resume-field">
              <span class="resume-label">性格</span>
              <span class="resume-value">${char.trait}</span>
            </div>
            <div class="resume-field">
              <span class="resume-label">出处</span>
              <span class="resume-value">${char.chapter}</span>
            </div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => this._onSelectCharacter(char));
      grid.appendChild(card);
    });

    // 入场动画
    AudioManager.play('whoosh');
    anime({
      targets: '.candidate-card',
      opacity: [0, 1],
      translateY: [60, 0],
      scale: [0.8, 1],
      delay: anime.stagger(120, { start: 100 }),
      duration: 600,
      easing: 'easeOutBack'
    });
  },

  // ============ 选择角色 ============

  _onSelectCharacter(char) {
    if (this.selectedCharacter) return;
    this.selectedCharacter = char;

    AudioManager.play('pass');

    // 1) 淡出整个候选人网格
    const grid = document.getElementById('candidates-grid');
    anime({
      targets: grid,
      opacity: [1, 0],
      duration: 500,
      easing: 'easeInQuad',
      complete: () => {
        grid.style.display = 'none';
      }
    });

    // 2) 显示飞行员提问（通用文案，不带角色名）
    this._showAssistantMessage('告诉我，你为什么想要ta成为你的星球居民？');

    // 3) 播放音频，音频结束后 → 淡出对话框 → 展示录音界面
    const proceed = () => {
      // 对话框停留一会儿再淡出
      setTimeout(() => this._fadeOutAssistantThen(char), 800);
    };

    const hasAudio = AudioManager.sounds && AudioManager.sounds['narratorS3SelectPrompt'];
    if (hasAudio) {
      AudioManager.playNarrator('narratorS3SelectPrompt', proceed);
    } else {
      // 没有音频时，等文字打完 + 停留一会
      setTimeout(proceed, 2500);
    }
  },

  _fadeOutAssistantThen(char) {
    const bar = document.getElementById('assistant-bar');
    anime({
      targets: bar,
      opacity: [1, 0],
      duration: 400,
      easing: 'easeInQuad',
      complete: () => {
        bar.style.display = 'none';
        bar.style.opacity = '1';
        this._showSelectedPhase(char);
      }
    });
  },

  // ============ 选中后：居中展示 + 录音按钮 ============

  _showSelectedPhase(char) {
    const phase = document.getElementById('s3-selected-phase');
    const cardSlot = document.getElementById('s3-selected-card');
    const hint = document.getElementById('s3-record-hint');
    const btn = document.getElementById('s3-record-btn');

    // 填充角色内容（复用 candidate-card + data-char-id 让 tuner 调参样式生效）
    cardSlot.classList.add('candidate-card');
    cardSlot.dataset.charId = char.id;
    cardSlot.innerHTML = `
      <div class="candidate-img-wrap">
        <img src="${char.image}" alt="${char.name}">
      </div>
      <div class="candidate-resume">
        <div class="resume-header">
          <span class="resume-title">📋 移民申请档案</span>
        </div>
        <div class="resume-body">
          <div class="resume-field">
            <span class="resume-label">姓名</span>
            <span class="resume-value">${char.name}</span>
          </div>
          <div class="resume-field">
            <span class="resume-label">性格</span>
            <span class="resume-value">${char.trait}</span>
          </div>
          <div class="resume-field">
            <span class="resume-label">出处</span>
            <span class="resume-value">${char.chapter}</span>
          </div>
        </div>
      </div>
    `;

    btn.classList.remove('recording');
    hint.textContent = '点击开始录音';
    phase.style.display = 'flex';

    // 入场动画
    anime({
      targets: phase,
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutCubic'
    });

    anime({
      targets: cardSlot,
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutCubic'
    });

    anime({
      targets: [btn, hint],
      scale: [0.5, 1],
      opacity: [0, 1],
      delay: 300,
      duration: 500,
      easing: 'easeOutBack',
      complete: () => {
        // 入场后持续上下晃动吸引注意
        btn.classList.add('s3-mic-attract');
      }
    });
  },

  _hideSelectedPhase() {
    const phase = document.getElementById('s3-selected-phase');
    phase.style.display = 'none';
    phase.style.opacity = '';
    const cardSlot = document.getElementById('s3-selected-card');
    cardSlot.innerHTML = '';
    cardSlot.classList.remove('candidate-card');
    delete cardSlot.dataset.charId;
    document.getElementById('s3-record-btn').classList.remove('recording');
  },

  // ============ 录音交互 ============

  _bindRecordButton() {
    const btn = document.getElementById('s3-record-btn');
    const hint = document.getElementById('s3-record-hint');

    btn.addEventListener('click', () => {
      if (!this.selectedCharacter) return;

      if (!this._fakeRecording) {
        // 开始录音
        AudioManager.play('recordStart');
        this._fakeRecording = true;
        btn.classList.remove('s3-mic-attract');
        btn.classList.add('recording');
        hint.textContent = '录音中…再次点击结束';
        hint.style.color = '#fff';
        hint.style.textShadow = '0 0 10px rgba(255,200,130,0.8), 0 1px 3px rgba(0,0,0,0.5)';
      } else {
        // 结束录音 → 过渡到环节四
        AudioManager.play('recordEnd');
        this._fakeRecording = false;
        btn.classList.remove('recording');
        hint.textContent = '录音完成';
        hint.style.color = '';
        hint.style.textShadow = '';

        // 保存决定
        App.state.decisions = [{
          characterId: this.selectedCharacter.id,
          characterName: this.selectedCharacter.name,
          action: 'pass'
        }];

        // 禁用再次点击
        btn.style.pointerEvents = 'none';

        this._showAssistantMessage('你的想法很独特！现在，你的星球还有空位呢！想想你身边，还有谁值得一张宇宙船票呢？');

        AudioManager.playNarrator('narratorS4Transition', () => {
          setTimeout(() => App.goToScreen(4), 500);
        });

        // 兜底
        if (!AudioManager.sounds || !AudioManager.sounds['narratorS4Transition']) {
          setTimeout(() => App.goToScreen(4), 2000);
        }
      }
    });
  },

  // ============ 助手飞行员对话框 ============

  _showAssistantMessage(text) {
    const bar = document.getElementById('assistant-bar');
    const msgEl = document.getElementById('assistant-message');

    bar.style.display = 'flex';
    msgEl.textContent = '';

    if (this.currentTyped) this.currentTyped.destroy();
    this.currentTyped = new Typed('#assistant-message', {
      strings: [text],
      typeSpeed: 30,
      showCursor: true,
      cursorChar: '▍'
    });

    anime({
      targets: bar,
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutCubic'
    });
  },

  _hideAssistantBar() {
    const bar = document.getElementById('assistant-bar');
    bar.style.display = 'none';
    if (this.currentTyped) {
      this.currentTyped.destroy();
      this.currentTyped = null;
    }
  },

  // ============ 离开清理 ============

  leave() {
    this._fakeRecording = false;
    this._hideAssistantBar();
    this._hideSelectedPhase();

    const grid = document.getElementById('candidates-grid');
    grid.innerHTML = '';
    grid.style.display = '';
    grid.style.opacity = '';

    const btn = document.getElementById('s3-record-btn');
    btn.style.pointerEvents = '';
    btn.classList.remove('recording');

    if (this.currentTyped) {
      this.currentTyped.destroy();
      this.currentTyped = null;
    }

    AudioManager.stopAllNarrators && AudioManager.stopAllNarrators();
  }
};
