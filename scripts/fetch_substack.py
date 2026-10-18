"""Fetch the latest Substack articles and save them as data/substack.json.

Runs in GitHub Actions before every deploy (see .github/workflows/deploy.yml).
Uses only the Python standard library. If the feed can't be read, the existing
JSON file is left untouched so the site still deploys.

Local test:  python3 scripts/fetch_substack.py
"""
import html
import json
import re
import sys
import urllib.request
import xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from pathlib import Path

FEED = sys.argv[1] if len(sys.argv) > 1 else "https://angeloguarnerio.substack.com/feed"
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "data/substack.json")
MAX_POSTS = 30


def text(node, tag):
    el = node.find(tag)
    return (el.text or "").strip() if el is not None else ""


def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()


def main():
    try:
        req = urllib.request.Request(FEED, headers={"User-Agent": "Mozilla/5.0 (site build)"})
        with urllib.request.urlopen(req, timeout=30) as r:
            root = ET.fromstring(r.read())
        channel = root.find("channel")
        if channel is None:
            raise ValueError("not an RSS feed")
    except Exception as e:  # keep the previous file, never break the deploy
        print(f"warning: could not read {FEED}: {e}")
        return

    posts = []
    for item in channel.findall("item")[:MAX_POSTS]:
        date = text(item, "pubDate")
        try:
            date = parsedate_to_datetime(date).date().isoformat()
        except (TypeError, ValueError):
            pass
        enclosure = item.find("enclosure")
        posts.append({
            "title": clean(text(item, "title")),
            "url": text(item, "link"),
            "date": date,
            "description": clean(text(item, "description"))[:280],
            "image": enclosure.get("url", "") if enclosure is not None else "",
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"saved {len(posts)} posts to {OUT}")


if __name__ == "__main__":
    main()
