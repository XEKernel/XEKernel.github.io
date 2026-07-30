#!/usr/bin/env python3
"""
build_articles.py — 文章索引生成器

扫描 articles/ 目录下的所有 .md 文件，
解析 frontmatter 元数据，生成 articles/index.json。

用法：
    python build_articles.py

或者：
    python build_articles.py --watch   # 监视文件变更自动更新
"""

import json
import os
import re
import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ARTICLES_DIR = BASE_DIR / "articles"
INDEX_PATH = ARTICLES_DIR / "index.json"


def parse_frontmatter(text: str) -> dict:
    """解析 YAML frontmatter（简易版，只支持 key: value 和 key: [list]）"""
    metadata = {}
    match = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not match:
        return metadata

    yaml_block = match.group(1)
    for line in yaml_block.strip().split("\n"):
        kv = re.match(r"^\s*(\w+)\s*:\s*(.+)\s*$", line)
        if not kv:
            continue
        key = kv.group(1).strip()
        value = kv.group(2).strip()

        # 解析数组格式: [item1, item2, ...]
        if value.startswith("[") and value.endswith("]"):
            value = [
                item.strip().strip("\"'")
                for item in value[1:-1].split(",")
                if item.strip()
            ]
        else:
            # 移除引号
            value = value.strip("\"'")

        metadata[key] = value

    return metadata


def scan_articles() -> list[dict]:
    """扫描所有 .md 文件并提取元数据"""
    articles = []
    for fpath in sorted(ARTICLES_DIR.glob("*.md"), key=lambda p: p.stat().st_mtime, reverse=True):
        slug = fpath.stem
        if slug == "README" or slug.startswith("."):
            continue

        text = fpath.read_text(encoding="utf-8")
        meta = parse_frontmatter(text)

        article = {
            "slug": slug,
            "title": meta.get("title", slug),
            "date": meta.get("date", ""),
            "tags": meta.get("tags", []),
            "summary": meta.get("summary", ""),
        }
        articles.append(article)

    # 按日期降序，缺失日期排最后
    def sort_key(a):
        try:
            return a["date"]
        except (KeyError, ValueError):
            return ""

    articles.sort(key=sort_key, reverse=True)
    return articles


def build_index():
    """构建 index.json"""
    articles = scan_articles()
    INDEX_PATH.write_text(
        json.dumps(articles, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"✅ 已生成 {INDEX_PATH}")
    print(f"📝 共 {len(articles)} 篇文章")
    for a in articles:
        tags = ", ".join(a["tags"]) if a["tags"] else "无标签"
        print(f"   {a['date']}  {a['title']}  [{tags}]")
    return articles


def watch():
    """监视文件变更并自动重建"""
    print("👀 正在监视文件变更 (Ctrl+C 退出)...")
    last_mtimes = {p: p.stat().st_mtime for p in ARTICLES_DIR.glob("*.md")}

    while True:
        time.sleep(2)
        changed = False
        for fpath in ARTICLES_DIR.glob("*.md"):
            mtime = fpath.stat().st_mtime
            if last_mtimes.get(fpath) != mtime:
                print(f"\n📄 检测到变更: {fpath.name}")
                last_mtimes[fpath] = mtime
                changed = True
        if changed:
            print()
            build_index()
            print()


if __name__ == "__main__":
    if "--watch" in sys.argv or "-w" in sys.argv:
        build_index()
        watch()
    else:
        build_index()
