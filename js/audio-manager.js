/**
 * 音效管理器 - 基于Howler.js
 * 管理BGM、操作音效、角色配音
 * 所有音频使用 html5:true 模式，确保 file:// 协议下可用
 */
const AudioManager = {
  sounds: {},
  bgm: null,
  muted: false,

  init() {
    // BGM - 宇宙空灵背景音乐
    this.bgm = new Howl({
      src: ['assets/audio/bgm/space-ambient.mp3'],
      html5: true,
      loop: true,
      volume: 0.3,
      preload: true
    });

    // 操作音效
    this.sounds.click = new Howl({
      src: ['assets/audio/sfx/click.mp3'],
      html5: true, volume: 0.5
    });

    this.sounds.type = new Howl({
      src: ['assets/audio/sfx/type.mp3'],
      html5: true, volume: 0.3
    });

    this.sounds.create = new Howl({
      src: ['assets/audio/sfx/create.mp3'],
      html5: true, volume: 0.6
    });

    this.sounds.scrollOpen = new Howl({
      src: ['assets/audio/sfx/scroll-open.mp3'],
      html5: true, volume: 0.5
    });

    this.sounds.publish = new Howl({
      src: ['assets/audio/sfx/publish.mp3'],
      html5: true, volume: 0.6
    });

    this.sounds.whoosh = new Howl({
      src: ['assets/audio/sfx/whoosh.mp3'],
      html5: true, volume: 0.4
    });

    this.sounds.pass = new Howl({
      src: ['assets/audio/sfx/pass.mp3'],
      html5: true, volume: 0.5
    });

    this.sounds.reject = new Howl({
      src: ['assets/audio/sfx/reject.mp3'],
      html5: true, volume: 0.4
    });

    this.sounds.recordStart = new Howl({
      src: ['assets/audio/sfx/record-start.mp3'],
      html5: true, volume: 0.5
    });

    this.sounds.recordEnd = new Howl({
      src: ['assets/audio/sfx/record-end.mp3'],
      html5: true, volume: 0.5
    });

    this.sounds.welcome = new Howl({
      src: ['assets/audio/sfx/welcome.mp3'],
      html5: true, volume: 0.5
    });

    this.sounds.finale = new Howl({
      src: ['assets/audio/sfx/finale.mp3'],
      html5: true, volume: 0.6
    });

    this.sounds.deco = new Howl({
      src: ['assets/audio/sfx/deco.mp3'],
      html5: true, volume: 0.4
    });

    // 飞行员旁白语音
    this.sounds.narratorIntro = new Howl({
      src: ['assets/audio/narrator/s1-intro.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorNaming = new Howl({
      src: ['assets/audio/narrator/s1-naming.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorDecorate = new Howl({
      src: ['assets/audio/narrator/s1-decorate.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorRecruitment = new Howl({
      src: ['assets/audio/narrator/s2-recruitment.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorScrollContent = new Howl({
      src: ['assets/audio/narrator/s2-scroll-content.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorS3Welcome = new Howl({
      src: ['assets/audio/narrator/s3-welcome.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorRoseSignal = new Howl({
      src: ['assets/audio/narrator/s3-rose-signal.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorKingSignal = new Howl({
      src: ['assets/audio/narrator/s3-king-signal.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorVainSignal = new Howl({
      src: ['assets/audio/narrator/s3-vain-signal.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorMerchantSignal = new Howl({
      src: ['assets/audio/narrator/s3-merchant-signal.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorStampPrompt = new Howl({
      src: ['assets/audio/narrator/s3-stamp-prompt.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorRecordPrompt = new Howl({
      src: ['assets/audio/narrator/s3-record-prompt.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorPassReaction = new Howl({
      src: ['assets/audio/narrator/s3-pass-reaction.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorRejectReaction = new Howl({
      src: ['assets/audio/narrator/s3-reject-reaction.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorS3SelectPrompt = new Howl({
      src: ['assets/audio/narrator/s3-select-prompt.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorS4Transition = new Howl({
      src: ['assets/audio/narrator/s4-transition.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorMicPrompt = new Howl({
      src: ['assets/audio/narrator/s4-mic-prompt.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorS4Step1 = new Howl({
      src: ['assets/audio/narrator/s4-step1.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorS4Step2 = new Howl({
      src: ['assets/audio/narrator/s4-step2.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorS4Step3 = new Howl({
      src: ['assets/audio/narrator/s4-step3.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorS4Finish = new Howl({
      src: ['assets/audio/narrator/s4-finish.mp3'],
      html5: true, volume: 0.8
    });
    this.sounds.narratorS5Narration = new Howl({
      src: ['assets/audio/narrator/s5-narration.mp3'],
      html5: true, volume: 0.8
    });

    // 角色配音
    this.sounds.voiceRose = new Howl({
      src: ['assets/audio/voice/rose.mp3'],
      html5: true, volume: 0.7
    });

    this.sounds.voiceKing = new Howl({
      src: ['assets/audio/voice/king.mp3'],
      html5: true, volume: 0.7
    });

    this.sounds.voiceVain = new Howl({
      src: ['assets/audio/voice/vain.mp3'],
      html5: true, volume: 0.7
    });

    this.sounds.voiceMerchant = new Howl({
      src: ['assets/audio/voice/merchant.mp3'],
      html5: true, volume: 0.7
    });

    // 绑定静音按钮
    this._bindToggle();
  },

  _bindToggle() {
    const btn = document.getElementById('audio-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      this.muted = !this.muted;
      Howler.mute(this.muted);
      btn.querySelector('.audio-on').style.display = this.muted ? 'none' : 'inline';
      btn.querySelector('.audio-off').style.display = this.muted ? 'inline' : 'none';
    });
  },

  playBGM() {
    try {
      if (this.bgm && !this.bgm.playing()) this.bgm.play();
    } catch (e) { /* 静默跳过 */ }
  },

  stopBGM() {
    if (this.bgm) this.bgm.stop();
  },

  fadeBGM(to, duration = 1000) {
    if (this.bgm) this.bgm.fade(this.bgm.volume(), to, duration);
  },

  play(name) {
    try {
      if (this.sounds[name]) this.sounds[name].play();
    } catch (e) { /* 音频未加载，静默跳过 */ }
  },

  stop(name) {
    if (this.sounds[name]) {
      this.sounds[name].stop();
    }
  },

  // 播放角色配音
  playVoice(characterId) {
    const voiceMap = {
      rose: 'voiceRose',
      king: 'voiceKing',
      vain: 'voiceVain',
      merchant: 'voiceMerchant'
    };
    const soundKey = voiceMap[characterId];
    try {
      if (soundKey && this.sounds[soundKey]) return this.sounds[soundKey].play();
    } catch (e) { /* 静默跳过 */ }
  },

  // 播放旁白语音，返回 Howl sound id；支持 onEnd 回调
  playNarrator(name, onEnd) {
    try {
      if (this.sounds[name]) {
        const id = this.sounds[name].play();
        if (onEnd) {
          this.sounds[name].once('end', onEnd, id);
        }
        return id;
      }
    } catch (e) { /* 静默跳过 */ }
  },

  stopNarrator(name) {
    if (this.sounds[name]) this.sounds[name].stop();
  },

  stopAllNarrators() {
    for (const [key, sound] of Object.entries(this.sounds)) {
      if (key.startsWith('narrator')) sound.stop();
    }
  },

  stopVoice(characterId) {
    const voiceMap = {
      rose: 'voiceRose',
      king: 'voiceKing',
      vain: 'voiceVain',
      merchant: 'voiceMerchant'
    };
    const soundKey = voiceMap[characterId];
    if (soundKey && this.sounds[soundKey]) {
      this.sounds[soundKey].stop();
    }
  }
};
