<!--
Archivo: docs/CONTINUIDAD_MIKROHUB_1.1.19_MENU_ACTIVO_NEGRITA.md
Actualización: 2026-09-09 — versión 1.1.19.
Función: continuidad del ajuste visual de navegación solicitado para Z-Hub Claro.
-->

# Z-Hub — Continuidad 1.1.19 — Menú activo en negrita

## Tipo
Corrección visual incremental del template `zhub-light` y su navegación lateral.

## Causa
En la referencia visual del usuario, el elemento seleccionado del menú lateral debe destacar con mayor claridad. El usuario solicitó que, al seleccionar un menú o submenú, el texto se muestre más en negrita para identificar rápidamente la ubicación actual.

## Solución
Se modificó `frontend/src/components/layout/Sidebar.jsx` para que:
- el menú principal activo use `font-bold`;
- los submenús activos usen `font-bold`;
- los elementos no activos mantengan `font-semibold`;
- no se modifique la lógica de rutas, permisos, expansión ni selección.

## Archivos modificados
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_MIKROHUB_1.1.19_MENU_ACTIVO_NEGRITA.md`

## Flujo
```text
Usuario selecciona menú
  ↓
activeTab identifica la sección
  ↓
Sidebar determina groupActive / active
  ↓
Elemento seleccionado → font-bold
Elemento no seleccionado → font-semibold
```

## Validación
- [x] Se revisó el componente real `Sidebar.jsx`.
- [x] Se mantuvo la lógica existente de navegación.
- [x] Se modificó únicamente el peso tipográfico del estado activo.
- [x] Se incrementó la versión a 1.1.19.
- [ ] Build React real.
- [ ] Prueba visual real en navegador/servidor.

## Resultado
El cambio queda publicado directamente en `main` como versión 1.1.19. El menú y submenú seleccionados deben resaltar con negrita claramente visible.

## Riesgos / pendientes
El resultado final puede depender del override CSS del template claro. Si el peso no se percibe suficientemente en el navegador, el siguiente ajuste debe ser puntual sobre color/contraste del estado activo, sin alterar la navegación.
