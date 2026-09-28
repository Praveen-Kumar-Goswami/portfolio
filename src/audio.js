/** Procedural cabin score. Starts only after the toggle, so autoplay policy stays intact. */

const CHORDS = {
  flight: { a: 49, b: 73.42, cut: 420 },
  about: { a: 65.41, b: 98, cut: 720 },
  skills: { a: 73.42, b: 110, cut: 880 },
  projects: { a: 87.31, b: 130.81, cut: 1100 },
  study: { a: 82.41, b: 123.47, cut: 980 },
  career: { a: 87.31, b: 130.81, cut: 1100 },
  vision: { a: 92.5, b: 138.59, cut: 1200 },
  health: { a: 98, b: 146.83, cut: 1040 },
  hackathon: { a: 73.42, b: 110, cut: 900 },
  education: { a: 61.74, b: 92.5, cut: 640 },
  contact: { a: 55, b: 82.41, cut: 520 },
};

export function createScore() {
  let ctx = null;
  let master = null;
  let oscA = null;
  let oscB = null;
  let filter = null;
  let audible = false;
  let section = 'about';

  function ensure() {
    if (ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0;

    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20;
    comp.knee.value = 18;
    comp.ratio.value = 3;
    comp.attack.value = 0.02;
    comp.release.value = 0.25;
    master.connect(comp);
    comp.connect(ctx.destination);

    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 700;
    filter.Q.value = 0.7;
    filter.connect(master);

    oscA = ctx.createOscillator();
    oscB = ctx.createOscillator();
    oscA.type = 'sine';
    oscB.type = 'triangle';
    const gA = ctx.createGain();
    const gB = ctx.createGain();
    gA.gain.value = 0.22;
    gB.gain.value = 0.07;
    oscA.connect(gA);
    oscB.connect(gB);
    gA.connect(filter);
    gB.connect(filter);
    oscA.frequency.value = CHORDS.about.a;
    oscB.frequency.value = CHORDS.about.b;
    oscA.start();
    oscB.start();

    const noiseLen = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.035;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 240;
    noiseFilter.Q.value = 0.6;
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noise.start();
  }

  function retune(name) {
    const chord = CHORDS[name] || CHORDS.about;
    if (!ctx) return;
    const t = ctx.currentTime;
    oscA.frequency.cancelScheduledValues(t);
    oscB.frequency.cancelScheduledValues(t);
    filter.frequency.cancelScheduledValues(t);
    oscA.frequency.linearRampToValueAtTime(chord.a, t + 1.3);
    oscB.frequency.linearRampToValueAtTime(chord.b, t + 1.3);
    filter.frequency.linearRampToValueAtTime(chord.cut, t + 1.3);
  }

  return {
    get audible() {
      return audible;
    },
    setSection(name) {
      if (!CHORDS[name]) return;
      section = name;
      if (audible) retune(name);
    },
    async toggle() {
      ensure();
      if (ctx.state === 'suspended') await ctx.resume();
      audible = !audible;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.linearRampToValueAtTime(audible ? 0.2 : 0, t + 0.35);
      if (audible) retune(section);
      return audible;
    },
    whoosh() {
      if (!ctx || !audible) return;
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      const len = Math.floor(ctx.sampleRate * 0.7);
      const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      src.buffer = buffer;
      const band = ctx.createBiquadFilter();
      band.type = 'bandpass';
      band.Q.value = 0.8;
      band.frequency.setValueAtTime(180, t);
      band.frequency.exponentialRampToValueAtTime(1600, t + 0.45);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      src.connect(band);
      band.connect(gain);
      gain.connect(ctx.destination);
      src.start(t);
      src.stop(t + 0.72);
    },
  };
}
