# Z-Hub — Continuidad: Recordar mi cuenta en Login

**Fecha:** 2026-09-09  
**Versión funcional:** 1.1.82  
**Repositorio:** `ronbercito/Z-Hub`  
**Rama:** `main`

## Objetivo

Agregar al formulario de inicio de sesión una opción voluntaria para que el operador pueda recordar su cuenta y no tenga que volver a escribir el correo en el siguiente acceso.

## Comportamiento implementado

En:

```text
frontend/src/modules/auth/Login.jsx
```

se agregó la casilla:

```text
Recordar mi cuenta
```

La opción es voluntaria y aparece debajo del campo de contraseña.

### Si está activada

Después de un inicio de sesión exitoso se guardan localmente:

```text
zhub_remember_account=true
zhub_remembered_email=<correo>
```

En el siguiente acceso, el correo se precarga automáticamente.

### Si está desactivada

No se conserva la cuenta recordada. Las claves utilizadas por esta función se eliminan después del inicio de sesión exitoso.

## Seguridad

**La contraseña NO se guarda.**

Esta funcionalidad solamente recuerda el identificador de la cuenta (correo electrónico). No cambia el mecanismo existente de autenticación ni crea credenciales automáticas.

El token JWT existente continúa administrándose mediante:

```text
fibraz_token
```

en:

```text
frontend/src/context/AuthContext.js
```

No se modificó el flujo JWT para implementar esta preferencia.

## Archivos involucrados

### Cambio funcional

```text
frontend/src/modules/auth/Login.jsx
```

Responsable de:
- mostrar la casilla;
- cargar el correo recordado;
- mantener el estado del checkbox;
- guardar/eliminar la preferencia después del login.

### Compatibilidad revisada

```text
frontend/src/context/AuthContext.js
```

Se verificó para mantener intacto el flujo de autenticación y almacenamiento del token.

## Commit funcional

```text
51d1318b5cc4b0a7adb2df5303aee8e2fbdc1eb6
```

Mensaje:

```text
feat: add optional remember account on login
```

## Pruebas / validación

Se revisó el flujo de `Login.jsx` y la interacción con `AuthContext.js` para asegurar que:

1. La cuenta se pueda recordar de forma opcional.
2. El correo se precargue cuando existe la preferencia.
3. La contraseña no se almacene por esta funcionalidad.
4. El token JWT existente continúe funcionando sin cambios.
5. Desactivar la opción elimine las claves de recuerdo.

### Pendiente de validación en instalación real

Realizar una prueba visual en navegador:

1. Entrar al login.
2. Escribir correo y contraseña.
3. Activar `Recordar mi cuenta`.
4. Iniciar sesión.
5. Cerrar sesión.
6. Volver al login y comprobar que el correo aparezca precargado.
7. Desactivar la casilla y volver a iniciar sesión.
8. Comprobar que el correo ya no quede recordado.

## Reglas para futuras modificaciones

- No guardar la contraseña para implementar esta función.
- No cambiar `fibraz_token` sin revisar primero todo el flujo de autenticación.
- Mantener la casilla como una preferencia opcional.
- Si se cambia el comportamiento de esta función, actualizar este documento y la bitácora maestra `docs/CONTINUIDAD_Z-HUB.md`.
- Los cambios funcionales deben actualizar `PANEL_VERSION` y `CHANGELOG` según las reglas del proyecto.
