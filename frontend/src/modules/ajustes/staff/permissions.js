// Política visual del módulo Gestión personal. Sidebar solo consume esta configuración.
export const roleDefaults = {
  tecnico: { dashboard:["view"], clients:["view"], plans:["view"], network:["view"], monitoring:["view"], tickets:["view"], tasks:["view"] },
  cobrador: { dashboard:["view"], clients:["view"], billing:["view"], messaging:["view"], tickets:["view"] },
};

export const permissionsByTab = {
  inicio:"dashboard", red:"network", routers_olts:"network", red_ipv4:"network",
  nap_boxes:"network", monitoring:"monitoring", servicios:"plans", clientes:"clients",
  client_users:"clients", client_zones:"clients", client_map:"clients", facturacion:"billing",
  hotspot:"hotspot", tareas:"tasks", almacen:"inventory", tickets:"tickets",
  mensajeria:"messaging", ajustes:"settings",
};

export function canViewTab(user, tab) {
  const permissions = Object.keys(user?.permissions || {}).length ? user.permissions : (roleDefaults[user?.role] || {});
  return user?.role === "admin" || Boolean((permissions[permissionsByTab[tab]] || []).includes("view"));
}
