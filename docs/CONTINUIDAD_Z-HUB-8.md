# Continuidad Z-Hub 8

**Fecha:** 2026-09-09  
**Versión:** 1.1.89

## Cambio
Se corrigió la información de las tarjetas de **Gestión de Red → Routers MikroTik** para que CPU, Mem y Ping muestren datos reales del router agregado.

## Problema encontrado
`RouterCard.jsx` mostraba directamente `cpu_usage_pct`, `memory_usage_pct` y `ping_ms` del objeto recibido por `GET /routers`. Esos campos podían contener valores históricos o predeterminados aunque las pestañas inferiores ya estuvieran consultando correctamente el MikroTik en vivo.

## Solución
`frontend/src/modules/red/Network.jsx` ahora, al cargar la lista de equipos, consulta automáticamente el endpoint existente `POST /routers/{router_id}/test-connection` para cada MikroTik. El endpoint ejecuta `snapshot_router()` y devuelve el objeto del router actualizado.

La tarjeta recibe así los datos reales de:
- CPU
- Memoria
- Ping/latencia TCP
- Estado online/offline
- Identidad
- Versión RouterOS
- Modelo/board
- Uptime

Las OLT no pasan por esta sincronización automática.

## Alcance
No se modificaron las pestañas ni sus consultas en vivo de Interfaces, PPPoE, Colas, DHCP, address-list o Hotspot. Tampoco se modificó la lógica de credenciales, permisos, cortes, aprovisionamiento ni actualización del sistema.

## Commits
- `f55e78dfeea4809e4ae67ff4e4d1bccdef3608b9` — tarjetas MikroTik con estado real al cargar.
- `fb46a31fe53fc217b61d1f080cceba862fc574d9` — versión 1.1.89.
- `bbf3bc4bebc0763183407e52eff7344ed80a947a` — continuidad 7 incorporada para mantener la secuencia documental.

## Próxima continuidad
`CONTINUIDAD_Z-HUB-9.md`.
