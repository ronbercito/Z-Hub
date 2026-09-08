/**
 * Archivo: frontend/src/modules/context/AuthContext.js
 * Actualización: 2026-09-08 — puente de compatibilidad para el módulo aislado de Facturación.
 * Función: reexportar el contexto transversal desde la ruta relativa esperada por el módulo extraído.
 * Recibe de: frontend/src/context/AuthContext.js.
 * Entrega a: módulos bajo frontend/src/modules que necesiten useAuth/AuthProvider mediante esta ruta.
 * Nota: es un puente temporal de compatibilidad; no contiene lógica propia de autenticación.
 */
export { AuthProvider, useAuth } from "../../context/AuthContext";
