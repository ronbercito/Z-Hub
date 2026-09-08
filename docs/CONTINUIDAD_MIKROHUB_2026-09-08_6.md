# Continuidad MikroHub — 2026-09-08 — Potencia óptica y semáforo visual

## Cambio
Se implementó una corrección funcional para la potencia óptica de fibra en la creación/edición de servicios adicionales.

## Solicitud
- Permitir que el operador escriba `14` o `-14`.
- Guardar y mostrar siempre `-14 dBm`.
- Aplicar semáforo visual por umbral:
  - `-28 dBm` o menor: rojo/crítico.
  - `-25` a `-27 dBm`: amarillo/naranja/advertencia.
  - mejor que `-25 dBm`: verde/normal.

## Causa y decisión técnica
El modelo `ClientService` ya dispone del campo `optical_power_dbm`. Se mantiene la normalización en backend mediante el validador para garantizar que los datos persistidos sean negativos aunque una petición externa envíe un valor positivo. El frontend también normaliza el valor al escribir para que el operador vea inmediatamente el signo `-`.

## Archivos afectados
- `backend/app/models/client_service.py`
  - Normaliza `optical_power_dbm` con `-abs(valor)`.
- `frontend/src/modules/clientes/editor/ClientServiceEditor.jsx`
  - Normalización inmediata del campo.
  - Coloreado del campo mientras se edita.
  - Coloreado de la columna Señal ONU según umbrales.
- `frontend/src/modules/system-update/version.js`
  - Versión `1.0.69` y changelog funcional.

## Publicación
- Versión: **1.0.69**.
- Commit de semáforo visual: `7cd5205a10adb938ae208f9f4f2d3e149692c610`.
- El cambio quedó publicado en `main`.

## Verificación prevista en producción
1. Actualizar desde Centro de Actualizaciones a 1.0.69.
2. Crear servicio de fibra e introducir `14`; debe mostrarse `-14` y guardarse como `-14 dBm`.
3. Probar `-24`, `-25`, `-27`, `-28` y `-30`.
4. Confirmar verde para `-24`, amarillo/naranja para `-25` a `-27`, y rojo para `-28` o menor.
5. Editar un servicio existente y confirmar que el valor negativo se conserva.

## Política aplicada
Ante una modificación funcional se revisó primero el código existente y se mantuvo el flujo actual de creación/edición de servicios, modificando únicamente la normalización y presentación de potencia óptica. No se alteraron datos existentes ni se creó una migración destructiva.
