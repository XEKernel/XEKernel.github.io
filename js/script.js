// 公共JavaScript文件 - script.js

// 检查particles.js是否加载成功
let particlesLoaded = false;

// 粒子背景初始化（带错误处理）
function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 100,
                    density: {
                        enable: true,
                        value_area: 900
                    }
                },
                color: {
                    value: ["#00F5FF", "#7B68EE", "#FF6B9D"]
                },
                shape: {
                    type: "circle",
                    stroke: {
                        width: 0,
                        color: "#000000"
                    }
                },
                opacity: {
                    value: 0.6,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1.5,
                        opacity_min: 0.2,
                        sync: false
                    }
                },
                size: {
                    value: 3.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2.5,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 160,
                    color: "#00F5FF",
                    opacity: 0.5,
                    width: 1.5
                },
                move: {
                    enable: true,
                    speed: 2.5,
                    direction: "none",
                    random: true,
                    straight: false,
                    out_mode: "out",
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: "canvas",
                events: {
                    onhover: {
                        enable: true,
                        mode: "grab"
                    },
                    onclick: {
                        enable: true,
                        mode: "push"
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 160,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    push: {
                        particles_nb: 6
                    }
                }
            },
            retina_detect: true
        });
        particlesLoaded = true;
        console.log('Particles initialized successfully');
    } else {
        console.warn('particles.js not loaded, particle effects disabled');
        // 隐藏粒子容器以避免空白区域
        const particlesContainer = document.getElementById('particles-js');
        if (particlesContainer) {
            particlesContainer.style.display = 'none';
        }
    }
}

// 延迟初始化粒子效果
setTimeout(initParticles, 100);

// 重新尝试加载particles.js
function retryLoadParticles() {
    if (!particlesLoaded) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/particles.js/2.0.0/particles.min.js';
        script.crossOrigin = 'anonymous';
        script.onerror = () => {
            console.warn('Failed to load particles.js from fallback CDN');
            // 再尝试备用CDN
            const backupScript = document.createElement('script');
            backupScript.src = 'https://unpkg.com/particles.js@2.0.0/particles.min.js';
            backupScript.crossOrigin = 'anonymous';
            backupScript.onerror = () => {
                console.warn('All CDN sources failed for particles.js');
            };
            backupScript.onload = () => {
                setTimeout(initParticles, 500);
            };
            document.head.appendChild(backupScript);
        };
        script.onload = () => {
            setTimeout(initParticles, 500);
        };
        document.head.appendChild(script);
    }
}

// 5秒后重试加载
setTimeout(retryLoadParticles, 5000);

// 打字效果
async function typeWriter(text, element, cursorElement, speed = 80) {
    element.innerHTML = '';
    cursorElement.style.visibility = 'visible';

    for (let i = 0; i < text.length; i++) {
        element.innerHTML += text[i];
        // 更自然的打字速度变化
        const currentSpeed = speed + Math.random() * 30 - 15;
        await new Promise(resolve => setTimeout(resolve, Math.max(30, currentSpeed)));
    }

    // 光标闪烁动画
    for (let i = 0; i < 3; i++) {
        cursorElement.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 150));
        cursorElement.style.opacity = '1';
        await new Promise(resolve => setTimeout(resolve, 150));
    }
    cursorElement.style.visibility = 'hidden';
}

// 格言循环显示
const quotes = [
    "人一旦有了隔阂就真的走不近了，断了的绳子怎么系都有结，这世上只有和好，没有如初和好容易，如初太难",
    "爱情之酒甜而苦。两人喝，是甘露；三人喝，是酸醋；随便喝，要中毒。",
    "爱情是女人一生的历史，而只是男人一生中的一段插曲。",
    "没有爱情的人生是什么？是没有黎明的长夜！",
    "爱一个人就是指帮助他回到自己，使他更是他自己。",
    "友情是永不放弃的信念——永远相信，永远相信，永远相信。",
    "友情是永不中断的TCP连接——双向奔赴，持久稳定。",
    "爱情像递归算法：需要终止条件，更需要永恒的热情。",
    "温暖的话语能穿透最坚硬的防火墙，直达心底。",
    "陪伴是最长情的告白，就像永不超时的心跳包。",    
];

