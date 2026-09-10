# Reportes de pruebas

Los archivos existentes en esta carpeta son **evidencia histórica de iteraciones anteriores**. No deben interpretarse como certificación automática de la versión actual de Z-Hub.

A partir de 1.2.37, todo reporte nuevo debe indicar como mínimo:

- versión `PANEL_VERSION` probada;
- commit Git exacto;
- fecha;
- entorno usado;
- pruebas ejecutadas y su resultado;
- pruebas omitidas o pendientes;
- si se utilizó MikroTik/OLT real, laboratorio o mock.

Los reportes antiguos que mencionan `admin@fibraz.pe / admin123` corresponden al entorno de pruebas previo al asistente de configuración actual y no representan credenciales predeterminadas de Z-Hub.

La validación automática actual se define en `.github/workflows/quality.yml`; las pruebas de integración con MariaDB/MikroTik/OLT siguen requiriendo un entorno apropiado.
