/**
 * Archivo: frontend/src/modules/clientes/usuarios/Users.jsx
 * Función: Entrada del submódulo Usuarios dentro de Clientes.
 * Trabaja con: Clients.jsx y SuspensionRecoveryAlerts.jsx.
 */
import React from "react";
import Clients from "../Clients";
import SuspensionRecoveryAlerts from "./SuspensionRecoveryAlerts";

export default function Users() {
  return <>
    <SuspensionRecoveryAlerts />
    <Clients />
  </>;
}
