"""Thin pytest entrypoint around run_evals.main(), so `pytest backend/evals -v`
works alongside `python -m backend.evals.run_evals`."""
from . import run_evals


def test_pipeline_meets_thresholds():
    result = run_evals.main()
    assert result.passed, (
        f"recall {result.recall_hits}/{result.recall_total}, "
        f"keyword-hit {result.keyword_hits}/{result.keyword_total}, "
        f"fallback correctness {result.fallback_correct}/{result.fallback_total}"
    )
