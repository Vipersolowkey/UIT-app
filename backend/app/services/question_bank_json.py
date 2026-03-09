import json
import random
from typing import Any, Dict, List, Optional, Set


class QuestionBankJSON:
    """
    JSON format đề xuất (mỗi item):
    {
      "id": "q1",
      "subject": "oop",
      "topics": ["inheritance", "polymorphism"],
      "type": "mcq",
      "question": "...",
      "options": [{"id":"a","text":"..."}, ...],
      "answer": "b",
      "explain": "..."
    }
    """

    def __init__(self, path: str):
        self.path = path
        self.items: List[Dict[str, Any]] = []
        self._subjects: Set[str] = set()
        self._topics_by_subject: Dict[str, Set[str]] = {}

    def load(self) -> None:
        with open(self.path, "r", encoding="utf-8") as f:
            data = json.load(f)

        if not isinstance(data, list):
            raise ValueError("questions.json must be a LIST of objects")

        self.items = data
        self._rebuild_index()

    def _rebuild_index(self) -> None:
        self._subjects.clear()
        self._topics_by_subject.clear()

        for x in self.items:
            sub = x.get("subject")
            if sub:
                self._subjects.add(sub)
                if sub not in self._topics_by_subject:
                    self._topics_by_subject[sub] = set()

                topics = x.get("topics") or []
                if isinstance(topics, list):
                    for t in topics:
                        if t:
                            self._topics_by_subject[sub].add(str(t))

    def subjects(self) -> List[str]:
        return sorted(list(self._subjects))

    def topics(self, subject: str) -> List[str]:
        return sorted(list(self._topics_by_subject.get(subject, set())))

    def filter_pool(
        self,
        subject: Optional[str] = None,
        topics: Optional[List[str]] = None,
        qtype: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        pool = self.items

        if subject:
            pool = [x for x in pool if x.get("subject") == subject]

        if qtype:
            pool = [x for x in pool if x.get("type") == qtype]

        if topics:
            want = set([t.strip() for t in topics if t and t.strip()])
            if want:
                def match_topics(x: Dict[str, Any]) -> bool:
                    xt = x.get("topics") or []
                    if not isinstance(xt, list):
                        return False
                    xt_set = set([str(t).strip() for t in xt if t])
                    return len(xt_set.intersection(want)) > 0

                pool = [x for x in pool if match_topics(x)]

        return pool

    def random_questions(
        self,
        k: int = 5,
        subject: Optional[str] = None,
        topics: Optional[List[str]] = None,
        qtype: Optional[str] = None,
        seed: Optional[int] = None,
    ) -> List[Dict[str, Any]]:
        pool = self.filter_pool(subject=subject, topics=topics, qtype=qtype)

        if seed is not None:
            rnd = random.Random(seed)
        else:
            rnd = random

        if not pool:
            return []

        k = max(1, int(k))
        return rnd.sample(pool, min(k, len(pool)))