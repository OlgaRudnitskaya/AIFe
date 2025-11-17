// Базовый класс для управления анимацией
class AnimationController {
    constructor(panelId, canvasId, scrubberId) {
        this.panel = document.getElementById(panelId);
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.scrubber = document.getElementById(scrubberId);
        
        this.images = [];
        this.currentFrame = 0;
        this.isPlaying = false;
        this.speed = 200; // мс на кадр
        this.animationId = null;
        this.totalFrames = 24;
        
        this.createFrameButtons();
        this.setupControls();
        this.generateDemoAnimation(); // Временная демо-анимация
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
        const speedSlider = this.panel.querySelector('.speed-slider');
        const speedValue = this.panel.querySelector('.speed-value');
        
        playBtn.addEventListener('click', () => this.togglePlay());
        
        speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            speedValue.textContent = `${this.speed} мс`;
            if (this.isPlaying) {
                this.restartAnimation();
            }
        });
    }
    
    // Временная демонстрационная анимация (замените на ваши изображения)
    generateDemoAnimation() {
        for (let i = 0; i < this.totalFrames; i++) {
            // Создаем демо-изображение с разными цветами
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
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Кадр ${i + 1}`, canvas.width / 2, canvas.height / 2);
            
            // Анимированный круг
            ctx.fillStyle = `hsl(${(i * 15) % 360}, 100%, 50%)`;
            const radius = 30 + 20 * Math.sin(i * 0.5);
            ctx.beginPath();
            ctx.arc(100 + i * 10, 100, radius, 0, Math.PI * 2);
            ctx.fill();
            
            const img = new Image();
            img.src = canvas.toDataURL();
            this.images.push(img);
        }
        
        this.drawFrame(0);
    }
    
    // Переключение воспроизведения/паузы
    togglePlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }
    
    // Запуск анимации
    play() {
        this.isPlaying = true;
        this.panel.querySelector('.play-btn').textContent = 'Стоп';
        this.panel.querySelector('.play-btn').classList.add('playing');
        this.animate();
    }
    
    // Остановка анимации
    stop() {
        this.isPlaying = false;
        this.panel.querySelector('.play-btn').textContent = 'Пуск';
        this.panel.querySelector('.play-btn').classList.remove('playing');
        if (this.animationId) {
            clearTimeout(this.animationId);
        }
    }
    
    // Основной цикл анимации
    animate() {
        if (!this.isPlaying) return;
        
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
        this.currentFrame = frameIndex;
        this.drawFrame(frameIndex);
        this.updateScrubber();
    }
    
    // Обновление подсветки кнопок
    updateScrubber() {
        const frameBtns = this.scrubber.querySelectorAll('.frame-btn');
        frameBtns.forEach((btn, index) => {
            btn.classList.toggle('active', index === this.currentFrame);
        });
    }
    
    // Перезапуск анимации (при изменении скорости)
    restartAnimation() {
        if (this.isPlaying) {
            this.stop();
            this.play();
        }
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

// Запуск/остановка всех анимаций
globalPlayBtn.addEventListener('click', () => {
    const allPlaying = animations.every(anim => anim.isPlaying);
    
    if (allPlaying) {
        // Если все играют - останавливаем все
        animations.forEach(anim => anim.stop());
        globalPlayBtn.textContent = 'Запуск всех анимаций';
    } else {
        // Если не все играют - запускаем все
        animations.forEach(anim => anim.play());
        globalPlayBtn.textContent = 'Остановить все';
    }
});

// Глобальное управление скоростью
globalSpeedSlider.addEventListener('input', (e) => {
    const speed = parseInt(e.target.value);
    globalSpeedValue.textContent = `${speed} мс`;
    
    animations.forEach(anim => {
        anim.speed = speed;
        anim.panel.querySelector('.speed-slider').value = speed;
        anim.panel.querySelector('.speed-value').textContent = `${speed} мс`;
        if (anim.isPlaying) {
            anim.restartAnimation();
        }
    });
});

console.log('Анимационная панель загружена!');
