# Continuidad complementaria — Z-Hub 1.1.13 — Tema Claro Suave

Fecha: 2026-09-09
Repositorio principal: `ronbercito/Z-Hub`
Rama de publicación: `main`

## Regla de repositorio
Desde esta entrega y de aquí en adelante, todo desarrollo nuevo, corrección, documentación y publicación del panel debe realizarse en `ronbercito/Z-Hub`.

`ronbercito/mirkohub` queda únicamente como repositorio legado/fallback del actualizador dual y no debe recibir desarrollos nuevos salvo una emergencia o rollback expresamente documentado.

## Motivo
El administrador indicó que el template claro seguía teniendo demasiado brillo blanco y resultaba molesto para la vista durante el uso prolongado.

## Cambio visual
Se conserva el identificador interno `zhub-light` para no romper preferencias guardadas, pero el nombre visible cambia de **Z-Hub Blanco** a **Z-Hub Claro Suave**.

La paleta se mueve a una luminancia menor:

- fondo principal: `#d7e0e9`;
- superficies principales: `#e7edf3`;
- superficies secundarias: `#dde5ed`;
- sidebar/header: `#e3e9f0`;
- campos: `#e8edf3`;
- bordes: gama `#becad7` / `#b3c0ce` / `#a8b7c6`;
- sombras y gradientes decorativos: intensidad reducida al mínimo.

No se usa blanco puro como superficie normal del template claro. El blanco se conserva solamente en texto sobre botones/estados con fondos de color cuando es necesario para contraste.

## Archivos modificados
- `frontend/src/modules/appearance/panel-theme.css`
- `frontend/src/modules/appearance/panelThemes.js`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_MIKROHUB.md`
- `docs/CONTINUIDAD_MIKROHUB_1.1.13_TEMA_CLARO_SUAVE.md`

## Compatibilidad
No se modifica:
- lógica de Clientes;
- Facturación;
- MikroTik;
- OLT;
- permisos;
- autenticación;
- base de datos;
- rutas internas;
- identificador persistido del tema (`zhub-light`);
- tema oscuro clásico.

## Backup
Antes de modificar el tema se creó la rama:

`backup-pre-soft-light-1.1.13`

Base: commit `ff71f9ae621cf196dff4cd21fd217f3a87eab602`.

## Pruebas requeridas antes de publicar
- validar sintaxis básica de los archivos modificados;
- ejecutar build React de producción;
- revisar que `PANEL_VERSION` sea 1.1.13;
- confirmar que el identificador `zhub-light` no haya cambiado;
- confirmar que la continuidad maestra quede actualizada.

## Validación posterior en servidor
Después de instalar 1.1.13 revisar visualmente:
1. Dashboard;
2. Sidebar y header;
3. Ajustes;
4. tablas;
5. formularios;
6. Clientes;
7. Facturación.

Si aún se percibe demasiado claro, el siguiente ajuste debe hacerse sobre esta misma capa visual, sin tocar la lógica funcional de los módulos.
