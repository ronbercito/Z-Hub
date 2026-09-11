/* Z-Hub License Center — generador comercial de claves 192-bit.
 * 24 bytes CSPRNG => 48 caracteres hexadecimales.
 * Formato: ZHUB-AAAA-<48 HEX>. La PK de SQLite mantiene unicidad al guardar.
 */
function generateLicenseKey192() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const random = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `ZHUB-${new Date().getFullYear()}-${random}`;
}

async function requestLicenseKey() {
  return generateLicenseKey192();
}
