# Auto-TRIAL / Portal de cliente — Etapa 1/7 — Baseline Z-Hub

Fecha: 2026-09-11

## Objetivo

Preparar el cambio desde activación manual por clave hacia activación automática durante el wizard, coordinada con Web-Licence y vinculada a una huella estable del servidor.

## Estado real de partida

- Rama productiva revisada: `main`.
- Commit de partida: `6edad45d99744d2ab7b819cc86f6e24960835e1a`.
- Versión actual de Z-Hub: `1.2.98`.
- Backup previo creado: `backup/pre-auto-trial-portal-20260911`.
- Rama de trabajo: `work/auto-trial-customer-flow-20260911`.

## Comportamiento actual confirmado

1. El wizard exige que el usuario escriba una clave de licencia.
2. `POST /api/setup/license` recibe `license_key` y valida esa clave antes de crear el administrador.
3. `POST /api/setup/complete` vuelve a exigir la misma clave para finalizar la configuración.
4. El identificador de instalación actual se genera con `uuid.uuid4()` y se persiste como `license_installation_id`.
5. El cliente remoto consulta `POST /v1/licenses/validate` enviando únicamente `license_key` + `installation_id`.
6. La validación remota usa JWT RS256 y caché firmada para continuidad temporal.
7. `Ajustes -> Licencia` todavía permite que el administrador pegue manualmente otra licencia mediante `POST /api/license/activate`.
8. El panel ya muestra Trial, capacidad, expiración, Installation ID, estado del License Server y acciones comerciales por WhatsApp/pago.

## Cambios arquitectónicos aprobados para las siguientes etapas

- El cliente no deberá pegar una licencia durante una instalación normal nueva.
- El wizard obtendrá una huella de hardware estable y pedirá a Web-Licence crear o recuperar el TRIAL correspondiente.
- Web-Licence decidirá si esa huella puede recibir un primer TRIAL o si debe reutilizar un registro existente.
- La licencia devuelta seguirá usando autorización firmada RS256; no se elimina el contrato seguro existente.
- La MAC no será el único identificador. La huella se construirá a partir de datos estables disponibles en el host y se enviará/guardará como hash.
- Reinstalar Z-Hub sobre el mismo hardware no debe producir otro TRIAL.
- El flujo manual de clave dejará de ser la experiencia principal del cliente y quedará únicamente como mecanismo controlado de compatibilidad/recuperación mientras se migra.
- El ZHI de Web-Licence NO se reutiliza para este flujo. ZHI continúa siendo exclusivo para autorizar instalaciones de Web-Licence.

## Contrato que debe conservarse

- HTTPS sin bypass de validación TLS.
- JWT RS256.
- Rechazo remoto explícito nunca se sustituye con caché antigua.
- Los datos locales no se eliminan cuando una licencia vence o se bloquea.
- La capacidad comercial y los permisos de usuarios siguen siendo conceptos independientes.

## Pendientes para Etapa 2/7

La siguiente etapa corresponde a Web-Licence: crear la base de registro público de cliente/empresa y el contrato de alta automática del primer TRIAL, sin alterar todavía el wizard productivo de Z-Hub.
