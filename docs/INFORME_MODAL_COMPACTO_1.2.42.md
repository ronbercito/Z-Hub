# Z-Hub 1.2.42 — Modal compacto de Nuevo servicio

## Objetivo
Ajustar **Nuevo servicio** al diseño compacto aprobado por el usuario, evitando que el formulario ocupe prácticamente toda la pantalla.

## Interfaz
- Ventana emergente centrada y de tamaño contenido.
- Dos columnas: **Internet y Router** / **Instalación y datos técnicos**.
- Se eliminan `Flujo de configuración`, `Control automático`, subtítulos explicativos y ayudas redundantes.
- Se conserva una guía superior compacta de pasos.
- El contenido interno puede desplazarse si la altura disponible es menor, sin convertir el modal en una pantalla completa.
- Compatible con tema oscuro y Z-Hub Claro.

## Orden y lógica conservada
Router → Tecnología → Plan de internet → Tipo de conexión → Datos de acceso → Zona y datos técnicos.

Los campos siguen habilitándose progresivamente. IP estática continúa como conexión predeterminada. El filtro de planes por tecnología se mantiene.

## Backup
Rama: `backup/pre-compact-service-modal-1.2.41-20260910`

HEAD respaldado: `091e1ac9c645c4ee88fbceb91e7d456c73250095`

## Datos
No se modifica el esquema de MariaDB ni se borran clientes, servicios, facturas, IP, NAP, ONU o configuración de RouterOS.

## Archivos principales
- `frontend/src/modules/clientes/editor/ClientServiceEditor.jsx`
- `frontend/src/modules/clientes/editor/client-service-compact.css`
- `frontend/src/modules/system-update/version.js`

## Validación pendiente
GitHub Actions debe confirmar build React y contratos del repositorio. La comprobación visual final corresponde al servidor real después de actualizar a 1.2.42.
