# Z-Hub — Backups históricos

## Propósito

Esta carpeta conserva puntos de restauración históricos y documentación asociada a cambios importantes del proyecto.

## Convención

A partir de las series documentales más recientes, un backup representa **el estado protegido antes de realizar un cambio**.

Por eso, la versión de una carpeta indica normalmente la versión base protegida, no necesariamente la versión final que nació después del cambio.

Ejemplo:

```text
1.2.59/
  LICENSE_STAGE4_BACKUP.md
        ↓
protege Z-Hub 1.2.59
        ↓
se implementa Etapa 4
        ↓
Z-Hub 1.2.60
```

Los registros deberían identificar, cuando exista la información:

- versión protegida;
- versión/cambio objetivo;
- rama de respaldo;
- commit protegido;
- motivo;
- alcance;
- restricciones o invariantes importantes.

## Generaciones históricas

### Backups de código heredados

Las primeras carpetas pueden contener archivos `.bak`, `.jsx`, `.py`, `version.js` u otras copias directas del código. Son material histórico y no deben utilizarse como mecanismo principal de rollback.

El código vigente se determina desde Git y la rama `main`.

### Backups documentales

Las versiones posteriores utilizan principalmente archivos `*_BACKUP.md` que registran el punto de restauración y su propósito.

### Backups registrados en continuidad/informes

En cambios más recientes, especialmente durante el sistema de licencias 1.2.6x–1.2.7x, algunas ramas de respaldo están documentadas directamente en `CONTINUIDAD_Z-HUB-v1.2.md` o en los informes de versión y no necesariamente tienen un archivo duplicado bajo esta carpeta.

Eso es válido: la fuente de rollback es la rama/commit de Git y la documentación explica su propósito.

## Regla para nuevos cambios

No crear copias manuales del código dentro de `docs/backups/` salvo que exista una razón histórica o técnica concreta.

Para un cambio crítico:

1. Crear una rama de respaldo antes de modificar.
2. Registrar el commit protegido.
3. Documentar versión base y cambio objetivo.
4. Ejecutar las pruebas correspondientes.
5. Registrar el resultado en la bitácora de continuidad.
6. Verificar que código, versión y documentación estén en `main` antes de declarar publicado el cambio.

## Importante

No almacenar aquí secretos, tokens, claves privadas, certificados privados, `.env` ni bases de datos productivas.

Los backups históricos no deben eliminarse durante una limpieza documental sin verificar primero que no contengan información necesaria para reconstruir una regresión antigua.
