# CONTINUIDAD Z-HUB 9

## Fecha
2026-09-09

## Versión
**1.1.90**

## Corrección
Se corrigió la apariencia de los cuatro recuadros de Gestión de Red que muestran:
- Clientes colas simples
- Clientes DHCP
- Clientes PPPoE
- Clientes suspendidos

### Causa
La capa visual del tema Claro Suave aplicaba una regla global que convertía superficies `bg-slate-950/60` en blanco. La regla específica de las cuatro métricas existía, pero podía quedar sobreescrita por el orden de carga de estilos.

### Solución
- Se creó `frontend/src/modules/appearance/network-metrics.css`.
- El archivo se importa después de `panel-theme.css` para darle prioridad a las métricas.
- Se conservaron los cuatro colores diferenciados: azul, violeta, turquesa y ámbar.
- Texto e iconos permanecen blancos para mantener contraste.
- La solución aplica al tema oscuro y al tema Claro Suave.
- No se modificó ninguna lógica de datos, conexión MikroTik ni funcionalidad de las pestañas en vivo.

## Archivos
- `frontend/src/modules/appearance/network-metrics.css`
- `frontend/src/App.js`
- `frontend/src/modules/system-update/version.js`

## Commit
`f7290a0d417fef68180b7de4f35f393b045335d4`
