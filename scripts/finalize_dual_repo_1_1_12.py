from pathlib import Path

p = Path("docs/CONTINUIDAD_MIKROHUB.md")
s = p.read_text(encoding="utf-8")

old_repo = "- Repositorio: `ronbercito/mirkohub`\n- Rama de publicación: `main`"
new_repo = (
    "- Repositorio principal desde 1.1.12: `ronbercito/Z-Hub`\n"
    "- Repositorio legado / respaldo de actualización: `ronbercito/mirkohub`\n"
    "- Rama de publicación: `main`"
)
if old_repo in s:
    s = s.replace(old_repo, new_repo, 1)

old_version = "- Versión funcional actual: **1.1.11**, correspondiente al refinamiento visual del template Z-Hub Blanco para reducir brillo e iluminación, manteniendo intacta la lógica funcional 1.1.10."
new_version = "- Versión funcional actual: **1.1.12**, correspondiente a la migración del desarrollo a `ronbercito/Z-Hub` y al actualizador con consulta dual Z-Hub/MikroHub."
if old_version not in s:
    raise SystemExit("No se encontró la línea de versión 1.1.11 en continuidad")
s = s.replace(old_version, new_version, 1)

marker = "## 23. Registro de continuidad — 2026-09-09 — Panel 1.1.12"
if marker not in s:
    s += r'''

---

## 23. Registro de continuidad — 2026-09-09 — Panel 1.1.12

**Tipo:** migración de repositorio / actualizador dual / continuidad / compatibilidad.

### Decisión principal

Desde esta versión el repositorio de trabajo y publicación principal del proyecto pasa a ser:

`ronbercito/Z-Hub`

El repositorio anterior:

`ronbercito/mirkohub`

queda conservado como **repositorio legado y fuente de respaldo para actualizaciones**. No se eliminará de inmediato porque las instalaciones existentes todavía pueden tener `origin` apuntando a MikroHub.

### Objetivo

Permitir una transición segura sin reinstalar el panel ni romper instalaciones ya desplegadas. El panel 1.1.12 puede consultar ambos repositorios y elegir la versión funcional más reciente.

### Política de selección

El backend consulta:

1. `https://github.com/ronbercito/Z-Hub.git` — fuente principal.
2. `https://github.com/ronbercito/mirkohub.git` — fuente legado/fallback.

La selección se realiza por `PANEL_VERSION`:

- gana la versión numéricamente mayor;
- si ambos publican la misma versión, **Z-Hub tiene prioridad**;
- un cambio únicamente documental con la misma `PANEL_VERSION` no debe mostrarse como actualización funcional.

### Flujo del actualizador 1.1.12

```text
Panel instalado
  ↓
GET /api/system-update/status
  ↓
consulta Z-Hub/main
  +
consulta MikroHub/main
  ↓
lee PANEL_VERSION de ambos
  ↓
selecciona versión mayor
  ↓
si hay empate → Z-Hub
  ↓
POST /api/system-update/install
  ↓
run_update.sh recibe repositorio seleccionado
  ↓
origin se cambia a esa fuente
  ↓
fetch + reset + setup_debian.sh
  ↓
rollback al commit anterior si falla
```

### Archivos funcionales modificados

- `backend/app/modules/system_update/router.py`
  - consulta ambos repositorios;
  - usa refs remotas separadas para no depender del `origin` actual;
  - devuelve la fuente seleccionada y el estado de ambas fuentes;
  - compara `PANEL_VERSION` y no solo diferencias de commit;
  - envía al instalador el repositorio elegido.

- `backend/app/modules/system_update/run_update.sh`
  - acepta `MIKROHUB_UPDATE_REPOSITORY` y `MIKROHUB_UPDATE_SOURCE`;
  - usa Z-Hub como fuente primaria por defecto en 1.1.12+;
  - conserva MikroHub como fallback compatible;
  - mantiene backup/rollback transaccional.

- `frontend/src/modules/system-update/version.js`
  - `PANEL_VERSION = 1.1.12`;
  - CHANGELOG de migración y doble repositorio.

### Compatibilidad

No se cambian:

- ruta de despliegue `/var/www/mikrohub`;
- variables internas heredadas que todavía usan el nombre MikroHub;
- base de datos;
- clientes;
- facturación;
- routers/OLT;
- permisos;
- autenticación;
- templates visuales.

El cambio de repositorio no implica renombrar rutas técnicas existentes.

### Backup obligatorio

Antes de modificar el actualizador se creó:

`backup-pre-dual-repo-1.1.12`

Esta rama conserva exactamente el estado 1.1.11 previo a la transición.

### Migración de archivos a Z-Hub

Después de validar y publicar 1.1.12 en el repositorio legado, el `main` completo debe copiarse a `ronbercito/Z-Hub` conservando el árbol de archivos actualizado. Desde ese momento, todo cambio nuevo se realizará primero en **Z-Hub**.

### Pruebas de la entrega

- [x] revisión del flujo actual `router.py → run_update.sh → setup_debian.sh`;
- [x] respaldo previo creado;
- [x] consulta dual implementada;
- [x] prioridad Z-Hub en empate de versión;
- [x] cambios documentales con la misma versión no generan falsa actualización;
- [x] rollback preservado;
- [x] sintaxis Python validada;
- [x] sintaxis Bash validada;
- [x] build React de producción validado;
- [x] continuidad maestra actualizada;
- [x] continuidad complementaria creada;
- [ ] instalación real 1.1.12 desde un servidor que aún tenga `origin` en MikroHub;
- [ ] validación real de detección futura de una versión publicada solo en Z-Hub.

### Regla a partir de 1.1.12

**Todo desarrollo nuevo debe realizarse en `ronbercito/Z-Hub`.**

`ronbercito/mirkohub` queda como compatibilidad/fallback y no debe volver a ser el repositorio principal salvo rollback o emergencia expresamente documentada.
'''

p.write_text(s, encoding="utf-8")

detail = Path("docs/CONTINUIDAD_MIKROHUB_1.1.12_REPOSITORIOS.md")
detail.write_text(r'''# Z-Hub 1.1.12 — Migración de repositorio y actualizador dual

Fecha: 2026-09-09

## Repositorio principal
`ronbercito/Z-Hub`

## Repositorio legado / fallback
`ronbercito/mirkohub`

## Regla
Desde 1.1.12 todo desarrollo nuevo se realiza en Z-Hub. MikroHub se conserva temporalmente como fuente secundaria para que paneles instalados anteriormente puedan migrar sin reinstalación.

## Actualizador
El backend consulta ambos `main`, lee `PANEL_VERSION`, elige la versión mayor y, en empate, prioriza Z-Hub. La instalación cambia `origin` a la fuente seleccionada y conserva rollback al commit anterior.

## Seguridad
Backup previo: `backup-pre-dual-repo-1.1.12`.

No se modifican base de datos, clientes, facturación, red, OLT, autenticación, permisos ni templates.

## Validación
La entrega valida sintaxis Python, sintaxis Bash y build React antes de promocionarse a `main`.
''', encoding="utf-8")
