import json
import yaml
import requests
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[3]
CONFIG_PATH = BASE_DIR / "backend/app/config/search_sources.yaml"


def load_sources():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)["sources"]


def search_wikipedia(query: str):
    url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{query}"
    res = requests.get(url)

    if res.status_code != 200:
        return None

    data = res.json()
    return {
        "source": "wikipedia",
        "title": data.get("title"),
        "content": data.get("extract")
    }


def search_local_docs(query: str):
    manifest_path = BASE_DIR / "data/processed/docs_manifest.json"

    if not manifest_path.exists():
        return None

    with open(manifest_path, "r", encoding="utf-8") as f:
        docs = json.load(f)

    results = []
    for doc in docs:
        file_path = BASE_DIR / doc["path"]
        if not file_path.exists():
            continue

        text = file_path.read_text(encoding="utf-8")
        if query.lower() in text.lower():
            results.append({
                "source": "local_docs",
                "title": doc["title"],
                "content": text[:1000]
            })

    return results if results else None


def search_agent(query: str):
    sources = load_sources()
    results = []

    for src in sources:
        if not src.get("enabled"):
            continue

        if src["name"] == "wikipedia":
            r = search_wikipedia(query)
            if r:
                results.append(r)

        if src["name"] == "local_docs":
            r = search_local_docs(query)
            if r:
                results.extend(r)

    return results