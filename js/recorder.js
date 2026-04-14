/**
 * 录音 + 波形可视化 - 基于wavesurfer.js
 */
const Recorder = {
  wavesurfer: null,
  recordPlugin: null,
  isRecording: false,
  audioBlob: null,

  // 初始化wavesurfer实例（用于指定容器）
  createInstance(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    const ws = WaveSurfer.create({
      container: `#${containerId}`,
      waveColor: 'rgba(162, 155, 254, 0.5)',
      progressColor: 'rgba(108, 92, 231, 0.8)',
      cursorColor: '#fdcb6e',
      cursorWidth: 2,
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 70,
      normalize: true,
      backend: 'WebAudio'
    });

    return ws;
  },

  // 初始化录音功能
  async initRecorder(containerId) {
    // 如果wavesurfer.js的Record插件可用
    if (typeof WaveSurfer !== 'undefined' && WaveSurfer.Record) {
      return this._initWithPlugin(containerId);
    }
    // 降级方案：使用Web Audio API + Canvas
    return this._initWithWebAudio(containerId);
  },

  async _initWithPlugin(containerId) {
    try {
      const record = WaveSurfer.Record.create();
      this.wavesurfer = WaveSurfer.create({
        container: `#${containerId}`,
        waveColor: 'rgba(162, 155, 254, 0.6)',
        progressColor: 'rgba(108, 92, 231, 0.9)',
        height: 70,
        barWidth: 3,
        barGap: 2,
        barRadius: 3,
        plugins: [record]
      });
      this.recordPlugin = record;
      return true;
    } catch (e) {
      console.warn('WaveSurfer Record plugin not available, using fallback');
      return this._initWithWebAudio(containerId);
    }
  },

  // Web Audio API 降级方案
  async _initWithWebAudio(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return false;

    // 创建Canvas
    let canvas = container.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.width = container.offsetWidth || 400;
      canvas.height = 70;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      container.appendChild(canvas);
    }

    this._canvas = canvas;
    this._canvasCtx = canvas.getContext('2d');
    this._animationId = null;

    return true;
  },

  async startRecording(containerId) {
    this.isRecording = true;
    this.audioBlob = null;

    // 使用Record插件
    if (this.recordPlugin) {
      try {
        await this.recordPlugin.startRecording();
        return true;
      } catch (e) {
        console.error('Record plugin error:', e);
      }
    }

    // Web Audio API降级
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this._mediaRecorder = new MediaRecorder(stream);
      this._audioChunks = [];

      this._mediaRecorder.ondataavailable = (e) => {
        this._audioChunks.push(e.data);
      };

      this._mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(this._audioChunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
      };

      // 实时波形可视化
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      this._analyser = analyser;
      this._audioCtx = audioCtx;

      this._drawWaveform(containerId);
      this._mediaRecorder.start();

      return true;
    } catch (e) {
      console.error('Recording failed:', e);
      this.isRecording = false;
      return false;
    }
  },

  _drawWaveform(containerId) {
    if (!this.isRecording || !this._analyser) return;

    const canvas = this._canvas;
    const ctx = this._canvasCtx;
    if (!canvas || !ctx) return;

    const analyser = this._analyser;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!this.isRecording) return;
      this._animationId = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const barWidth = (width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * height * 0.9;

        // 渐变色彩
        const hue = (i / bufferLength) * 60 + 240; // 紫到蓝
        const lightness = 50 + (dataArray[i] / 255) * 30;
        ctx.fillStyle = `hsla(${hue}, 80%, ${lightness}%, 0.8)`;

        // 居中绘制
        const y = (height - barHeight) / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - 1, barHeight, 2);
        ctx.fill();

        // 发光效果
        ctx.shadowColor = `hsla(${hue}, 80%, 60%, 0.5)`;
        ctx.shadowBlur = 5;

        x += barWidth;
      }

      ctx.shadowBlur = 0;
    };

    draw();
  },

  async stopRecording() {
    this.isRecording = false;

    if (this._animationId) {
      cancelAnimationFrame(this._animationId);
      this._animationId = null;
    }

    // Record插件
    if (this.recordPlugin) {
      try {
        const blob = await this.recordPlugin.stopRecording();
        this.audioBlob = blob;
        return blob;
      } catch (e) {
        console.error('Stop recording error:', e);
      }
    }

    // Web Audio API降级
    return new Promise((resolve) => {
      if (this._mediaRecorder && this._mediaRecorder.state !== 'inactive') {
        this._mediaRecorder.onstop = () => {
          this.audioBlob = new Blob(this._audioChunks, { type: 'audio/webm' });
          if (this._audioCtx) {
            this._audioCtx.close();
            this._audioCtx = null;
          }
          resolve(this.audioBlob);
        };
        this._mediaRecorder.stop();
      } else {
        resolve(null);
      }
    });
  },

  // 在指定容器中渲染静态波形（用于波形卡片展示）
  renderStaticWaveform(containerId, audioBlob) {
    if (!audioBlob) return;

    const container = document.getElementById(containerId);
    if (!container) return;

    // 用wavesurfer渲染
    const ws = WaveSurfer.create({
      container: `#${containerId}`,
      waveColor: 'rgba(162, 155, 254, 0.6)',
      progressColor: 'rgba(253, 203, 110, 0.8)',
      height: 40,
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      interact: false,
      cursorWidth: 0
    });

    const url = URL.createObjectURL(audioBlob);
    ws.load(url);

    return ws;
  },

  // 清理
  destroy() {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
      this.wavesurfer = null;
    }
    if (this._audioCtx) {
      this._audioCtx.close();
      this._audioCtx = null;
    }
    this.isRecording = false;
  }
};
