# CONTINUIDAD Z-HUB 11

## Fecha
2026-09-09

## Versión
**1.1.92**

## Problema reportado
Después de actualizar a 1.1.91, las cuatro tarjetas de resumen de Gestión de Red seguían viéndose blancas en **Z-Hub Claro Suave**, aunque en el tema oscuro sí mostraban correctamente sus colores.

Tarjetas afectadas:
- Clientes colas simples
- Clientes DHCP
- Clientes PPPoE
- Clientes suspendidos

## Diagnóstico
`panel-theme.css` contiene reglas globales del tema Claro Suave que convierten las superficies `bg-slate-*` a blanco y neutralizan los degradados con `background-image: none !important`. La hoja específica `network-metrics.css` no era suficiente para garantizar prioridad durante el build/carga final de CSS.

## Solución
Se añadió una excepción **al final de `frontend/src/modules/appearance/panel-theme.css`**, después de las reglas globales del tema claro.

La excepción usa selectores específicos y `!important` para restaurar:
- azul para Clientes colas simples;
- violeta para Clientes DHCP;
- turquesa para Clientes PPPoE;
- ámbar para Clientes suspendidos.

También se mantiene texto e iconos blancos.

El bloque está condicionado a `html[data-panel-theme="zhub-light"]`, por lo que no altera el tema oscuro ni la funcionalidad de Gestión de Red.

## Versión
`frontend/src/modules/system-update/version.js` → **1.1.92**

## Commits
- `4ce6700d09708a8a8dd6c0ed32edadda814b4d22` — fix: force network metric colors after light theme overrides
- `6404fb8005b2690aa5f6cb9f025c89ecbb74048b` — release: bump Z-Hub to 1.1.92

## Nota
La corrección no cambia consultas al MikroTik, conteos, permisos, navegación ni funcionalidad de las pestañas en vivo. Es exclusivamente una corrección de precedencia CSS para Claro Suave.