function displayQuotes() {
    let currentQuoteIndex = 0;
    const quoteDisplay = document.getElementById("quoteDisplay");
    
    // 立即显示第一个格言
    if (quoteDisplay && quotes.length > 0) {
        quoteDisplay.innerHTML = quotes[0];
        currentQuoteIndex = 1;
    }
    
    setInterval(() => {
        if (quoteDisplay) {
            quoteDisplay.style.transition = 'opacity 0.6s ease';
            quoteDisplay.style.opacity = 0;
            
            setTimeout(() => {
                quoteDisplay.innerHTML = quotes[currentQuoteIndex];
                quoteDisplay.style.opacity = 1;
                currentQuoteIndex = (currentQuoteIndex + 1) % quotes.length;
            }, 600);
        }
    }, 6000);
}

// 滚动导航高亮
function highlightNavOnScroll() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.navLink');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').substring(1) === currentSection) {
            link.classList.add('active');
        }
    });
}

// 平滑滚动到指定部分
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const navHeight = document.getElementById('mainNav').offsetHeight;
        const targetPosition = section.offsetTop - navHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// 返回顶部功能
function setupBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }, { passive: true });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// 导航栏滚动效果
function setupNavScroll() {
    const nav = document.getElementById('mainNav');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        // 滚动超过80px时添加scrolled类
        if (currentScrollY > 80) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
    }, { passive: true });
}

// 移动端菜单切换
function setupMobileMenu() {
    const menuToggle = document.getElementById('mobileMenu');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) return;
    
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    
    // 点击导航链接后关闭菜单
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
    
    // 点击页面其他区域关闭菜单
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    });
}

// Toast 通知
function showToast(msg) {
    var el = document.createElement('div');
    el.textContent = msg;
    Object.assign(el.style, {
        position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
        background: 'var(--tx)', color: 'var(--bg)', padding: '10px 24px',
        borderRadius: '100px', fontSize: '0.88rem', zIndex: '999',
        opacity: '0', transition: 'opacity 0.3s', pointerEvents: 'none',
        fontFamily: 'inherit'
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => el.style.opacity = '1');
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 300);
    }, 2000);
}

// 复制到剪贴板功能
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制到剪贴板');
    }).catch(function() {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('已复制到剪贴板');
        } catch (e) {
            prompt('无法自动复制，请手动复制:', text);
        }
        document.body.removeChild(ta);
    });
}

// GitHub API调用（带 localStorage 缓存）
const CACHE_TTL = 10 * 60 * 1000; // 10分钟

function getCache(key) {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
        const { data, time } = JSON.parse(raw);
        return Date.now() - time < CACHE_TTL ? data : null;
    } catch { return null; }
}

function setCache(key, data) {
    try { localStorage.setItem(key, JSON.stringify({ data, time: Date.now() })); } catch {}
}

// 获取GitHub用户统计数据
async function fetchGitHubStats() {
    const cached = getCache('gh_stats');
    if (cached) {
        updateAvatar(cached.avatar);
        updateStats(cached);
        return;
    }

    const username = 'XEKernel';
    
    try {
        const [userResponse, reposResponse] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`),
            fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=owner`)
        ]);
        
        if (!userResponse.ok) throw new Error('GitHub API error');
        
        const userData = await userResponse.json();
        let repos = [];
        if (reposResponse.ok) repos = await reposResponse.json();
        
        const totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        const experienceYears = calculateExperienceYears(userData.created_at);
        
        const stats = {
            repoCount: userData.public_repos || 0,
            experienceYears,
            totalStars,
            followers: userData.followers || 0,
            avatar: userData.avatar_url
        };
        
        updateAvatar(stats.avatar);
        updateStats(stats);
        setCache('gh_stats', stats);
        
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        const fallback = getCache('gh_stats');
        if (fallback) {
            updateAvatar(fallback.avatar);
            updateStats(fallback);
        } else {
            updateStats({ repoCount: 0, experienceYears: 3, totalStars: 0, followers: 0 });
        }
    }
}

// 计算编程经验年数
function calculateExperienceYears(createdAt) {
    if (!createdAt) return 3;
    
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    
    // 计算年数差
    let years = currentDate.getFullYear() - createdDate.getFullYear();
    
    // 计算月份差
    let months = currentDate.getMonth() - createdDate.getMonth();
    
    // 如果月份差为负，说明还没满整年
    if (months < 0) {
        years--;
        months += 12;
    }
    
    // 如果月份差小于6个月，可以选择向下取整；否则向上取整
    // 这里我们保留一位小数，显示更精确的年数
    const preciseYears = years + (months / 12);
    
    // 返回整数年数（向下取整）
    return Math.floor(preciseYears);
}

