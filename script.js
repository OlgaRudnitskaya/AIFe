// Soundscape Animations with real images
class AnimationController {
    constructor(panelId, canvasId, scrubberId, animationConfig) {
        this.panel = document.getElementById(panelId);
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scrubber = document.getElementById(scrubberId);
        this.config = animationConfig;
        
        this.images = [];
        this.coverImage = null;
        this.currentFrame = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.speed = 500;
        this.animationId = null;
        this.totalFrames = 24;
        this.isOnCover = true;
        this.imagesLoaded = false;
        
        this.createFrameButtons();
        this.setupControls();
        this.loadImages();
    }
    
    createFrameButtons() {
        this.scrubber.innerHTML = '';
        for (let i = 0; i < this.totalFrames; i++) {
            const btn = document.createElement('button');
            btn.className = 'frame-btn';
            btn.textContent = `${i}:00`; // Format as 0:00, 1:00, etc.
            btn.title = `Frame ${i}:00`;
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
        
        playBtn.addEventListener('click', () => this.play());
        pauseBtn.addEventListener('click', () => this.pause());
        coverBtn.addEventListener('click', () => this.showCover());
        
        // Set initial speed display
        this.updateSpeedDisplay();
        
        speedSlider.addEventListener('input', (e) => {
            // Only allow speed changes when not playing
            if (!this.isPlaying && !window.isGlobalPlaying) {
                this.speed = parseInt(e.target.value);
                this.updateSpeedDisplay();
            }
        });
    }
    
    updateSpeedDisplay() {
        const speedValue = this.panel.querySelector('.speed-value');
        const speedPerSec = 1000 / this.speed;
        speedValue.textContent = speedPerSec.toFixed(1);
    }
    
    async loadImages() {
        try {
            console.log(`Loading cover: ${this.config.coverPath}`);
            
            // Load cover image
            this.coverImage = new Image();
            await new Promise((resolve, reject) => {
                this.coverImage.onload = () => {
                    console.log(`Cover loaded: ${this.config.coverPath}`);
                    resolve();
                };
                this.coverImage.onerror = () => {
                    console.error(`Error loading cover: ${this.config.coverPath}`);
                    reject(new Error(`Failed to load cover: ${this.config.coverPath}`));
                };
                this.coverImage.src = this.config.coverPath;
            });
            
            // Load animation frames
            console.log(`Loading frames for ${this.config.name}...`);
            for (let i = 0; i < this.totalFrames; i++) {
                const framePath = this.config.getFramePath(i);
                console.log(`Loading frame ${i}: ${framePath}`);
                
                const img = new Image();
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        console.log(`Frame ${i} loaded: ${framePath}`);
                        resolve();
                    };
                    img.onerror = () => {
                        console.error(`Error loading frame ${i}: ${framePath}`);
                        reject(new Error(`Failed to load frame ${i}: ${framePath}`));
                    };
                    img.src = framePath;
                });
                this.images.push(img);
            }
            
