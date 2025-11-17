
// Базовый класс для управления анимацией
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
        this.speed = 500; // мс на кадр (2 img/sec)
        this.animationId = null;
        this.totalFrames = 24;
        this.isOnCover = true;
        this.lastTime = 0;
        this.alpha = 1; // Для плавных переходов
        
        this.createFrameButtons();
        this.setupControls();
        this.generateDemoContent();
        this.showCover();
    }
    
    // Создает кнопки для переключения кадров
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
    
    // Настройка элементов управления
    setupControls() {
        const playBtn = this.panel.querySelector('.play-btn');
        const pauseBtn = this.panel.querySelector('.pause-btn');
        const coverBtn = this.panel.querySelector('.cover-btn');
        const speedSlider = this.panel.querySelector('.speed-slider');
        const speedValue = this.panel.querySelector('.speed-value');
        
        playBtn.addEventListener('click', () => this.play());
        pauseBtn.addEventListener('click', () => this.pause());
        coverBtn.addEventListener('click', () => this.showCover());
        
        speedSlider.addEventListener('input', (e) => {
            this.setSpeed(parseInt(e.target.value));
        });
        
        this.updateSpeedDisplay();
    }
    
    // Установка скорости с обновлением отображения
    setSpeed(speedMs) {
        this.speed = speedMs;
        this.updateSpeedDisplay();
        if (this.isPlaying && !this.isPaused) {
            this.restartAnimation();
        }
    }
    
    // Обновление отображения скорости
    updateSpeedDisplay() {
        const speedValue = this.panel.querySelector('.speed-value');
        const speedPerSec = 1000 / this.speed;
        speedValue.textContent = `${speedPerSec.toFixed(1)} img/sec`;
    }
    
    // Временный демо-контент
    generateDemoContent() {
        // Создаем демо-обложку
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
        coverCtx.fillText('📊 ОБЛОЖКА', coverCanvas.width / 2, coverCanvas.height / 2 - 30);
        
        coverCtx.fillStyle = '#333';
        coverCtx.font = '16px Arial';
        coverCtx.fillText('Средние значения', coverCanvas.width / 2, coverCanvas.height / 2 + 10);
        
        this.coverImage = new Image();
        this.coverImage.src = coverCanvas.toDataURL();
        
        // Создаем демо-кадры анимации
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
            ctx.fillText(`Кадр ${i + 1}`, canvas.width / 2, canvas.height / 2);
            
            ctx.fillStyle = `hsl(${(i * 15) % 360}, 100%, 50%)`;
            const radius = 20 + 15 * Math.sin(i * 0.3);
            ctx.beginPath();
            ctx.arc(80 + i * 5, 80, radius, 0, Math.PI * 2);
            ctx.fill();
            
            const img = new Image();
            img.src = canvas.toDataURL();
            this.images.push(img);
        }
    }
    
    // Показать обложку
    showCover() {
        this.stop();
        this.isOnCover = true;
        if (this.coverImage) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(this.coverImage, 0, 0, this.canvas.width, this.canvas.height);
        }
        this.updateScrubber();
    }
    
    // Запуск анимации
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
    
    // Пауза анимации
    pause() {
        if (!this.isPlaying) return;
        
        this.isPaused = true;
        this.panel.querySelector('.play-btn').disabled = false;
        this.panel.querySelector('.pause-btn').disabled = true;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    // Полная остановка анимации
    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        
        this.panel.querySelector('.play-btn').disabled = false;
        this.panel.querySelector('.pause-btn').disabled = true;
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    // Основной цикл анимации
    animate(currentTime = performance.now()) {
        if (!this.isPlaying || this.isPaused) return;
        
        const delta = currentTime - this.lastTime;
        
        if (delta >= this.speed) {
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
            this.drawFrame(this.currentFrame);
            this.updateScrubber();
            this.lastTime = currentTime;
        }
        
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    // Отрисовка текущего кадра с плавным переходом
    drawFrame(frameIndex) {
        if (this.images[frameIndex]) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalAlpha = 1;
            this.ctx.drawImage(this.images[frameIndex], 0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    // Переход к конкретному кадру
    goToFrame(frameIndex) {
        this.stop();
        this.currentFrame = frameIndex;
        this.isOnCover = false;
        this.drawFrame(frameIndex);
        this.updateScrubber();
    }
    
    // Обновление подсветки кнопок
    updateScrubber() {
        const frameBtns = this.scrubber.querySelectorAll('.frame-btn');
        frameBtns.forEach((btn, index) => {
            btn.classList.toggle('active', !this.isOnCover && index === this.currentFrame);
        });
    }
    
    // Перезапуск анимации
    restartAnimation() {
        if (this.isPlaying && !this.isPaused) {
            this.lastTime = performance.now();
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
            }
            this.animate();
        }
    }
    
    // Синхронный запуск с начала
    syncPlay() {
        this.currentFrame = 0;
        this.play();
    }
}

// Глобальное управление
let globalSpeed = 500; // Общая скорость по умолчанию
const animations = [];

// Создаем 5 анимационных панелей
for (let i = 1; i <= 5; i++) {
    animations.push(new AnimationController(
        `panel${i}`,
        `canvas${i}`,
        `scrubber${i}`
    ));
}

// Глобальные элементы управления
const globalPlayBtn = document.getElementById('global-play');
const globalPauseBtn = document.getElementById('global-pause');
const globalCoverBtn = document.getElementById('global-cover');
const globalSpeedSlider = document.getElementById('global-speed');
const globalSpeedValue = document.getElementById('global-speed-value');
const globalScrubber = document.getElementById('global-scrubber');

// Создаем глобальные кнопки переключения кадров
for (let i = 0; i < 24; i++) {
    const btn = document.createElement('button');
    btn.className = 'frame-btn';
    btn.textContent = i + 1;
    btn.addEventListener('click', () => {
        animations.forEach(anim => anim.goToFrame(i));
    });
    globalScrubber.appendChild(btn);
}

// Глобальное управление воспроизведением
globalPlayBtn.addEventListener('click', () => {
    animations.forEach(anim => {
        anim.setSpeed(globalSpeed);
        anim.syncPlay();
    });
});

globalPauseBtn.addEventListener('click', () => {
    animations.forEach(anim => anim.pause());
});

globalCoverBtn.addEventListener('click', () => {
    animations.forEach(anim => anim.showCover());
});

// Глобальное управление скоростью
globalSpeedSlider.addEventListener('input', (e) => {
    globalSpeed = parseInt(e.target.value);
    const speedPerSec = 1000 / globalSpeed;
    globalSpeedValue.textContent = `${speedPerSec.toFixed(1)} img/sec`;
});

// Управление развертыванием панелей
const expandButtons = document.querySelectorAll('.expand-btn');
const modal = document.getElementById('modal');
const modalCanvas = document.getElementById('modal-canvas');
const modalTitle = document.getElementById('modal-title');
const closeModal = document.getElementById('close-modal');
const modalControls = document.querySelector('.modal-controls');

let expandedAnimation = null;

expandButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const panelNumber = parseInt(e.target.getAttribute('data-panel'));
        openModal(panelNumber);
    });
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    if (expandedAnimation) {
        expandedAnimation = null;
    }
});

