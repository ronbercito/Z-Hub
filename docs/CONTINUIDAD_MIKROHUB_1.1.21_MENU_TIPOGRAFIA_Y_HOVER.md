<!--
Archivo: docs/CONTINUIDAD_MIKROHUB_1.1.21_MENU_TIPOGRAFIA_Y_HOVER.md
Actualización: 2026-09-09 — versión 1.1.21.
Función: continuidad del ajuste tipográfico y de interacción del menú lateral para Z-Hub Claro.
-->

# Z-Hub — Continuidad 1.1.21 — Menú: tipografía y hover reforzado

## Tipo
Corrección visual incremental del template `zhub-light` y de la navegación lateral.

## Causa
La referencia visual solicitada muestra el texto del menú lateral con un tono oscuro y un peso tipográfico claramente más fuerte. El usuario indicó además que, al pasar el mouse por una opción, el texto debe verse todavía más grueso para resaltar la interacción.

## Solución
Se ajustó la navegación lateral para que:
- las opciones normales del menú usen texto oscuro con peso 700;
- la opción seleccionada use peso 900;
- los submenús seleccionados usen peso 900;
- al pasar el mouse sobre una opción, el texto aumente a peso 900;
- el cambio sea visual y no altere rutas, permisos, expansión ni lógica de navegación;
- el ajuste corresponda al template `zhub-light`.

## Archivos involucrados
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/modules/appearance/panel-theme.css`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_MIKROHUB_1.1.21_MENU_TIPOGRAFIA_Y_HOVER.md`

## Flujo esperado
```text
Usuario navega por el menú
  ↓
Elemento normal → texto oscuro + peso 700
  ↓
Mouse sobre elemento → peso 900
  ↓
Elemento activo → peso 900
  ↓
Submenú activo → peso 900
```

## Validación
- [x] Se revisó la fuente de verdad de versión `version.js`.
- [x] Se registró el cambio como versión 1.1.21.
- [x] Se mantuvo la lógica de navegación existente.
- [x] Se limitó el objetivo al comportamiento visual del menú claro.
- [ ] Build React real.
- [ ] Prueba visual real en navegador/servidor.

## Resultado
La versión 1.1.21 queda documentada como ajuste de legibilidad y jerarquía visual del menú lateral: texto oscuro/negrita en estado normal, mayor peso en selección y peso 900 durante hover.

## Riesgos / pendientes
El peso final percibido puede depender de la fuente disponible en el navegador. Si el texto todavía no coincide con la referencia, el siguiente ajuste debe centrarse en familia tipográfica, color y peso, sin modificar la estructura ni la lógica del menú.
