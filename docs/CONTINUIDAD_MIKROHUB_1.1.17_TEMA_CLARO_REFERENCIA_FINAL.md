<!--
Archivo: docs/CONTINUIDAD_MIKROHUB_1.1.17_TEMA_CLARO_REFERENCIA_FINAL.md
Actualización: 2026-09-09 — versión 1.1.17.
Función: continuidad del ajuste final del template visual zhub-light.
-->

# Z-Hub — Continuidad 1.1.17 — Tema claro según referencia final

## Tipo
Corrección visual / ajuste fino del template claro.

## Causa
La versión 1.1.16 seguía sin coincidir suficientemente con la referencia proporcionada: el fondo, contraste, líneas, sombras, saturación de los KPI y tono general continuaban percibiéndose demasiado luminosos.

## Objetivo aprobado
Reproducir la referencia visual con:
- fondo gris muy claro y neutro;
- superficies blancas sólidas;
- azul tinta oscuro y definido para textos;
- bordes y divisores finos en gris azulado;
- sombras neutras muy cortas y discretas;
- KPI con colores sólidos moderados;
- navegación seleccionada en azul claro sobrio;
- cero glow, neón, gradientes decorativos o filtros luminosos.

## Solución
Se reemplazó la capa de overrides de `zhub-light` en `frontend/src/modules/appearance/panel-theme.css` por una paleta más controlada y coherente con la referencia. Se mantuvo la separación entre tema claro y oscuro mediante el selector `html[data-panel-theme="zhub-light"]`.

No se modificó deliberadamente la lógica funcional, API, base de datos, autenticación, facturación, red o servicios.

## Archivos modificados
- `frontend/src/modules/appearance/panel-theme.css`
- `frontend/src/modules/system-update/version.js`
- `docs/CONTINUIDAD_MIKROHUB_1.1.17_TEMA_CLARO_REFERENCIA_FINAL.md`

## Flujo visual
```text
Selector de tema
  ↓
zhub-light
  ↓
panel-theme.css
  ↓
fondo gris claro + superficies blancas
  ↓
azul tinta + líneas sobrias + sombras neutras
  ↓
KPI sólidos moderados
  ↓
sin glow / sin neón / sin gradientes
```

## Backup
Se mantiene el backup previo documentado en continuidades anteriores: `backup/pre-zhub-light-solid-2026-09-09`.

## Validación
- [x] Referencia visual revisada.
- [x] Propietario visual revisado.
- [x] Paleta y saturación corregidas.
- [x] Gradientes eliminados del override.
- [x] Glow/filtros eliminados.
- [x] Sombras normalizadas.
- [x] Versión 1.1.17 registrada.
- [ ] Build React real.
- [ ] Prueba visual real en navegador/servidor.
- [ ] Comprobación final del tema oscuro.

## Resultado
El nuevo template `zhub-light` queda publicado en `main` como versión 1.1.17, orientado específicamente a la referencia visual proporcionada y no a un blanco puro/luminoso genérico.

## Pendientes
La confirmación final debe hacerse sobre el panel compilado/desplegado. Si un componente concreto conserva estilos inline o clases no cubiertas por el override, deberá corregirse en su propietario sin alterar el tema oscuro.
