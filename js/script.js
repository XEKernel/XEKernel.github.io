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

// 复制到剪贴板功能
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('QQ号已复制到剪贴板: ' + text);
    }).catch(err => {
        // 备用方案：使用传统方法复制
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            alert('QQ号已复制到剪贴板: ' + text);
        } catch (e) {
            prompt('无法自动复制，请手动复制:', text);
        }
        
        document.body.removeChild(textarea);
    });
}

// GitHub API调用
// 获取GitHub用户统计数据
async function fetchGitHubStats() {
    const username = 'XEKernel';
    const userApiUrl = `https://api.github.com/users/${username}`;
    
    try {
        // 获取用户基本信息（包含仓库数量、注册日期、followers等）
        const userResponse = await fetch(userApiUrl);
        
        if (!userResponse.ok) {
            if (userResponse.status === 403) {
                console.warn('GitHub API速率限制，使用默认数据');
                throw new Error('GitHub API速率限制');
            } else if (userResponse.status === 404) {
                console.warn('用户不存在，使用默认数据');
                throw new Error('用户不存在');
            } else {
                console.warn(`GitHub API错误: ${userResponse.status}，使用默认数据`);
                throw new Error(`GitHub API错误: ${userResponse.status}`);
            }
        }
        
        const userData = await userResponse.json();
        
        // 并行获取仓库列表和公共活动事件
        const reposApiUrl = `https://api.github.com/users/${username}/repos?per_page=100&type=owner`;
        const eventsApiUrl = `https://api.github.com/users/${username}/events/public?per_page=100`;
        
        const [reposResponse, eventsResponse] = await Promise.all([
            fetch(reposApiUrl),
            fetch(eventsApiUrl)
        ]);
        
        let repos = [];
        if (reposResponse.ok) {
            repos = await reposResponse.json();
        }
        
        let events = [];
        if (eventsResponse.ok) {
            events = await eventsResponse.json();
        }
        
        // 计算总星标数
        let totalStars = 0;
        if (Array.isArray(repos)) {
            totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
        }
        
        // 从最近公开事件中统计 PushEvent 数量（反映近期提交活跃度）
        const recentPushEvents = Array.isArray(events)
            ? events.filter(e => e.type === 'PushEvent').length
            : 0;
        
        const experienceYears = calculateExperienceYears(userData.created_at);
        const repoCount = userData.public_repos || 0;
        const followers = userData.followers || 0;
        
        updateStats({ repoCount, experienceYears, totalStars, followers, recentPushEvents });
        
    } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        updateStats({ repoCount: 0, experienceYears: 3, totalStars: 0, followers: 0, recentPushEvents: 0 });
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
function updateStats({ repoCount, experienceYears, totalStars, followers, recentPushEvents }) {
    updateStatElement('experienceYears', experienceYears);
    updateStatElement('repoCount', repoCount);
    updateStatElement('totalStars', totalStars);
    updateStatElement('followerCount', followers);
    
    console.log(`GitHub Stats: ${experienceYears}年经验, ${repoCount}个仓库, ${totalStars}星标, ${followers}关注者, 近期${recentPushEvents}次Push`);
}

// 辅助：更新单个统计元素
function updateStatElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.setAttribute('data-target', value);
    }
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
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    let statsAnimated = false; // 标记统计数字是否已动画
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                
                // 如果是统计项，同时启动所有统计数字的计数动画
                if (entry.target.classList.contains('stat-item') && !statsAnimated) {
                    statsAnimated = true;
                    const allStatNumbers = document.querySelectorAll('.stat-item .stat-number');
                    allStatNumbers.forEach(statNumber => {
                        const target = parseInt(statNumber.getAttribute('data-target'));
                        if (target && !statNumber.classList.contains('counted')) {
                            statNumber.classList.add('counted');
                            animateCounter(statNumber, target);
                        }
                    });
                }
                
                // 如果是技能条，启动进度动画
                const skillProgress = entry.target.querySelectorAll('.skill-progress');
                skillProgress.forEach(progress => {
                    const progressValue = progress.getAttribute('data-progress');
                    if (progressValue) {
                        progress.style.width = progressValue + '%';
                    }
                });
                
                // 如果是语言圆环图，启动动画
                if (entry.target.classList.contains('about-skills') && !entry.target.classList.contains('loaded')) {
                    entry.target.classList.add('loaded');
                    fetchLanguageDistribution();
                }
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    const animatedElements = document.querySelectorAll('.stat-item, .skill-item, .tool-card, .contact-card, .project-card, .about-skills');
    animatedElements.forEach(el => observer.observe(el));
}

