## 2026-09-11 — Reorganización documental de continuidad y backups

- Se revisó nuevamente `docs/backups/` y se confirmó la evolución de tres modelos históricos: copias directas de código, backups documentales y rollbacks registrados por rama/commit en informes/continuidad.
- Se agregó `docs/backups/README.md` para dejar explícita la convención: una carpeta de backup representa normalmente el estado protegido antes del cambio, no necesariamente la versión final resultante.
- Se conserva el material histórico existente; esta limpieza no elimina copias `.bak` ni registros de rollback.
- Se mantiene `docs/CONTINUIDAD_Z-HUB-v1.2.md` como fuente activa de la serie 1.2.x, con las versiones nuevas primero.
- `docs/CONTINUIDAD_Z-HUB.md` continúa siendo la bitácora maestra general; la sección de identidad antigua que decía 1.1.79 queda expresamente declarada como legado histórico y no como estado actual.
- No se modificó código funcional ni `PANEL_VERSION`.
- Commit de esta limpieza: `cbac1ee1155664993897bb343e854a492226962a`.

# Z-Hub — Bitácora maestra de continuidad

## 0. Fuente de verdad y reglas

**Fuente activa de la serie 1.2.x:** `docs/CONTINUIDAD_Z-HUB-v1.2.md`.

**Estado actual conocido:** Z-Hub 1.2.79 en `main`, según la bitácora v1.2. Antes de cualquier cambio hay que verificar nuevamente `main`, el despliegue real de `z2` y el estado desplegado de Web-Licence.

Esta bitácora maestra conserva contexto general e histórico. No debe interpretarse ningún dato antiguo de este archivo como estado actual si contradice la bitácora v1.2 o el código real de `main`.

### Reglas obligatorias

1. Identificar el propietario real del comportamiento y modificar solo lo necesario.
2. Crear respaldo antes de cambios críticos o delicados.
3. Ejecutar pruebas razonables y declarar exactamente qué se probó y qué queda pendiente.
4. Todo cambio funcional incrementa `frontend/src/modules/system-update/version.js` y actualiza el CHANGELOG correspondiente.
5. Actualizar la bitácora en la misma entrega.
6. Verificar código, versión y documentación en `main` antes de declarar una actualización publicada.
7. Nunca borrar la base de datos para corregir UI, subir secretos, ocultar errores de backend ni afirmar pruebas no realizadas.
8. Conservar datos reales y compatibilidad operacional.
9. Las nuevas entradas de la serie 1.2.x se agregan primero en `CONTINUIDAD_Z-HUB-v1.2.md`.
10. Un cambio solo documental no incrementa `PANEL_VERSION`.

---

## 1. Estado actual

La serie funcional activa del proyecto es **1.2.x**. La última versión documentada en `main` es **1.2.79**.

La arquitectura de licenciamiento fue separada: el servidor central y License Center viven en `ronbercito/web-licence`; Z-Hub conserva el cliente remoto, cache/JWT, activación, validación y enforcement necesarios para comunicarse con ese servicio.

La versión de producción de `z2` no debe asumirse igual a `main`: la bitácora v1.2 registra 1.2.77 como última versión confirmada manualmente en ese servidor.

---

## 2. Historial

El historial detallado y vigente de 1.2.x se mantiene exclusivamente en:

`docs/CONTINUIDAD_Z-HUB-v1.2.md`

Orden obligatorio: **más nuevo primero**.

La historia anterior a 1.2.x permanece como referencia histórica en este archivo y en sus informes originales. No utilizarla para determinar la versión funcional actual.

---

## 3. Documentación y backups

### Continuidad

- `docs/CONTINUIDAD_Z-HUB.md` → contexto maestro general e histórico.
- `docs/CONTINUIDAD_Z-HUB-v1.2.md` → fuente activa de continuidad para 1.2.x.

### Backups

- `docs/backups/README.md` → convención y reglas de uso de backups históricos.
- `docs/backups/` → puntos de restauración históricos y material legado.

Los backups antiguos no se consideran código vigente. El código vigente se determina desde Git y `main`.

---

## 4. Identidad histórica del proyecto

- Repositorio principal desde 1.1.12: `ronbercito/Z-Hub`.
- Repositorio legado: `ronbercito/mirkohub`.
- Rama de publicación: `main`.
- Nombre público desde 1.1.10: **Z-Hub**.
- Nombres/rutas heredadas como **MikroHub** se conservan solo por compatibilidad.
- Tipo: panel de operaciones para ISP.
- Frontend: React.
- Backend: FastAPI/Python.
- Persistencia: SQLAlchemy/base de datos configurada por el proyecto.
- Integraciones: MikroTik, OLT y Google Maps según módulo.
- Fuente de versión visible: `frontend/src/modules/system-update/version.js`.

> **Nota histórica:** versiones antiguas de este archivo indicaban 1.1.79 como versión actual. Ese dato ya no representa el estado del proyecto y se conserva únicamente como registro histórico.

---

## 5. Regla de arquitectura

Para localizar cualquier error seguir la cadena:

```text
Vista React
  ↓
llamada API
  ↓
router FastAPI
  ↓
modelo / base de datos / integración
  ↓
resultado
  ↓
build y despliegue
```

No corregir un problema de negocio en Layout si pertenece a Clientes, Red o Facturación. Antes de cambiar un archivo, identificar el dueño real del comportamiento. No hacer cambios globales a ciegas.

---

## 6. Estado funcional histórico

Los detalles de Facturación, Clientes/Servicios, Red/IP/NAP/ONU, Equipos/Recuperación, Inventario, Ajustes, Actualizaciones y Licenciamiento se mantienen en la continuidad v1.2 y en los informes específicos de cada versión.

Para evitar duplicidad y contradicciones, esta bitácora maestra no debe volver a copiar bloques extensos de implementación que ya tengan una fuente activa en `CONTINUIDAD_Z-HUB-v1.2.md`.

---

## 7. Regla para futuras sesiones

Antes de modificar Z-Hub:

1. Leer `docs/CONTINUIDAD_Z-HUB.md`.
2. Leer `docs/CONTINUIDAD_Z-HUB-v1.2.md` completa.
3. Revisar el estado real de `main`.
4. Revisar la versión realmente instalada en producción cuando el cambio afecte despliegue.
5. Identificar archivos propietarios del comportamiento.
6. Crear backup cuando el cambio sea crítico.
7. Implementar y probar.
8. Actualizar versión/CHANGELOG si es funcional.
9. Actualizar la continuidad en la misma entrega.
10. Verificar que código y documentación estén en `main`.

**Nunca asumir que la versión de `main` está instalada en producción.**

---

## 8. Estado de la limpieza documental

Revisión interna: **2026-09-11**.

Resultado:

- Backups históricos conservados.
- Convención de backups documentada.
- Serie 1.2.x reconocida con fuente activa única.
- Versión antigua 1.1.79 desambiguada como dato histórico.
- No se incrementó `PANEL_VERSION`.
- No se modificó lógica funcional.
