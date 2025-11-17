// Базовый класс для управления анимацией
class AnimationController {
    constructor(panelId, canvasId, scrubberId) {
        this.panel = document.getElementById(panelId);
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scrubber = document.getElementById(scrubberId);
        
        this.images = [];
        this.coverImage = null; // Обложка
        this.currentFrame = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.speed = 200;
        this.animationId = null;
        this.totalFrames = 24;
        this.isOnCover = true; // Находимся ли на обложке
        
        this.createFrameButtons();
        this.setupControls();
        this.generateDemoContent(); // Временный демо-контент
        
        // Показываем обложку по умолчанию
        this.showCover();
    }
    
    // Создает кнопки для переключения кадров
    createFrameButtons() {
        this.scrubber.innerHTML = '';
        
        // Кнопка для обложки
        const coverBtn = document.createElement('button');
        coverBtn.className = 'frame-btn cover-frame';
        coverBtn.textContent = '📊';
        coverBtn.title = 'Обложка (средние значения)';
        coverBtn.addEventListener('click', () => this.showCover());
        this.scrubber.appendChild(coverBtn);
        
        // Кнопки для кадров анимации
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
        const stopBtn = this.panel.querySelector('.stop-btn');
        const coverBtn = this.panel.querySelector('.cover-btn');
        const speedSlider = this.panel.querySelector('.speed-slider');
        const speedValue = this.panel.querySelector('.speed-value');
        
        playBtn.addEventListener('click', () => this.play());
        pauseBtn.addEventListener('click', () => this.pause());
        stopBtn.addEventListener('click', () => this.stop());
        coverBtn.addEventListener('click', () => this.showCover());
        
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            speedValue.textContent = `${this.speed} мс`;
            if (this.isPlaying && !this.isPaused) {
                this.restartAnimation();
            }
        });
    }
    
    // Временный демо-контент (замените на ваши изображения)
    generateDemoContent() {
        // Создаем демо-обложку
        const coverCanvas = document.createElement('canvas');
        coverCanvas.width = this.canvas.width;
        coverCanvas.height = this.canvas.height;
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
        coverCtx.fillText('Нажмите "Пуск" для анимации', coverCanvas.width / 2, coverCanvas.height / 2 + 40);
        
        this.coverImage = new Image();
        this.coverImage.src = coverCanvas.toDataURL();
        
        // Создаем демо-кадры анимации
        for (let i = 0; i < this.totalFrames; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = this.canvas.width;
            canvas.height = this.canvas.height;
            const ctx = canvas.getContext('2d');
            
            // Градиентный фон
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, `hsl(${(i * 15) % 360}, 70%, 80%)`);
            gradient.addColorStop(1, `hsl(${(i * 15 + 180) % 360}, 70%, 80%)`);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Текст с номером кадра
            ctx.fillStyle = '#333';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Кадр ${i + 1}`, canvas.width / 2, canvas.height / 2);
            
            // Анимированный элемент
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
        this.panel.querySelector('.stop-btn').disabled = false;
        
        this.animate();
    }
    
    // Пауза анимации
    pause() {
        if (!this.isPlaying) return;
        
        this.isPaused = true;
        this.panel.querySelector('.play-btn').disabled = false;
        this.panel.querySelector('.pause-btn').disabled = true;
        
        if (this.animationId) {
            clearTimeout(this.animationId);
        }
    }
    
    // Полная остановка анимации
    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        
        this.panel.querySelector('.play-btn').disabled = false;
        this.panel.querySelector('.pause-btn').disabled = true;
        this.panel.querySelector('.stop-btn').disabled = true;
        
        if (this.animationId) {
            clearTimeout(this.animationId);
        }
        
        // При остановке не переключаем на обложку, остаемся на текущем кадре
        // this.showCover(); // Раскомментируйте, если хотите возврат к обложке при стопе
    }
    
    // Основной цикл анимации
    animate() {
        if (!this.isPlaying || this.isPaused) return;
        
        this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        this.drawFrame(this.currentFrame);
        this.updateScrubber();
        
        this.animationId = setTimeout(() => {
            requestAnimationFrame(() => this.animate());
        }, this.speed);
    }
    
    // Отрисовка текущего кадра
    drawFrame(frameIndex) {
        if (this.images[frameIndex]) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
            if (index === 0) {
                // Кнопка обложки
                btn.classList.toggle('active', this.isOnCover);
            } else {
                // Кнопки кадров
                const frameIndex = index - 1;
                btn.classList.toggle('active', !this.isOnCover && frameIndex === this.currentFrame);
            }
        });
    }
    
    // Перезапуск анимации (при изменении скорости)
    restartAnimation() {
        if (this.isPlaying && !this.isPaused) {
            if (this.animationId) {
                clearTimeout(this.animationId);
            }
            this.animate();
        }
    }
    
    // Получить текущее состояние для модального окна
    getState() {
        return {
            images: this.images,
            coverImage: this.coverImage,
            currentFrame: this.currentFrame,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            isOnCover: this.isOnCover,
            speed: this.speed
        };
    }
}

// Инициализация всех анимаций
const animations = [];

// Создаем 5 анимационных панелей
for (let i = 1; i <= 5; i++) {
    animations.push(new AnimationController(
        `panel${i}`,
        `canvas${i}`,
        `scrubber${i}`
    ));
}

// Глобальное управление
const globalPlayBtn = document.getElementById('global-play');
const globalPauseBtn = document.getElementById('global-pause');
const globalStopBtn = document.getElementById('global-stop');
const globalCoverBtn = document.getElementById('global-cover');
const globalSpeedSlider = document.getElementById('global-speed');
const globalSpeedValue = document.getElementById('global-speed-value');
const globalScrubber = document.getElementById('global-scrubber');

// Создаем глобальные кнопки переключения кадров
const globalCoverBtnElem = document.createElement('button');
globalCoverBtnElem.className = 'frame-btn cover-frame';
globalCoverBtnElem.textContent = '📊';
globalCoverBtnElem.title = 'Все на обложки';
globalCoverBtnElem.addEventListener('click', () => {
    animations.forEach(anim => anim.showCover());
});
globalScrubber.appendChild(globalCoverBtnElem);

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
    animations.forEach(anim => anim.play());
});

globalPauseBtn.addEventListener('click', () => {
    animations.forEach(anim => anim.pause());
});

globalStopBtn.addEventListener('click', () => {
    animations.forEach(anim => anim.stop());
});

globalCoverBtn.addEventListener('click', () => {
    animations.forEach(anim => anim.showCover());
});

// Глобальное управление скоростью
globalSpeedSlider.addEventListener('input', (e) => {
    const speed = parseInt(e.target.value);
    globalSpeedValue.textContent = `${speed} мс`;
    
    animations.forEach(anim => {
        anim.speed = speed;
        anim.panel.querySelector('.speed-slider').value = speed;
        anim.panel.querySelector('.speed-value').textContent = `${speed} мс`;
        if (anim.isPlaying && !anim.isPaused) {
            anim.restartAnimation();
        }
    });
});

// Управление развертыванием панелей
const expandButtons = document.querySelectorAll('.expand-btn');
const modal = document.getElementById('modal');
const modalCanvas = document.getElementById('modal-canvas');
const modalTitle = document.getElementById('modal-title');
const closeModal = document.getElementById('close-modal');
const modalControls = document.querySelector('.modal-controls');

expandButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const panelNumber = e.target.getAttribute('data-panel');
        openModal(panelNumber);
    });
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

function openModal(panelNumber) {
    const anim = animations[panelNumber - 1];
    const state = anim.getState();
    
    modalTitle.textContent = `Анимация ${panelNumber}`;
    modalCanvas.width = window.innerWidth * 0.8;
    modalCanvas.height = window.innerHeight * 0.6;
    
    const modalCtx = modalCanvas.getContext('2d');
    
    // Копируем изображение в модальное окно
    if (state.isOnCover && state.coverImage) {
        modalCtx.drawImage(state.coverImage, 0, 0, modalCanvas.width, modalCanvas.height);
    } else if (state.images[state.currentFrame]) {
        modalCtx.drawImage(state.images[state.currentFrame], 0, 0, modalCanvas.width, modalCanvas.height);
    }
    
    modal.style.display = 'block';
}

// Закрытие модального окна по клику вне его
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

console.log('Анимационная панель загружена!');
