# Z-Hub 1.2.53 — Tablero visual de Ajustes

## Objetivo
Reemplazar la entrada directa de Ajustes por una portada visual de módulos basada en el diseño aprobado, conservando todas las pantallas y opciones existentes.

## Cambios
- `Ajustes` abre ahora `SettingsHome` con tarjetas visuales de todos los módulos existentes.
- Las tarjetas tienen iconos, tonos diferenciados, animación hover, realce de borde/sombra y tooltip descriptivo.
- Se muestran estados informativos `Operativo` y `En desarrollo`.
- Se consideran operativos únicamente los accesos que actualmente tienen interfaz funcional específica: General, Configuración clientes, Gestión personal, Servidor de correo y Google.
- Los demás accesos continúan disponibles, pero se identifican como `En desarrollo` porque actualmente muestran la pantalla preparada de Settings.
- Las tarjetas navegan a las mismas rutas internas existentes; no se elimina el submenú lateral ni se cambia backend.
- Se agregan estilos explícitos para tema claro, oscuro y diseño responsive.

## Archivos
- Nuevo: `frontend/src/modules/ajustes/SettingsHome.jsx`
- Nuevo: `frontend/src/modules/ajustes/settings-home.css`
- Modificado: `frontend/src/components/layout/Layout.jsx`
- Modificado: `frontend/src/modules/system-update/version.js`

## Backup
- Rama: `backup/pre-settings-dashboard-1.2.52-20260910`
- HEAD protegido: `82f4a9ff950f1c643421589b6cd4976154792da8`

## Compatibilidad
No se elimina ni modifica información de clientes, facturación, inventario, recuperación, red, MikroTik, OLT ni configuraciones existentes. El cambio es de navegación y presentación del módulo Ajustes.

## Validación
Debe pasar el workflow de calidad existente, incluyendo build React. La validación visual final en producción queda pendiente después de actualizar a 1.2.53.
