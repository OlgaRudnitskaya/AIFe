// Simple working version with expansion
class AnimationController {
    constructor(panelId, canvasId, scrubberId) {
        this.panel = document.getElementById(panelId);
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scrubber = document.getElementById(scrubberId);
        
        this.images = [];
        this.coverImage = null;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.speed = 500;
        this.animationId = null;
        this.totalFrames = 24;
        this.isOnCover = true;
        this.isExpanded = false;
        
        this.createFrameButtons();
        this.setupControls();
        this.generateDemoContent();
        this.showCover(); // Show cover by default on startup
    }
    
    createFrameButtons() {
        this.scrubber.innerHTML = '';
        for (let i = 0; i < this.totalFrames; i++) {
            const btn = document.createElement('button');
            btn.className = 'frame-btn';
            btn.textContent = i + 1;
            btn.addEventListener('click', () => this.goToFrame(i));
            this.scrubber.appendChild(btn);
        }
        this.updateScrubber();
    }
    
    setupControls() {
        const playBtn = this.panel.querySelector('.play-btn');
        const pauseBtn = this.panel.querySelector('.pause-btn');
        const coverBtn = this.panel.querySelector('.cover-btn');
        const speedSlider = this.panel.querySelector('.speed-slider');
        const speedValue = this.panel.querySelector('.speed-value');
        const expandBtn = this.panel.querySelector('.expand-btn');
        
        playBtn.addEventListener('click', () => this.play());
        pauseBtn.addEventListener('click', () => this.pause());
        coverBtn.addEventListener('click', () => this.showCover());
        expandBtn.addEventListener('click', () => this.toggleExpand());
        
        // Set initial speed display (0.5 to 10)
        this.updateSpeedDisplay();
        
        speedSlider.addEventListener('input', (e) => {
            // Reverse the value for correct speed direction
            const rawValue = parseInt(e.target.value);
            const reversedValue = 2100 - rawValue; // 100-2000 becomes 2000-100
            this.speed = reversedValue;
            this.updateSpeedDisplay();
            
            if (this.isPlaying && !this.isPaused) {
                this.restartAnimation();
            }
        });
    }
    
    updateSpeedDisplay() {
        const speedValue = this.panel.querySelector('.speed-value');
        const speedPerSec = 1000 / this.speed;
        speedValue.textContent = speedPerSec.toFixed(1);
    }
    