// 更新统计数据显示
function updateStats({ repoCount, experienceYears, totalStars, followers, avatar }) {
    updateStatElement('experienceYears', experienceYears);
    updateStatElement('repoCount', repoCount);
    updateStatElement('totalStars', totalStars);
    updateStatElement('followerCount', followers);
    
    // 更新内联统计卡片
    const overview = document.getElementById('statsOverview');
    if (overview) {
        overview.innerHTML = `
            <div class="stat-row"><span class="stat-k">仓库</span><span class="stat-v">${repoCount}</span></div>
            <div class="stat-row"><span class="stat-k">星标</span><span class="stat-v">${totalStars}</span></div>
            <div class="stat-row"><span class="stat-k">关注者</span><span class="stat-v">${followers}</span></div>
            <div class="stat-row"><span class="stat-k">经验</span><span class="stat-v">${experienceYears} 年</span></div>
        `;
    }
    
    animateStatsIfVisible();
}

// 辅助：更新单个统计元素
function updateStatElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.setAttribute('data-target', value);
        el.classList.remove('counted'); // allow re-animation
        el.textContent = '0'; // reset display
    }
}

// 对可见的未计数统计数字执行动画
function animateStatsIfVisible() {
    const statsContainer = document.querySelector('.stats-container');
    if (!statsContainer) return;
    const rect = statsContainer.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
        document.querySelectorAll('.stat-item .stat-number').forEach(el => {
            const target = parseInt(el.getAttribute('data-target'));
            if (target > 0 && !el.classList.contains('counted')) {
                el.classList.add('counted');
                animateCounter(el, target);
            } else if (target === 0 && !el.classList.contains('counted')) {
                // Even if target is 0, mark as counted to avoid leaving 0 display
                el.classList.add('counted');
                el.textContent = '0';
            }
        });
    }
}

// 从 GitHub API 更新头像
function updateAvatar(avatarUrl) {
    if (!avatarUrl) return;
    const profilePics = document.querySelectorAll('.profilePic');
    profilePics.forEach(pic => {
        pic.src = avatarUrl;
        pic.onerror = null; // 不回退，保留现有
    });
    // 更新 favicon
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) favicon.href = avatarUrl;
}

// 获取GitHub项目列表
async function fetchGitHubProjects() {
    const username = 'XEKernel';
    const apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`;
    
    try {
        const response = await fetch(apiUrl);
        const projects = await response.json();
        
        if (!response.ok) {
            throw new Error('获取GitHub项目失败');
        }
        
        displayProjects(projects);
    } catch (error) {
        console.error('Error fetching GitHub projects:', error);
        const container = document.getElementById('projects-container');
        if (container) {
            container.innerHTML = `
                <div class="loading">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>无法加载项目，请稍后再试</p>
                </div>
            `;
        }
    }
}

function displayProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (projects.length === 0) {
        container.innerHTML = '<p style="text-align: center;">暂无项目</p>';
        return;
    }
    
    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        const languageTag = project.language 
            ? `<span class="language-tag">${project.language}</span>` 
            : '';
        
        const description = project.description || '暂无项目描述';
        
        card.innerHTML = `
            <h3>${project.name}</h3>
            <p>${description}</p>
            <div class="project-meta">
                <span><i class="fas fa-star"></i> ${project.stargazers_count}</span>
                <span><i class="fas fa-code-branch"></i> ${project.forks_count}</span>
                <span>${languageTag}</span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// 数字计数动画
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }
    
    updateCounter();
}

