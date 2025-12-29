// Simple Audio Synthesizer for UI Sounds
// Uses Web Audio API to avoid loading external assets and allow procedural variation

class SoundManager {
    private ctx: AudioContext | null = null;
    private enabled: boolean = true;

    private getContext(): AudioContext {
        if (!this.ctx) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Ctx = window.AudioContext || (window as any).webkitAudioContext;
            this.ctx = new Ctx();
        }
        return this.ctx!;
    }

    public play(type: 'click' | 'success' | 'delete' | 'pop' | 'swipe') {
        if (!this.enabled) return;
        try {
            const ctx = this.getContext();
            // Resume context if suspended (browser autoplay policy)
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;

            switch (type) {
                case 'click':
                    // Short high-pitch tick
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(800, now);
                    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
                    gain.gain.setValueAtTime(0.3, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
                    osc.start(now);
                    osc.stop(now + 0.05);
                    break;

                case 'pop':
                    // Bubble pop sound
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(400, now);
                    osc.frequency.linearRampToValueAtTime(800, now + 0.1);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
                    osc.start(now);
                    osc.stop(now + 0.1);
                    break;

                case 'success':
                    // Pleasant ascending major triad (C-E-G roughly)
                    this.playNote(523.25, now, 0.1); // C5
                    setTimeout(() => this.playNote(659.25, ctx.currentTime, 0.1), 80); // E5
                    break;

                case 'delete':
                    // Descending low tone
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(300, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
                    osc.start(now);
                    osc.stop(now + 0.2);
                    break;

                case 'swipe':
                    // Soft white noise-ish swish (using filtered saw roughly)
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(200, now);
                    gain.gain.setValueAtTime(0.05, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
                    osc.start(now);
                    osc.stop(now + 0.15);
                    break;
            }
        } catch (e) {
            console.error('Audio play failed', e);
        }
    }

    private playNote(freq: number, startTime: number, duration: number) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.1, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }
}

export const sounds = new SoundManager();
