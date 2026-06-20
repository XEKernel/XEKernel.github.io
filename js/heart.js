// heart.js - 烟花告白页面JavaScript

// 配置常量
const CONFIG = {
    PARTICLE: {
        MAX_COUNT: 2000,
        BASE_SIZE: 2,
        HEART_SIZE: 3,
        LAUNCHER_COUNT: 20,
        GRAVITY: 0.05,
        RESISTANCE: 0.85,
        BASE_SPEED: 1.2,
        EXPLOSION_SPEED: 2.5
    },
    HEART: {
        BASE_SIZE: 15,
        EXPLOSION_SIZE: 20
    },
    TEXT: {
        FONT: 'bold 72px "Microsoft YaHei"',
        SAMPLE_INTERVAL: 8
    },
    STAR: {
        COUNT: 150,
        OPACITY_SPEED: 0.02
    },
    COLORS: [
        '#ff4081', // 粉色
        '#03a9f4', // 蓝色
        '#ffeb3b'  // 黄色
    ]
};

// 初始化画布
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let [width, height] = [window.innerWidth, window.innerHeight];
[canvas.width, canvas.height] = [width, height];

// 音效系统
class SoundSystem {
    constructor() {
        this.enabled = false;
        this.audioContext = null;
        this.oscillators = new Map();
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
        } catch (e) {
            console.warn('音频API不支持:', e);
        }
        
        this.toggleButton = document.getElementById('soundToggle');
        this.toggleButton.addEventListener('click', () => this.toggle());
    }
    
    toggle() {
        this.enabled = !this.enabled;
        this.toggleButton.textContent = this.enabled ? '🔊' : '🔇';
        
        if (this.enabled && this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        if (!this.enabled) {
            this.stopAll();
        }
    }
    
    playTone(frequency, duration = 0.5, type = 'sine') {
        if (!this.enabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
        
        const id = Symbol();
        this.oscillators.set(id, oscillator);
        
        oscillator.onended = () => {
            this.oscillators.delete(id);
        };
    }
    
    playSuccess() {
        this.playTone(523.25, 0.3);
        setTimeout(() => this.playTone(659.25, 0.3), 100);
        setTimeout(() => this.playTone(783.99, 0.5), 200);
    }
    
    playHeartbeat() {
        this.playTone(392, 0.1);
        setTimeout(() => this.playTone(440, 0.1), 150);
    }
    
    // 移除烟花爆炸音效
    playExplosion() {
        // 不再播放任何音效
        return;
    }
    
    playPageTurn() {
        this.playTone(300, 0.1);
        setTimeout(() => this.playTone(400, 0.1), 50);
    }
    
    stopAll() {
        this.oscillators.forEach(oscillator => {
            try {
                oscillator.stop();
            } catch (e) {
                // 忽略已停止的振荡器
            }
        });
        this.oscillators.clear();
    }
}

// 烟花系统
class FireworkSystem {
    constructor() {
        this.fireworks = [];
        this.particles = [];
    }

    launch(x, y, targetX, targetY, color) {
        this.fireworks.push({
            x, y, targetX, targetY, color,
            speed: 5 + Math.random() * 3,
            completed: false
        });
    }

    update() {
        // 更新烟花
        this.fireworks = this.fireworks.filter(firework => {
            if (firework.completed) return false;
            
            const dx = firework.targetX - firework.x;
            const dy = firework.targetY - firework.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 5) {
                this.explode(firework.x, firework.y, firework.color);
                firework.completed = true;
                return false;
            }
            
            firework.x += (dx / distance) * firework.speed;
            firework.y += (dy / distance) * firework.speed;
            
            return true;
        });
        
        // 更新爆炸粒子
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.05; // 重力
            particle.life -= 0.01;
            
            return particle.life > 0;
        });
    }

    explode(x, y, color) {
        // 不再播放爆炸音效
        
        // 创建爆炸粒子
        for (let i = 0; i < 80; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 2;
            // 使用烟花颜色，保持颜色一致性
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                life: 1,
                size: Math.random() * 3 + 1
            });
        }
    }

    draw() {
        // 绘制烟花
        this.fireworks.forEach(firework => {
            ctx.beginPath();
            ctx.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = firework.color;
            ctx.fill();
            
            // 绘制尾迹
            ctx.beginPath();
            ctx.moveTo(firework.x, firework.y);
            ctx.lineTo(firework.x - (firework.targetX - firework.x) * 0.1, 
                       firework.y - (firework.targetY - firework.y) * 0.1);
            ctx.strokeStyle = firework.color;
            ctx.lineWidth = 2;
            ctx.stroke();
        });
        
        // 绘制爆炸粒子
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.life;
            ctx.fill();
            ctx.globalAlpha = 1;
        });
    }
}

