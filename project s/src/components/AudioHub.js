/**
 * AudioHub Component
 * Silent audio scaffold respecting browser autoplay policies.
 * Ready to receive ambient soundtracks, subtle environmental textures,
 * or voice clips in later phases without breaking the experience if disabled.
 */
export class AudioHub {
  constructor(toggleBtnId = 'audio-toggle') {
    this.toggleBtn = document.getElementById(toggleBtnId);
    this.soundWave = this.toggleBtn?.querySelector('.sound-wave');
    this.isPlaying = false;
    this.audioElement = null;

    this.bindEvents();
  }

  bindEvents() {
    this.toggleBtn?.addEventListener('click', () => {
      this.togglePlayback();
    });
  }

  togglePlayback() {
    if (!this.audioElement) {
      // In Phase 1, simply toggle visual indicator state gracefully
      this.isPlaying = !this.isPlaying;
      this.updateState();
      return;
    }

    if (this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
    } else {
      this.audioElement.play().catch(() => {
        this.isPlaying = false;
      });
      this.isPlaying = true;
    }
    this.updateState();
  }

  updateState() {
    if (this.soundWave) {
      this.soundWave.classList.toggle('active', this.isPlaying);
    }
    if (this.toggleBtn) {
      this.toggleBtn.setAttribute('aria-pressed', String(this.isPlaying));
    }
  }

  /**
   * Future Integration Hook (Phase 2+)
   * Assigns an audio file source (e.g. ambient night wind or bespoke soundtrack).
   */
  loadTrack(src, loop = true) {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.audioElement = new Audio(src);
    this.audioElement.loop = loop;
    this.audioElement.volume = 0.5;
  }
}
