import { SoundscapeId } from '../types';

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private currentSound: SoundscapeId = 'muted';
  private volume = 0.25;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!this.ctx) {
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public stop(): void {
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(0, now, 0.08);
    }
    const nodesToClean = [...this.activeNodes];
    this.activeNodes = [];
    setTimeout(() => {
      nodesToClean.forEach((node) => {
        try {
          if ('stop' in node && typeof (node as AudioBufferSourceNode).stop === 'function') {
            (node as AudioBufferSourceNode).stop();
          }
          node.disconnect();
        } catch {
          // ignore already stopped nodes
        }
      });
    }, 180);
    this.currentSound = 'muted';
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && this.currentSound !== 'muted') {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.35, this.ctx.currentTime, 0.08);
    }
  }

  public play(sound: SoundscapeId, vol?: number): void {
    if (typeof vol === 'number') {
      this.volume = Math.max(0, Math.min(1, vol));
    }
    if (sound === 'muted') {
      this.stop();
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;

    this.stop();
    this.currentSound = sound;

    if (sound === 'binaural') {
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();
      const panLeft = ctx.createStereoPanner();
      const panRight = ctx.createStereoPanner();
      oscLeft.type = 'sine';
      oscRight.type = 'sine';
      oscLeft.frequency.value = 200;
      oscRight.frequency.value = 240; // 40 Hz Gamma Focus beat
      panLeft.pan.value = -0.85;
      panRight.pan.value = 0.85;

      const subGain = ctx.createGain();
      subGain.gain.value = 0.25;

      oscLeft.connect(panLeft);
      oscRight.connect(panRight);
      panLeft.connect(subGain);
      panRight.connect(subGain);
      subGain.connect(this.masterGain);

      oscLeft.start();
      oscRight.start();
      this.activeNodes.push(oscLeft, oscRight, panLeft, panRight, subGain);
    } else {
      // Synthesize smooth filtered noise buffer
      const bufferSize = ctx.sampleRate * 3;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const output = buffer.getChannelData(channel);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (sound === 'brown') {
            output[i] = (lastOut + 0.02 * white) / 1.02;
            lastOut = output[i];
            output[i] *= 3.2;
          } else if (sound === 'rain') {
            output[i] = (lastOut + 0.08 * white) / 1.08;
            lastOut = output[i];
            output[i] *= 1.6;
          } else {
            // soft cafe / library room tone
            output[i] = (lastOut + 0.04 * white) / 1.04;
            lastOut = output[i];
            output[i] *= 2.2;
          }
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = ctx.createBiquadFilter();
      if (sound === 'rain') {
        filter.type = 'bandpass';
        filter.frequency.value = 950;
        filter.Q.value = 0.6;
      } else if (sound === 'brown') {
        filter.type = 'lowpass';
        filter.frequency.value = 340;
      } else {
        filter.type = 'lowpass';
        filter.frequency.value = 620;
      }

      source.connect(filter);
      filter.connect(this.masterGain);
      source.start();
      this.activeNodes.push(source, filter);
    }

    const now = ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(this.volume * 0.35, now, 0.15);
  }
}

export const ambientAudio = new AmbientAudioEngine();
