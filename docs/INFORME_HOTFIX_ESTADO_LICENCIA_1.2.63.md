# Z-Hub 1.2.63 — Hotfix estado de licencia

## Problema observado
Una instalación actualizada mostraba simultáneamente `LICENCIA NO VÁLIDA` y datos de una licencia pagada/ilimitada. La causa compatible más probable era la coexistencia de un archivo privado de licencias con el fallback del repositorio: el motor anterior elegía uno u otro, por lo que la sola existencia del archivo privado podía ocultar una licencia histórica válida presente en el fallback.

## Corrección
- El registro incluido en el repositorio y el registro privado ahora se combinan temporalmente durante la transición a la Etapa 6.
- El fallback se carga primero.
- El registro privado se carga después y sobrescribe cualquier clave repetida.
- Una licencia `INACTIVA` o `SUSPENDIDA` en el registro privado conserva prioridad y no puede quedar activa por el fallback.
- Una clave histórica válida que no exista en el archivo privado puede seguir resolviéndose desde el fallback hasta migrar al License Server.

## Alcance
No cambia clientes, facturación, MikroTik, OLT ni datos de operación. Solo corrige la resolución local de la fuente de licencia.

## Backup
`backup/pre-license-status-hotfix-1.2.62-20260910`

## Versión
Z-Hub 1.2.63.
