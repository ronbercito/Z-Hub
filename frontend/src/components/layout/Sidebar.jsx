import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { TEST_IDS } from "../../constants/testIds";
import { Home, Server, Zap, Users, Wifi, Calendar, DollarSign, Package, Headphones, MessageSquare, Settings, ChevronRight, LogOut, ShieldCheck, ChevronLeft, Network, Box, ChevronDown, Radio, MapPin, Map } from "lucide-react";

const roleDefaults = { tecnico:{dashboard:["view"],clients:["view"],plans:["view"],network:["view"],monitoring:["view"],tickets:["view"],tasks:["view"]}, cobrador:{dashboard:["view"],clients:["view"],billing:["view"],messaging:["view"],tickets:["view"]} };
const permissionsByTab = { inicio:"dashboard", red:"network", routers_olts:"network", red_ipv4:"network", nap_boxes:"network", monitoring:"monitoring", servicios:"plans", clientes:"clients", client_users:"clients", client_zones:"clients", client_map:"clients", facturacion:"billing", hotspot:"hotspot", tareas:"tasks", almacen:"inventory", tickets:"tickets", mensajeria:"messaging", ajustes:"settings" };
const menuItems = [
  { id:"inicio", label:"Inicio", icon:Home, testId:TEST_IDS.NAV_INICIO },
  { id:"red", label:"Gestión de Red", icon:Server, testId:TEST_IDS.NAV_RED, children:[{id:"routers_olts",label:"Routers | OLTs",icon:Server},{id:"red_ipv4",label:"Redes IPv4",icon:Network},{id:"nap_boxes",label:"Cajas NAP",icon:Box},{id:"monitoring",label:"Monitoreo",icon:Radio}] },
  { id:"servicios",label:"Servicios / Planes",icon:Zap,testId:TEST_IDS.NAV_SERVICIOS },
  { id:"clientes",label:"Clientes",icon:Users,testId:TEST_IDS.NAV_CLIENTES,children:[{id:"client_users",label:"Usuarios",icon:Users},{id:"client_zones",label:"Zonas",icon:MapPin},{id:"client_map",label:"Mapa clientes",icon:Map}] },
  { id:"facturacion",label:"Finanzas / Facturación",icon:DollarSign,testId:TEST_IDS.NAV_FACTURACION },
  { id:"hotspot",label:"Fichas Hotspot",icon:Wifi,testId:TEST_IDS.NAV_HOTSPOT },
  { id:"tareas",label:"Tareas",icon:Calendar,testId:TEST_IDS.NAV_TAREAS },
  { id:"almacen",label:"Almacén",icon:Package,testId:TEST_IDS.NAV_ALMACEN },
  { id:"tickets",label:"Tickets",icon:Headphones,testId:TEST_IDS.NAV_TICKETS },
  { id:"mensajeria",label:"Mensajería",icon:MessageSquare,testId:TEST_IDS.NAV_MENSAJERIA },
  { id:"ajustes",label:"Ajustes",icon:Settings,testId:TEST_IDS.NAV_AJUSTES },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, companyName="MikroHub", logoData="" }) {
  const { user, logout } = useAuth();
  const canView = (tab) => { const permissions = Object.keys(user?.permissions || {}).length ? user.permissions : (roleDefaults[user?.role] || {}); return user?.role === "admin" || Boolean((permissions[permissionsByTab[tab]] || []).includes("view")); };
  const visibleItems = menuItems.map(item => ({...item, children:item.children?.filter(child => canView(child.id))})).filter(item => canView(item.id) || item.children?.length);
  const groupForTab = tab => { const parent=visibleItems.find(item=>item.id===tab||item.children?.some(child=>child.id===tab)); return parent?.children ? parent.id : null; };
  const [openGroup,setOpenGroup]=useState(()=>groupForTab(activeTab));
  useEffect(()=>setOpenGroup(groupForTab(activeTab)),[activeTab,user]);
  const itemClass=active=>`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${active?"bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm":"text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"}`;
  const selectLeaf=id=>{setActiveTab(id);setOpenGroup(groupForTab(id));};

  return <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-slate-800 bg-slate-900 transition-all duration-300 ${isOpen?"w-64":"w-20"}`}>
    <div><div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4"><div className="flex items-center gap-2.5 overflow-hidden"><div className="flex h-9 w-9 min-w-[36px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">{logoData?<img src={logoData} alt="Logo de empresa" className="h-full w-full object-contain bg-white/5"/>:<Wifi className="h-5 w-5 text-white"/>}</div>{isOpen&&<div><span className="block truncate text-lg font-black tracking-tight text-white">{companyName}</span><span className="-mt-1 block text-[10px] font-bold uppercase tracking-widest text-cyan-400">ISP PORTAL</span></div>}</div><button onClick={()=>setIsOpen(!isOpen)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200">{isOpen?<ChevronLeft className="h-4 w-4"/>:<ChevronRight className="h-4 w-4"/>}</button></div>
      <div className="flex items-center gap-3 border-b border-slate-800/60 p-4"><div className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-sm font-bold text-cyan-400">{user?.name?.charAt(0)||"A"}</div>{isOpen&&<div className="overflow-hidden"><h4 className="truncate text-xs font-bold text-slate-100">{user?.name||"Operador"}</h4><p className="flex items-center gap-1 text-[10px] font-medium capitalize text-cyan-400/90"><ShieldCheck className="h-3 w-3"/>{user?.role||"Usuario"}</p></div>}</div>
      <div className="p-3">{isOpen&&<p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">Menú principal</p>}<nav className="space-y-1">{visibleItems.map(item=>{const Icon=item.icon,hasChildren=Boolean(item.children?.length),groupActive=activeTab===item.id||item.children?.some(child=>child.id===activeTab),expanded=openGroup===item.id;return <div key={item.id}><button data-testid={item.testId} onClick={()=>{if(hasChildren){const first=item.children[0].id;setActiveTab(first);setOpenGroup(expanded?null:item.id)}else selectLeaf(item.id)}} className={itemClass(groupActive)} title={!isOpen?item.label:""}><Icon className={`h-4 w-4 min-w-[16px] ${groupActive?"text-cyan-400":"text-slate-400 group-hover:text-slate-200"}`}/>{isOpen&&<><span className="flex-1 truncate text-left">{item.label}</span>{hasChildren&&<ChevronDown className={`h-4 w-4 transition-transform ${expanded?"rotate-180":""}`}/>}</>}</button>{isOpen&&hasChildren&&expanded&&<div className="mt-1 ml-5 space-y-1 border-l border-slate-700/70 pl-2">{item.children.map(child=>{const ChildIcon=child.icon,active=activeTab===child.id;return <button key={child.id} onClick={()=>selectLeaf(child.id)} className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${active?"bg-cyan-500/15 text-cyan-300":"text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}><ChildIcon className="h-3.5 w-3.5"/><span>{child.label}</span></button>})}</div>}</div>})}</nav></div></div>
    <div className="border-t border-slate-800 p-3"><button data-testid={TEST_IDS.LOGOUT_BTN} onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"><LogOut className="h-4 w-4 min-w-[16px]"/>{isOpen&&<span>Cerrar sesión</span>}</button></div>
  </aside>;
}
