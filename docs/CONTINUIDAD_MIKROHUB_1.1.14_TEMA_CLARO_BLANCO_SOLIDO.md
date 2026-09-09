<!--
ARCHIVO INTERNO DE CONTINUIDAD — NO ES PARTE DEL PANEL
Archivo: docs/CONTINUIDAD_MIKROHUB_1.1.14_TEMA_CLARO_BLANCO_SOLIDO.md
Actualización: 2026-09-09
Función: registrar el rediseño visual del template zhub-light.
-->

# Continuidad Z-Hub — 1.1.14 — Tema claro blanco sólido

## Tipo
Mejora visual / UX / tema claro.

## Objetivo
El template `zhub-light` seguía mostrando una apariencia demasiado luminosa y azulada. La referencia visual aprobada solicita un panel claro profesional: superficies blancas sólidas, texto de color sólido y claramente legible, acentos definidos y ausencia de glow/neón.

## Solución
Se renovó exclusivamente la capa visual de `zhub-light` en `frontend/src/modules/appearance/panel-theme.css`.

### Cambios visuales
- Fondo general claro y limpio.
- Header y sidebar en blanco sólido.
- Tarjetas y superficies principales en blanco sólido.
- Campos de formulario blancos con bordes azul-gris discretos.
- Texto principal en azul tinta oscuro para alto contraste.
- Textos secundarios en tonos azul/gris sólidos.
- Estados cian, azul, verde, violeta, rojo y ámbar con colores definidos y sin brillo.
- Gradientes decorativos desactivados en el tema claro.
- Sombras glow de Tailwind desactivadas para el tema claro.
- Focus accesible mediante contorno discreto, sin glow.
- El tema oscuro clásico no se modifica deliberadamente.

## Archivos modificados
- `frontend/src/modules/appearance/panel-theme.css` — propietario de la capa visual `zhub-light`.
- `frontend/src/modules/system-update/version.js` — versión 1.1.14 y CHANGELOG.
- `docs/CONTINUIDAD_MIKROHUB_1.1.14_TEMA_CLARO_BLANCO_SOLIDO.md` — continuidad complementaria.

## Persistencia / compatibilidad
Se conserva el identificador interno `zhub-light`, por lo que no se cambia la preferencia almacenada del usuario. No hay cambios de base de datos ni de API.

## Flujo
```text
Ajustes → Apariencia
        ↓
panel_theme = zhub-light
        ↓
applyPanelTheme()
        ↓
html[data-panel-theme="zhub-light"]
        ↓
panel-theme.css
        ↓
blanco sólido + texto sólido + colores sin glow
```

## Seguridad
- No se modifican credenciales.
- No se modifica la base de datos.
- No se modifican rutas funcionales.
- No se modifica el tema oscuro deliberadamente.

## Pruebas
- [x] Se revisó la implementación actual de `zhub-light` antes del cambio.
- [x] Se mantuvo el identificador `zhub-light`.
- [x] Se limitó el cambio al archivo visual del tema y versión/changelog.
- [ ] Build React de producción — no ejecutado desde este entorno.
- [ ] Validación visual real en navegador/servidor — pendiente.
- [ ] Revisión de módulos completos con el tema claro — pendiente.

## Resultado
El código de la versión **1.1.14** queda publicado en `main` con el nuevo enfoque visual aprobado: blanco limpio, textos sólidos y colores sin efectos luminosos.

## Riesgos / pendientes
1. Ejecutar build React antes de considerar la versión completamente validada.
2. Revisar visualmente Dashboard, Clientes, Facturación, Red, Ajustes y modales en `zhub-light`.
3. Si algún componente usa estilos inline o clases no cubiertas por la capa global, ajustarlo de forma puntual sin alterar el tema oscuro.

## Commits
- CSS del tema: `8933f9631b064ce78a552704f24bf0c4a21bcd0d`
- Versión 1.1.14: `79b39d124ab3ebfda9f306256f5fe445a5870cd3`
- Esta continuidad: commit generado al crear el archivo.

## Estado
**Publicado en `main`; pendiente únicamente la validación real de build y navegador.**
