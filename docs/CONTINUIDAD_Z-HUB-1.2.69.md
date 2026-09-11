# Z-Hub 1.2.69 — Continuidad License Center

Fecha: 2026-09-10

## Cambio
Se reemplaza para nuevas licencias el sufijo corto de 8 caracteres hexadecimales por un identificador aleatorio de 48 caracteres hexadecimales (24 bytes / 192 bits).

Formato oficial:
`ZHUB-AAAA-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

Ejemplo de forma (no reutilizar como licencia):
`ZHUB-2026-8F3A7C91D2E64B80A1F94C7752B3D8E69A41F271C6E84353`

## Implementación
- `license_server/static/key192.js`: usa `crypto.getRandomValues()` con 24 bytes y los representa como 48 HEX mayúsculas.
- `license_server/static/index.html`: carga el generador 192-bit después de `app.js`, reemplazando el generador de UI anterior.
- SQLite mantiene `license_key` como PRIMARY KEY, por lo que una colisión no puede guardarse como licencia duplicada.
- No se usan `#`, `$`, `%` ni otros caracteres especiales para evitar problemas de transporte/escape.
- Las licencias existentes no se modifican ni migran; el formato se aplica a claves nuevas/regeneradas.

## Backup
`backup/pre-license-key-192bit-1.2.69-20260910`

## Riesgo / pendiente
El endpoint legado `/admin/licenses/generate-key` continúa existiendo para compatibilidad, pero la interfaz 1.2.69 genera las nuevas claves de 192 bits con Web Crypto. En una revisión futura puede alinearse también ese endpoint sin romper consumidores existentes.

## Prueba operativa pendiente
Actualizar el contenedor `web-licencia`, recargar `/admin-ui` sin caché y confirmar visualmente que Nueva licencia muestre 48 caracteres HEX después de `ZHUB-2026-` y que `Generar otra` produzca una clave distinta.
