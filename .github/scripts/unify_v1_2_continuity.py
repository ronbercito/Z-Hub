from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"
TARGET = DOCS / "CONTINUIDAD_Z-HUB-v1.2.md"
MASTER = DOCS / "CONTINUIDAD_Z-HUB.md"

# Unificar solo bitácoras de continuidad 1.2.x; no tocar INFORME_* ni backups.
patterns = [
    "CONTINUIDAD_Z-HUB-1.2*.md",
    "CONTINUIDAD_Z-HUB-v1.2.*.md",
]

sources = []
for pattern in patterns:
    for path in DOCS.glob(pattern):
        if path.name != TARGET.name and path.is_file():
            sources.append(path)

# Orden estable por versión numérica cuando exista.
def version_key(path: Path):
    nums = re.findall(r"1\.2\.(\d+)", path.name)
    return (int(nums[0]) if nums else 10**9, path.name)

sources = sorted(set(sources), key=version_key)

if not TARGET.exists():
    raise SystemExit(f"No existe destino: {TARGET}")

text = TARGET.read_text(encoding="utf-8").rstrip() + "\n"
marker = "# ANEXOS CONSOLIDADOS DE BITÁCORAS v1.2.x"
if marker not in text:
    text += "\n---\n\n" + marker + "\n\n"
    text += "Esta sección conserva íntegramente las bitácoras v1.2.x que antes estaban separadas. " \
            "Desde esta consolidación, `docs/CONTINUIDAD_Z-HUB-v1.2.md` es el único archivo de continuidad específico de la rama v1.2.\n"

for src in sources:
    content = src.read_text(encoding="utf-8").strip()
    source_marker = f"## Fuente consolidada: `{src.name}`"
    if source_marker not in text:
        text += f"\n\n---\n\n{source_marker}\n\n{content}\n"

TARGET.write_text(text.rstrip() + "\n", encoding="utf-8")

# Eliminar archivos ya absorbidos.
for src in sources:
    src.unlink()

# Registrar la política también en la bitácora maestra sin duplicar contenidos.
if MASTER.exists():
    master = MASTER.read_text(encoding="utf-8").rstrip() + "\n"
    note = "## 2026-09-11 — Consolidación documental de continuidad v1.2"
    if note not in master:
        master += (
            "\n\n" + note + "\n\n"
            "- Se consolidaron todas las bitácoras `CONTINUIDAD_Z-HUB-1.2.x.md` y variantes equivalentes dentro de `docs/CONTINUIDAD_Z-HUB-v1.2.md`.\n"
            "- Los archivos individuales absorbidos se eliminaron para evitar divergencias.\n"
            "- `docs/CONTINUIDAD_Z-HUB-v1.2.md` queda como única bitácora específica de la serie 1.2; `docs/CONTINUIDAD_Z-HUB.md` se conserva como bitácora maestra general del proyecto.\n"
            "- Los documentos `INFORME_*` y `docs/backups/` no forman parte de esta consolidación y se conservan.\n"
            "- Cambio exclusivamente documental: no incrementa `PANEL_VERSION`.\n"
        )
        MASTER.write_text(master.rstrip() + "\n", encoding="utf-8")

print("Destino:", TARGET.relative_to(ROOT))
print("Fuentes consolidadas:")
for src in sources:
    print(" -", src.name)
print("Total:", len(sources))
