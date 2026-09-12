from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_router_inventory_renders_before_live_snapshots_finish():
    view = read("frontend/src/modules/red/Network.jsx")
    assert "setRouters(rows);" in view
    assert "setLoading(false);" in view
    assert "rows.filter((row) => row.device_type === \"mikrotik\").forEach" in view
    assert "void refreshRouterSnapshot(row);" in view
    assert "Promise.all(rows.map" not in view


def test_live_snapshot_has_timeout_and_updates_one_card_only():
    view = read("frontend/src/modules/red/Network.jsx")
    assert "timeout: 6000" in view
    assert "applyRouterSnapshot" in view
    assert "current.map((row) => row.id === snapshotRouter.id" in view


def test_release_1318_is_documented():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.18"' in version
    assert "1.3.18" in continuity
    assert "backup/pre-router-loading-hotfix-1.3.18-20260912" in continuity
