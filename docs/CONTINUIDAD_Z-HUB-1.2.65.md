# Z-Hub — Continuidad 1.2.65

**Fecha:** 2026-09-10
**Versión:** 1.2.65
**Estado:** hotfix publicado en `main`, pendiente validación visual/operativa en servidor real.

## Punto exacto de continuidad
Se corrigió la causa por la que una licencia pagada/ilimitada podía seguir apareciendo como `LICENCIA NO VÁLIDA` después de 1.2.63 y 1.2.64.

El fallback anterior estaba ubicado en `licencia/licencias.txt`, pero `deploy/install.sh` elimina ese directorio durante la instalación. Por eso el motor podía quedarse únicamente con el registro privado y perder la fuente de compatibilidad.

Desde 1.2.65 el fallback runtime es:

`backend/app/core/license_fallback.txt`

`backend/app/core/license_manager.py` lo combina con `/etc/zhub/licencia/licencias.txt`; el registro privado mantiene prioridad para suspensiones/revocaciones explícitas.

## Backup
`backup/pre-license-runtime-fallback-1.2.65-20260910`

## Informe detallado
`docs/INFORME_HOTFIX_RUNTIME_LICENCIA_1.2.65.md`

## Próximo paso obligatorio
Actualizar un servidor de prueba/producción de 1.2.64 a 1.2.65 y comprobar:
1. `Ajustes → Licencia Z-Hub`.
2. La clave terminada en `002` debe aparecer como `LICENCIA ACTIVA` si no está suspendida/inactiva en el registro privado.
3. Reinicio/backend y build deben finalizar correctamente.
4. Solo después de cerrar esta validación continuar con Etapa 6/7 (License Server).
