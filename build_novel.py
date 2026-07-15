#!/usr/bin/env python3
"""
小说网页生成工具 —— 命令行 + 图形界面双模式
新增：移动端头部菜单按钮，触摸优化
"""

import os, re, html, json, sys, argparse
import tkinter as tk
from tkinter import filedialog, messagebox, ttk

# ---------- 核心功能 ----------
def read_chapters(chapter_dir):
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
/* 移动端目录按钮（默认隐藏） */
.toc-toggle-btn {{
    display: none;
    background:var(--btn);border:1px solid var(--ln);color:var(--tx);
    cursor:pointer;padding:5px 10px;border-radius:6px;font-size:.82rem;
    font-family:inherit;transition:all .15s;
    margin-right: auto; /* 让按钮靠左，标题在右或保持布局 */
}}
.header-btn{{
    background:var(--btn);border:1px solid var(--ln);color:var(--tx);
    cursor:pointer;padding:5px 10px;border-radius:6px;font-size:.82rem;
    font-family:inherit;transition:all .15s;
}}
.header-btn:hover, .toc-toggle-btn:hover{{background:var(--btn2);color:var(--ac)}}
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
    -webkit-tap-highlight-color: transparent;
}}
.nav-btn:hover{{background:var(--btn2);color:var(--ac)}}
.nav-toc{{font-size:1.1rem;padding:8px 14px}}
.footer{{
    text-align:center;padding:40px 24px;color:var(--tx2);
    font-size:.82rem;border-top:1px solid var(--ln);
    max-width:700px;margin:0 auto;margin-left:260px;
}}
.back-to-top{{
    position:fixed;bottom:32px;right:32px;width:44px;height:44px;border-radius:50%;
    background:var(--ac);color:#fff;border:none;cursor:pointer;font-size:1.1rem;
    box-shadow:0 2px 12px rgba(0,0,0,0.15);opacity:0;transform:translateY(10px);
    transition:all .3s;z-index:200;display:flex;align-items:center;justify-content:center;
    -webkit-tap-highlight-color: transparent;
}}
.back-to-top.visible{{opacity:1;transform:translateY(0)}}

/* ---------- 移动端增强 ---------- */
@media(max-width:900px){{
    html{{font-size:16px}}
    /* 显示头部目录按钮 */
    .toc-toggle-btn {{
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 36px;
        padding: 0;
        font-size: 1.2rem;
    }}
    .header-inner {{
        padding: 8px 16px;
    }}
    .header-title {{
        font-size: 1rem;
        margin-left: 8px;
    }}
    .header-actions {{
        gap: 4px;
    }}
    .header-btn {{
        padding: 5px 8px;
        font-size: 0.78rem;
    }}
    /* 侧边栏变为全屏抽屉 */
    .toc-sidebar {{
        position:fixed;top:0;left:0;height:100vh;z-index:200;
        transform:translateX(-100%);width:280px;padding-top:72px;
        box-shadow: 2px 0 10px rgba(0,0,0,0.1);
    }}
    .toc-sidebar.open {{transform:translateX(0)}}
    .toc-overlay.open {{display:block}}
    .main {{margin-left:0;padding:24px 20px 60px}}
    .chapter {{padding:28px 0 40px}}
    .chapter-title {{font-size:1.3rem;margin-bottom:28px}}
    .chapter-nav {{flex-wrap:wrap;gap:8px}}
    .nav-btn {{padding:10px 16px;font-size:0.9rem;}}
    .nav-toc {{padding:10px 12px;font-size:1rem}}
    .footer {{margin-left:0}}
    .back-to-top {{right:20px;bottom:24px;width:42px;height:42px}}
    .toc-link {{font-size:0.9rem;padding:8px 12px;}} /* 稍大点击区域 */
}}
</style>
</head>
<body>

<header class="header">
    <div class="header-inner">
        <!-- 移动端专用目录按钮 -->
        <button class="toc-toggle-btn" onclick="toggleToc()" aria-label="目录">☰</button>
        <span class="header-title" onclick="scrollToTop()">{html.escape(book_title)}</span>
        <div class="header-actions">
            <button class="header-btn" onclick="toggleTheme()">🌓</button>
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

