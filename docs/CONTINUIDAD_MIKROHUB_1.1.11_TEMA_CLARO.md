# Z-Hub 1.1.11 — Ajuste del template claro

Fecha: 2026-09-09

## Objetivo
Reducir la iluminación del template `zhub-light` introducido en 1.1.10 sin afectar funciones ni el template oscuro.

## Cambios
- fondo general `#eef3f8`;
- superficies blancas suavizadas;
- bordes más neutros;
- sombras más discretas;
- hovers menos brillantes;
- gradientes decorativos con menor opacidad;
- versión funcional: `1.1.11`.

## Seguridad
Backup previo: `backup-pre-zhub-light-1.1.11`.

No se modificaron módulos de clientes, facturación, red, MikroTik, OLT, autenticación, permisos ni base de datos.

## Validación
La rama de actualización ejecuta build React y validación de sintaxis Python antes de ser promovida a `main`.

## Pendiente
Validación visual en el servidor real después de instalar desde el centro de actualizaciones.
