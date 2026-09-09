<!--
Archivo: README.md
Actualización: 2026-09-08 — establece README y bitácora maestra como lectura obligatoria de continuidad.
Función: punto de entrada del repositorio MikroHub y acceso a sus guías principales.
Recibe de: documentación versionada dentro del repositorio.
Entrega a: desarrolladores, Copilot y mantenedores rutas de lectura antes de modificar el sistema.
-->

# Z-Hub

Panel de gestión para operación ISP: clientes, red, routers/OLT, IPv4, facturación, tickets, mensajería, tareas, ajustes y actualizaciones.

## 📚 Documentación

### 🔴 Lectura obligatoria para retomar el proyecto

Antes de realizar cualquier modificación en Z-Hub, una nueva sesión de ChatGPT/Copilot o cualquier colaborador debe revisar el README y la única bitácora de continuidad:

1. **[README.md](README.md)** — Entrada general del proyecto, reglas de publicación y documentación principal.
2. **[Bitácora maestra de continuidad](docs/CONTINUIDAD_Z-HUB.md)** — **Único archivo de continuidad del repositorio.** Historial interno, versiones, decisiones, pruebas y pendientes. Cada actualización debe agregarse allí; no se deben crear documentos complementarios de continuidad.

**Orden recomendado:** README → Bitácora maestra → archivo/módulo específico que se vaya a modificar.

### Documentación técnica


### Instalación y despliegue

- **[Guía de Instalación Debian](INSTALL_DEBIAN.md)** — Instalación y despliegue del panel.

## 🔐 Documentación interna de continuidad

`docs/CONTINUIDAD_Z-HUB.md` y sus registros de continuidad fechados son documentación interna del proyecto. **No forman parte de la interfaz ni de la lógica del panel.**

No deben:

- importarse desde React;
- importarse desde FastAPI;
- copiarse al directorio público del panel;
- incluirse en el build frontend;
- utilizarse como fuente de datos del panel;
- contener contraseñas, tokens, claves privadas, `.env` ni secretos reales.

La documentación existe únicamente para conservar el contexto técnico y facilitar futuras revisiones o nuevas sesiones de desarrollo.

## 📝 Regla de continuidad y publicación

Todo cambio funcional debe:

1. Modificar el módulo/archivo responsable del comportamiento.
2. Incluir comentarios de actualización en los archivos modificados.
3. Registrar el cambio únicamente en `docs/CONTINUIDAD_Z-HUB.md`; no crear archivos complementarios, fechados ni por versión.
4. Indicar en la bitácora la versión del panel afectada.
5. Actualizar `frontend/src/modules/system-update/version.js` y su `CHANGELOG` cuando el cambio sea funcional para el panel.
6. Registrar archivos modificados, origen/destino de los datos, pruebas realizadas y pendientes.
7. Publicar la documentación junto con el cambio funcional cuando sea posible.
8. Verificar el estado real de `main` y el despliegue antes de considerar terminada la entrega.

Los cambios exclusivamente documentales **no deben incrementar `PANEL_VERSION`**, salvo que también modifiquen el funcionamiento del panel.
