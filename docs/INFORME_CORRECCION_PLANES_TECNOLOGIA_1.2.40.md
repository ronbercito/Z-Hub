# Z-Hub 1.2.40 — Corrección de planes por tecnología

## Incidencia
En la ficha del cliente, al abrir **Nuevo servicio**, el selector **Plan de internet** mostraba todos los planes aunque se cambiara **Tecnología** entre Fibra óptica e Inalámbrico.

## Causa
`ClientServiceEditor.jsx` cargaba `/api/plans` y renderizaba directamente `plans.map(...)`. El asistente principal de registro ya conservaba la política correcta mediante `planTechnology()` y `activePlans`, pero el editor de servicios no reutilizaba esa clasificación.

## Corrección
- Se incorpora en el editor la misma clasificación de tecnología usada por el alta guiada.
- Fibra óptica muestra únicamente planes activos clasificados como fibra.
- Inalámbrico muestra únicamente planes activos Radio/Inalámbrico/Ubiquiti/Mimosa.
- Cambiar la tecnología limpia `plan_id` para impedir conservar accidentalmente un plan de la tecnología anterior.
- Antes de guardar se valida que el plan seleccionado corresponda a la tecnología actual.
- Se añade una ayuda visual debajo del selector indicando qué tecnología está filtrando los planes.

## Seguridad de datos
No se modifica MariaDB, MikroTik, OLT, facturación, clientes existentes, NAP ni direcciones IP. Es una corrección de selección/validación en el editor de servicios.

## Backup
Rama: `backup/pre-plan-tech-filter-1.2.39-20260910`

HEAD previo: `0d93f37057a62712a0f8a25c680c14748c92cebb`

## Versión
`1.2.40`

## Pruebas
Debe validarse GitHub Actions (build React y controles existentes) y después comprobar visualmente en producción ambos cambios de tecnología dentro de Nuevo servicio.