// 观察者模式：元素进入视口时触发动画
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px'
    };
    
    let statsAnimated = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add visible class for .reveal elements
                if (entry.target.classList.contains('reveal')) {
                    entry.target.classList.add('visible');
                }
                entry.target.classList.add('animate');
                
                // Stats counter animation — trigger once
                if (entry.target.classList.contains('stat-item') && !statsAnimated) {
                    statsAnimated = true;
                    document.querySelectorAll('.stat-item .stat-number').forEach(el => {
                        const target = parseInt(el.getAttribute('data-target'));
                        if (target && !el.classList.contains('counted')) {
                            el.classList.add('counted');
                            animateCounter(el, target);
                        }
                    });
                }
                
                // Language donut — load when about-skills enters view
                if (entry.target.classList.contains('about-skills') && !entry.target.classList.contains('loaded')) {
                    entry.target.classList.add('loaded');
                    fetchLanguageDistribution();
                }
            }
        });
    }, observerOptions);
    
    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.stat-item, .tool-card, .contact-card, .project-card, .about-skills, .github-stat-card, .contribution-card, .update-section');
    animatedElements.forEach(el => observer.observe(el));
}

// 从GitHub获取语言分布并生成圆环图
async function fetchLanguageDistribution() {
    const username = 'XEKernel';
    
    try {
        // 获取所有仓库
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=owner`);
        
        // 检查响应状态
        if (!reposResponse.ok) {
            if (reposResponse.status === 403) {
                console.warn('GitHub API速率限制，使用默认数据');
                throw new Error('GitHub API速率限制');
            } else if (reposResponse.status === 404) {
                console.warn('用户不存在，使用默认数据');
                throw new Error('用户不存在');
            } else {
                console.warn(`GitHub API错误: ${reposResponse.status}，使用默认数据`);
                throw new Error(`GitHub API错误: ${reposResponse.status}`);
            }
        }
        
        const repos = await reposResponse.json();
        
        // 检查是否返回了数组
        if (!Array.isArray(repos)) {
            console.warn('GitHub API返回数据格式错误，使用默认数据');
            throw new Error('数据格式错误');
        }
        
        // 统计语言分布
        const languageStats = {};
        let totalProjects = 0;
        
        repos.forEach(repo => {
            if (repo.language) {
                languageStats[repo.language] = (languageStats[repo.language] || 0) + 1;
                totalProjects++;
            }
        });
        
        // 如果没有语言数据，使用默认值
        if (totalProjects === 0) {
            console.log('没有找到有语言标签的项目，使用默认数据');
            languageStats['Python'] = 4;
            languageStats['C#'] = 3;
            languageStats['JavaScript'] = 2;
            languageStats['HTML/CSS'] = 1;
            totalProjects = 10;
        }
        
        // 生成圆环图
        generateDonutChart(languageStats, totalProjects);
        
    } catch (error) {
        console.error('Error fetching language distribution:', error);
        // 使用默认数据
        const defaultStats = {
            'Python': 4,
            'C#': 3,
            'JavaScript': 2,
            'HTML/CSS': 1
        };
        generateDonutChart(defaultStats, 10);
    }
}

// 生成圆环图
function generateDonutChart(languageStats, totalProjects) {
    const segmentsGroup = document.getElementById('languageSegments');
    const legendContainer = document.getElementById('languageLegend');
    const totalProjectsElement = document.getElementById('totalProjects');
    
    if (!segmentsGroup || !legendContainer || !totalProjectsElement) return;
    
    // 清空现有内容
    segmentsGroup.innerHTML = '';
    legendContainer.innerHTML = '';
    
    // 语言颜色映射
    const languageColors = {
        'Python': '#3776AB',
        'C#': '#9B4DCA',
        'JavaScript': '#F7DF1E',
        'HTML': '#E34F26',
        'CSS': '#1572B6',
        'HTML/CSS': '#E34F26',
        'TypeScript': '#3178C6',
        'Java': '#007396',
        'Go': '#00ADD8',
        'Rust': '#000000',
        'PHP': '#777BB4',
        'Ruby': '#CC342D',
        'Swift': '#F05138',
        'Kotlin': '#A97BFF',
        'C++': '#00599C',
        'C': '#A8B9CC',
        'Shell': '#89E051',
        'Vue': '#4FC08D',
        'React': '#61DAFB',
        'Dart': '#0175C2'
    };
    
    // 圆环参数
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const animationDuration = 1500; // 动画时长（毫秒）
    const animationDelay = 100; // 每个段的延迟
    
    // 计算每个语言段的偏移量和长度
    const segments = [];
    let currentOffset = 0;
    
    Object.entries(languageStats).forEach(([language, count], index) => {
        const percentage = (count / totalProjects) * 100;
        const strokeLength = (count / totalProjects) * circumference;
        const color = languageColors[language] || `hsl(${index * 60}, 70%, 50%)`;
        
        segments.push({
            language,
            count,
            percentage,
            strokeLength,
            color,
            offset: currentOffset,
            index
        });
        
        currentOffset += strokeLength;
    });
    
    // 创建圆弧并添加动画
    segments.forEach((segment, index) => {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'donut-segment');
        circle.setAttribute('cx', '100');
        circle.setAttribute('cy', '100');
        circle.setAttribute('r', radius);
        circle.setAttribute('stroke', segment.color);
        circle.setAttribute('fill', 'none');
        circle.setAttribute('stroke-dasharray', `0 ${circumference}`);
        circle.setAttribute('stroke-dashoffset', -segment.offset);
        circle.style.color = segment.color;
        circle.style.transition = 'stroke-dasharray 0.1s ease';
        
        // 添加鼠标事件
        circle.addEventListener('mouseenter', () => {
            totalProjectsElement.textContent = segment.count;
            totalProjectsElement.nextElementSibling.textContent = segment.language + '项目';
        });
        
        circle.addEventListener('mouseleave', () => {
            totalProjectsElement.textContent = totalProjects;
            totalProjectsElement.nextElementSibling.textContent = '个项目';
        });
        
        segmentsGroup.appendChild(circle);
        
        // 动画效果：使用requestAnimationFrame实现平滑过渡
        const startDelay = animationDelay + index * 150;
        const startTime = performance.now() + startDelay;
        
        function animateSegment(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            // 使用缓动函数使动画更自然
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentLength = segment.strokeLength * easeProgress;
            
            circle.setAttribute('stroke-dasharray', `${currentLength} ${circumference}`);
            
            if (progress < 1) {
                requestAnimationFrame(animateSegment);
            }
        }
        
        requestAnimationFrame(animateSegment);
        
        // 创建图例项
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = `
            <div class="legend-color" style="background: ${segment.color}; color: ${segment.color};"></div>
            <span class="legend-label">${segment.language}</span>
            <span class="legend-percentage">${segment.percentage.toFixed(1)}%</span>
        `;
        
        // 图例项动画
        legendItem.style.opacity = '0';
        legendItem.style.transform = 'translateY(20px)';
        
        legendItem.addEventListener('mouseenter', () => {
            circle.style.strokeWidth = '30';
            circle.style.filter = 'drop-shadow(0 0 15px currentColor)';
            totalProjectsElement.textContent = segment.count;
            totalProjectsElement.nextElementSibling.textContent = segment.language + '项目';
        });
        
        legendItem.addEventListener('mouseleave', () => {
            circle.style.strokeWidth = '';
            circle.style.filter = '';
            totalProjectsElement.textContent = totalProjects;
            totalProjectsElement.nextElementSibling.textContent = '个项目';
        });
        
        legendContainer.appendChild(legendItem);
        
        // 图例项淡入动画
        setTimeout(() => {
            legendItem.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            legendItem.style.opacity = '1';
            legendItem.style.transform = 'translateY(0)';
        }, startDelay + 200);
    });
    
    // 更新总项目数
    animateCounter(totalProjectsElement, totalProjects, 1500);
    
    // 更新技术栈标签 + 语言条形图
    updateTechStackTags(languageStats);
    updateLangBars(languageStats, totalProjects);
}

// 动态更新技术栈标签
function updateTechStackTags(languageStats) {
    const container = document.getElementById('techStackTags');
    if (!container) return;
    
    // 获取语言列表（按数量排序）
    const sortedLanguages = Object.entries(languageStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6); // 最多显示6种语言
    
    if (sortedLanguages.length === 0) return;
    
    // 生成标签 HTML
    const tagsHtml = sortedLanguages.map(([language]) => 
        `<span class="tech-tag">${language}</span>`
    ).join('、');
    
    // 更新容器内容，添加淡入动画
    container.style.opacity = '0';
    container.innerHTML = tagsHtml;
    
    setTimeout(() => {
        container.style.transition = 'opacity 0.5s ease';
        container.style.opacity = '1';
    }, 100);
}

// 更新语言条形图
function updateLangBars(languageStats, totalProjects) {
    const el = document.getElementById('langBars');
    if (!el || totalProjects === 0) return;
    
    const languageColors = {
        'Python': '#3776AB', 'C#': '#9B4DCA', 'JavaScript': '#F7DF1E',
        'HTML': '#E34F26', 'CSS': '#1572B6', 'HTML/CSS': '#E34F26',
        'TypeScript': '#3178C6', 'Java': '#007396', 'Go': '#00ADD8',
        'Rust': '#000000', 'PHP': '#777BB4', 'C++': '#00599C',
        'C': '#A8B9CC', 'Shell': '#89E051', 'Vue': '#4FC08D',
        'Dart': '#0175C2', 'Kotlin': '#A97BFF', 'Swift': '#F05138',
    };
    
    const sorted = Object.entries(languageStats).sort((a, b) => b[1] - a[1]).slice(0, 6);
    
    let html = '';
    for (const [lang, count] of sorted) {
        const pct = ((count / totalProjects) * 100).toFixed(1);
        const color = languageColors[lang] || '#6b7280';
        html += `<div class="lang-bar-item">
            <span class="lang-bar-name">${lang}</span>
            <div class="lang-bar-track"><div class="lang-bar-fill" style="width:${pct}%;background:${color}"></div></div>
            <span class="lang-bar-pct">${pct}%</span>
        </div>`;
    }
    el.innerHTML = html;
}

// 视差滚动效果
function setupParallaxEffect() {
    const shapes = document.querySelectorAll('.floating-shape');
    if (!shapes.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const state = { scroll: 0, mx: 0, my: 0, ticking: false };

    // 滚动偏移 + 鼠标偏移统一合并计算，避免两个监听器互相覆盖 transform
    const apply = () => {
        state.ticking = false;
        shapes.forEach((shape, index) => {
            const sp = (index + 1) * 0.1;
            const msp = (index + 1) * 20;
            const tx = state.mx * msp;
            const ty = state.scroll * sp + state.my * msp;
            shape.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${state.scroll * 0.05}deg)`;
        });
    };
    const schedule = () => {
        if (!state.ticking) { state.ticking = true; requestAnimationFrame(apply); }
    };

    window.addEventListener('scroll', () => { state.scroll = window.pageYOffset || 0; schedule(); }, { passive: true });

    // 鼠标跟随（仅桌面端）
    if (window.innerWidth > 768) {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.addEventListener('mousemove', (e) => {
                const rect = heroSection.getBoundingClientRect();
                state.mx = (e.clientX - rect.left) / rect.width - 0.5;
                state.my = (e.clientY - rect.top) / rect.height - 0.5;
                schedule();
            });
        }
    }
}

