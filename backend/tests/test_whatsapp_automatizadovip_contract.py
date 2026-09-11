from app.services.whatsapp_automatizadovip import build_payload, normalize_phone
from app.services.whatsapp_automatizadovip_automation import cut_warning, payment_confirmation, payment_reminder


def test_normalize_phone_adds_peru_country_code():
    assert normalize_phone("999 111 222", "51") == "51999111222"
    assert normalize_phone("51999111222", "51") == "51999111222"


def test_build_payload_matches_automatizadovip_v2_contract():
    assert build_payload([{"number": "999111222", "message": "Hola"}], "51", True) == {
        "contact": [{"number": "51999111222", "message": "Hola"}],
        "verify": True,
    }


def test_message_templates_render_expected_variables():
    assert payment_reminder("Hola {cliente}, S/. {monto}, {plan}, vence {vencimiento}", "Ana", 50, "Fibra", "2026-09-15") == "Hola Ana, S/. 50.00, Fibra, vence 2026-09-15"
    assert cut_warning("{cliente} deuda {monto}", "Ana", 75) == "Ana deuda 75.00"
    assert payment_confirmation("{cliente} {monto} {recibo}", "Ana", 80, "REC-1") == "Ana 80.00 REC-1"


def test_message_limit_is_enforced():
    try:
        build_payload([{"number": "999111222", "message": "x" * 1001}], "51")
    except ValueError as exc:
        assert "1000" in str(exc)
    else:
        raise AssertionError("Se esperaba rechazo por superar 1000 caracteres")
