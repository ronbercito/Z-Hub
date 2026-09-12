from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_snapshot_counts_bound_dhcp_leases():
    service = read("backend/app/integrations/mikrotik/service.py")
    assert "leases = await mt.dhcp_leases()" in service
    assert 'str(row.get("status", "")).lower() == "bound"' in service
    assert "router.dhcp_bound_count = dhcp_bound_count" in service


def test_router_public_dict_exposes_transient_dhcp_count_without_db_column():
    model = read("backend/app/models/router.py")
    assert 'd["dhcp_bound_count"] = int(getattr(self, "dhcp_bound_count", 0) or 0)' in model
    assert "dhcp_bound_count: Mapped" not in model


def test_card_replaces_traffic_with_dhcp():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    assert 'label="DHCP"' in card
    assert "router.dhcp_bound_count" in card
    assert 'label="Tráfico"' not in card


def test_release_1331_is_documented():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.31"' in version
    assert "1.3.31 — DHCP en tarjeta MikroTik" in continuity
    assert "backup/pre-router-dhcp-metric-1.3.31-20260912" in continuity
