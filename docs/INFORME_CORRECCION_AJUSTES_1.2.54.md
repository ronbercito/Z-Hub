# Z-Hub 1.2.54 — Corrección real de acceso al tablero de Ajustes

## Causa
La versión 1.2.53 sí incorporó `SettingsHome` y lo conectó en `Layout.jsx`, pero el menú lateral `Ajustes` seguía definido como grupo con todos los submenús. Al pulsarlo, `Sidebar.jsx` seleccionaba automáticamente el primer hijo (`settings_general`), por lo que el usuario seguía viendo la pantalla General y la lista larga lateral.

## Corrección
- `Ajustes` deja de desplegar la lista larga de subopciones en el sidebar.
- Pulsar `Ajustes` ahora selecciona directamente `activeTab="ajustes"`.
- `Layout.jsx` ya resuelve `ajustes` hacia `SettingsHome`, por lo que se muestra la portada visual aprobada.
- Las tarjetas del tablero conservan el acceso a las mismas secciones existentes.
- Cuando se abre una sección `settings_*`, el botón principal `Ajustes` permanece resaltado.
- Se conserva Configuración clientes como módulo independiente.

## Compatibilidad
No se elimina ninguna pantalla, configuración ni dato. Solo se corrige la navegación que impedía ver la portada visual.

## Backup
- Rama: `backup/pre-settings-home-fix-1.2.53-20260910`
- HEAD protegido: `c3c27a7b376f90d670ea9eb07e171f8ec1ce065d`

## Calidad
Se añade `backend/tests/test_settings_home_navigation.py` y se incorpora al workflow de calidad para comprobar que el acceso principal de Ajustes no vuelva a reconstruir el submenú largo y que `Layout` continúe mostrando `SettingsHome`.

## Prueba pendiente en producción
Actualizar a 1.2.54, pulsar Ajustes y confirmar visualmente que aparece el tablero de tarjetas y que ya no se despliega el listado largo en el menú lateral.
