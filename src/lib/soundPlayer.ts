import { Howl } from 'howler';

export enum SoundType {
  BUTTON_CLICK = 'button',
  WALK = 'walk',
  VICTORY = 'victory',
  BREAK_PLANK = 'break_plank',
  UNLOCK = 'unlock',
}

class SoundPlayer {
  private sounds: Map<SoundType, Howl> = new Map();
  private isEnabled: boolean = true;
  private walkSoundId: number | null = null;
  private globalVolume: number = 1.0;

  constructor() {
    this.sounds.set(SoundType.BUTTON_CLICK, new Howl({ src: ['/fx/button.mp3'], volume: 1.0 }));
    this.sounds.set(SoundType.WALK, new Howl({ src: ['/fx/shagi.mp3'], loop: false, volume: 0.86 }));
    this.sounds.set(SoundType.VICTORY, new Howl({ src: ['/fx/victory.mp3'], volume: 1.14 }));
    this.sounds.set(SoundType.BREAK_PLANK, new Howl({ src: ['/fx/lom.mp3'], volume: 1.28 }));
    this.sounds.set(SoundType.UNLOCK, new Howl({ src: ['/fx/key.mp3'], volume: 1.28 }));
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  public setVolume(volume: number) {
    this.globalVolume = volume;
    this.sounds.forEach((sound, type) => {
        // Find original relative volume and apply global volume
        const baseVolume = this.getBaseVolume(type);
        sound.volume(baseVolume * this.globalVolume);
    });
  }

  private getBaseVolume(type: SoundType): number {
      switch(type) {
        case SoundType.BUTTON_CLICK: return 1.0;
        case SoundType.WALK: return 0.86;
        case SoundType.VICTORY: return 1.14;
        case SoundType.BREAK_PLANK: return 1.28;
        case SoundType.UNLOCK: return 1.28;
        default: return 1.0;
      }
  }
  
  public play(type: SoundType) {
    if (!this.isEnabled) return;
    const sound = this.sounds.get(type);
    if (sound) {
      sound.volume(this.getBaseVolume(type) * this.globalVolume);
      if (type === SoundType.WALK) {
        if (!sound.playing()) {
          this.walkSoundId = sound.play();
        }
      } else {
        sound.play();
      }
    }
  }

  public stop(type: SoundType) {
    const sound = this.sounds.get(type);
    if (sound) {
      if (type === SoundType.WALK && this.walkSoundId !== null) {
        sound.stop(this.walkSoundId);
        this.walkSoundId = null;
      } else {
        sound.stop();
      }
    }
  }
  
  public stopAll() {
    this.sounds.forEach(sound => sound.stop());
    this.walkSoundId = null;
  }
}

export const soundPlayer = new SoundPlayer();