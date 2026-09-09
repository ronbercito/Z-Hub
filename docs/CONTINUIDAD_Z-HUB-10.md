# CONTINUIDAD Z-HUB 10

## Fecha
2026-09-09

## Versión
**1.1.91**

## Incidencia
Durante la actualización a 1.1.90, el build de producción reportó:
`SyntaxError: /var/www/z-hub/frontend/src/App.js: Unexpected token (47:2)`

El error apuntaba a la declaración `const [theme, setTheme] = useState(() => getToastTheme());` dentro de `ThemedToaster`.

## Corrección
Se reestructuró `frontend/src/App.js` sin cambiar su funcionalidad:
- JSX de los estados de carga pasado a bloques multilínea.
- `useEffect` de comprobación de setup conservado.
- `ThemedToaster` conservado con sincronización del tema.
- `AuthProvider`, `MainApp` y `Toaster` conservados.
- Se mantiene la importación de `network-metrics.css` después de `panel-theme.css`.

La intención es eliminar la ambigüedad de parseo que estaba provocando el fallo de compilación y permitir que el instalador vuelva a construir el frontend.

## Archivos modificados
- `frontend/src/App.js`
- `frontend/src/modules/system-update/version.js`

## Commits
- `e29c091f886d4b43957f05d2937be0212d7cb6d1` — reparación de App.js.
- `2929a9035babbe497e2529593dad29bd66aa9c15` — versión 1.1.91.

## Estado
El commit más reciente de `main` debe ser **1.1.91**. El siguiente paso es ejecutar nuevamente la actualización desde el panel y confirmar que `yarn build` complete sin el SyntaxError de `App.js`.
