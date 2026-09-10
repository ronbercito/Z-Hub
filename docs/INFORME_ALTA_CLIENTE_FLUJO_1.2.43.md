# Z-Hub 1.2.43 — Flujo progresivo en alta de clientes

## Objetivo
Aplicar al paso **Servicio** del alta de un abonado nuevo el mismo criterio de orden y habilitación progresiva usado en **Nuevo servicio**, manteniendo el formulario compacto y evitando selecciones incompatibles.

## Orden técnico
1. Router.
2. Tecnología.
3. Plan de internet.
4. Tipo de conexión, con **IP estática** como valor predeterminado.
5. Red/pool y datos de acceso.
6. Zona y configuración técnica.

## Comportamiento
- Router es el primer selector técnico.
- Tecnología queda bloqueada hasta elegir Router.
- Plan queda bloqueado hasta elegir Tecnología y solo muestra planes activos compatibles.
- Tipo de conexión se habilita después del Plan y parte en IP estática para altas nuevas.
- Red/pool y credenciales o IP se habilitan de forma secuencial.
- Zona se habilita al completar los datos de acceso obligatorios.
- Fibra continúa con Caja NAP → Puerto NAP → Serie ONU/Potencia opcionales.
- Inalámbrico continúa con Equipo de acceso → Antena/IP de administración opcionales.
- `Registrar usuario` permanece deshabilitado mientras el servicio técnico no esté completo.
- Al cambiar Router, Tecnología, Plan, conexión, red o zona se limpian los datos dependientes para evitar combinaciones antiguas.

## Interfaz
El paso Servicio conserva dos columnas compactas: **Internet y Router** e **Instalación y datos técnicos**. Se añade un estilo local para tema oscuro y `zhub-light`, sin tocar el tema global del panel.

## Nomenclatura
La interfaz de alta usa **Router** en lugar de **MikroTik**. La integración interna continúa trabajando con equipos `device_type=mikrotik` y RouterOS sin cambios de backend.

## Archivos
- `frontend/src/modules/clientes/usuarios/ClientRegistrationWizard.jsx`
- `frontend/src/modules/clientes/usuarios/client-registration-service.css` (nuevo)
- `backend/tests/test_maintenance_contracts.py`
- `frontend/src/modules/system-update/version.js`

## Backup
- Rama: `backup/pre-new-client-service-flow-1.2.42-20260910`
- HEAD previo: `19752b1fdc481dc71e9a52efe92d5c3aa78a2e28`

## Compatibilidad y datos
No se modifica el esquema de MariaDB, endpoints de Clientes, aprovisionamiento RouterOS, facturación ni datos existentes. El cambio se limita al flujo de interfaz, validaciones previas y valores iniciales del alta.

## Validación
Se añadió una regresión estática para comprobar IP estática por defecto, orden Router/Tecnología/Plan/Conexión, bloqueos progresivos, filtro de planes, nomenclatura Router, bloqueo del botón final y estilos para Z-Hub Claro. La compilación React y los contratos deben quedar validados por GitHub Actions. La prueba visual y el alta real contra MariaDB/MikroTik corresponden al servidor de producción.