// 元素滚动进入动画
function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.section-content, .hero-content, .hero-visual');
    if (!revealElements.length) return;

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
}

// 平滑滚动到锚点
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.getElementById('mainNav').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// 添加页面加载动画（带兜底：无论 load 是否触发，页面都会在超时后显示）
function setupPageLoadAnimation() {
    document.body.style.opacity = '0';

    const finish = () => {
        document.body.style.transition = 'opacity 0.8s ease-in-out';
        document.body.style.opacity = '1';
    };

    // 若脚本执行时页面已加载完成（如服务端渲染/缓存命中），直接显示
    if (document.readyState === 'complete') { finish(); return; }

    // 3 秒兜底：CDN 资源卡住时 load 不触发，也不能让页面一直透明
    const fallback = setTimeout(finish, 3000);
    window.addEventListener('load', () => { clearTimeout(fallback); finish(); }, { once: true });
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 优化滚动事件
function setupOptimizedScroll() {
    const handleScroll = throttle(() => {
        highlightNavOnScroll();
    }, 100);
    
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// 添加键盘导航
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Esc键关闭移动端菜单
        if (e.key === 'Escape') {
            const navLinks = document.querySelector('.nav-links');
            const menuToggle = document.getElementById('mobileMenu');
            if (navLinks) navLinks.classList.remove('active');
            if (menuToggle) menuToggle.classList.remove('active');
        }
    });
}