// 心形粒子系统
class HeartParticleSystem {
    constructor() {
        this.particles = [];
        this.heartPoints = [];
        this.currentPointIndex = 0;
        this.animationComplete = false;
    }

    createHeart(x, y, size) {
        // 重置状态
        this.particles = [];
        this.currentPointIndex = 0;
        this.animationComplete = false;
        
        // 生成心形点
        this.heartPoints = heartGenerator(x, y, size);
        
        // 找到心尖点（y值最大的点）
        let bottomPoint = this.heartPoints[0];
        for (let i = 1; i < this.heartPoints.length; i++) {
            if (this.heartPoints[i].y > bottomPoint.y) {
                bottomPoint = this.heartPoints[i];
            }
        }
        
        // 从心尖点开始排序
        const centerX = x;
        const centerY = y;
        
        // 将点分成左右两部分
        const leftPoints = [];
        const rightPoints = [];
        
        this.heartPoints.forEach(point => {
            if (point.x < centerX) {
                leftPoints.push(point);
            } else if (point.x > centerX) {
                rightPoints.push(point);
            }
        });
        
        // 按距离心尖点的角度排序
        leftPoints.sort((a, b) => {
            const angleA = Math.atan2(a.y - bottomPoint.y, a.x - bottomPoint.x);
            const angleB = Math.atan2(b.y - bottomPoint.y, b.x - bottomPoint.x);
            return angleA - angleB;
        });
        
        rightPoints.sort((a, b) => {
            const angleA = Math.atan2(a.y - bottomPoint.y, a.x - bottomPoint.x);
            const angleB = Math.atan2(b.y - bottomPoint.y, b.x - bottomPoint.x);
            return angleB - angleA;
        });
        
        // 重新构建点数组，从心尖开始，先左后右
        this.heartPoints = [bottomPoint, ...leftPoints, ...rightPoints];
    }

    update() {
        // 逐步创建粒子，从心尖开始向两边展开
        if (!this.animationComplete && this.currentPointIndex < this.heartPoints.length) {
            const pointsPerFrame = 5; // 每帧创建的点数
            
            for (let i = 0; i < pointsPerFrame && this.currentPointIndex < this.heartPoints.length; i++) {
                const point = this.heartPoints[this.currentPointIndex];
                
                this.particles.push({
                    x: point.x,
                    y: point.y,
                    targetX: point.x,
                    targetY: point.y,
                    color: '#ff4081',
                    size: Math.random() * 2 + 1,
                    life: 1,
                    vx: 0,
                    vy: 0
                });
                
                this.currentPointIndex++;
            }
            
            if (this.currentPointIndex >= this.heartPoints.length) {
                this.animationComplete = true;
            }
        }
        
        // 更新已有粒子
        this.particles.forEach(particle => {
            // 轻微的浮动效果
            particle.x += Math.sin(Date.now() * 0.001 + particle.x * 0.01) * 0.1;
            particle.y += Math.cos(Date.now() * 0.001 + particle.y * 0.01) * 0.1;
        });
    }

    draw() {
        this.particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();
        });
    }
}

// 星空背景系统
class StarBackground {
    constructor() {
        this.stars = Array(CONFIG.STAR.COUNT).fill().map(() => this.createStar());
    }

    createStar() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2,
            opacity: Math.random(),
            update: function() {
                this.opacity = this.opacity < 0 ? 1 : this.opacity - CONFIG.STAR.OPACITY_SPEED;
            },
            draw: function() {
                ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        };
    }

    animate() {
        this.stars.forEach(star => {
            star.update();
            star.draw();
        });
    }
}

// 心形生成器
const heartGenerator = (() => {
    const cache = new Map();
    
    return function(x, y, size) {
        const key = `${size}`;
        if (!cache.has(key)) {
            const points = [];
            for(let t = 0; t < Math.PI * 2; t += 0.05) {
                points.push({
                    x: size * (16 * Math.pow(Math.sin(t), 3)),
                    y: -size * (13 * Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t))
                });
            }
            cache.set(key, points);
        }
        return cache.get(key).map(p => ({
            x: x + p.x,
            y: y + p.y
        }));
    };
})();

// 初始化系统
const soundSystem = new SoundSystem();
const fireworkSystem = new FireworkSystem();
const heartParticleSystem = new HeartParticleSystem();
const starBackground = new StarBackground();

// 动画循环
function animate() {
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, width, height);

    starBackground.animate();
    fireworkSystem.update();
    fireworkSystem.draw();
    heartParticleSystem.update();
    heartParticleSystem.draw();

    requestAnimationFrame(animate);
}

