<!--
Archivo: docs/CONTINUIDAD_MIKROHUB_1.1.15_TEMA_CLARO_SIN_BRILLO.md
Actualización: 2026-09-09 — versión 1.1.15.
Función: continuidad de la corrección visual del template zhub-light.
-->

# Z-Hub — Continuidad 1.1.15 — Tema claro sin brillo

## Tipo
Mejora visual / corrección de apariencia.

## Causa
La versión 1.1.14 del template claro había reducido los efectos del tema oscuro, pero el panel todavía se percibía demasiado luminoso y conservaba contrastes/efectos que no coincidían con la referencia visual aprobada por el administrador.

## Objetivo aprobado
Aplicar al template claro el aspecto de la referencia:

- superficies blancas limpias;
- fondo claro neutro;
- textos en azul tinta sólido;
- colores de estado definidos y con saturación controlada;
- líneas y bordes grises discretos;
- sombras mínimas o inexistentes;
- cero glow/neón;
- cero gradientes decorativos;
- cero filtros luminosos;
- apariencia plana, profesional y legible.

## Solución
Se reforzó exclusivamente la capa visual `zhub-light` en `frontend/src/modules/appearance/panel-theme.css`.

Se normalizaron fondos, textos, bordes, formularios, botones, tarjetas y estados. Se desactivaron gradientes, sombras coloreadas, drop-shadow, filtros y efectos de glow. Los KPI mantienen colores sólidos para conservar su significado, pero sin gradientes ni brillo.

El tema oscuro clásico no se modifica deliberadamente.

## Archivos modificados

- `frontend/src/modules/appearance/panel-theme.css` — propietario de la capa visual `zhub-light`.
- `frontend/src/modules/system-update/version.js` — versión 1.1.15 y CHANGELOG.
- `docs/CONTINUIDAD_MIKROHUB_1.1.15_TEMA_CLARO_SIN_BRILLO.md` — esta continuidad.

## Flujo
```text
Selector de tema
  ↓
zhub-light
  ↓
panel-theme.css
  ↓
Sobrescritura visual no destructiva
  ↓
Superficies blancas + texto azul tinta + colores sólidos
  ↓
Sin glow / sin gradientes / sin sombras luminosas
```

## Base de datos / API
Sin cambios.

## Funcionalidad
Sin cambios deliberados en lógica de negocio, API, datos, autenticación, facturación, red o servicios.

## Backup
Se conserva la rama creada antes del rediseño:
`backup/pre-zhub-light-solid-2026-09-09`

## Pruebas
- [x] revisión de la referencia visual proporcionada;
- [x] revisión del propietario `panel-theme.css`;
- [x] ajuste de paleta y superficies;
- [x] eliminación de gradientes;
- [x] eliminación de sombras coloreadas y glow;
- [x] actualización de versión/changelog;
- [x] continuidad registrada;
- [ ] build React real;
- [ ] prueba visual real en navegador/servidor;
- [ ] comprobación del tema oscuro después del cambio.

## Resultado
Código publicado en `main` como **1.1.15**. El template claro queda definido para aproximarse a la referencia aprobada: limpio, plano, sólido, con tonos sobrios y sin brillo.

## Pendientes
La validación visual final debe hacerse en el panel desplegado. Si algún componente conserva un efecto luminoso porque utiliza una clase CSS específica no cubierta por esta capa, se debe corregir puntualmente sin alterar el tema oscuro.

## Commits
- Tema claro: `32c6f68e51586f6ddbe64b10f758104c5336d4c3`
- Versión 1.1.15: `10b60734424b913248b8af75ff4518cc6ad8b332`