// 错误处理
function setupErrorHandling() {
    window.addEventListener('error', (e) => {
        console.error('页面错误:', e.error);
    });
    
    window.addEventListener('unhandledrejection', (e) => {
        console.error('未处理的Promise拒绝:', e.reason);
    });
}

// 初始化所有功能
function initAll() {
    displayQuotes();
    setupBackToTop();
    setupNavScroll();
    setupMobileMenu();
    setupScrollAnimations();
    setupParallaxEffect();
    setupScrollReveal();
    setupSmoothScroll();
    setupPageLoadAnimation();
    setupOptimizedScroll();
    setupKeyboardNavigation();
    setupErrorHandling();
    initRevealElements();

    // 2026-08 新增动画与优化
    setupScrollProgress();
    setupCardTilt();

    // 延迟从GitHub获取统计数据，避免速率限制
    if (document.getElementById('repoCount') || document.getElementById('totalStars') || document.getElementById('followerCount')) {
        setTimeout(() => {
            fetchGitHubStats();
        }, 500);
    }
    
    // 如果页面有GitHub项目部分，则延迟加载项目
    if (document.getElementById('projects-container')) {
        setTimeout(() => {
            fetchGitHubProjects();
        }, 1000);
    }
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
}

// ── Reveal animation setup ──
function initRevealElements() {
    // Add .reveal class to grid children for scroll-triggered animations
    const grids = {
        '.projects-grid .project-card': 'project-card',
        '.tools-grid .tool-card': 'tool-card',
        '.contact-grid .contact-card': 'contact-card',
        '.github-stats-grid .github-stat-card': 'github-stat-card',
        '.stats-container .stat-item': 'stat-item',
    };
    
    for (const [selector, cls] of Object.entries(grids)) {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add('reveal', cls);
            el.style.setProperty('--i', i);
        });
    }
    
    // Also add reveal to .update-section elements
    document.querySelectorAll('.update-section').forEach((el, i) => {
        el.classList.add('reveal', 'update-section');
        el.style.setProperty('--i', i);
    });
}

