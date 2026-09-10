# Z-Hub 1.2.56 — Corrección visual de ventanas de Ajustes

## Objetivo
Corregir los colores y detalles internos de las ventanas emergentes de Ajustes para que cada formulario respete de forma consistente el tema claro u oscuro del panel.

## Cambios
- Se mantiene el tamaño compacto y el comportamiento modal introducido en 1.2.55.
- Se agregan variables visuales locales para fondo, superficie, superficie secundaria, borde, texto, texto secundario y acento.
- En tema claro se eliminan fondos negros heredados de utilidades `slate` dentro de inputs, selects, textareas, tarjetas y tablas.
- En tema oscuro se unifica la paleta azul noche de superficies, controles, bordes y scrollbar.
- Inputs, selects, textareas y campos reciben foco visible coherente con Z-Hub.
- Se normalizan textos `slate`, acentos cyan/verde/ámbar/rojo y estados dentro del modal.
- El selector de archivos recibe botón y texto compatibles con tema claro.
- Los cambios son exclusivamente visuales y están limitados a `.settings-modal-panel`.

## Backup
- Rama: `backup/pre-settings-modal-theme-1.2.55-20260910`
- HEAD protegido: `9503089f760616983748499ba406babc477c79bc`

## Archivos
- `frontend/src/modules/ajustes/settings-modal.css`
- `frontend/src/modules/system-update/version.js`
- `backend/tests/test_settings_modal_contract.py`

## Compatibilidad
No se modifican API, MariaDB, clientes, MikroTik, OLT, facturación, inventario, recuperación ni valores de configuración. El cierre exterior, Escape y cierre posterior a guardado de 1.2.55 se conservan.

## Validación
El contrato de modal ahora verifica explícitamente tema claro, tema oscuro, variables de superficie, inputs, selects, textareas y selector de archivos. GitHub Actions debe confirmar pytest y build React sobre el HEAD final.

## Prueba pendiente en producción
Actualizar a 1.2.56 y revisar visualmente General, Configuración clientes, Gestión personal y Servidor de correo tanto en tema claro como en oscuro.