#!/usr/bin/env python3
"""
小说网页生成工具 —— 将章节 txt 文件构建为独立 HTML 阅读页面。

用法：
    python build_novel.py <源目录> <书名> [输出文件名]

示例：
    python build_novel.py 小说 长情机器
    python build_novel.py ./chapters "另一本书" book.html

源目录结构：
    源目录/
        章/
            第1章.txt      ← 第一行作为章节标题
            第2章.txt
            ...

生成功能：
    - 左侧可折叠目录导航
    - 章节内前后翻页按钮
    - 浅色/深色主题切换（localStorage 记忆）
    - 字号调节 A⁺/A⁻
    - 阅读进度条
    - 键盘快捷键：左右方向键翻章，M 切换目录
    - 响应式布局（桌面 + 移动端）
"""

import os, re, html, json, sys, argparse

def read_chapters(chapter_dir):
    """读取所有章节，返回按章号排序的 (序号, 标题, 正文行列表)。"""
    chapters = []
    for fname in sorted(os.listdir(chapter_dir)):
        if not fname.endswith('.txt'):
            continue
        m = re.match(r'第(\d+)章', fname)
        num = int(m.group(1)) if m else 999
        path = os.path.join(chapter_dir, fname)
        with open(path, 'r', encoding='utf-8') as f:
            raw = f.read()
        lines = raw.split('\n')
        title = lines[0].strip()
        chapters.append((num, title, lines[1:]))
    chapters.sort(key=lambda x: x[0])
    return chapters

def parse_body(body_lines):
    """将正文行按空行分隔为段落列表。"""
    paragraphs = []
    current = []
    for line in body_lines:
        stripped = line.rstrip()
        if stripped == '':
            if current:
                paragraphs.append('\n'.join(current))
                current = []
        else:
            current.append(stripped)
    if current:
        paragraphs.append('\n'.join(current))
    return paragraphs

def build_html(chapters, book_title):
    """生成完整的自包含 HTML 字符串。"""
    chapters_data = []
    toc_items = []
    chapter_html_parts = []

    for num, title, body_lines in chapters:
        paras = parse_body(body_lines)
        chapter_id = f'chapter-{num}'
        chapters_data.append({'num': num, 'title': title, 'id': chapter_id})

        toc_items.append(
            f'<li><a href="#{chapter_id}" data-chapter="{num}" class="toc-link">'
            f'{html.escape(title)}</a></li>'
        )

        paras_html = '\n'.join(f'<p>{html.escape(p)}</p>' for p in paras)

        chapter_html_parts.append(f'''
        <article id="{chapter_id}" class="chapter" data-chapter="{num}">
            <h2 class="chapter-title">{html.escape(title)}</h2>
            <div class="chapter-content">{paras_html}</div>
            <div class="chapter-nav">
                <button class="nav-btn nav-prev" onclick="navigate(-1)">◂ 上一章</button>
                <button class="nav-btn nav-toc" onclick="toggleToc()">☰ 目录</button>
                <button class="nav-btn nav-next" onclick="navigate(1)">下一章 ▸</button>
            </div>
        </article>''')

    chapters_json = json.dumps(chapters_data, ensure_ascii=False)

    return f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{html.escape(book_title)} — 在线阅读</title>