// 事件处理器
const eventHandler = {
    currentPage: 0,
    totalPages: 5,
    letterContent: [],
    isAnimating: false,
    
    init() {
        // 输入验证
        const nameInput = document.getElementById('name');
        nameInput.addEventListener('input', () => {
            this.toggleButtonState(!!nameInput.value.trim());
        });

        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleClick();
            }
        });

        document.getElementById('launchBtn').addEventListener('click', () => {
            // 添加按钮点击音效
            soundSystem.playTone(440, 0.1);
            this.handleClick();
        });
        
        window.addEventListener('resize', () => this.handleResize());

        // 移动端触摸反馈
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('touchstart', () => {
                btn.style.transform = 'scale(0.95)';
            });
            btn.addEventListener('touchend', () => {
                btn.style.transform = 'scale(1)';
            });
        });

        // 初始状态
        this.toggleButtonState(false);
    },

    toggleButtonState(enabled) {
        const btn = document.getElementById('launchBtn');
        btn.disabled = !enabled;
        btn.style.opacity = enabled ? 1 : 0.6;
        btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
    },

    async handleClick() {
        const name = document.getElementById('name').value.trim();
        if (!name) {
            this.showMessage('✨ 请先输入你的名字哦～', 2000);
            return;
        }

        const btn = document.getElementById('launchBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span>加载中...';
        btn.disabled = true;

        // 模拟加载过程
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.hideInputBox();
        this.showMessage(name);
        this.createFireworks(name);
        setTimeout(() => this.showHeart(name), 3000);
        setTimeout(() => this.showLetter(name), 6000);

        // 恢复按钮状态
        setTimeout(() => {
            btn.innerHTML = originalText;
        }, 2000);
    },

    hideInputBox() {
        const inputBox = document.querySelector('.input-box');
        inputBox.classList.add('hidden');
        setTimeout(() => { inputBox.style.display = 'none'; }, 1000);
    },

    showMessage(name, duration = 3000) {
        const messages = [
            `${name}，你是我眼中的星辰大海 ✨`,
            `从遇见${name}的那天起，我的世界开始发光 🌟`,
            `${name}，你就是我的全世界 💫`,
            `愿与${name}共度余生，直到永恒 🌙`
        ];
        const messageEl = document.getElementById('message');
        messageEl.textContent = messages[Math.floor(Math.random() * messages.length)];
        messageEl.style.opacity = 1;
        
        // 播放成功音效
        soundSystem.playSuccess();
        
        setTimeout(() => messageEl.style.opacity = 0, duration);
    },

    createFireworks(name) {
        // 发射多组烟花 - 使用三种颜色
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const startX = Math.random() * width;
                const targetX = width/2 + (Math.random() - 0.5) * 100;
                const targetY = height/2 - 100 + (Math.random() - 0.5) * 50;
                // 从三种颜色中循环选择
                const color = CONFIG.COLORS[i % CONFIG.COLORS.length];
                
                fireworkSystem.launch(
                    startX, height,
                    targetX, targetY,
                    color
                );
            }, i * 200);
        }
    },

    showHeart(name) {
        // 创建心形粒子 - 使用原始粉色
        heartParticleSystem.createHeart(width/2, height/2, CONFIG.HEART.EXPLOSION_SIZE);
        
        // 播放心跳音效
        soundSystem.playHeartbeat();
    },

    handleResize() {
        [width, height] = [window.innerWidth, window.innerHeight];
        [canvas.width, canvas.height] = [width, height];
        starBackground.stars = Array(CONFIG.STAR.COUNT).fill().map(() => starBackground.createStar());
    },

    showLetter(name) {
        // 设置情书内容
        this.letterContent = [
            `我想，谈恋爱不只是亲一下，抱一下，牵牵手，也不只是弄个情侣网名，或者穿个情侣装，然后整天腻在一起什么事都不去做互相耽误。`,
            `《侧耳倾听》里有这么一段话："因为你，我愿意成为一个更好的人，不想成为你的包袱，因此发奋努力只是为了想要证明我是与你相配。"好的爱情，一定是彼此相互成长的。`,
            `我不会以爱之名束缚你，你可以做你想做的事情，但我希望你做任何事情之前都可以想起我，并且因为我而拒绝一些暧昧的人，或事。`,
            `我希望我们谈的不只是恋爱，而是信任，是忠诚，是陪伴，也是考验，也不只是有爱情的甜蜜，还会跟你一起分享快乐和痛苦。当你坚持不下去的时候，身边都会有一个对你无条件支持的人。`,
            `希望我们都将永远忠于爱情，我们永远在一起晨昏与四季，我爱你。`
        ];
        
        const letterEl = document.getElementById('letter');
        this.currentPage = 0;
        this.renderLetterPage(name, letterEl);
        
        letterEl.style.opacity = 1;
        letterEl.classList.add('open');
    },

    renderLetterPage(name, letterEl) {
        letterEl.innerHTML = `
            <div class="letter-content">
                <h2>致${name}</h2>
                <p>
                    <span class="text-container" id="textContainer"></span>
                </p>
                <div class="letter-nav">
                    <button class="nav-btn" id="prevBtn" ${this.currentPage === 0 ? 'disabled' : ''}>上一页</button>
                    <span style="align-self: center;">${this.currentPage + 1} / ${this.totalPages}</span>
                    <button class="nav-btn" id="nextBtn">${this.currentPage === this.totalPages - 1 ? '结束' : '下一页'}</button>
                </div>
            </div>
        `;
        
        // 绑定按钮事件
        document.getElementById('prevBtn').addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextBtn').addEventListener('click', () => this.changePage(1));
        
        // 逐字显示效果
        this.typewriterEffect(this.letterContent[this.currentPage]);
    },

    typewriterEffect(text) {
        if (this.isAnimating) return;
        this.isAnimating = true;
        
        const container = document.getElementById('textContainer');
        container.innerHTML = '';
        
        // 将文本拆分为字符
        const chars = text.split('');
        let index = 0;
        
        const showNextChar = () => {
            if (index < chars.length) {
                const span = document.createElement('span');
                span.className = 'char show';
                span.textContent = chars[index];
                container.appendChild(span);
                index++;
                setTimeout(showNextChar, 50);
            } else {
                this.isAnimating = false;
                
                // 如果是最后一页，添加回答按钮
                if (this.currentPage === this.totalPages - 1) {
                    setTimeout(() => this.showResponseButtons(), 500);
                }
            }
        };
        
        soundSystem.playPageTurn();
        showNextChar();
    },

    showResponseButtons() {
        const nav = document.querySelector('.letter-nav');
        nav.innerHTML = `
            <button class="nav-btn" id="prevBtn">上一页</button>
            <div class="action-buttons">
                <button class="response-btn reject" id="rejectBtn">拒绝</button>
                <button class="response-btn accept" id="acceptBtn">接受</button>
            </div>
        `;
        
        document.getElementById('prevBtn').addEventListener('click', () => this.changePage(-1));
        document.getElementById('rejectBtn').addEventListener('click', () => this.handleReject());
        document.getElementById('acceptBtn').addEventListener('click', () => this.handleAccept());
    },

    handleReject() {
        if (this.isAnimating) return;
        
        const letterEl = document.getElementById('letter');
        const nav = document.querySelector('.letter-nav');
        
        // 禁用按钮
        nav.querySelectorAll('button').forEach(btn => btn.disabled = true);
        
        this.isAnimating = true;
        
        // 显示拒绝后的动画
        const btn = document.getElementById('rejectBtn');
        
        // 创建涟漪效果
        this.createRipple(btn);
        
        setTimeout(() => {
            alert('没关系，我会一直在你身边，默默守护你 💙');
            
            // 隐藏情书
            letterEl.classList.remove('open');
            letterEl.classList.add('close');
            
            // 创建心形粒子
            setTimeout(() => {
                heartParticleSystem.createHeart(width/2, height/2, CONFIG.HEART.EXPLOSION_SIZE);
                soundSystem.playHeartbeat();
            }, 500);
            
            this.isAnimating = false;
        }, 1000);
    },

    handleAccept() {
        if (this.isAnimating) return;
        
        const nav = document.querySelector('.letter-nav');
        
        // 禁用按钮
        nav.querySelectorAll('button').forEach(btn => btn.disabled = true);
        
        this.isAnimating = true;
        
        // 播放成功音效
        soundSystem.playSuccess();
        
        // 播放烟花
        this.createFireworks('你');
        
        setTimeout(() => {
            const btn = document.getElementById('acceptBtn');
            this.createRipple(btn);
            
            setTimeout(() => {
                alert('太好了！我会用一生来爱你，守护你！💕');
                this.isAnimating = false;
            }, 1000);
        }, 500);
    },

    createRipple(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${rect.left}px`;
        ripple.style.top = `${rect.top}px`;
        
        document.body.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 1500);
    },

    changePage(direction) {
        if (this.isAnimating) return;
        
        const newPage = this.currentPage + direction;
        
        if (newPage >= 0 && newPage < this.totalPages) {
            this.currentPage = newPage;
            this.renderLetterPage(document.getElementById('name').value.trim(), document.getElementById('letter'));
        }
    }
};

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
    eventHandler.init();
    animate();
});