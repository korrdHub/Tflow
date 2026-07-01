import json
import os
from typing import Any


class RuleEngine:
    def __init__(self, rules_dir: str | None = None):
        self.rules_dir = rules_dir or os.path.join(os.path.dirname(__file__), "..", "rules")
        self._configs: dict[str, dict] = {}
        for fname in os.listdir(self.rules_dir):
            if fname.endswith(".json"):
                with open(os.path.join(self.rules_dir, fname), encoding="utf-8") as f:
                    cfg = json.load(f)
                    self._configs[cfg["mode"]] = cfg

    def _config(self, mode: str) -> dict:
        if mode not in self._configs:
            raise ValueError(f"Unknown mode: {mode}")
        return self._configs[mode]

    def render_reminder(self, mode: str, **kwargs: Any) -> str:
        return self._config(mode)["reminder_template"].format(**kwargs)

    def escalation_intervals(self, mode: str) -> list[int]:
        return self._config(mode)["followup_escalation"]

    def analyze(self, mode: str, consecutive_missed: int, **kwargs: Any) -> dict:
        config = self._config(mode)
        threshold = 3
        advice = ""
        if consecutive_missed >= threshold:
            advice = config["review_suggestion"].format(consecutive_missed=consecutive_missed)
        elif consecutive_missed > 0:
            advice = "注意完成节奏，避免连续中断"
        else:
            advice = "表现不错，继续保持"
        return {"mode": mode, "consecutive_missed": consecutive_missed, "advice": advice}