<style>
:root {{
    --bg:#fdfaf5; --tx:#2c2416; --tx2:#6b5e4a; --tx3:#a09080;
    --ac:#8b4513; --ac2:#a0522d; --ln:#e0d5c0; --bg2:#f8f3ea;
    --card:#fffefb; --btn:#f0e8d8; --btn2:#e5d8c0; --sel:#f5e6d0;
}}
[data-theme="dark"] {{
    --bg:#1a1814; --tx:#e0d8c8; --tx2:#a09880; --tx3:#706858;
    --ac:#c97a3a; --ac2:#d99050; --ln:#3a3228; --bg2:#221e18;
    --card:#242018; --btn:#2a2418; --btn2:#3a3228; --sel:#3a2a18;
}}
*{{margin:0;padding:0;box-sizing:border-box}}
::selection{{background:var(--sel)}}
html{{scroll-behavior:smooth;font-size:17px}}
body{{
    font-family:"Noto Serif SC","Source Han Serif SC","STSong","Songti SC","KaiTi",serif;
    background:var(--bg);color:var(--tx);line-height:2;min-height:100vh;
    transition:background .3s,color .3s;
}}
.header{{
    position:fixed;top:0;left:0;right:0;z-index:100;
    background:var(--bg);border-bottom:1px solid var(--ln);
    backdrop-filter:blur(10px);transition:background .3s,border-color .3s;
}}
.header-inner{{
    max-width:1200px;margin:0 auto;padding:10px 24px;height:52px;
    display:flex;align-items:center;justify-content:space-between;
}}
.header-title{{font-size:1.1rem;font-weight:700;color:var(--ac);cursor:pointer;letter-spacing:.05em}}
.header-actions{{display:flex;align-items:center;gap:8px}}
.header-btn{{
    background:var(--btn);border:1px solid var(--ln);color:var(--tx);
    cursor:pointer;padding:5px 10px;border-radius:6px;font-size:.82rem;
    font-family:inherit;transition:all .15s;
}}
.header-btn:hover{{background:var(--btn2);color:var(--ac)}}
.progress-bar{{position:fixed;top:52px;left:0;right:0;height:3px;background:var(--ln);z-index:99}}
.progress-fill{{height:100%;background:var(--ac);transition:width .15s linear}}
.layout{{display:flex;max-width:1200px;margin:0 auto;padding-top:72px;min-height:100vh}}
.toc-sidebar{{
    width:260px;flex-shrink:0;position:fixed;top:72px;
    left:max(0px,calc((100vw - 1200px)/2));height:calc(100vh - 72px);
    overflow-y:auto;padding:24px 16px 24px 24px;
    border-right:1px solid var(--ln);background:var(--bg2);
    z-index:50;transition:transform .3s,background .3s;
}}
.toc-sidebar h3{{font-size:.85rem;color:var(--tx2);margin-bottom:16px;font-weight:500}}
.toc-sidebar ul{{list-style:none}}
.toc-sidebar li{{margin-bottom:2px}}
.toc-link{{
    display:block;padding:5px 12px;font-size:.85rem;color:var(--tx2);
    text-decoration:none;border-radius:4px;transition:all .15s;
    white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}}
.toc-link:hover{{background:var(--btn);color:var(--ac)}}
.toc-link.active{{color:var(--ac);font-weight:600;background:var(--sel)}}
.toc-overlay{{display:none;position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:199}}
.main{{flex:1;margin-left:260px;padding:40px 48px 80px;min-width:0}}
.chapter{{max-width:700px;margin:0 auto;padding:48px 0 60px;border-bottom:1px solid var(--ln)}}
.chapter:last-child{{border-bottom:none}}
.chapter-title{{font-size:1.5rem;font-weight:700;color:var(--ac);text-align:center;margin-bottom:40px;letter-spacing:.08em}}
.chapter-content p{{text-indent:2em;margin-bottom:1em;text-align:justify}}
.chapter-nav{{display:flex;justify-content:center;align-items:center;gap:12px;margin-top:40px;padding-top:24px}}
.nav-btn{{
    background:var(--btn);border:1px solid var(--ln);color:var(--tx);
    cursor:pointer;padding:8px 20px;border-radius:8px;font-size:.88rem;
    font-family:inherit;transition:all .15s;
}}
.nav-btn:hover{{background:var(--btn2);color:var(--ac)}}
.nav-toc{{font-size:1.1rem;padding:8px 14px}}
.footer{{
    text-align:center;padding:40px 24px;color:var(--tx2);
    font-size:.82rem;border-top:1px solid var(--ln);
    max-width:700px;margin:0 auto;margin-left:260px;
}}
.back-to-top{{
    position:fixed;bottom:32px;right:32px;width:40px;height:40px;border-radius:50%;
    background:var(--ac);color:#fff;border:none;cursor:pointer;font-size:1.1rem;
    box-shadow:0 2px 12px rgba(0,0,0,0.15);opacity:0;transform:translateY(10px);
    transition:all .3s;z-index:200;display:flex;align-items:center;justify-content:center;
}}
.back-to-top.visible{{opacity:1;transform:translateY(0)}}
@media(max-width:900px){{
    html{{font-size:16px}}
    .toc-sidebar{{position:fixed;top:0;left:0;height:100vh;z-index:200;transform:translateX(-100%);width:280px;padding-top:72px}}
    .toc-sidebar.open{{transform:translateX(0)}}
    .toc-overlay.open{{display:block}}
    .main{{margin-left:0;padding:24px 20px 60px}}
    .chapter{{padding:28px 0 40px}}
    .chapter-title{{font-size:1.3rem;margin-bottom:28px}}
    .footer{{margin-left:0}}
    .back-to-top{{right:20px;bottom:24px}}
}}
</style>
</head>
<body>

<header class="header">
    <div class="header-inner">
        <span class="header-title" onclick="scrollToTop()">{html.escape(book_title)}</span>
        <div class="header-actions">
            <button class="header-btn" onclick="toggleTheme()">🌓 主题</button>
            <button class="header-btn" onclick="changeFontSize(1)">A⁺</button>
            <button class="header-btn" onclick="changeFontSize(-1)">A⁻</button>
        </div>
    </div>
    <div class="progress-bar"><div class="progress-fill" id="pf"></div></div>