// ── Theme toggle ──
function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? null : 'dark';
    if (next) html.setAttribute('data-theme', next);
    else html.removeAttribute('data-theme');
    localStorage.setItem('theme', next || 'light');
}
(function() {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
})();

// 服务页面头像获取
(function() {
    var path = window.location.pathname;
    if (path.indexOf('/services/') !== -1 || path.indexOf('UpdateLog') !== -1) {
        var cached = getCache('gh_stats');
        if (cached && cached.avatar) {
            var f = document.querySelector('link[rel="icon"]');
            if (f) f.href = cached.avatar;
        } else {
            fetch('https://api.github.com/users/XEKernel')
                .then(function(r) { return r.json(); })
                .then(function(d) {
                    if (d.avatar_url) {
                        var f = document.querySelector('link[rel="icon"]');
                        if (f) f.href = d.avatar_url;
                    }
                })
                .catch(function(){});
        }
    }
})();

// 页面可见性变化处理：页面不可见时暂停粒子动画，省电省资源
document.addEventListener('visibilitychange', () => {
    const canvas = document.querySelector('#particles-js canvas');
    if (canvas) {
        if (document.visibilityState === 'visible') canvas.style.animationPlayState = 'running';
        else canvas.style.animationPlayState = 'paused';
    }
});

// 页面大小变化处理
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // 屏幕旋转/缩放后重新评估是否启用卡片倾斜
        setupCardTilt();
    }, 250);
});

/* ═══════════════════════════════════════════════════
   2026-08 · 新增动画交互
   ═══════════════════════════════════════════════════ */

// 顶部滚动进度条
function setupScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    const update = () => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
        bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
}

// 卡片 3D 倾斜 + 光晕跟随（桌面端，respect reduced-motion）
function setupCardTilt() {
    if (window.innerWidth <= 768) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll(
        '.project-card, .tool-card, .contact-card, .github-stat-card, .update-section'
    );
    cards.forEach(card => {
        card.classList.add('spotlight');
        // 已绑定过的事件不再重复绑定（resize 时会再次调用）
        if (card.dataset.tiltBound) return;
        card.dataset.tiltBound = '1';

        card.addEventListener('mouseenter', () => card.classList.add('tilt-card'));
        card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            card.style.setProperty('--rx', ((0.5 - py) * 8).toFixed(2) + 'deg');
            card.style.setProperty('--ry', ((px - 0.5) * 10).toFixed(2) + 'deg');
            card.style.setProperty('--ty', '-3px');
            card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
            card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
        card.addEventListener('mouseleave', () => {
            card.classList.remove('tilt-card');
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
            card.style.setProperty('--ty', '0px');
        });
    });
}

// 导航栏滚动投影（原有 setupNavScroll 已负责 .scrolled 类，此处仅补充 CSS 增强，不重复逻辑）