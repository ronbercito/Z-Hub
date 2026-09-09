<!--
Archivo: docs/CONTINUIDAD_MIKROHUB_1.1.20_MENU_TIPOGRAFIA.md
Actualización: 2026-09-09 — versión 1.1.20.
Función: continuidad del ajuste visual de tipografía y resaltado de navegación del template claro.
-->

# Z-Hub — Continuidad 1.1.20 — Tipografía del menú lateral

## Causa
La comparación visual mostró que el menú lateral del panel no tenía el mismo peso tipográfico que la referencia: las etiquetas se percibían demasiado delgadas y la opción seleccionada no resaltaba suficientemente.

## Solución
Se ajustó exclusivamente la capa visual del template `zhub-light` en `frontend/src/modules/appearance/panel-theme.css`:
- tipografía del menú con `Inter`, `Segoe UI` y Arial como fallback;
- elementos no activos con peso 600;
- sección activa con peso 800;
- submenú activo con peso 800;
- color activo azul tinta sólido;
- sin introducir glow, neón ni cambios de navegación.

## Archivos modificados
- `frontend/src/modules/appearance/panel-theme.css`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_MIKROHUB_1.1.20_MENU_TIPOGRAFIA.md`

## Flujo
```text
Template zhub-light
  ↓
Sidebar
  ↓
Menú / submenú
  ↓
No activo: peso 600
Activo: peso 800 + azul tinta
```

## Validación
- [x] Se revisó la captura del panel y la referencia proporcionada.
- [x] Se identificó tipografía/peso como diferencia principal del menú.
- [x] Se limitó el cambio al template claro.
- [x] Se incrementó la versión a 1.1.20.
- [ ] Build React real.
- [ ] Prueba visual real en navegador/servidor.

## Resultado
Cambio publicado en `main` como versión 1.1.20. El objetivo es que el menú y especialmente la opción activa tengan un peso visual claramente mayor, manteniendo el diseño sobrio del ejemplo.

## Pendiente
Validar visualmente en el panel desplegado. Si el peso todavía no coincide, el siguiente ajuste deberá hacerse sobre familia tipográfica/carga de fuente antes de alterar tamaños o colores.
