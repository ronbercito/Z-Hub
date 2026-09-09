# CONTINUIDAD Z-HUB 12

Fecha: 2026-09-09
Versión: 1.1.93

## Incidente
Después de actualizar a 1.1.92, las cuatro métricas de Gestión de Red ya mostraban sus colores en Claro Suave, pero el resto de la vista de Gestión de Red aparecía oscuro, como si estuviera heredando el template del tema oscuro.

## Diagnóstico
La hoja `frontend/src/modules/appearance/panel-theme.css` que quedó en `main` estaba recortada: conservaba la capa base de Claro Suave y la excepción de las cuatro métricas, pero había perdido gran parte de las reglas específicas que habían construido progresivamente la apariencia clara de Gestión de Red, OLT, clientes, facturación, ajustes y otros módulos.

La versión completa anterior estaba disponible en el commit `d95b094ab259da5fe0a57af6cf854aee2f21cc7f`, con blob histórico `b680b81b9b95ed8fcaf65d593690a009a76de89a`.

## Corrección aplicada
Se restauró `frontend/src/modules/appearance/panel-theme.css` a la versión completa del commit histórico, conservando las reglas existentes de color para:
- Clientes colas simples: azul.
- Clientes DHCP: violeta.
- Clientes PPPoE: turquesa.
- Clientes suspendidos: ámbar.

Esto recupera las reglas específicas del tema Claro Suave para la vista completa de Gestión de Red y evita que el contenido restante aparezca con superficies oscuras.

No se modificó `Network.jsx` ni la lógica funcional de MikroTik/OLT en esta corrección.

## Commits
- `611b234c2de8ad9c1e7d3bcc6cc6960b4cd007f` — `fix: restore complete light theme styles and keep network metric colors`
- `93fa237dd487ab0b9c8ee8aab3f64ed7d81e23ec` — `release: bump Z-Hub to 1.1.93`

## Estado esperado
Al actualizar el panel a **1.1.93**:
1. Tema oscuro: permanece sin cambios.
2. Tema Claro Suave: recupera la apariencia clara completa de Gestión de Red.
3. Las cuatro métricas mantienen sus colores diferenciados.
4. Router cards, detalle, pestañas en vivo y áreas OLT vuelven a utilizar sus estilos claros específicos.
5. No se altera la funcionalidad ni los datos.

## Próximo paso
Actualizar el panel a 1.1.93 y revisar Gestión de Red en Claro Suave antes de realizar cualquier otra modificación visual.