// Global state
let globalSpeed = 500;
let isGlobalPlaying = false;
const animations = [];

// Animation controller class
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
        this.lastTime = 0;
        
        this.createFrameButtons();
        this.setupControls();
        this.generateDemoContent();
        // Show cover by default
        this.showCover();
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
        
        playBtn.addEventListener('click', () => this.play());
        pauseBtn.addEventListener('click', () => this.pause());
        coverBtn.addEventListener('click', () => this.showCover());
        
        speedSlider.addEventListener('input', (e) => {
            if (!isGlobalPlaying) {
                this.setSpeed(parseInt(e.target.value));
            }
        });
        
        this.updateSpeedDisplay();
    }
    
    setSpeed(speedMs) {
        this.speed = speedMs;
        this.updateSpeedDisplay();
        if (this.isPlaying && !this.isPaused) {
            this.restartAnimation();
        }
    }
    
    updateSpeedDisplay() {
        const speedValue = this.panel.querySelector('.speed-value');
        const speedPerSec = 1000 / this.speed;
        speedValue.textContent = speedPerSec.toFixed(1);
    }
    
    generateDemoContent() {
        // Demo cover
        const coverCanvas = document.createElement('canvas');
        coverCanvas.width = 400;
        coverCanvas.height = 400;
        const coverCtx = coverCanvas.getContext('2d');
        
        coverCtx.fillStyle = '#e7f3ff';
        coverCtx.fillRect(0, 0, coverCanvas.width, coverCanvas.height);
        
        coverCtx.fillStyle = '#007acc';
        coverCtx.font = 'bold 32px Arial';
        coverCtx.textAlign = 'center';
        coverCtx.textBaseline = 'middle';
        coverCtx.fillText('📊 COVER', coverCanvas.width / 2, coverCanvas.height / 2 - 30);
        
        coverCtx.fillStyle = '#333';
        coverCtx.font = '16px Arial';
        coverCtx.fillText('Average values', coverCanvas.width / 2, coverCanvas.height / 2 + 10);
        
        this.coverImage = new Image();
        this.coverImage.src = coverCanvas.toDataURL();
        
        // Demo animation frames
        for (let i = 0; i < this.totalFrames; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 400;
            const ctx = canvas.getContext('2d');
            
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, `hsl(${(i * 15) % 360}, 70%, 80%)`);
            gradient.addColorStop(1, `hsl(${(i * 15 + 180) % 360}, 70%, 80%)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#333';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
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
        this.updateGlobalScrubber();
    }
    
    play() {
        if (this.isPlaying && !this.isPaused) return;
        
        this.isPlaying = true;
        this.isPaused = false;
        this.isOnCover = false;
        
        this.panel.querySelector('.play-btn').disabled = true;
        this.panel.querySelector('.pause-btn').disabled = false;
        
        this.lastTime = performance.now();
        this.animate();
    }
    
    pause() {
        if (!this.isPlaying) return;
        
        this.isPaused = true;
        this.panel.querySelector('.play-btn').disabled = false;
        this.panel.querySelector('.pause-btn').disabled = true;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        
        this.panel.querySelector('.play-btn').disabled = false;
        this.panel.querySelector('.pause-btn').disabled = true;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate(currentTime = performance.now()) {
        if (!this.isPlaying || this.isPaused) return;
        
        const delta = currentTime - this.lastTime;
        const currentSpeed = isGlobalPlaying ? globalSpeed : this.speed;
        
        if (delta >= currentSpeed) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.drawFrame(this.currentFrame);
            this.updateScrubber();
            this.updateGlobalScrubber();
            this.lastTime = currentTime;
        }
        
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    drawFrame(frameIndex) {
        if (this.images[frameIndex]) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.images[frameIndex], 0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    goToFrame(frameIndex) {
        if (!isGlobalPlaying) {
            this.stop();
            this.currentFrame = frameIndex;
            this.isOnCover = false;
            this.drawFrame(frameIndex);
            this.updateScrubber();
            this.updateGlobalScrubber();
        }
    }
    
    updateScrubber() {
        const frameBtns = this.scrubber.querySelectorAll('.frame-btn');
        frameBtns.forEach((btn, index) => {
            btn.classList.toggle('active', !this.isOnCover && index === this.currentFrame);
        });
    }
    
    updateGlobalScrubber() {
        if (isGlobalPlaying && this.isPlaying) {
            const globalFrameBtns = document.querySelectorAll('#global-scrubber .frame-btn');
            globalFrameBtns.forEach((btn, index) => {
                btn.classList.toggle('active', index === this.currentFrame);
            });
        }
    }
    
    restartAnimation() {
        if (this.isPlaying && !this.isPaused) {
            this.lastTime = performance.now();
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            this.animate();
        }
    }
    
    syncPlay() {
        this.currentFrame = 0;
        this.isOnCover = false;
        this.drawFrame(0);
        this.play();
    }
    
    disableIndividualControls() {
        const speedControl = this.panel.querySelector('.speed-control');
        const speedSlider = this.panel.querySelector('.speed-slider');
        const frameBtns = this.scrubber.querySelectorAll('.frame-btn');
        
        speedControl.classList.add('disabled');
        speedSlider.disabled = true;
        frameBtns.forEach(btn => {
            btn.disabled = true;
        });
    }
    
    enableIndividualControls() {
        const speedControl = this.panel.querySelector('.speed-control');
        const speedSlider = this.panel.querySelector('.speed-slider');
        const frameBtns = this.scrubber.querySelectorAll('.frame-btn');
        
        speedControl.classList.remove('disabled');
        speedSlider.disabled = false;
        frameBtns.forEach(btn => {
            btn.disabled = false;
        });
    }
}

// Initialize all animations to show covers by default
function initializeAnimations() {
    for (let i = 1; i <= 5; i++) {
        const anim = new AnimationController(
            `panel${i}`,
            `canvas${i}`,
            `scrubber${i}`
        );
        animations.push(anim);
    }
}

// Global controls
function setupGlobalControls() {
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
            if (!isGlobalPlaying) {
                animations.forEach(anim => anim.goToFrame(i));
            }
        });
        globalScrubber.appendChild(btn);
    }

    // Global play with synchronization
    globalPlayBtn.addEventListener('click', () => {
        isGlobalPlaying = true;
        
        // Disable individual controls
        animations.forEach(anim => {
            anim.disableIndividualControls();
            anim.setSpeed(globalSpeed);
            anim.syncPlay();
        });
    });

    globalPauseBtn.addEventListener('click', () => {
        isGlobalPlaying = false;
        animations.forEach(anim => {
            anim.pause();
            anim.enableIndividualControls();
        });
    });

    globalCoverBtn.addEventListener('click', () => {
        isGlobalPlaying = false;
        animations.forEach(anim => {
            anim.showCover();
            anim.enableIndividualControls();
        });
        
        // Clear global scrubber highlighting
        const globalFrameBtns = document.querySelectorAll('#global-scrubber .frame-btn');
        globalFrameBtns.forEach(btn => btn.classList.remove('active'));
    });

    // Global speed control
    globalSpeedSlider.addEventListener('input', (e) => {
        globalSpeed = parseInt(e.target.value);
        const speedPerSec = 1000 / globalSpeed;
        globalSpeedValue.textContent = speedPerSec.toFixed(1);
        
        if (isGlobalPlaying) {
            animations.forEach(anim => {
                anim.setSpeed(globalSpeed);
            });
        }
    });
}

// Modal functionality
let expandedAnimation = null;

function setupModal() {
    const expandButtons = document.querySelectorAll('.expand-btn');
    const modal = document.getElementById('modal');
    const modalCanvas = document.getElementById('modal-canvas');
    const modalTitle = document.getElementById('modal-title');
    const closeModal = document.getElementById('close-modal');
    const modalScrubber = document.getElementById('modal-scrubber');

    // Create modal frame buttons
    for (let i = 0; i < 24; i++) {
        const btn = document.createElement('button');
        btn.className = 'frame-btn';
        btn.textContent = i + 1;
        btn.addEventListener('click', () => {
            if (expandedAnimation) {
                expandedAnimation.goToFrame(i);
            }
        });
        modalScrubber.appendChild(btn);
    }

    expandButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const panelNumber = parseInt(e.target.getAttribute('data-panel'));
            openModal(panelNumber);
        });
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        expandedAnimation = null;
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            expandedAnimation = null;
        }
    });
}

function openModal(panelNumber) {
    expandedAnimation = animations[panelNumber - 1];
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCanvas = document.getElementById('modal-canvas');
    const modalPlayBtn = document.querySelector('.modal-play-btn');
    const modalPauseBtn = document.querySelector('.modal-pause-btn');
    const modalCoverBtn = document.querySelector('.modal-cover-btn');
    const modalSpeedSlider = document.querySelector('.modal-speed-slider');
    const modalSpeedValue = document.querySelector('.modal-speed-value');
    const modalScrubber = document.getElementById('modal-scrubber');
    
    modalTitle.textContent = `Animation ${panelNumber}`;
    
    // Set up modal controls
    modalPlayBtn.onclick = () => expandedAnimation.play();
    modalPauseBtn.onclick = () => expandedAnimation.pause();
    modalCoverBtn.onclick = () => expandedAnimation.showCover();
    modalSpeedSlider.oninput = (e) => {
        expandedAnimation.setSpeed(parseInt(e.target.value));
    };
    
    // Sync current values
    modalSpeedSlider.value = expandedAnimation.speed;
    const speedPerSec = 1000 / expandedAnimation.speed;
    modalSpeedValue.textContent = speedPerSec.toFixed(1);
    
    // Update modal scrubber
    updateModalScrubber();
    
    // Start rendering
    modal.style.display = 'block';
    renderModal();
}

function updateModalScrubber() {
    if (!expandedAnimation) return;
    
    const modalFrameBtns = document.querySelectorAll('#modal-scrubber .frame-btn');
    modalFrameBtns.forEach((btn, index) => {
        btn.classList.toggle('active', 
            !expandedAnimation.isOnCover && index === expandedAnimation.currentFrame
        );
    });
}

function renderModal() {
    if (!expandedAnimation || document.getElementById('modal').style.display === 'none') {
        return;
    }
    
    const modalCanvas = document.getElementById('modal-canvas');
    const modalCtx = modalCanvas.getContext('2d');
    
    // Set canvas size
    modalCanvas.width = modalCanvas.parentElement.clientWidth;
    modalCanvas.height = modalCanvas.parentElement.clientHeight * 0.7;
    
    modalCtx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);
    
    let imageToDraw;
    if (expandedAnimation.isOnCover && expandedAnimation.coverImage) {
        imageToDraw = expandedAnimation.coverImage;
    } else if (expandedAnimation.images[expandedAnimation.currentFrame]) {
        imageToDraw = expandedAnimation.images[expandedAnimation.currentFrame];
    }
    
    if (imageToDraw) {
        const scale = Math.min(
            modalCanvas.width / imageToDraw.width,
            modalCanvas.height / imageToDraw.height
        );
        const width = imageToDraw.width * scale;
        const height = imageToDraw.height * scale;
        const x = (modalCanvas.width - width) / 2;
        const y = (modalCanvas.height - height) / 2;
        
        modalCtx.drawImage(imageToDraw, x, y, width, height);
    }
    
    // Update modal controls state
    const modalPlayBtn = document.querySelector('.modal-play-btn');
    const modalPauseBtn = document.querySelector('.modal-pause-btn');
    
    modalPlayBtn.disabled = expandedAnimation.isPlaying && !expandedAnimation.isPaused;
    modalPauseBtn.disabled = !expandedAnimation.is