            this.imagesLoaded = true;
            console.log(`All images loaded for ${this.config.name}`);
            this.showCover(); // Show cover when images are loaded
            
        } catch (error) {
            console.error(`Error loading images for ${this.config.name}:`, error);
            this.generateErrorContent();
        }
    }
    
    generateErrorContent() {
        console.log(`Generating error content for ${this.config.name}`);
        
        // Create error cover
        const coverCanvas = document.createElement('canvas');
        coverCanvas.width = 400;
        coverCanvas.height = 400;
        const coverCtx = coverCanvas.getContext('2d');
        
        coverCtx.fillStyle = '#ffe6e6';
        coverCtx.fillRect(0, 0, coverCanvas.width, coverCanvas.height);
        coverCtx.fillStyle = '#dc3545';
        coverCtx.font = 'bold 20px Arial';
        coverCtx.textAlign = 'center';
        coverCtx.fillText('❌ Image Loading Error', coverCanvas.width / 2, coverCanvas.height / 2 - 40);
        coverCtx.fillStyle = '#666';
        coverCtx.font = '14px Arial';
        coverCtx.fillText(this.config.name, coverCanvas.width / 2, coverCanvas.height / 2);
        coverCtx.fillText('Check file paths', coverCanvas.width / 2, coverCanvas.height / 2 + 20);
        coverCtx.fillText(this.config.coverPath, coverCanvas.width / 2, coverCanvas.height / 2 + 40);
        
        this.coverImage = new Image();
        this.coverImage.src = coverCanvas.toDataURL();
        
        // Create error frames
        for (let i = 0; i < this.totalFrames; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            
            const hue = (i * 15) % 360;
            ctx.fillStyle = `hsl(${hue}, 70%, 90%)`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#333';
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.config.name} - ${i}:00`, canvas.width / 2, canvas.height / 2);
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.fillText('Demo content - check image paths', canvas.width / 2, canvas.height / 2 + 30);
            
            const img = new Image();
            img.src = canvas.toDataURL();
            this.images.push(img);
        }
        
        this.imagesLoaded = true;
        this.showCover();
    }
    
    showCover() {
        if (!this.imagesLoaded) return;
        
        this.stop();
        this.isOnCover = true;
        if (this.coverImage) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.coverImage, 0, 0, this.canvas.width, this.canvas.height);
        }
        this.updateScrubber();
        this.enableSpeedControl();
    }
    
    play() {
        if (!this.imagesLoaded || (this.isPlaying && !this.isPaused)) return;
        
        this.isPlaying = true;
        this.isPaused = false;
        this.isOnCover = false;
        this.disableSpeedControl();
        
        // Use global timing for synchronization
        if (window.isGlobalPlaying) {
            this.syncAnimate();
        } else {
            this.animate();
        }
    }
    
    pause() {
        if (!this.isPlaying) return;
        
        this.isPaused = true;
        this.enableSpeedControl();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        this.enableSpeedControl();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isPlaying || this.isPaused || !this.imagesLoaded) return;
        
        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        this.drawFrame(this.currentFrame);
        this.updateScrubber();
        
        this.animationId = setTimeout(() => {
            this.animate();
        }, this.speed);
    }
    
    // Synchronized animation using global timer
    syncAnimate() {
        if (!this.isPlaying || this.isPaused || !window.isGlobalPlaying || !this.imagesLoaded) return;
        
        const currentGlobalFrame = window.globalCurrentFrame;
        if (currentGlobalFrame !== this.currentFrame) {
            this.currentFrame = currentGlobalFrame;
            this.drawFrame(this.currentFrame);
            this.updateScrubber();
        }
        
        this.animationId = requestAnimationFrame(() => this.syncAnimate());
    }
    
    drawFrame(frameIndex) {
        if (this.images[frameIndex]) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.images[frameIndex], 0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    goToFrame(frameIndex) {
        // Only allow frame changes when not playing and images are loaded
        if (!this.isPlaying && !window.isGlobalPlaying && this.imagesLoaded) {
            this.stop();
            this.currentFrame = frameIndex;
            this.isOnCover = false;
            this.drawFrame(frameIndex);
            this.updateScrubber();
        }
    }
    
    updateScrubber() {
        const frameBtns = this.scrubber.querySelectorAll('.frame-btn');
        frameBtns.forEach((btn, index) => {
            btn.classList.toggle('active', !this.isOnCover && index === this.currentFrame);
        });
    }
    
    disableSpeedControl() {
        const speedSlider = this.panel.querySelector('.speed-slider');
        speedSlider.disabled = true;
    }
    
    enableSpeedControl() {
        // Only enable if not playing (individually or globally)
        if (!this.isPlaying && !window.isGlobalPlaying) {
            const speedSlider = this.panel.querySelector('.speed-slider');
            speedSlider.disabled = false;
        }
    }
    
    syncPlay() {
        if (!this.imagesLoaded) return;
        
        this.currentFrame = 0;
        this.isOnCover = false;
        this.drawFrame(0);
        this.isPlaying = true;
        this.isPaused = false;
        this.disableSpeedControl();
        this.syncAnimate();
    }
}

// Animation configurations for each soundscape index
const animationConfigs = [
    {
        name: "NDSI",
        coverPath: "images/Animation%201/NDSI%20Mean%202.png",
        getFramePath: (frameIndex) => `images/Animation%201/NDSI%20${frameIndex}_00.png`
    },
    {
        name: "ADI", 
        coverPath: "images/Animation%202/ADI%20Mean%201.png",
        getFramePath: (frameIndex) => `images/Animation%202/ADI%20${frameIndex}_00.png`
    },
    {
        name: "SPL",
        coverPath: "images/Animation%203/SPL%20Mean%203.png", 
        getFramePath: (frameIndex) => `images/Animation%203/SPL%20${frameIndex}_00.png`
    },
    {
        name: "BI",
        coverPath: "images/Animation%204/BI%20Mean%201.png",
        getFramePath: (frameIndex) => `images/Animation%204/BI%20${frameIndex}_00.png`
    },
    {
        name: "ACI",
        coverPath: "images/Animation5/ACI%20Mean.png",
        getFramePath: (frameIndex) => `images/Animation5/ACI%20${frameIndex}_00.png`
    }
];

// Global state for expansion and synchronization
let expandedPanel = null;
window.isGlobalPlaying = false;
window.globalSpeed = 500;
window.globalCurrentFrame = 0;
window.globalAnimationId = null;

// Global animation timer for perfect synchronization
function startGlobalAnimation() {
    if (!window.isGlobalPlaying) return;
    
    window.globalCurrentFrame = (window.globalCurrentFrame + 1) % 24;
    
    // Update global scrubber
    const globalFrameBtns = document.querySelectorAll('#global-scrubber .frame-btn');
    globalFrameBtns.forEach((btn, index) => {
        btn.classList.toggle('active', index === window.globalCurrentFrame);
    });
    
    window.globalAnimationId = setTimeout(() => {
        startGlobalAnimation();
    }, window.globalSpeed);
}

function stopGlobalAnimation() {
    if (window.globalAnimationId) {
        clearTimeout(window.globalAnimationId);
        window.globalAnimationId = null;
    }
}

// Initialize animations when page loads
window.addEventListener('load', function() {
    const animations = [];
    
    // Create 5 animation panels with real configurations
    for (let i = 0; i < 5; i++) {
        animations.push(new AnimationController(
            `panel${i + 1}`,
            `canvas${i + 1}`,
            `scrubber${i + 1}`,
            animationConfigs[i]
        ));
    }
    
    // Add collapse buttons to panel headers
    for (let i = 1; i <= 5; i++) {
        const panelHeader = document.querySelector(`#panel${i} .panel-header`);
        const collapseBtn = document.createElement('button');
        collapseBtn.className = 'collapse-btn';
        collapseBtn.textContent = '✕ Collapse';
        collapseBtn.addEventListener('click', () => collapseAll());
        panelHeader.appendChild(collapseBtn);
    }
    
    // Setup expand buttons
    const expandButtons = document.querySelectorAll('.expand-btn');
    expandButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const panelNumber = parseInt(e.target.getAttribute('data-panel'));
            expandPanel(panelNumber);
        });
    });
    
    function expandPanel(panelNumber) {
        const container = document.querySelector('.container');
        const panel = document.getElementById(`panel${panelNumber}`);
        
        // Set expanded state
        expandedPanel = panelNumber;
        container.classList.add('expanded');
        panel.classList.add('expanded');
    }
    
    function collapseAll() {
        const container = document.querySelector('.container');
        const expandedPanels = document.querySelectorAll('.animation-panel.expanded');
        
        // Remove expanded state
        expandedPanel = null;
        container.classList.remove('expanded');
        expandedPanels.forEach(panel => {
            panel.classList.remove('expanded');
        });
    }
    
    // Global controls
    const globalPlayBtn = document.getElementById('global-play');
    const globalPauseBtn = document.getElementById('global-pause');
    const globalCoverBtn = document.getElementById('global-cover');
    const globalSpeedSlider = document.getElementById('global-speed');
    const globalSpeedValue = document.getElementById('global-speed-value');
    const globalScrubber = document.getElementById('global-scrubber');
    
    // Create global frame buttons with time format
    for (let i = 0; i < 24; i++) {
        const btn = document.createElement('button');
        btn.className = 'frame-btn';
        btn.textContent = `${i}:00`;
        btn.title = `Frame ${i}:00`;
        btn.addEventListener('click', () => {
            // Only allow frame changes when not playing globally
            if (!window.isGlobalPlaying) {
                animations.forEach(anim => {
                    if (anim.imagesLoaded) {
                        anim.stop();
                        anim.currentFrame = i;
                        anim.isOnCover = false;
                        anim.drawFrame(i);
                        anim.updateScrubber();
                    }
                });
                // Update global scrubber
                const globalFrameBtns = globalScrubber.querySelectorAll('.frame-btn');
                globalFrameBtns.forEach((btn, index) => {
                    btn.classList.toggle('active', index === i);
                });
            }
        });
        globalScrubber.appendChild(btn);
    }
    
    // Set initial global speed display
    const updateGlobalSpeedDisplay = () => {
        const speed = parseInt(globalSpeedSlider.value);
        const speedPerSec = 1000 / speed;
        globalSpeedValue.textContent = speedPerSec.toFixed(1);
        window.globalSpeed = speed;
    };
    
    updateGlobalSpeedDisplay();
    
    // Disable global speed slider during playback
    const disableGlobalSpeedControl = () => {
        globalSpeedSlider.disabled = true;
    };
    
    const enableGlobalSpeedControl = () => {
        globalSpeedSlider.disabled = false;
    };
    
    globalPlayBtn.addEventListener('click', () => {
        if (window.isGlobalPlaying) return;
        
        window.isGlobalPlaying = true;
        window.globalCurrentFrame = 0;
        disableGlobalSpeedControl();
        
        // Start global animation timer
        stopGlobalAnimation();
        startGlobalAnimation();
        
        // Start all animations synchronized
        animations.forEach(anim => {
            anim.syncPlay();
        });
    });
    
    globalPauseBtn.addEventListener('click', () => {
        if (!window.isGlobalPlaying) return;
        
        window.isGlobalPlaying = false;
        enableGlobalSpeedControl();
        stopGlobalAnimation();
        
        animations.forEach(anim => {
            anim.pause();
            anim.enableSpeedControl();
        });
    });
    
    globalCoverBtn.addEventListener('click', () => {
        window.isGlobalPlaying = false;
        enableGlobalSpeedControl();
        stopGlobalAnimation();
        
        animations.forEach(anim => {
            anim.showCover();
            anim.enableSpeedControl();
        });
        
        // Clear global scrubber highlighting
        const globalFrameBtns = globalScrubber.querySelectorAll('.frame-btn');
        globalFrameBtns.forEach(btn => btn.classList.remove('active'));
        window.globalCurrentFrame = 0;
    });
    
    globalSpeedSlider.addEventListener('input', (e) => {
        // Only allow speed changes when not playing globally
        if (!window.isGlobalPlaying) {
            updateGlobalSpeedDisplay();
            const speed = parseInt(e.target.value);
            
            animations.forEach(anim => {
                anim.speed = speed;
                anim.updateSpeedDisplay();
            });
        }
    });
    
    console.log('Soundscape animations initialized! Loading real images...');
});
