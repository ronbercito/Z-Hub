<!--
Archivo: README.md
Actualización: 2026-09-07 — incorpora enlaces de documentación para colaboradores y mantenimiento.
Función: punto de entrada del repositorio MikroHub y acceso a sus guías principales.
Recibe de: documentación versionada dentro del repositorio.
Entrega a: desarrolladores, Copilot y mantenedores rutas de lectura antes de modificar el sistema.
-->

# MikroHub

Panel de gestión para operación ISP: clientes, red, routers/OLT, IPv4, facturación, tickets, mensajería, tareas, ajustes y actualizaciones.

## 📚 Documentación

Para colaboradores y mantenimiento:

- **[Guía de Continuidad para Copilot](docs/CONTINUIDAD_PARA_COPILOT_2026-09-07.md)** — Arquitectura, módulos, método de corrección, pruebas, troubleshooting y checklist de despliegue.

Para instalación y uso:

- **[Guía de Instalación Debian](INSTALL_DEBIAN.md)** — Instalación y despliegue del panel.

## Regla de publicación

Todo cambio funcional debe incluir comentarios de actualización en los archivos modificados, una nueva versión en `frontend/src/modules/system-update/version.js` y un changelog visible desde el botón **Actualizaciones** del panel.
