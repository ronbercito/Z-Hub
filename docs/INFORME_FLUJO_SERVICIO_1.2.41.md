# Z-Hub 1.2.41 — Flujo guiado de Nuevo servicio

## Objetivo
Rediseñar la ventana **Nuevo servicio** para que el alta técnica sea secuencial, clara y consistente con los temas oscuro y Z-Hub Claro.

## Orden solicitado
1. Router.
2. Tecnología.
3. Plan de internet.
4. Tipo de conexión, con **IP estática** como valor predeterminado.
5. Datos de acceso.
6. Zona y configuración técnica.

## Comportamiento
- Solo Router está habilitado al iniciar un servicio nuevo.
- Al seleccionar Router se habilita Tecnología.
- Al seleccionar Tecnología se habilita Plan de internet y se mantiene el filtro de planes por tecnología de 1.2.40.
- Al seleccionar Plan se habilita Tipo de conexión.
- IP estática queda seleccionada por defecto; puede cambiarse a PPPoE o DHCP.
- Los datos de acceso se habilitan en cadena según el tipo de conexión.
- Zona queda bloqueada hasta completar los datos de acceso obligatorios.
- En Fibra: Caja NAP → Puerto NAP → Serie ONU/Potencia opcionales.
- En Inalámbrico: Equipo de acceso → datos opcionales de antena/IP de administración.
- Guardar permanece deshabilitado mientras falten requisitos obligatorios.

## Nomenclatura
En esta ventana se muestra **Router** en lugar de **MikroTik**, sin cambiar el tipo de dispositivo ni la integración RouterOS del backend.

## Interfaz
Se incorpora un diseño de pasos con tarjetas, guía visual y estados bloqueados. El tema oscuro usa una paleta azul marino/cian; `zhub-light` usa superficies blancas y azules claras mediante reglas dedicadas en `client-service-wizard.css`.

## Archivos
- `frontend/src/modules/clientes/editor/ClientServiceEditor.jsx`
- `frontend/src/modules/clientes/editor/client-service-wizard.css` (nuevo)
- `frontend/src/modules/system-update/version.js`
- `backend/tests/test_maintenance_contracts.py`

## Backup
- Rama: `backup/pre-service-wizard-1.2.40-20260910`
- HEAD previo: `b00b6dd04e6343f9f9eaf74ec688304ebc3d183e`
- Documento: `docs/backups/1.2.40/SERVICE_WIZARD_BACKUP.md`

## Seguridad de datos
No se cambia el esquema de MariaDB, no se borran clientes, facturas, IP, NAP, ONU, routers ni configuraciones de red. La modificación está limitada al flujo de interfaz y validaciones previas al envío.

## Validación
Se añadieron contratos estáticos para comprobar el orden, el valor predeterminado IP Estática, los bloqueos progresivos, el filtro por tecnología, el botón Guardar condicionado y la existencia de estilos específicos para Z-Hub Claro. La compilación final debe validarse con GitHub Actions y la prueba visual definitiva corresponde al servidor real.