    generateDemoContent() {
        // Create demo cover
        const coverCanvas = document.createElement('canvas');
        coverCanvas.width = 400;
        coverCanvas.height = 400;
        const coverCtx = coverCanvas.getContext('2d');
        
        coverCtx.fillStyle = '#e7f3ff';
        coverCtx.fillRect(0, 0, coverCanvas.width, coverCanvas.height);
        coverCtx.fillStyle = '#007acc';
        coverCtx.font = 'bold 32px Arial';
        coverCtx.textAlign = 'center';
        coverCtx.fillText('📊 COVER', coverCanvas.width / 2, coverCanvas.height / 2 - 20);
        coverCtx.fillStyle = '#333';
        coverCtx.font = '16px Arial';
        coverCtx.fillText('Average values', coverCanvas.width / 2, coverCanvas.height / 2 + 20);
        
        this.coverImage = new Image();
        this.coverImage.src = coverCanvas.toDataURL();
        
        // Create demo frames
        for (let i = 0; i < this.totalFrames; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            
            const hue = (i * 15) % 360;
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, `hsl(${hue}, 70%, 80%)`);
            gradient.addColorStop(1, `hsl(${hue + 180}, 70%, 80%)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#333';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`Frame ${i + 1}`, canvas.width / 2, canvas.height / 2);
            
            const img = new Image();
            img.src = canvas.toDataURL();
            this.images.push(img);
        }
    }
    
    showCover() {
        this.stop();
        this.isOnCover = true;
        if (this.coverImage) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.coverImage, 0, 0, this.canvas.width, this.canvas.height);
        }
        this.updateScrubber();
    }
    
    play() {
        if (this.isPlaying && !this.isPaused) return;
        
        this.isPlaying = true;
        this.isPaused = false;
        this.isOnCover = false;
        this.animate();
    }
    
    pause() {
        if (!this.isPlaying) return;
        
        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isPlaying || this.isPaused) return;
        
        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        this.drawFrame(this.currentFrame);
        this.updateScrubber();
        
        this.animationId = setTimeout(() => {
            this.animate();
        }, this.speed);
    }
    
    drawFrame(frameIndex) {
        if (this.images[frameIndex]) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.images[frameIndex], 0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    goToFrame(frameIndex) {
        this.stop();
        this.currentFrame = frameIndex;
        this.isOnCover = false;
        this.drawFrame(frameIndex);
        this.updateScrubber();
    }
    
    updateScrubber() {
        const frameBtns = this.scrubber.querySelectorAll('.frame-btn');
        frameBtns.forEach((btn, index) => {
            btn.classList.toggle('active', !this.isOnCover && index === this.currentFrame);
        });
    }
    
    restartAnimation() {
        if (this.isPlaying && !this.isPaused) {
            this.stop();
            this.play();
        }
    }
    
    toggleExpand() {
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            // Expand this panel
            this.panel.classList.add('expanded');
            // Create overlay
            const overlay = document.createElement('div');
            overlay.className = 'overlay active';
            overlay.addEventListener('click', () => this.toggleExpand());
            document.body.appendChild(overlay);
        } else {
            // Collapse this panel
            this.panel.classList.remove('expanded');
            // Remove overlay
            const overlay = document.querySelector('.overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }
}

// Initialize animations when page loads
window.addEventListener('load', function() {
    const animations = [];
    
    // Create 5 animation panels
    for (let i = 1; i <= 5; i++) {
        animations.push(new AnimationController(
            `panel${i}`,
            `canvas${i}`,
            `scrubber${i}`
        ));
    }
    
    // Global controls
    const globalPlayBtn = document.getElementById('global-play');
    const globalPauseBtn = document.getElementById('global-pause');
    const globalCoverBtn = document.getElementById('global-cover');
    const globalSpeedSlider = document.getElementById('global-speed');
    const globalSpeedValue = document.getElementById('global-speed-value');
    const globalScrubber = document.getElementById('global-scrubber');
    
    // Create global frame buttons
    for (let i = 0; i < 24; i++) {
        const btn = document.createElement('button');
        btn.className = 'frame-btn';
        btn.textContent = i + 1;
        btn.addEventListener('click', () => {
            animations.forEach(anim => anim.goToFrame(i));
        });
        globalScrubber.appendChild(btn);
    }
    
    // Set initial global speed display
    const updateGlobalSpeedDisplay = () => {
        const rawValue = parseInt(globalSpeedSlider.value);
        const reversedValue = 2100 - rawValue;
        const speedPerSec = 1000 / reversedValue;
        globalSpeedValue.textContent = speedPerSec.toFixed(1);
    };
    
    updateGlobalSpeedDisplay();
    
    globalPlayBtn.addEventListener('click', () => {
        animations.forEach(anim => anim.play());
    });
    
    globalPauseBtn.addEventListener('click', () => {
        animations.forEach(anim => anim.pause());
    });
    
    globalCoverBtn.addEventListener('click', () => {
        animations.forEach(anim => anim.showCover());
    });
    
    globalSpeedSlider.addEventListener('input', (e) => {
        updateGlobalSpeedDisplay();
        const rawValue = parseInt(e.target.value);
        const reversedValue = 2100 - rawValue;
        
        animations.forEach(anim => {
            anim.speed = reversedValue;
            anim.updateSpeedDisplay();
            if (anim.isPlaying && !anim.isPaused) {
                anim.restartAnimation();
            }
        });
    });
    
    console.log('Animations loaded successfully! All panels show covers by default.');
});
