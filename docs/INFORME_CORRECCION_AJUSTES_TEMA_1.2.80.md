# Informe de corrección — Guardado de tema en Ajustes · Z-Hub 1.2.80

## Problema

Al cambiar el tema del panel desde Ajustes, el usuario podía recibir el mensaje genérico `Error al guardar ajustes`.

## Causa

El frontend conserva en su estado la respuesta completa de `GET /api/settings`. En instalaciones que arrastran claves antiguas o personalizadas, esas claves también podían viajar de vuelta en `PUT /api/settings`.

El backend había sido endurecido para rechazar cualquier clave que no perteneciera a `DEFAULT_SETTINGS`. Como consecuencia, una clave heredada podía hacer fallar una actualización válida como `panel_theme`.

## Corrección 1.2.80

- `PUT /api/settings` elimina siempre las claves internas protegidas de licencia y SMTP.
- Después de eliminar las protegidas, solo conserva para escritura claves pertenecientes a `EDITABLE_SETTINGS`.
- Las claves antiguas/desconocidas dejan de bloquear actualizaciones válidas.
- `panel_theme` continúa siendo una configuración editable y se guarda normalmente.
- No se modifica la lógica de activación, validación o enforcement de licencias.
- No se modifica la lógica de MikroTik, OLT, facturación ni clientes.

## Compatibilidad

Los datos válidos que ya existen en `s.data` se conservan. Las claves obsoletas no se escriben de nuevo durante un PUT genérico, pero tampoco provocan un 422 que impida guardar el resto de la configuración.

## Validación realizada

Revisión estática del flujo React → `PUT /api/settings` → FastAPI → `Setting.data` y verificación del contrato de `panel_theme` en `DEFAULT_SETTINGS`.

No se ejecutó un navegador contra una instalación productiva desde este entorno; por ello la prueba final pendiente es cambiar el tema en la instancia desplegada y confirmar que permanece después de recargar la página.
