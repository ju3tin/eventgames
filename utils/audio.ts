export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  
  // State
  private isMuted: boolean = false;
  private isPlayingBgm: boolean = false;
  
  // Sequencer
  private nextNoteTime: number = 0;
  private timerID: number | undefined;
  private step: number = 0;
  private tempo: number = 115; // Driving BPM
  private lookahead: number = 25.0; // ms
  private scheduleAheadTime: number = 0.1; // s

  constructor() {}

  init() {
    if (this.ctx) return;
    
    // 1. Create Context
    const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
    this.ctx = new AudioContextClass();

    // 2. Create Mastering Chain (Compressor -> Master Gain -> Out)
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
    this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.6; // Keep it from blowing ears out

    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound Effects (SFX) ---

  playJump() {
    if (!this.ctx || this.isMuted) return;
    this.resume();
    const t = this.ctx.currentTime;

    // "Whoosh" noise (Hydraulics)
    const noise = this.createNoiseBuffer();
    const noiseSrc = this.ctx.createBufferSource();
    noiseSrc.buffer = noise;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(400, t);
    noiseFilter.frequency.exponentialRampToValueAtTime(3000, t + 0.2);
    
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.compressor!);
    noiseSrc.start(t);

    // Subtle tonal lift
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(300, t + 0.3);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.1, t);
    oscGain.gain.linearRampToValueAtTime(0, t + 0.3);
    
    osc.connect(oscGain);
    oscGain.connect(this.compressor!);
    osc.start(t);
    osc.stop(t + 0.4);
  }
  
  playCoin() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Dual sine for a "shimmering" effect
    const createPing = (freq: number, delay: number) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + delay);
        
        gain.gain.setValueAtTime(0, t + delay);
        gain.gain.linearRampToValueAtTime(0.15, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.5);

        osc.connect(gain);
        gain.connect(this.compressor!);
        osc.start(t + delay);
        osc.stop(t + delay + 0.6);
    }

    // A Major 7th arpeggio feeling
    createPing(1760, 0);   // A6
    createPing(2217, 0.05); // C#7
  }

  playSlide() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Filtered Noise for friction
    const buffer = this.createNoiseBuffer();
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(200, t + 0.4); // Pitch down friction
    filter.Q.value = 1;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor!);
    source.start(t);
  }

  playCrash() {
    if (!this.ctx || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Deep impact noise
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer();
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, t);
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.6);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.compressor!);
    noise.start(t);

    // Discordant saws
    [100, 105, 140].forEach(f => {
        const osc = this.ctx!.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = f;
        const og = this.ctx!.createGain();
        og.gain.setValueAtTime(0.2, t);
        og.gain.linearRampToValueAtTime(0, t+0.5);
        osc.connect(og);
        og.connect(this.compressor!);
        osc.start(t);
        osc.stop(t+0.5);
    });
  }

  // --- Music Engine (Procedural Synthwave) ---

  startBGM() {
    if (this.isPlayingBgm) return;
    this.init();
    if (!this.ctx) return;
    this.resume();
    
    this.isPlayingBgm = true;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.step = 0;
    this.scheduler();
  }

  stopBGM() {
    this.isPlayingBgm = false;
    if (this.timerID) clearTimeout(this.timerID);
  }

  private scheduler() {
    if (!this.isPlayingBgm || !this.ctx) return;
    
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.nextNoteTime);
      const secondsPerBeat = 60.0 / this.tempo;
      // 16th notes
      this.nextNoteTime += 0.25 * secondsPerBeat;
    }
    this.timerID = window.setTimeout(() => this.scheduler(), this.lookahead);
  }

  private scheduleNote(time: number) {
    if (!this.ctx || this.isMuted) return;
    
    const step16 = this.step % 16;
    
    // 1. Kick (Four on the floor)
    if (step16 % 4 === 0) {
       this.triggerKick(time);
    }
    
    // 2. Snare / Clap (Backbeat)
    if (step16 % 8 === 4) {
       this.triggerSnare(time);
    }

    // 3. HiHats (Running 16ths)
    if (step16 % 2 === 0) { 
        // 8th notes are louder
        this.triggerHat(time, 0.15); 
    } else {
        // Off-beats quieter
        this.triggerHat(time, 0.05);
    }

    // 4. Driving Bassline (Rolling 16ths)
    // E-flat minor / Cyberpunk feel
    const root = 77.78; // Eb2
    const min3 = 92.50; // Gb2
    
    // Pattern: Root... Root... Min3...
    let freq = root;
    if (step16 >= 12) freq = min3; // Lift at the end of the bar

    // Sidechain effect: Bass is quieter when Kick hits (step % 4 === 0)
    const velocity = (step16 % 4 === 0) ? 0.3 : 0.6; 
    
    this.triggerBass(time, freq, velocity);

    this.step++;
  }

  // --- Instruments ---

  private triggerKick(time: number) {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      // Pitch drop
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
      
      // Amplitude envelope
      gain.gain.setValueAtTime(1, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

      osc.connect(gain);
      gain.connect(this.compressor!);
      osc.start(time);
      osc.stop(time + 0.5);
  }

  private triggerSnare(time: number) {
      // Noise burst + Low tone
      const noise = this.ctx!.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      const noiseFilter = this.ctx!.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.value = 800;
      const noiseGain = this.ctx!.createGain();
      noiseGain.gain.setValueAtTime(0.5, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.compressor!);
      noise.start(time);
      noise.stop(time + 0.2);

      // Body tone
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, time);
      const oscGain = this.ctx!.createGain();
      oscGain.gain.setValueAtTime(0.3, time);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      
      osc.connect(oscGain);
      oscGain.connect(this.compressor!);
      osc.start(time);
      osc.stop(time + 0.2);
  }

  private triggerHat(time: number, vol: number) {
      const noise = this.ctx!.createBufferSource();
      noise.buffer = this.createNoiseBuffer();
      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 6000;
      
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor!);
      noise.start(time);
  }

  private triggerBass(time: number, freq: number, vol: number) {
      // "Super Saw" approximation: 2 detuned sawtooths
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(freq, time);
      osc2.frequency.setValueAtTime(freq, time);
      
      // Detune
      osc2.detune.value = 15; // cents

      const filter = this.ctx!.createBiquadFilter();
      filter.type = 'lowpass';
      filter.Q.value = 4;
      
      // Filter Envelope (The "Wub")
      filter.frequency.setValueAtTime(200, time);
      filter.frequency.exponentialRampToValueAtTime(1500, time + 0.05);
      filter.frequency.exponentialRampToValueAtTime(200, time + 0.2);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(vol * 0.4, time);
      gain.gain.linearRampToValueAtTime(0, time + 0.25);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.compressor!);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + 0.3);
      osc2.stop(time + 0.3);
  }

  // Helper
  private createNoiseBuffer() {
      if (!this.ctx) return this.ctx!.createBuffer(1, 1, 22050);
      const bufferSize = this.ctx.sampleRate * 2; // 2 seconds
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
  }
}

export const audioManager = new AudioManager();