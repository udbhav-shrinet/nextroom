// Universal Audio Engine & Studio DSP Rack for NextRoom
class AudioEngine {
  constructor() {
    this.ctx = null;
    this.radioAudioEl = null;
    this.radioSource = null;
    this.directAudioEl = null;
    this.isDirectMode = false;
    this.isPlaying = false;
    this.currentStation = null;
    this.volume = 0.8;
    this.muted = false;

    // Master DSP Nodes
    this.masterGain = null;
    this.limiter = null;
    this.analyser = null;
    this.stereoPanner = null;
    this.saturationNode = null;
    this.convolver = null;
    this.reverbGain = null;
    this.dryGain = null;
    this.muffleFilter1 = null;
    this.muffleFilter2 = null;
    this.isMuffled = false;

    // 10-Band EQ
    this.eqBands = [];
    this.eqFrequencies = [31, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    this.eqGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // FX states
    this.saturationAmount = 0;
    this.reverbWet = 0.2;
    this.orbit8D = false;
    this.orbitAngle = 0;
    this.orbitSpeed = 0.05;
    this.varispeed = 1.0;

    // Ambience Stem Nodes
    this.ambienceGain = null;
    this.stemNodes = new Map(); // stemId -> { gain, pan, filter, generator }
    this.activeStemIntervals = new Map();

    // Procedural Lo-Fi Synth
    this.synthActive = false;
    this.synthTimer = null;

    // WebSocket Bridge for local amp CLI
    this.ws = null;
    this.wsConnected = false;

    // Listeners
    // Recorder & Sleep Timer
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.sleepTimer = null;
    this.sleepTimeLeft = 0;
    this.streamDest = null;
    this.subscribers = new Set();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify(event, data) {
    for (const sub of this.subscribers) {
      try {
        sub(event, data);
      } catch (err) {
        console.error('AudioEngine subscriber error:', err);
      }
    }
  }

  async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);

    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-1.0, this.ctx.currentTime);
    this.limiter.knee.setValueAtTime(0, this.ctx.currentTime);
    this.limiter.ratio.setValueAtTime(20.0, this.ctx.currentTime);
    this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.limiter.release.setValueAtTime(0.1, this.ctx.currentTime);

    // Spectrum Analyser (128-bin / fftSize 256)
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.85;

    // Saturation wave shaper
    this.saturationNode = this.ctx.createWaveShaper();
    this.updateSaturationCurve(0);

    // 8D Stereo panner
    this.stereoPanner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    // Door Muffle Filters (cascaded 24dB low-pass)
    this.muffleFilter1 = this.ctx.createBiquadFilter();
    this.muffleFilter1.type = 'lowpass';
    this.muffleFilter1.frequency.setValueAtTime(22000, this.ctx.currentTime);

    this.muffleFilter2 = this.ctx.createBiquadFilter();
    this.muffleFilter2.type = 'lowpass';
    this.muffleFilter2.frequency.setValueAtTime(22000, this.ctx.currentTime);

    // Algorithmic Reverb
    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = this.createReverbImpulse(2.5, 2.0);
    this.reverbGain = this.ctx.createGain();
    this.reverbGain.gain.setValueAtTime(this.reverbWet, this.ctx.currentTime);
    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.setValueAtTime(1.0 - this.reverbWet * 0.5, this.ctx.currentTime);

    // Ambience Master bus
    this.ambienceGain = this.ctx.createGain();
    this.ambienceGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.ambienceGain.connect(this.masterGain);

    // Setup 10-band EQ
    let prevNode = null;
    this.eqBands = this.eqFrequencies.map((freq, idx) => {
      const filter = this.ctx.createBiquadFilter();
      if (idx === 0) {
        filter.type = 'lowshelf';
      } else if (idx === this.eqFrequencies.length - 1) {
        filter.type = 'highshelf';
      } else {
        filter.type = 'peaking';
        filter.Q.setValueAtTime(1.4, this.ctx.currentTime);
      }
      filter.frequency.setValueAtTime(freq, this.ctx.currentTime);
      filter.gain.setValueAtTime(this.eqGains[idx] || 0, this.ctx.currentTime);
      return filter;
    });

