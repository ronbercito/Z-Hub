# Z-Hub 1.3.30 — Sistema operativo y tema claro/oscuro

## Cambio solicitado

Se revisó la pantalla **Ajustes > Sistema** a partir de la validación visual realizada en Z-Hub.

## Backup previo

Antes de modificar esta entrega se creó:

`backup/pre-system-theme-operativo-20260912`

apuntando a `main` en el commit `5e34b83c60e2fcb1f29b89153c403588934f9ac6` (Z-Hub 1.3.29).

## Cambios

- `Sistema` queda marcado como **Operativo** en `SettingsHome.jsx`.
- El panel `SystemSettings` deja de depender visualmente del tema oscuro.
- Se agregan variables y reglas específicas para `zhub-light` y `zhub-dark`.
- En tema claro, selector, textos, tarjeta de hora, separadores y botón de detección quedan con contraste adecuado.
- En tema oscuro se conservan superficies oscuras y textos claros, sin afectar la funcionalidad.
- Se mantiene `America/Lima` como zona predeterminada y no se modifica la hora del servidor.

## Validación pendiente

La revisión visual debe comprobarse en el panel real alternando **tema claro ↔ tema oscuro** y verificando que el selector, la hora actual y ambos botones permanezcan legibles.
