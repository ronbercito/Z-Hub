# Continuidad MikroHub / Z-Hub — versión 1.1.21

## Fecha
2026-09-09

## Causa
La referencia visual del menú lateral claro muestra una tipografía más oscura y gruesa que la versión instalada. El usuario solicitó que las letras sean negras/negritas y que al pasar el mouse aumenten claramente de grosor.

## Solución
Se reforzó la tipografía del menú lateral únicamente para el template `zhub-light` mediante `panel-theme.css`. Las opciones normales usan peso 700, las opciones activas peso 900 y el estado hover también usa peso 900. El texto usa azul tinta oscuro sólido, sin gris tenue ni efectos luminosos.

Se ajustó `Sidebar.jsx` para que la navegación mantenga `font-bold`/`font-black` en su estructura y el tema claro controle el color y el peso final. No se modificaron rutas, permisos ni lógica de apertura/cierre.

## Archivos modificados
- `frontend/src/components/layout/Sidebar.jsx`
- `frontend/src/modules/appearance/panel-theme.css`
- `frontend/src/modules/system-update/version.js`

## Flujo esperado
1. El usuario activa `Z-Hub Claro`.
2. El texto del menú lateral aparece oscuro y en negrita.
3. La sección activa aparece más gruesa.
4. El submenú activo aparece más grueso.
5. Al pasar el mouse por una opción, el texto pasa a peso 900 y se oscurece ligeramente.
6. El tema oscuro conserva su comportamiento porque las reglas reforzadas de color están limitadas a `data-panel-theme="zhub-light"`.

## Versión
**1.1.21**

## Validación
No se ejecutó build ni prueba de navegador en este entorno. La implementación fue revisada sobre los componentes y selectores actuales del repositorio.

## Riesgo / pendiente
Validar visualmente en el panel desplegado que la fuente disponible del sistema represente correctamente los pesos 700 y 900 y que el hover sea perceptiblemente más grueso sin alterar el layout.
