/**
 * Screen 4: 深度表达 · 邀请身边的人
 * 三步流程（每步前有飞行员串词过渡）：
 *   Step 1: 选人（飞行员引导 → 点击麦克风说出来）
 *   Step 2: 星球相处说明书（飞行员过渡 → 录音回答）
 *   Step 3: 封面语总结（飞行员过渡 + 名言示例 → 录音回答）
 *   完成后：飞行员收束 → 显示按钮进入下一环节
 */
const Invite = {
  _currentStep: 1,
  _recording: false,
  _micEnabled: false,
  _typedInstance: null,

  // 飞行员串词配置：每步的旁白文字 + 音频key
  _pilotLines: {
    // Step 1 只播音频，不弹对话框
    1: { text: null, audioKey: 'narratorS4Step1' },
    2: {
      text: '太好了！为了让ta愿意和你一起居住在这个星球，你会怎么和ta相处，为ta做哪些事呢？',
      audioKey: 'narratorS4Step2'
    },
    3: {
      text: '嘿！所以你觉得人与人相处最重要的事情是什么？用一句话总结一下吧！',
      audioKey: 'narratorS4Step3'
    },
    finish: {
      text: '恭喜，你的星球故事收集完毕！',
      audioKey: 'narratorS4Finish'
    }
  },

  init() {
    this._bindMic();
    this._bindFinishButton();
  },

  enter() {
    this._currentStep = 1;
    this._recording = false;
    this._micEnabled = false;

    // 重置所有步骤显示（用 class 控制，不设 inline display）
    document.querySelectorAll('#screen-4 .s4-step').forEach(el => {
      el.classList.remove('active');
      el.style.removeProperty('display');
      el.style.removeProperty('opacity');
      el.style.removeProperty('transform');
    });

    // 重置麦克风
    const micWrap = document.getElementById('s4MicWrap');
    micWrap.classList.remove('recording');
    micWrap.style.display = '';
    micWrap.style.opacity = '1';

    // 隐藏完成按钮、飞行员对话框
    document.getElementById('btn-to-panorama').style.display = 'none';
    const s4Bar = document.getElementById('s4-assistant-bar');
    if (s4Bar) { s4Bar.style.display = 'none'; s4Bar.style.opacity = '1'; }

    // 进入 Step 1
    this._enterStep(1);
  },

  // ============ 飞行员对话框（与 Screen 3 同款） ============

  _showAssistantDialog(text) {
    const bar = document.getElementById('s4-assistant-bar');
    const msgEl = document.getElementById('s4-assistant-message');

    bar.style.display = 'flex';
    msgEl.textContent = '';

    if (this._typedInstance) {
      this._typedInstance.destroy();
      this._typedInstance = null;
    }

    this._typedInstance = new Typed('#s4-assistant-message', {
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

  _hideAssistantDialog(onDone) {
    const bar = document.getElementById('s4-assistant-bar');
    if (!bar || bar.style.display === 'none') {
      if (onDone) onDone();
      return;
    }
    anime({
      targets: bar,
      opacity: [1, 0],
      duration: 400,
      easing: 'easeInCubic',
      complete: () => {
        bar.style.display = 'none';
        bar.style.opacity = '1';
        if (this._typedInstance) {
          this._typedInstance.destroy();
          this._typedInstance = null;
        }
        if (onDone) onDone();
      }
    });
  },

  // ============ 步骤管理 ============

  _enterStep(step) {
    this._currentStep = step;
    this._recording = false;
    this._micEnabled = false;

    // 隐藏麦克风（等串词说完再显示）
    const micWrap = document.getElementById('s4MicWrap');
    micWrap.classList.remove('recording');
    micWrap.style.opacity = '0';
    micWrap.style.pointerEvents = 'none';
    micWrap.style.display = '';

    const hint = micWrap.querySelector('.mic-hint');
    const pilotLine = this._pilotLines[step];
    if (hint) hint.textContent = pilotLine ? '请先听飞行员说……' : '点击发言';

    // 隐藏所有步骤
    document.querySelectorAll('#screen-4 .s4-step').forEach(el => {
      el.classList.remove('active');
      el.style.removeProperty('display');
    });

    const stepEl = document.getElementById(`s4-step-${step}`);
    stepEl.style.removeProperty('display');
    stepEl.classList.add('active');

    // 淡入步骤内容
    stepEl.style.opacity = '0';
    anime({
      targets: stepEl,
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutCubic',
      complete: () => {
        stepEl.style.removeProperty('transform');
      }
    });

    // 播放飞行员串词
    if (pilotLine) {
      const audioKey = pilotLine.audioKey;
      const hasAudio = AudioManager.sounds && AudioManager.sounds[audioKey];

      // 修改4：Step 2 和 Step 3 不显示对话框，直接播音频+启用麦克风
      if (pilotLine.text && step !== 2 && step !== 3) {
        // 有文字且不是Step 2/3：弹对话框 → 播音频 → 对话框淡出 → 启用麦克风
        this._showAssistantDialog(pilotLine.text);
        const onAudioDone = () => {
          setTimeout(() => {
            this._hideAssistantDialog(() => this._enableMic());
          }, 600);
        };
        if (hasAudio) {
          AudioManager.playNarrator(audioKey, onAudioDone);
        } else {
          setTimeout(onAudioDone, 2500);
        }
      } else {
        // 无文字 或 Step 2/3：麦克风立即显示，音频同步播放
        this._enableMic();
        if (hasAudio) {
          AudioManager.playNarrator(audioKey);
        }
      }
    } else {
      this._enableMic();
    }
  },

  _enableMic() {
    this._micEnabled = true;
    const micWrap = document.getElementById('s4MicWrap');
    micWrap.style.pointerEvents = '';

    const hint = micWrap.querySelector('.mic-hint');
    if (hint) hint.textContent = '点击发言';

    anime({
      targets: micWrap,
      opacity: [0, 1],
      duration: 400,
      easing: 'easeOutCubic'
    });
  },

  // ============ 麦克风交互 ============

  _bindMic() {
    const micWrap = document.getElementById('s4MicWrap');
    if (!micWrap) return;

    micWrap.addEventListener('click', () => {
      if (!this._micEnabled) return;

      this._recording = !this._recording;
      if (this._recording) {
        micWrap.classList.add('recording');
        AudioManager.play('recordStart');
      } else {
        micWrap.classList.remove('recording');
        AudioManager.play('recordEnd');
        this._onStepRecordDone();
      }
    });
  },

  _onStepRecordDone() {
    this._micEnabled = false;

    if (this._currentStep < 3) {
      // 修复1：Step 1 不再播放反馈（已在环节三播放过），直接过渡到下一步
      const currentStepEl = document.getElementById(`s4-step-${this._currentStep}`);
      anime({
        targets: currentStepEl,
        opacity: [1, 0],
        duration: 400,
        easing: 'easeInQuad',
        complete: () => {
          currentStepEl.classList.remove('active');
          currentStepEl.style.removeProperty('display');
          currentStepEl.style.removeProperty('opacity');
          currentStepEl.style.removeProperty('transform');
          this._enterStep(this._currentStep + 1);
        }
      });
    } else {
      // 三步全部完成 → 飞行员收束语 → 显示完成按钮
      this._showFinishWithPilot();
    }
  },

  _showFinishWithPilot() {
    const pilotLine = this._pilotLines.finish;

    this._showAssistantDialog(pilotLine.text);

    const hasAudio = AudioManager.sounds && AudioManager.sounds[pilotLine.audioKey];
    const onDone = () => {
      setTimeout(() => {
        this._hideAssistantDialog(() => {
          this._showFinishButton();
        });
      }, 600);
    };

    if (hasAudio) {
      AudioManager.playNarrator(pilotLine.audioKey, onDone);
    } else {
      setTimeout(onDone, 1200);
    }
  },

  _showFinishButton() {
    // 隐藏麦克风
    const micWrap = document.getElementById('s4MicWrap');
    anime({
      targets: micWrap,
      opacity: [1, 0],
      duration: 300,
      easing: 'easeInQuad',
      complete: () => {
        micWrap.style.display = 'none';
      }
    });

    const btn = document.getElementById('btn-to-panorama');
    btn.style.display = 'inline-flex';
    btn.style.opacity = '0';
    anime({
      targets: btn,
      opacity: [0, 1],
      duration: 600,
      delay: 300,
      easing: 'easeOutCubic'
    });
  },

  _bindFinishButton() {
    const btn = document.getElementById('btn-to-panorama');
    if (!btn) return;
    btn.addEventListener('click', () => {
      App.goToScreen(5);
    });
  },

  leave() {
    if (this._typedInstance) {
      this._typedInstance.destroy();
      this._typedInstance = null;
    }
    AudioManager.stopAllNarrators && AudioManager.stopAllNarrators();
  }
};
