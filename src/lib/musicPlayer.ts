import { Howl } from 'howler';

class MusicPlayer {
  private static instance: MusicPlayer;
  private sound: Howl | null = null;
  private isPlaying = false;

  private constructor() {
    this.sound = new Howl({
      src: ['/songs/OST.mp3'],
      autoplay: false,
      loop: true,
      volume: 0.23,
      html5: true,
    });
  }

  public static getInstance(): MusicPlayer {
    if (!MusicPlayer.instance) {
      MusicPlayer.instance = new MusicPlayer();
    }
    return MusicPlayer.instance;
  }

  public play() {
    if (this.sound && !this.isPlaying) {
      this.sound.play();
      this.isPlaying = true;
    }
  }

  public pause() {
    if (this.sound && this.isPlaying) {
      this.sound.pause();
      this.isPlaying = false;
    }
  }
  
  public toggle(shouldPlay: boolean) {
    if (shouldPlay) {
      this.play();
    } else {
      this.pause();
    }
  }

  public setVolume(volume: number) {
    if (this.sound) {
      this.sound.volume(volume);
    }
  }
}

export const musicPlayer = MusicPlayer.getInstance();