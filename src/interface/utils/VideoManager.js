/**
 * Gestionnaire de vidéos - version simplifiée anti-freeze
 * Principe : ne JAMAIS spammer play(). Une seule tentative, pas de boucle agressive.
 */
export class VideoManager {
    constructor() {
        this.videos = new Map();
        this.isActive = true;
        this._contextLost = false;
        this._playInProgress = new Map();
        this.checkInterval = null;
    }

    onContextLost() {
        this._contextLost = true;
        this.stopMonitoring();
    }

    onContextRestored() {
        this._contextLost = false;
        this.videos.forEach((config, video) => {
            this._tryPlay(video);
        });
        this.startMonitoring();
    }

    register(video, options = {}) {
        if (!video || !(video instanceof HTMLVideoElement)) return;

        const config = {
            shouldLoop: options.loop !== false,
            shouldMute: options.muted !== false,
            onError: options.onError || null,
            onPlay: options.onPlay || null,
            name: options.name || 'video-' + this.videos.size
        };

        video.loop = config.shouldLoop;
        video.muted = config.shouldMute;
        video.playsInline = true;
        video.preload = 'auto';
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');

        this.videos.set(video, config);

        // Fallback si loop natif échoue (rare) - attendre que la vidéo soit prête
        video.addEventListener('ended', () => {
            if (config.shouldLoop && this.isActive && !this._contextLost && !video.loop) {
                video.currentTime = 0;
                this._tryPlay(video);
            }
        });

        // Listen for play success
        video.addEventListener('play', () => {
            if (config.onPlay) config.onPlay(video);
        });

        // Listen for errors - reload once
        let errorCount = 0;
        video.addEventListener('error', (e) => {
            if (config.onError) config.onError(e);
            if (errorCount < 2 && this.isActive && !this._contextLost) {
                errorCount++;
                setTimeout(() => {
                    video.load();
                    video.addEventListener('canplay', () => this._tryPlay(video), { once: true });
                }, 3000 * errorCount);
            }
        });
    }

    /**
     * Safe play - prevents concurrent play() calls on same video
     */
    _tryPlay(video) {
        if (!video || !this.isActive || this._contextLost) return;
        if (this._playInProgress.get(video)) return;

        this._playInProgress.set(video, true);
        const p = video.play();
        if (p && p.then) {
            p.then(() => { this._playInProgress.set(video, false); })
             .catch(() => { this._playInProgress.set(video, false); });
        } else {
            this._playInProgress.set(video, false);
        }
    }

    /**
     * Gentle monitoring - check every 10s if a video stopped unexpectedly
     */
    startMonitoring(interval = 10000) {
        if (this.checkInterval) return;

        this.checkInterval = setInterval(() => {
            if (!this.isActive || this._contextLost) return;

            this.videos.forEach((config, video) => {
                // Ne relancer que si la vidéo est vraiment stoppée ET a assez de données
                // readyState >= 3 (HAVE_FUTURE_DATA) = évite de spam play() pendant le buffering
                if (video.paused && !video.ended && config.shouldLoop && video.readyState >= 3) {
                    this._tryPlay(video);
                }
            });
        }, interval);
    }

    stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    unregister(video) {
        this.videos.delete(video);
        this._playInProgress.delete(video);
    }

    unregisterAll() {
        this.videos.clear();
        this._playInProgress.clear();
    }

    disable() {
        this.isActive = false;
        this.stopMonitoring();
    }

    enable() {
        this.isActive = true;
        this.startMonitoring();
    }

    destroy() {
        this.disable();
        this.unregisterAll();
    }
}

// Instance singleton
export const videoManager = new VideoManager();