# ---------- 图形界面 ----------
class NovelBuilderGUI:
    def __init__(self, root):
        self.root = root
        root.title("小说网页生成工具")
        root.resizable(True, True)
        root.geometry("600x350")
        root.minsize(520, 300)
        style = ttk.Style()
        style.theme_use("clam")
        main_frame = ttk.Frame(root, padding="20")
        main_frame.pack(fill=tk.BOTH, expand=True)

        ttk.Label(main_frame, text="源目录（包含 “章” 子文件夹）:").grid(row=0, column=0, sticky=tk.W, pady=6)
        self.src_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.src_var, width=45).grid(row=0, column=1, padx=5, pady=6, sticky=tk.EW)
        ttk.Button(main_frame, text="浏览...", command=self.browse_src).grid(row=0, column=2, padx=5)

        ttk.Label(main_frame, text="书名:").grid(row=1, column=0, sticky=tk.W, pady=6)
        self.title_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.title_var, width=45).grid(row=1, column=1, padx=5, pady=6, sticky=tk.EW)

        ttk.Label(main_frame, text="输出文件:").grid(row=2, column=0, sticky=tk.W, pady=6)
        self.output_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.output_var, width=45).grid(row=2, column=1, padx=5, pady=6, sticky=tk.EW)
        ttk.Button(main_frame, text="保存为...", command=self.browse_output).grid(row=2, column=2, padx=5)

        self.title_var.trace_add('write', self.update_output_name)
        self.generate_btn = ttk.Button(main_frame, text="生成网页", command=self.generate)
        self.generate_btn.grid(row=3, column=1, pady=20)
        self.status_var = tk.StringVar(value="就绪")
        ttk.Label(main_frame, textvariable=self.status_var, foreground="gray").grid(row=4, column=0, columnspan=3, pady=6)
        main_frame.columnconfigure(1, weight=1)

    def browse_src(self):
        directory = filedialog.askdirectory(title="选择源目录（包含“章”子文件夹）")
        if directory:
            self.src_var.set(directory)

    def browse_output(self):
        filename = filedialog.asksaveasfilename(title="保存网页文件", defaultextension=".html",
                                                filetypes=[("网页文件", "*.html"), ("所有文件", "*.*")])
        if filename:
            self.output_var.set(filename)

    def update_output_name(self, *args):
        if not self.output_var.get() and self.title_var.get():
            self.output_var.set(self.title_var.get() + ".html")

    def generate(self):
        src = self.src_var.get().strip()
        title = self.title_var.get().strip()
        output = self.output_var.get().strip()
        if not src:
            messagebox.showerror("错误", "请选择源目录")
            return
        if not title:
            messagebox.showerror("错误", "请输入书名")
            return
        if not output:
            output = title + ".html"
            self.output_var.set(output)

        chapter_dir = os.path.join(src, "章")
        if not os.path.isdir(chapter_dir):
            messagebox.showerror("错误", f"源目录下未找到“章”子文件夹：\n{chapter_dir}")
            return

        self.generate_btn.config(state=tk.DISABLED)
        self.status_var.set("正在读取章节...")
        self.root.update_idletasks()
        try:
            chapters = read_chapters(chapter_dir)
            if not chapters:
                messagebox.showwarning("警告", "章节目录中没有找到任何 txt 文件")
                self.status_var.set("没有可处理的章节")
                return
            self.status_var.set(f"读取到 {len(chapters)} 章，正在生成 HTML...")
            self.root.update_idletasks()
            html_content = build_html(chapters, title)
            with open(output, 'w', encoding='utf-8') as f:
                f.write(html_content)
            size_kb = os.path.getsize(output) / 1024
            self.status_var.set(f"生成成功！文件：{output} ({size_kb:.1f} KB)")
            messagebox.showinfo("完成", f"网页已生成：\n{output}\n大小：{size_kb:.1f} KB\n共 {len(chapters)} 章")
        except Exception as e:
            messagebox.showerror("生成失败", str(e))
            self.status_var.set("生成失败")
        finally:
            self.generate_btn.config(state=tk.NORMAL)

# ---------- 主入口 ----------
def main():
    if len(sys.argv) > 1:
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
    else:
        root = tk.Tk()
        app = NovelBuilderGUI(root)
        root.mainloop()

if __name__ == '__main__':
    main()