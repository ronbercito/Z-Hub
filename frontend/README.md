# Frontend Z-Hub

Interfaz React del panel ISP Z-Hub. El frontend consume la API FastAPI bajo `/api` y se compila con CRACO.

## Estructura principal

- `src/components/layout/`: Sidebar, Navbar y Layout.
- `src/context/AuthContext.js`: sesión y URL de API.
- `src/modules/clientes/`: abonados, instalaciones, mapa y recuperación de equipos.
- `src/modules/red/`: MikroTik, OLT, IPv4, NAP y monitoreo.
- `src/modules/facturacion/`: facturación y pagos.
- `src/modules/ajustes/`: configuración, personal y permisos.
- `src/modules/system-update/`: versión visible y Centro de Actualización.

## Desarrollo

```bash
yarn install
yarn start
```

`REACT_APP_BACKEND_URL` puede apuntar al backend de desarrollo. En el despliegue oficial se deja vacío para utilizar el mismo origen de Nginx (`/api`).

## Build de producción

```bash
yarn install --network-timeout 100000
env DISABLE_ESLINT_PLUGIN=true CI= yarn build
```

El instalador oficial publica el contenido de `build/` en `/var/www/z-hub/web`.

## Autenticación

Desde 1.2.37 la sesión persistente utiliza la cookie `access_token` httpOnly. El token devuelto por login se conserva solo en memoria por compatibilidad con componentes existentes; no debe volver a almacenarse en `localStorage`.

## Reglas del proyecto

- No introducir lógica global en `Layout.jsx` cuando corresponde al módulo dueño del comportamiento.
- Los submenús deben respetar `staff/permissions.js`.
- Toda llamada que pueda sobrevivir a una recarga debe funcionar con la cookie httpOnly.
- Los cambios funcionales requieren incremento de `PANEL_VERSION` y actualización de la bitácora activa.
- Antes de modificar flujos críticos, crear backup recuperable.

La continuidad vigente de la serie actual está documentada en `../docs/CONTINUIDAD_Z-HUB-v1.2.md`.
