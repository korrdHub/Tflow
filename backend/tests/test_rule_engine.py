from app.services.rule_engine import RuleEngine


def test_strict_mode_message_contains_variables():
    engine = RuleEngine()
    msg = engine.render_reminder("strict", title="Run", deadline="2026-07-10 08:00")
    assert "Run" in msg
    assert "军令状" in msg or "必须" in msg


def test_analyze_recommends_switch_mode():
    engine = RuleEngine()
    result = engine.analyze(mode="moderate", consecutive_missed=4)
    assert result["advice"] == "连续 4 次未完成，建议切换至'时刻提醒型'强化执行"
