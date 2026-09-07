// Política visual del módulo Gestión personal. Los componentes solo consumen estas reglas.
export const roleDefaults = {
  tecnico: { dashboard:["view"], clients:["view"], plans:["view"], monitoring:["view"], tickets:["view"], tasks:["view"] },
  cobrador: { dashboard:["view"], clients:["view"], billing:["view"], messaging:["view"], tickets:["view"] },
};
export const permissionsByTab = {
  inicio:"dashboard", red:"network", routers:"network", olts:"olt", red_ipv4:"network",
  nap_boxes:"network", monitoring:"monitoring", servicios:"plans", clientes:"clients",
  client_users:"clients", client_zones:"clients", client_map:"clients", facturacion:"billing",
  hotspot:"hotspot", tareas:"tasks", almacen:"inventory", tickets:"tickets",
  mensajeria:"messaging", ajustes:"settings",
};
export function permissionsFor(user) {
  return Object.keys(user?.permissions || {}).length ? user.permissions : (roleDefaults[user?.role] || {});
}
export function canPermission(user, module, action = "view") {
  return user?.role === "admin" || Boolean((permissionsFor(user)[module] || []).includes(action));
}
export function canViewTab(user, tab) {
  return canPermission(user, permissionsByTab[tab], "view");
}
