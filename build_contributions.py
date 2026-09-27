#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抓取 GitHub 贡献日历，生成 data/contributions.json（首页热力图用）。

数据源（按优先级）：
  1. GraphQL contributionsCollection —— 需要 token：
     - 环境变量 GITHUB_TOKEN（GitHub Actions 内自动注入）
     - 或本机 gh CLI 已登录（gh auth login）
  2. 兜底：抓取 https://github.com/users/<login>/contributions 的公开 HTML

为什么不用 REST events API：`/users/<u>/events/public` 只保留 90 天 / 最多 300 条事件，
私库提交、Issue、PR review 等都不计入，画出来左边一片空白，数字也不对。
contributionsCollection 才是 GitHub 个人主页那张图的同一份数据。

输出格式（精简，前端按周渲染）：
  {
    "login": "XEKernel",
    "generated": "2026-09-27T05:40:00Z",
    "start": "2025-09-28",          # 第一个单元格的日期（周日）
    "total": 889,                    # 近一年贡献总数
    "weeks": [[0,3,1,0,0,null,null], ...]   # 53 组，每组 7 天（周日→周六），
  }                                          # null = 该周不在统计区间内（首尾补齐）
"""

import json
import os
import re
import subprocess
import sys
import urllib.request
from datetime import datetime, timedelta, timezone

LOGIN = os.environ.get("GH_LOGIN", "XEKernel")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "contributions.json")

QUERY = """
query($login:String!){
  user(login:$login){
    contributionsCollection{
      contributionCalendar{
        totalContributions
        weeks{ contributionDays{ contributionCount date } }
      }
    }
  }
}
"""


def via_graphql_env():
    """GitHub Actions：GITHUB_TOKEN + urllib"""
    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        return None
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=json.dumps({"query": QUERY, "variables": {"login": LOGIN}}).encode(),
        headers={
            "Authorization": "bearer " + token,
            "Content-Type": "application/json",
            "User-Agent": "xe-contributions-builder",
        },
    )
    with urllib.request.urlopen(req, timeout=45) as r:
        payload = json.loads(r.read().decode())
    if payload.get("errors"):
        raise RuntimeError("GraphQL: " + json.dumps(payload["errors"], ensure_ascii=False)[:300])
    return payload["data"]["user"]["contributionsCollection"]["contributionCalendar"]


def via_gh_cli():
    """本机：gh api graphql"""
    p = subprocess.run(
        ["gh", "api", "graphql", "-f", "query=" + QUERY, "-f", "login=" + LOGIN],
        capture_output=True, text=True,
    )
    if p.returncode != 0:
        raise RuntimeError("gh CLI: " + (p.stderr or "").strip()[:300])
    payload = json.loads(p.stdout)
    if payload.get("errors"):
        raise RuntimeError("GraphQL: " + json.dumps(payload["errors"], ensure_ascii=False)[:300])
    return payload["data"]["user"]["contributionsCollection"]["contributionCalendar"]


def via_html():
    """兜底：GitHub 公开贡献页 HTML（服务端渲染，含 data-date / data-level）"""
    url = "https://github.com/users/%s/contributions" % LOGIN
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=45) as r:
        html = r.read().decode("utf-8", "replace")
    days = re.findall(r'data-date="(\d{4}-\d{2}-\d{2})"[^>]*?data-level="(\d)"', html)
    if not days:
        days = re.findall(r'data-level="(\d)"[^>]*?data-date="(\d{4}-\d{2}-\d{2})"', html)
        days = [(d, l) for l, d in days]
    if not days:
        raise RuntimeError("HTML 未匹配到贡献单元格")
    # HTML 只给色阶（0-4），映射成代表性次数，图能画出来（数值精度不如 GraphQL）
    approx = [0, 1, 3, 6, 10]
    return {"totalContributions": None,
            "weeks": [{"contributionDays": [{"date": d, "contributionCount": approx[min(4, int(l))]}
                                            for d, l in days]}]}


def build(cal):
    """把 GraphQL 的 weeks 规整成 53×7 的 int 矩阵（首尾用 null 补齐）"""
    raw = [[(d.get("date"), d.get("contributionCount")) for d in w["contributionDays"]]
           for w in cal["weeks"] if w.get("contributionDays")]
    if not raw:
        raise RuntimeError("没有周数据")

    first_date = datetime.strptime(raw[0][0][0], "%Y-%m-%d")
    pad_head = (first_date.weekday() + 1) % 7  # 周日=0 → 需要补的格子数

    weeks = []
    for w in raw:
        row = [None] * pad_head + [c for _d, c in w]
        pad_head = 0
        row = (row + [None] * 7)[:7]
        weeks.append(row)
    while len(weeks) < 53:
        weeks.insert(0, [None] * 7)
    weeks = weeks[-53:]
    return weeks


def main():
    cal = None
    for name, fn in (("GITHUB_TOKEN", via_graphql_env), ("gh CLI", via_gh_cli), ("HTML", via_html)):
        try:
            got = fn()
        except Exception as e:  # noqa: BLE001
            print("[warn] %s 失败：%s" % (name, e), file=sys.stderr)
            continue
        if got:                       # 没配 token 时返回 None，要继续试下一路
            cal = got
            print("[ok] 数据源：%s" % name)
            break
    if cal is None:
        print("[error] 三个数据源都失败，保留现有 JSON", file=sys.stderr)
        return 1

    if cal.get("totalContributions") is None:       # HTML 兜底：只拿得到 level
        weeks = build(cal)
        total = None
    else:
        weeks = build(cal)
        total = cal["totalContributions"]

    flat = [c for w in weeks for c in w if c is not None]
    first_date = None
    for w in cal["weeks"]:
        if w.get("contributionDays"):
            first_date = w["contributionDays"][0]["date"]
            break
    start = datetime.strptime(first_date, "%Y-%m-%d")
    start -= timedelta(days=(start.weekday() + 1) % 7)

    data = {
        "login": LOGIN,
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "start": start.strftime("%Y-%m-%d"),
        "total": total,
        "max": max(flat) if flat else 0,
        "weeks": weeks,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    print("[ok] 写入 %s：%d 周，总贡献 %s，单日峰值 %s" % (
        os.path.relpath(OUT), len(weeks), total, data["max"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