    for (let i = 0; i < this.eqBands.length - 1; i++) {
      this.eqBands[i].connect(this.eqBands[i + 1]);
    }

    // Connect DSP Chain:
    // eqBands[last] -> saturationNode -> muffleFilter1 -> muffleFilter2 -> dry/wet split
    // dry/wet -> stereoPanner -> masterGain -> limiter -> analyser -> destination
    const lastEq = this.eqBands[this.eqBands.length - 1];
    lastEq.connect(this.saturationNode);
    this.saturationNode.connect(this.muffleFilter1);
    this.muffleFilter1.connect(this.muffleFilter2);

    this.muffleFilter2.connect(this.dryGain);
    this.muffleFilter2.connect(this.convolver);
    this.convolver.connect(this.reverbGain);

    const postReverbBus = this.ctx.createGain();
    this.dryGain.connect(postReverbBus);
    this.reverbGain.connect(postReverbBus);

    if (this.stereoPanner) {
      postReverbBus.connect(this.stereoPanner);
      this.stereoPanner.connect(this.masterGain);
    } else {
      postReverbBus.connect(this.masterGain);
    }

    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.analyser);
        this.streamDest = this.ctx.createMediaStreamDestination();
    this.analyser.connect(this.streamDest);
    this.analyser.connect(this.ctx.destination);

    // Create audio elements
    this.radioAudioEl = new Audio();
    this.radioAudioEl.crossOrigin = 'anonymous';
    this.radioAudioEl.preload = 'none';

    this.directAudioEl = new Audio();
    this.directAudioEl.preload = 'none';

    this.setupAudioListeners();
    this.start8DLoop();
    this.connectWebSocketBridge();

    this.notify('ready');
  }

  setupAudioListeners() {
    this.radioAudioEl.addEventListener('playing', () => {
      this.isPlaying = true;
      this.synthActive = false;
      this.stopProceduralSynth();
      this.notify('playState', { isPlaying: true, isDirect: false });
    });

    this.radioAudioEl.addEventListener('waiting', () => {
      this.notify('buffering', true);
    });

    this.radioAudioEl.addEventListener('error', (e) => {
      console.warn('CORS or playback error on Web Audio element, switching to direct element fallback...', e);
      this.fallbackToDirectStream();
    });

    this.directAudioEl.addEventListener('playing', () => {
      this.isPlaying = true;
      this.isDirectMode = true;
      this.synthActive = false;
      this.stopProceduralSynth();
      this.notify('playState', { isPlaying: true, isDirect: true });
    });

    this.directAudioEl.addEventListener('error', () => {
      console.warn('Both stream elements failed. Launching procedural Lo-Fi synth fallback!');
      this.fallbackToProceduralSynth();
    });
  }

  async playStation(station) {
    await this.init();
    this.currentStation = station;
    this.isDirectMode = false;

    // Reset direct audio
    this.directAudioEl.pause();
    this.directAudioEl.src = '';

    // Connect source node once
    if (!this.radioSource && this.radioAudioEl) {
      try {
        this.radioSource = this.ctx.createMediaElementSource(this.radioAudioEl);
        this.radioSource.connect(this.eqBands[0]);
      } catch (err) {
        console.warn('MediaElementSource error:', err);
      }
    }

    try {
      this.radioAudioEl.src = station.url;
      this.radioAudioEl.playbackRate = this.varispeed;
      await this.radioAudioEl.play();
      this.isPlaying = true;
      this.synthActive = false;
      this.notify('stationChanged', station);
    } catch (err) {
      console.warn('Direct play error:', err);
      this.fallbackToDirectStream();
    }
  }

  fallbackToDirectStream() {
    if (!this.currentStation) return;
    this.radioAudioEl.pause();
    this.radioAudioEl.src = '';
    this.isDirectMode = true;

    try {
      this.directAudioEl.src = this.currentStation.url;
      this.directAudioEl.volume = this.volume;
      this.directAudioEl.play().then(() => {
        this.isPlaying = true;
        this.notify('directMode', true);
      }).catch((e) => {
        console.warn('Direct stream also blocked, starting synth:', e);
        this.fallbackToProceduralSynth();
      });
    } catch {
      this.fallbackToProceduralSynth();
    }
  }

  fallbackToProceduralSynth() {
    this.radioAudioEl.pause();
    this.directAudioEl.pause();
    this.isDirectMode = false;
    this.synthActive = true;
    this.isPlaying = true;
    this.startProceduralSynth();
    this.notify('synthFallback', true);
  }

  pause() {
    if (this.radioAudioEl) this.radioAudioEl.pause();
    if (this.directAudioEl) this.directAudioEl.pause();
    this.stopProceduralSynth();
    this.isPlaying = false;
    this.notify('playState', { isPlaying: false, isDirect: this.isDirectMode });
  }

  resume() {
    if (this.synthActive) {
      this.startProceduralSynth();
      this.isPlaying = true;
      this.notify('playState', { isPlaying: true });
    } else if (this.isDirectMode) {
      this.directAudioEl.play();
    } else if (this.radioAudioEl && this.radioAudioEl.src) {
      this.radioAudioEl.play();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (this.directAudioEl) {
      this.directAudioEl.volume = this.muted ? 0 : this.volume;
    }
    this.notify('volume', this.volume);
  }

  setMute(isMuted) {
    this.muted = isMuted;
    this.setVolume(this.volume);
  }

  // 10-Band EQ Controls
  setBandGain(index, gainDb) {
    if (index >= 0 && index < this.eqBands.length && this.ctx) {
      this.eqGains[index] = gainDb;
      this.eqBands[index].gain.setTargetAtTime(gainDb, this.ctx.currentTime, 0.05);
      this.notify('eqChanged', [...this.eqGains]);
    }
  }

  setEqPreset(gainsArray) {
    gainsArray.forEach((gain, idx) => {
      this.setBandGain(idx, gain);
    });
  }

  // Door Muffle (Next Room) Effect
  toggleDoorMuffle(active) {
    this.isMuffled = active;
    if (!this.ctx || !this.muffleFilter1) return;

    const targetFreq = active ? 380 : 22000;
    this.muffleFilter1.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.15);
    this.muffleFilter2.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.15);

    // Increase reverb send slightly when behind the door
    const wet = active ? 0.45 : this.reverbWet;
    this.reverbGain.gain.setTargetAtTime(wet, this.ctx.currentTime, 0.2);

    this.notify('muffleChanged', active);
  }

  // Varispeed (Nightcore vs Slowed + Reverb)
  setVarispeed(rate) {
    this.varispeed = rate;
    if (this.radioAudioEl) {
      this.radioAudioEl.playbackRate = rate;
    }
    this.notify('varispeedChanged', rate);
  }

  // Saturation (Soft tube / tape clipper)
  setSaturation(amount) {
    this.saturationAmount = amount;
    this.updateSaturationCurve(amount);
    this.notify('saturationChanged', amount);
  }

  updateSaturationCurve(k) {
    if (!this.saturationNode || !this.ctx) return;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    const factor = k * 50;

    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      if (k === 0) {
        curve[i] = x;
      } else {
        curve[i] = ((3 + factor) * x * 20 * deg) / (Math.PI + factor * Math.abs(x));
      }
    }
    this.saturationNode.curve = curve;
  }

  // Reverb generator
  createReverbImpulse(seconds, decay) {
    const rate = this.ctx.sampleRate;
    const length = rate * seconds;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const n = i;
      left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    return impulse;
  }

  setReverbWet(val) {
    this.reverbWet = Math.max(0, Math.min(1, val));
    if (this.reverbGain && this.ctx) {
      this.reverbGain.gain.setTargetAtTime(this.reverbWet, this.ctx.currentTime, 0.05);
      this.dryGain.gain.setTargetAtTime(1.0 - this.reverbWet * 0.4, this.ctx.currentTime, 0.05);
    }
    this.notify('reverbChanged', this.reverbWet);
  }

  // 8D Orbit Audio
  set8DOrbit(enabled, speed = 0.05) {
    this.orbit8D = enabled;
    this.orbitSpeed = speed;
    if (!enabled && this.stereoPanner && this.ctx) {
      this.stereoPanner.pan.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
    this.notify('orbitChanged', enabled);
  }

  start8DLoop() {
    const update = () => {
      if (this.orbit8D && this.stereoPanner && this.ctx) {
        this.orbitAngle += this.orbitSpeed;
        const panValue = Math.sin(this.orbitAngle);
        this.stereoPanner.pan.setValueAtTime(panValue, this.ctx.currentTime);
      }
      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  // Spectrum data reader for 128-bin visualizer
  getSpectrumData() {
    if (!this.analyser) {
      return new Uint8Array(128);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getWaveformData() {
    if (!this.analyser) {
      return new Uint8Array(128);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  // -------------------------------------------------------------
  // Ambience Stems Audio Graph & Procedural Generators
  // -------------------------------------------------------------
  initStem(stem) {
    if (!this.ctx) return;
    if (this.stemNodes.has(stem.id)) return;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(stem.defaultVol || 0, this.ctx.currentTime);

    const pan = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    if (pan) {
      pan.pan.setValueAtTime(stem.defaultPan || 0, this.ctx.currentTime);
    }

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(stem.tone || 3000, this.ctx.currentTime);

    // Chain: generator output -> filter -> pan -> gain -> ambienceGain
    if (pan) {
      filter.connect(pan);
      pan.connect(gain);
    } else {
      filter.connect(gain);
    }
    gain.connect(this.ambienceGain);

    const stemObj = { gain, pan, filter, stem, isRunning: false };
    this.stemNodes.set(stem.id, stemObj);

    if (stem.defaultVol > 0) {
      this.startStemSound(stem.id);
    }
  }

  setStemVolume(stemId, vol) {
    const obj = this.stemNodes.get(stemId);
    if (!obj || !this.ctx) return;
    obj.gain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);

    if (vol > 0 && !obj.isRunning) {
      this.startStemSound(stemId);
    } else if (vol === 0 && obj.isRunning) {
      this.stopStemSound(stemId);
    }
    this.notify('stemVolume', { stemId, vol });
  }

  setStemPan(stemId, panVal) {
    const obj = this.stemNodes.get(stemId);
    if (!obj || !obj.pan || !this.ctx) return;
    obj.pan.pan.setTargetAtTime(panVal, this.ctx.currentTime, 0.05);
  }

  startStemSound(stemId) {
    const obj = this.stemNodes.get(stemId);
    if (!obj || !this.ctx || obj.isRunning) return;
    obj.isRunning = true;

    const type = obj.stem.type;
    const ctx = this.ctx;

    // Generators by stem type
    if (type.includes('rain') || type === 'creek' || type === 'waves' || type.includes('noise')) {
      // Noise buffer based
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === 'brown_noise') {
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        } else if (type === 'pink_noise' || type.includes('rain')) {
          output[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = output[i];
          output[i] *= 2.0;
        } else {
          output[i] = white * 0.5;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      whiteNoise.connect(obj.filter);
      whiteNoise.start();
      obj.source = whiteNoise;

    } else if (type.includes('binaural')) {
      // Dual oscillator binaural beat
      const baseFreq = type.includes('gamma') ? 220 : type.includes('alpha') ? 200 : 160;
      const delta = type.includes('gamma') ? 40 : type.includes('alpha') ? 10 : 4;

      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();
      oscL.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      oscR.frequency.setValueAtTime(baseFreq + delta, ctx.currentTime);

      const panL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      const panR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      if (panL && panR) {
        panL.pan.setValueAtTime(-0.9, ctx.currentTime);
        panR.pan.setValueAtTime(0.9, ctx.currentTime);
        oscL.connect(panL);
        panL.connect(obj.filter);
        oscR.connect(panR);
        panR.connect(obj.filter);
      } else {
        oscL.connect(obj.filter);
        oscR.connect(obj.filter);
      }

      oscL.start();
      oscR.start();
      obj.oscillators = [oscL, oscR];

    } else if (type === 'fire') {
      // Fire crackle: low rumble oscillator + intermittent sharp noise pops
      const rumble = ctx.createOscillator();
      rumble.type = 'triangle';
      rumble.frequency.setValueAtTime(65, ctx.currentTime);
      rumble.connect(obj.filter);
      rumble.start();

      const crackleInterval = setInterval(() => {
        if (!obj.isRunning) {
          clearInterval(crackleInterval);
          return;
        }
        if (Math.random() > 0.4) {
          this.triggerPop(obj.filter, 0.03, Math.random() * 0.15 + 0.05);
        }
      }, 120);

      this.activeStemIntervals.set(stemId, crackleInterval);
      obj.oscillators = [rumble];

    } else if (type === 'keyboard') {
      // Mechanical keyboard thock clicks
      const keyInterval = setInterval(() => {
        if (!obj.isRunning) {
          clearInterval(keyInterval);
          return;
        }
        if (Math.random() > 0.3) {
          this.triggerKeyboardThock(obj.filter);
        }
      }, 180 + Math.random() * 120);

      this.activeStemIntervals.set(stemId, keyInterval);

    } else if (type === 'cat_purr') {
      // 25Hz low purr vibration
      const purrOsc = ctx.createOscillator();
      purrOsc.type = 'sawtooth';
      purrOsc.frequency.setValueAtTime(26, ctx.currentTime);

      const purrLfo = ctx.createOscillator();
      purrLfo.frequency.setValueAtTime(1.8, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(8, ctx.currentTime);
      purrLfo.connect(lfoGain);
      lfoGain.connect(purrOsc.frequency);

      purrOsc.connect(obj.filter);
      purrLfo.start();
      purrOsc.start();
      obj.oscillators = [purrOsc, purrLfo];

    } else {
      // Gentle melodic or drone harmonic
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(obj.stem.tone || 432, ctx.currentTime);
      osc.connect(obj.filter);
      osc.start();
      obj.oscillators = [osc];
    }
  }

  triggerPop(destNode, duration, intensity) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(800 + Math.random() * 1200, this.ctx.currentTime);
    gain.gain.setValueAtTime(intensity, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(destNode);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  triggerKeyboardThock(destNode) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160 + Math.random() * 80, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.08);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(destNode);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  stopStemSound(stemId) {
    const obj = this.stemNodes.get(stemId);
    if (!obj) return;
    obj.isRunning = false;

    if (obj.source) {
      try { obj.source.stop(); } catch {}
      obj.source = null;
    }
    if (obj.oscillators) {
      obj.oscillators.forEach(o => {
        try { o.stop(); } catch {}
      });
      obj.oscillators = null;
    }
    const interval = this.activeStemIntervals.get(stemId);
    if (interval) {
      clearInterval(interval);
      this.activeStemIntervals.delete(stemId);
    }
  }

  // -------------------------------------------------------------
  // Procedural Offline Lo-Fi Synth (Never silent fallback!)
  // -------------------------------------------------------------
  startProceduralSynth() {
    this.stopProceduralSynth();
    if (!this.ctx) return;

    // Chords: Cmaj7, Am7, Dm7, G7
    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [196.00, 246.94, 293.66, 349.23]  // G7
    ];
    let chordIdx = 0;

    const playNextBar = () => {
      if (!this.isPlaying) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      // Play soft Rhodes chord
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.03);

        const now = this.ctx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

        osc.connect(gain);
        gain.connect(this.eqBands[0]);
        osc.start(now + i * 0.03);
        osc.stop(now + 3.4);
      });

      // Play soft sub-bass note
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(notes[0] / 2, this.ctx.currentTime);
      bassGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.4);

      bassOsc.connect(bassGain);
      bassGain.connect(this.eqBands[0]);
      bassOsc.start(this.ctx.currentTime);
      bassOsc.stop(this.ctx.currentTime + 2.5);

      this.synthTimer = setTimeout(playNextBar, 3200);
    };

    playNextBar();
  }

  stopProceduralSynth() {
    if (this.synthTimer) {
      clearTimeout(this.synthTimer);
      this.synthTimer = null;
    }
  }

  // -------------------------------------------------------------
  // 8-Pad Lo-Fi Sampler (Real Audio Synthesis)
  // -------------------------------------------------------------
  playPad(padIndex) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    switch (padIndex) {
      case 0: { // 1: Warm Rhodes Chord
        [261.63, 329.63, 392.00, 493.88].forEach(freq => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          g.gain.setValueAtTime(0.15, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
          osc.connect(g);
          g.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 1.25);
        });
        break;
      }
      case 1: { // 2: Deep Lo-Fi Kick
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);
        g.gain.setValueAtTime(0.8, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 2: { // 3: Crisp Snare
        const noise = this.ctx.createBufferSource();
        const b = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
        const data = b.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        noise.buffer = b;
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.4, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        noise.connect(g);
        g.connect(this.masterGain);
        noise.start(now);
        break;
      }
      case 3: { // 4: Hi-Hat Sizzle
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(7500, now);
        g.gain.setValueAtTime(0.2, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }
      case 4: { // 5: Vinyl Rewind Scratch
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.2);
        osc.frequency.linearRampToValueAtTime(200, now + 0.35);
        g.gain.setValueAtTime(0.25, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 5: { // 6: Thunder Clap
        this.triggerPop(this.masterGain, 0.4, 0.5);
        break;
      }
      case 6: { // 7: Singing Bowl Harmonics
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(528, now);
        g.gain.setValueAtTime(0.35, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 2.5);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 2.6);
        break;
      }
      case 7: { // 8: Water Drop Plink
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        g.gain.setValueAtTime(0.3, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      }
      default:
        break;
    }
  }

  // -------------------------------------------------------------
  // WebSocket Bridge (ws://localhost:7474) for CLI
  // -------------------------------------------------------------
  connectWebSocketBridge() {
    try {
      this.ws = new WebSocket('ws://localhost:7474');
      this.ws.onopen = () => {
        this.wsConnected = true;
        this.notify('wsStatus', true);
      };
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleCliMessage(msg);
        } catch {}
      };
      this.ws.onclose = () => {
        this.wsConnected = false;
        this.notify('wsStatus', false);
        // Retry gently after 15s
        setTimeout(() => this.connectWebSocketBridge(), 15000);
      };
      this.ws.onerror = () => {
        this.wsConnected = false;
      };
    } catch {
      this.wsConnected = false;
    }
  }


  // -------------------------------------------------------------
  // Master DSP Recorder (MediaRecorder API)
  // -------------------------------------------------------------
  startRecording() {
    if (!this.streamDest) return false;
    this.recordedChunks = [];
    try {
      this.mediaRecorder = new MediaRecorder(this.streamDest.stream, { mimeType: 'audio/webm' });
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.recordedChunks.push(e.data);
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nextroom-session-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        this.notify('recordState', false);
      };
      this.mediaRecorder.start();
      this.isRecording = true;
      this.notify('recordState', true);
      return true;
    } catch (err) {
      console.warn('Recorder start error:', err);
      return false;
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.notify('recordState', false);
    }
  }

  // -------------------------------------------------------------
  // Sleep Timer with Gradual Volume Roll-off
  // -------------------------------------------------------------
  setSleepTimer(minutes) {
    if (this.sleepTimer) clearInterval(this.sleepTimer);
    if (!minutes || minutes <= 0) {
      this.sleepTimeLeft = 0;
      this.notify('sleepTimer', 0);
      return;
    }

    this.sleepTimeLeft = minutes * 60;
    const initialVol = this.volume;
    this.notify('sleepTimer', this.sleepTimeLeft);

    this.sleepTimer = setInterval(() => {
      this.sleepTimeLeft--;
      this.notify('sleepTimer', this.sleepTimeLeft);

      // Roll off volume smoothly in the final 2 minutes
      if (this.sleepTimeLeft <= 120 && this.sleepTimeLeft > 0) {
        this.setVolume((this.sleepTimeLeft / 120) * initialVol);
      } else if (this.sleepTimeLeft <= 0) {
        clearInterval(this.sleepTimer);
        this.sleepTimer = null;
        this.pause();
        this.setVolume(initialVol);
      }
    }, 1000);
  }

  handleCliMessage(msg) {
    if (msg.cmd === 'toggle') this.togglePlay();
    if (msg.cmd === 'volume') this.setVolume(msg.val);
    if (msg.cmd === 'muffle') this.toggleDoorMuffle(msg.val);
  }
}

export const audioEngine = new AudioEngine();