</header>

<div class="layout">
    <div class="toc-overlay" id="toc-overlay" onclick="toggleToc()"></div>
    <nav class="toc-sidebar" id="toc-sidebar">
        <h3>目 录</h3>
        <ul>{"".join(toc_items)}</ul>
    </nav>
    <main class="main" id="main-content">
        {"".join(chapter_html_parts)}
        <div class="footer"><p>《{html.escape(book_title)}》</p></div>
    </main>
</div>

<button class="back-to-top" id="btt" onclick="scrollToTop()">▲</button>

<script>
var C={chapters_json},T=C.length;
function up(){{
    var s=window.scrollY,d=document.documentElement.scrollHeight-window.innerHeight;
    document.getElementById('pf').style.width=(d>0?(s/d)*100:0)+'%';
    document.getElementById('btt').classList.toggle('visible',s>400);
    var a=window.scrollY+100,i=1;
    for(var j=T-1;j>=0;j--){{
        var e=document.getElementById(C[j].id);
        if(e&&e.offsetTop<=a){{i=C[j].num;break}}
    }}
    document.querySelectorAll('.toc-link').forEach(function(l){{
        l.classList.toggle('active',parseInt(l.dataset.chapter)===i)
    }})
}}
function navigate(d){{var c=1;
    for(var i=0;i<T;i++){{var e=document.getElementById(C[i].id);if(e&&e.getBoundingClientRect().top>10){{c=i+1;break}}c=T}}
    c=Math.max(1,Math.min(T,c+d));
    var el=document.getElementById(C[c-1].id);if(el)el.scrollIntoView({{behavior:'smooth'}});
    closeToc()
}}
function toggleToc(){{var s=document.getElementById('toc-sidebar'),o=document.getElementById('toc-overlay');
    if(s.classList.contains('open'))closeToc();else{{s.classList.add('open');o.classList.add('open')}}
}}
function closeToc(){{document.getElementById('toc-sidebar').classList.remove('open');document.getElementById('toc-overlay').classList.remove('open')}}
function toggleTheme(){{var h=document.documentElement,n=h.getAttribute('data-theme')==='dark'?null:'dark';
    if(n)h.setAttribute('data-theme',n);else h.removeAttribute('data-theme');
    localStorage.setItem('novel-theme',n||'light')
}}
(function(){{if(localStorage.getItem('novel-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}})();
var fs=parseInt(localStorage.getItem('novel-fs'))||17;
document.documentElement.style.fontSize=fs+'px';
function changeFontSize(d){{fs=Math.max(14,Math.min(24,fs+d));document.documentElement.style.fontSize=fs+'px';localStorage.setItem('novel-fs',fs)}}
document.addEventListener('keydown',function(e){{
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA')return;
    if(e.key==='ArrowLeft'){{e.preventDefault();navigate(-1)}}
    else if(e.key==='ArrowRight'){{e.preventDefault();navigate(1)}}
    else if(e.key==='m'||e.key==='M')toggleToc()
}});
document.querySelectorAll('.toc-link').forEach(function(l){{
    l.addEventListener('click',function(e){{e.preventDefault();
        var t=document.getElementById(this.getAttribute('href').substring(1));
        if(t){{t.scrollIntoView({{behavior:'smooth'}});setTimeout(closeToc,300)}}
    }})
}});
window.addEventListener('scroll',up,{{passive:true}});up();
</script>
</body>
</html>'''

def main():
    parser = argparse.ArgumentParser(description='小说网页生成工具')
    parser.add_argument('src', help='源目录（包含 章/ 子目录）')
    parser.add_argument('title', help='书名')
    parser.add_argument('-o', '--output', help='输出文件名（默认：书名.html）')
    args = parser.parse_args()

    chapter_dir = os.path.join(args.src, '章')
    if not os.path.isdir(chapter_dir):
        print(f'错误：找不到章节目录 {chapter_dir}')
        sys.exit(1)

    chapters = read_chapters(chapter_dir)
    if not chapters:
        print(f'错误：{chapter_dir} 中没有找到章节 txt 文件')
        sys.exit(1)

    print(f'读取到 {len(chapters)} 章:')
    for n, t, _ in chapters:
        print(f'  {n}. {t[:20]}')

    html_content = build_html(chapters, args.title)
    out = args.output or f'{args.title}.html'
    with open(out, 'w', encoding='utf-8') as f:
        f.write(html_content)

    size_kb = os.path.getsize(out) / 1024
    print(f'\n已生成: {out} ({size_kb:.1f} KB)')

if __name__ == '__main__':
    main()
