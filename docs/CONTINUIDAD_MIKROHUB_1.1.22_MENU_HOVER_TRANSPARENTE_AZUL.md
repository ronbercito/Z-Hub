<!--
Archivo: docs/CONTINUIDAD_MIKROHUB_1.1.22_MENU_HOVER_TRANSPARENTE_AZUL.md
Actualización: 2026-09-09 — versión 1.1.22.
Función: continuidad del ajuste visual del hover del menú lateral en Z-Hub Claro.
-->

# Z-Hub — Continuidad 1.1.22 — Hover transparente azul

## Tipo
Corrección visual incremental del template `zhub-light`.

## Causa
Después de aplicar tipografía negra/negrita al menú lateral, el usuario indicó que al pasar el mouse aparecía una barra gris oscura que reducía la distinción y legibilidad del texto.

## Solicitud
El hover debe ser transparente, con un rectángulo delimitado por líneas azules y una carga azul translúcida, manteniendo la tipografía oscura y gruesa.

## Solución
Se modificó `frontend/src/modules/appearance/panel-theme.css` para que, exclusivamente en `zhub-light`:
- el estado hover no use fondo gris oscuro;
- el fondo sea transparente con una carga azul translúcida (`rgba(24, 119, 190, 0.08)`);
- el rectángulo tenga borde azul translúcido (`rgba(24, 119, 190, 0.42)`);
- el texto permanezca azul oscuro `#102f50`;
- el peso tipográfico sea 900 durante hover;
- no se agreguen glow ni sombras luminosas;
- los submenús reciban el mismo tratamiento.

El estado seleccionado mantiene una carga azul translúcida ligeramente mayor y borde azul más definido.

## Archivos modificados
- `frontend/src/modules/appearance/panel-theme.css`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_MIKROHUB_1.1.22_MENU_HOVER_TRANSPARENTE_AZUL.md`

## Flujo
```text
Usuario coloca el mouse sobre una opción
  ↓
zhub-light detecta :hover
  ↓
Fondo transparente + carga azul suave
  ↓
Marco azul sutil alrededor del rectángulo
  ↓
Texto azul oscuro + peso 900
```

## Validación
- [x] Se modificó únicamente la capa visual del template `zhub-light`.
- [x] Se conserva la navegación existente.
- [x] Se eliminó el tratamiento visual gris del hover.
- [x] Se aplicó fondo azul translúcido y borde azul.
- [x] Se incrementó la versión a 1.1.22.
- [ ] Build React real.
- [ ] Prueba visual real en navegador/servidor.

## Resultado esperado
Al pasar el mouse por una opción del menú, el texto debe seguir siendo claramente visible y grueso, dentro de un rectángulo con fondo azul muy transparente y líneas azules, sin barra gris oscura ni efecto brillante.

## Riesgos / pendientes
La apariencia final puede depender de clases Tailwind presentes en los botones. Si algún componente mantiene una clase de fondo con mayor especificidad, se deberá corregir puntualmente sin alterar el resto del template.
