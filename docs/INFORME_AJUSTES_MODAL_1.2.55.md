# Z-Hub 1.2.55 — Ajustes en ventanas modales

## Objetivo
Mantener el tablero visual de Ajustes como pantalla principal y abrir cada opción en una ventana compacta, sin ocupar toda la pantalla ni navegar fuera del tablero.

## Cambios
- Cada tarjeta de Ajustes abre un modal centrado sobre el tablero.
- El modal limita ancho y alto y usa scroll interno cuando el contenido lo requiere.
- Clic fuera del modal o tecla Escape cierra la ventana sin guardar.
- Una operación de escritura confirmada por la API cierra automáticamente el modal.
- La acción de prueba SMTP `/test` no cierra el modal porque no es un guardado de configuración.
- Se conservan los formularios y módulos existentes; no se reescribe su lógica de negocio.
- El diseño se adapta a tema claro, oscuro y pantallas pequeñas.

## Backup
- Rama: `backup/pre-settings-modal-1.2.54-20260910`
- HEAD protegido: `a5a52df07e0d06db3722390a5fd0667f78b70d65`

## Archivos
- Nuevo: `frontend/src/modules/ajustes/SettingsModal.jsx`
- Nuevo: `frontend/src/modules/ajustes/settings-modal.css`
- Modificado: `frontend/src/components/layout/Layout.jsx`
- Modificado: `frontend/src/modules/system-update/version.js`
- Nuevo: `backend/tests/test_settings_modal_contract.py`
- Modificado: `.github/workflows/quality.yml`

## Compatibilidad
No modifica backend, MariaDB, clientes, facturación, inventario, MikroTik, OLT ni valores guardados. Los cambios no confirmados se descartan al cerrar el modal.

## Validación
Se añade un contrato estático para comprobar apertura modal, cierre exterior/Escape, cierre posterior a escritura exitosa, dimensiones compactas y tema claro. El workflow también ejecuta build React.

## Prueba pendiente en producción
Actualizar a 1.2.55, abrir varias tarjetas en tema claro/oscuro, cerrar con clic exterior sin guardar y confirmar que un guardado exitoso cierre la ventana.
