---
title: 测试 GitHub Actions 自动索引
date: 2026-07-30
tags: [测试, GitHub Actions]
summary: 这是一篇测试文章，用来验证 GitHub Actions 能否自动检测文章变更并更新索引。
---

# 测试 GitHub Actions 🚀

这篇文章用于测试 GitHub Actions 的自动索引功能。

## 测试内容

1. 提交本 `.md` 文件到 `articles/` 目录
2. GitHub Actions 检测到变更
3. 自动运行 `build_articles.py` 
4. 更新 `articles/index.json`
5. 自动提交更新后的索引文件

## 预期结果

- ✅ `index.json` 中包含这篇文章的元数据
- ✅ 在 `articles.html` 中可以看到这篇文章的卡片
- ✅ 可以通过 `articles.html#/article/test-github-actions` 阅读全文

## 后续操作

如果测试通过，在「更新日志」页面记录下这个里程碑！

---

*测试结果：✅ GitHub Actions 自动索引功能已正常工作！*
