# Z-Hub 1.2.45 — Rediseño de tabla principal de Clientes

## Objetivo
Replicar el diseño aprobado para el listado principal de Clientes, separando la información por columnas y moviendo Ubicación a Acciones.

## Nuevo orden
`Abonado | Contacto | Plan / Tarifa | IP / Conexión | Deuda | Estado | Acciones`

## Cambios visuales
- Abonado muestra nombre y DNI/RUC en una columna propia.
- Contacto muestra teléfono y correo en una columna separada.
- Plan / Tarifa conserva nombre, precio mensual y una etiqueta de tecnología.
- IP / Conexión conserva IP, tipo de conexión y Router.
- Deuda conserva el total agregado del abonado y el contador de facturas pendientes.
- Estado usa insignias independientes para Activo, Pausado o Cortado.
- Ubicación deja de ocupar espacio en Abonado y pasa a Acciones como icono de mapa/GPS con tooltip `Ver en mapa`.
- Acciones conserva ficha, corte/reactivación, ONU cuando corresponda, WhatsApp, pausa, retiro, ubicación y eliminación.

## Estilo
- Cabecera azul marino.
- Tema Z-Hub Claro con fila blanca, divisores azul-gris suaves y tipografía azul oscura.
- Deuda pendiente en rojo vivo con contador circular rojo.
- Estado activo en insignia verde suave.
- Botones de acciones con fondos y bordes diferenciados por función.
- Tema oscuro conserva la misma estructura con tonos equivalentes oscuros.

## Compatibilidad
No se modifica MariaDB, facturación, servicios, aprovisionamiento MikroTik, OLT, NAP ni datos del cliente. El cambio es de presentación y regresiones estáticas.

## Backup
- Rama: `backup/pre-clients-table-redesign-1.2.44-20260910`
- HEAD previo: `eaad19a611149f76fdc8afd3c31a02d8589f8fb9`
- Registro: `docs/backups/1.2.44/CLIENTS_TABLE_REDESIGN_BACKUP.md`

## Archivos
- `frontend/src/modules/clientes/Clients.jsx`
- `frontend/src/modules/clientes/clients-theme.css`
- `backend/tests/test_maintenance_contracts.py`
- `frontend/src/modules/system-update/version.js`

## Validación
Se añadió una regresión que verifica el orden de las siete columnas, `colSpan=7`, el botón `Ver en mapa`, la separación de teléfono/correo, el total de deuda y los estilos principales. GitHub Actions valida compilación Python, contratos pytest y build React.

## Prueba pendiente
Validación visual en el servidor real con tema Z-Hub Claro y tema oscuro, incluyendo un abonado con deuda y varios servicios.
