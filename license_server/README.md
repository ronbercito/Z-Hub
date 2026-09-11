# Z-Hub License Server — Etapa 6/7

Servicio privado para centralizar el licenciamiento de instalaciones Z-Hub Self-Hosted sin mover la operación del ISP al VPS.

## Qué valida

- clave de licencia;
- estado comercial;
- plan y `max_clients`;
- instalación autorizada (`installation_id`);
- historial de validaciones.

El VPS no recibe tráfico MikroTik/OLT ni datos operativos del ISP. Solo responde consultas de licencia.

## Continuidad ante caída del VPS

Cada validación correcta devuelve una autorización JWT RS256 firmada. La instalación local guarda esa autorización y puede continuar usándola hasta su `grace_until`. El valor por defecto es 72 horas (`ZHUB_LICENSE_GRACE_HOURS`). Un rechazo explícito del servidor no usa una autorización antigua.

Durante la migración inicial, si el License Server está configurado pero todavía no existe una autorización firmada válida, Z-Hub conserva el registro local como transición. El archivo local se retirará del uso productivo solo después de validar el servicio remoto, tal como exige el plan de Etapa 6.

## VPS — instalación base

1. Crear un usuario de sistema `zhub-license`.
2. Copiar `license_server/` a `/opt/zhub-license-server`.
3. Crear un entorno virtual e instalar `requirements.txt`.
4. Crear `/etc/zhub-license-server/server.env` desde `env.example` y sustituir el token administrativo por uno aleatorio largo.
5. Ejecutar `scripts/generate_keys.sh /etc/zhub-license-server`.
6. Instalar `deploy/zhub-license-server.service` en systemd.
7. Configurar Nginx usando `deploy/nginx.conf.example`, reemplazando `license.example.com` por el dominio real y habilitando certificado HTTPS válido.
8. Copiar únicamente `public.pem` a cada servidor Z-Hub como `/etc/zhub/licencia/server-public.pem`.
9. En la instalación Z-Hub configurar `ZHUB_LICENSE_SERVER_URL=https://<dominio>`.

## API

### Salud

`GET /health`

### Validación desde Z-Hub

`POST /v1/licenses/validate`

Cuerpo:

```json
{
  "license_key": "ZHUB-...",
  "installation_id": "uuid-de-la-instalacion"
}
```

Respuesta válida:

```json
{
  "valid": true,
  "authorization": "<JWT-RS256>",
  "grace_until": "<fecha ISO>"
}
```

### Administración temporal previa a Etapa 7

Los endpoints `/admin/*` requieren `Authorization: Bearer <ZHUB_LICENSE_ADMIN_TOKEN>`.

- `PUT /admin/licenses/{license_key}` crea o actualiza una licencia.
- `PUT /admin/licenses/{license_key}/installations/{installation_id}` autoriza/suspende una instalación.
- `GET /admin/validations` devuelve historial reciente.

Estos endpoints son operativos para Etapa 6. La interfaz gráfica para administrarlos corresponde a la Etapa 7 — Z-Hub License Center.

## Regla de seguridad

La clave privada `private.pem` nunca debe copiarse a instalaciones Z-Hub ni almacenarse en GitHub. Solo el VPS la utiliza para firmar autorizaciones. Las instalaciones reciben exclusivamente la clave pública.
