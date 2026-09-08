<!--
POLÍTICA INTERNA DE CONTINUIDAD — NO ES PARTE DEL PANEL
Este archivo pertenece exclusivamente a la documentación técnica interna.
No importar desde React, FastAPI, Nginx ni ningún bundle/build.
-->

# Política prioritaria — errores durante actualizaciones

**Prioridad: MÁXIMA / OBLIGATORIA**

Cada vez que una actualización de MikroHub genere un error, falle el build,
se revierta (rollback) o no complete correctamente, **NO se debe intentar
repetir la actualización a ciegas**.

## Procedimiento obligatorio

1. **Detener la repetición del update** hasta entender la causa.
2. **Identificar exactamente qué cambió** en la actualización que falló:
   - archivos modificados;
   - commits involucrados;
   - versión anterior y versión objetivo;
   - dependencias nuevas o modificadas;
   - cambios de frontend, backend, scripts de despliegue o configuración.
3. **Revisar primero el código modificado** y buscar errores sintácticos,
   referencias incorrectas, imports faltantes, nombres incompatibles,
   cierres JSX/HTML, endpoints mal conectados, firmas incompatibles y errores
   de lógica que puedan explicar directamente el fallo.
4. **Seguir la cadena completa del comportamiento afectado**:

   ```text
   componente/llamada que inicia
       ↓
   función o servicio que procesa
       ↓
   endpoint/API que recibe
       ↓
   router/backend que ejecuta
       ↓
   modelo/DB/integración que modifica o consulta
       ↓
   respuesta
       ↓
   componente que recibe/muestra el resultado
   ```

5. **Comparar con el código existente que ya realiza funciones similares**.
   Si un cambio agrega una llamada, envío, actualización, eliminación,
   aprovisionamiento o integración, revisar cómo los demás módulos hacen esa
   misma operación y comparar:
   - nombres y firmas de funciones;
   - rutas/endpoints;
   - payloads y parámetros;
   - validaciones;
   - permisos;
   - manejo de errores;
   - respuestas esperadas;
   - imports/dependencias;
   - convenciones del proyecto.
6. **Reproducir el error en un entorno aislado/worktree** cuando sea posible,
   antes de tocar la instalación productiva.
7. **Corregir la causa real**, no ocultar el error ni desactivar validaciones
   para forzar el despliegue.
8. **Volver a ejecutar las pruebas relevantes**, como mínimo el build afectado
   y las pruebas de la funcionalidad modificada.
9. **Solo después de una verificación exitosa**, volver a probar el flujo de
   actualización del panel.
10. **Registrar el incidente y la solución** en la documentación interna de
    continuidad, incluyendo versión, archivos, causa, corrección, pruebas y
    resultado.

## Regla especial para errores de build

Si el update falla durante `yarn build`, `craco build` o una etapa equivalente,
la primera revisión debe ser el código fuente modificado en esa versión.

No asumir que el problema es Yarn, Node, ESLint, caché o el servidor sin antes
comprobar si existe un error real introducido por el cambio.

## Regla especial para código que hace llamadas o envíos

Cuando el cambio afecte una operación que **hace una llamada o envío**, siempre
comparar la implementación nueva con otras implementaciones funcionales del
mismo repositorio que ya hagan esa operación.

Ejemplos:
- frontend → API;
- API → MikroTik/OLT;
- envío de correo/WhatsApp;
- creación/actualización/eliminación de registros;
- aprovisionamiento de servicios;
- sincronización de identidad.

La comparación debe comprobar tanto quién **envía** como quién **recibe** y
cómo se procesa la respuesta.

## Prohibiciones

- No repetir un update fallido sin diagnóstico.
- No hacer `git reset --hard` sobre producción si existen datos/archivos locales
  que deban conservarse.
- No borrar la base de datos para resolver errores de actualización o de UI.
- No declarar una actualización exitosa solo porque Git cambió de commit.
- No solucionar un error de compilación ocultándolo sin identificar primero la
  causa.

## Objetivo

La prioridad es **encontrar y corregir primero el error introducido por la
modificación**, y luego verificar que las llamadas/envíos sean compatibles con
el resto de la arquitectura de MikroHub antes de volver a actualizar producción.

Esta política es interna y no incrementa `PANEL_VERSION` por sí sola.