function openModal(panelNumber) {
    expandedAnimation = animations[panelNumber - 1];
    
    modalTitle.textContent = `Анимация ${panelNumber}`;
    
    // Копируем управление
    modalControls.innerHTML = expandedAnimation.panel.querySelector('.controls').innerHTML;
    
    // Настраиваем обработчики для модального окна
    const modalPlayBtn = modalControls.querySelector('.play-btn');
    const modalPauseBtn = modalControls.querySelector('.pause-btn');
    const modalCoverBtn = modalControls.querySelector('.cover-btn');
    const modalSpeedSlider = modalControls.querySelector('.speed-slider');
    const modalSpeedValue = modalControls.querySelector('.speed-value');
    
    modalPlayBtn.addEventListener('click', () => expandedAnimation.play());
    modalPauseBtn.addEventListener('click', () => expandedAnimation.pause());
    modalCoverBtn.addEventListener('click', () => expandedAnimation.showCover());
    modalSpeedSlider.addEventListener('input', (e) => {
        expandedAnimation.setSpeed(parseInt(e.target.value));
    });
    
    // Синхронизируем состояние кнопок
    updateModalControls();
    
    // Запускаем рендеринг модального окна
    renderModal();
    
    modal.style.display = 'block';
}

function updateModalControls() {
    if (!expandedAnimation) return;
    
    const modalPlayBtn = modalControls.querySelector('.play-btn');
    const modalPauseBtn = modalControls.querySelector('.pause-btn');
    
    modalPlayBtn.disabled = expandedAnimation.isPlaying && !expandedAnimation.isPaused;
    modalPauseBtn.disabled = !expandedAnimation.isPlaying || expandedAnimation.isPaused;
    
    const modalSpeedSlider = modalControls.querySelector('.speed-slider');
    const modalSpeedValue = modalControls.querySelector('.speed-value');
    modalSpeedSlider.value = expandedAnimation.speed;
    expandedAnimation.updateSpeedDisplay.call({
        panel: { querySelector: () => modalSpeedValue },
        speed: expandedAnimation.speed
    });
}

function renderModal() {
    if (!expandedAnimation || modal.style.display === 'none') return;
    
    const ctx = modalCanvas.getContext('2d');
    ctx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);
    
    if (expandedAnimation.isOnCover && expandedAnimation.coverImage) {
        // Центрируем обложку
        const scale = Math.min(
            modalCanvas.width / expandedAnimation.coverImage.width,
            modalCanvas.height / expandedAnimation.coverImage.height
        );
        const width = expandedAnimation.coverImage.width * scale;
        const height = expandedAnimation.coverImage.height * scale;
        const x = (modalCanvas.width - width) / 2;
        const y = (modalCanvas.height - height) / 2;
        
        ctx.drawImage(expandedAnimation.coverImage, x, y, width, height);
    } else if (expandedAnimation.images[expandedAnimation.currentFrame]) {
        // Центрируем кадр анимации
        const img = expandedAnimation.images[expandedAnimation.currentFrame];
        const scale = Math.min(
            modalCanvas.width / img.width,
            modalCanvas.height / img.height
        );
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (modalCanvas.width - width) / 2;
        const y = (modalCanvas.height - height) / 2;
        
        ctx.drawImage(img, x, y, width, height);
    }
    
    updateModalControls();
    requestAnimationFrame(renderModal);
}

// Закрытие модального окна по клику вне его
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        expandedAnimation = null;
    }
});

// Ресайз модального окна
window.addEventListener('resize', () => {
    if (modalCanvas) {
        modalCanvas.width = modalCanvas.parentElement.clientWidth;
        modalCanvas.height = modalCanvas.parentElement.clientHeight * 0.8;
    }
});

// Инициализация размеров модального canvas
setTimeout(() => {
    if (modalCanvas) {
        modalCanvas.width = modalCanvas.parentElement.clientWidth;
        modalCanvas.height = modalCanvas.parentElement.clientHeight * 0.8;
    }
}, 100);

console.log('Анимационная панель загружена!');
