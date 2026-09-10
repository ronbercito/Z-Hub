// Política visual del módulo Gestión personal. Los componentes solo consumen estas reglas.
export const roleDefaults = {
  tecnico: { dashboard:["view"], clients:["view"], plans:["view"], monitoring:["view"], tickets:["view"], tasks:["view"] },
  cobrador: { dashboard:["view"], clients:["view"], billing:["view"], messaging:["view"], tickets:["view"] },
};
export const permissionsByTab = {
  inicio:"dashboard", red:"network", routers:"router_menu", olts:"olt", red_ipv4:"network",
  nap_boxes:"network", monitoring:"monitoring", servicios:"plans", clientes:"clients",
  client_users:"clients", client_installations:"clients", client_recovery:"clients", client_zones:"clients", client_map:"clients", facturacion:"billing",
  hotspot:"hotspot", tareas:"tasks", almacen:"inventory", tickets:"tickets",
  mensajeria:"messaging", ajustes:"settings",
};
export function permissionsFor(user) {
  return Object.keys(user?.permissions || {}).length ? user.permissions : (roleDefaults[user?.role] || {});
}
export function isAdministrator(user) {
  return ["admin", "administrador", "administrator"].includes(String(user?.role || "").trim().toLowerCase());
}
export function canPermission(user, module, action = "view") {
  if (isAdministrator(user)) return true;
  const permissions = permissionsFor(user);
  return Boolean((permissions[module] || []).includes(action));
}
export function permissionModuleForTab(tab) {
  if (String(tab || "").startsWith("settings_")) return "settings";
  return permissionsByTab[tab];
}
export function canViewTab(user, tab) {
  const module = permissionModuleForTab(tab);
  return Boolean(module) && canPermission(user, module, "view");
}
