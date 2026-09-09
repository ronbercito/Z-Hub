from pathlib import Path

p = Path("docs/CONTINUIDAD_MIKROHUB.md")
s = p.read_text(encoding="utf-8")
old = """### Migración de archivos a Z-Hub

Después de validar y publicar 1.1.12 en el repositorio legado, el `main` completo debe copiarse a `ronbercito/Z-Hub` conservando el árbol de archivos actualizado. Desde ese momento, todo cambio nuevo se realizará primero en **Z-Hub**."""
new = """### Migración de archivos a Z-Hub — COMPLETADA

La migración fue completada el 2026-09-09. El `main` validado de 1.1.12 fue promovido íntegramente a `ronbercito/Z-Hub`, conservando el mismo commit de origen durante la copia inicial (`177e29184ce138469ef0d9d4eb6d5328acf5e409`).

Desde este punto:

- `ronbercito/Z-Hub` es el repositorio principal y autoritativo;
- todo desarrollo nuevo se realiza en Z-Hub;
- `ronbercito/mirkohub` queda congelado como fuente legado/fallback de transición;
- el panel 1.1.12 consulta ambos repositorios y solo ofrece actualización cuando existe una `PANEL_VERSION` superior;
- cambios exclusivamente documentales con la misma versión no provocan una actualización del panel."""
if old in s:
    s = s.replace(old, new, 1)
closure = """

### Cierre de migración de repositorio

**Migración de código: completada.** El repositorio principal `ronbercito/Z-Hub` contiene el árbol actualizado de 1.1.12. La validación en servidor real del nuevo actualizador dual permanece pendiente hasta que el administrador instale 1.1.12 desde su panel.
"""
if "### Cierre de migración de repositorio" not in s:
    s += closure
p.write_text(s, encoding="utf-8")

d = Path("docs/CONTINUIDAD_MIKROHUB_1.1.12_REPOSITORIOS.md")
ds = d.read_text(encoding="utf-8")
block = """

## Estado de migración
Migración del árbol de archivos a `ronbercito/Z-Hub`: **COMPLETADA**.
Commit inicial promovido: `177e29184ce138469ef0d9d4eb6d5328acf5e409`.
El repositorio Z-Hub queda como fuente principal de todo trabajo futuro.
"""
if "## Estado de migración" not in ds:
    ds += block
d.write_text(ds, encoding="utf-8")