// 圆环进度条动画
function animateSkillRing(ring) {
    const percentage = parseInt(ring.getAttribute('data-percentage'));
    const color = ring.getAttribute('data-color');
    const progressCircle = ring.querySelector('.ring-progress');
    const percentageText = ring.querySelector('.skill-percentage');
    
    if (!progressCircle || !percentageText) return;
    
    // 设置圆环颜色
    progressCircle.style.stroke = color;
    
    // 计算圆周长（2 * π * r，其中 r=45）
    const circumference = 2 * Math.PI * 45;
    
    // 计算进度值
    const progress = (percentage / 100) * circumference;
    
    // 动画圆环
    setTimeout(() => {
        progressCircle.style.strokeDasharray = `${progress} ${circumference}`;
    }, 100);
    
    // 动画数字
    animateCounter(percentageText, percentage, 2000);
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
    
    // 更新技术栈标签
    updateTechStackTags(languageStats);
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

// 视差滚动效果
function setupParallaxEffect() {
    const shapes = document.querySelectorAll('.floating-shape');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.1;
            shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.05}deg)`;
        });
    });
}

// 鼠标跟随效果（可选，仅在桌面端启用）
function setupMouseFollowEffect() {
    if (window.innerWidth > 768) {
        const heroSection = document.querySelector('.hero-section');
        if (!heroSection) return;
        
        heroSection.addEventListener('mousemove', (e) => {
            const shapes = document.querySelectorAll('.floating-shape');
            const rect = heroSection.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            shapes.forEach((shape, index) => {
                const speed = (index + 1) * 20;
                shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
            });
        });
    }
}

// 元素滚动进入动画
function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.section-content, .hero-content, .hero-visual');
    
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

// 添加页面加载动画
function setupPageLoadAnimation() {
    document.body.style.opacity = '0';
    
    window.addEventListener('load', () => {
        document.body.style.transition = 'opacity 0.8s ease-in-out';
        document.body.style.opacity = '1';
    });
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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

// 添加触摸滑动支持
function setupTouchSwipe() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            // 可以在这里添加滑动导航逻辑
            console.log('Swipe detected:', diff > 0 ? 'left' : 'right');
        }
    }
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

// 性能监控（开发环境）
function setupPerformanceMonitoring() {
    if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const timing = window.performance.timing;
                const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                console.log(`页面加载时间: ${pageLoadTime}ms`);
            }, 0);
        });
    }
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

// 页面离开提示
function setupBeforeUnload() {
    window.addEventListener('beforeunload', (e) => {
        // 如果有未保存的内容，可以添加提示
        // e.preventDefault();
        // e.returnValue = '';
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
    setupMouseFollowEffect();
    setupScrollReveal();
    setupSmoothScroll();
    setupPageLoadAnimation();
    setupOptimizedScroll();
    setupTouchSwipe();
    setupKeyboardNavigation();
    setupPerformanceMonitoring();
    setupErrorHandling();
    setupBeforeUnload();
    
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
    
    console.log('All features initialized successfully');
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
} else {
    initAll();
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

// 页面可见性变化处理
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log('页面变为可见');
        // 可以在这里恢复某些动画或功能
    } else {
        console.log('页面变为不可见');
        // 可以在这里暂停某些动画以节省资源
    }
});

// 页面大小变化处理
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        console.log('页面大小已改变');
        // 可以在这里重新计算某些布局或动画
    }, 250);
});