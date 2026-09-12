import React from "react";
import {
  Settings, Users, Mail, DollarSign, FileText, CreditCard, Code2, UserCircle,
  Bell, Headphones, ShieldAlert, Package, RefreshCw, MapPin, Database, Clock3,
  Wrench, Server, MessageSquare, Cloud, SlidersHorizontal, LayoutTemplate, Send,
  KeyRound, CheckCircle2, Hammer, AlertTriangle
} from "lucide-react";
import "./settings-home.css";
const MODULES = [
  { id:"general", label:"General", desc:"Empresa, tema y parámetros globales", icon:Settings, tone:"blue", live:true },
  { id:"clients", label:"Configuración clientes", desc:"Registro, pausas, retiros y equipos", icon:Users, tone:"green", live:true },
  { id:"staff", label:"Gestión personal", desc:"Usuarios, roles y permisos", icon:Users, tone:"violet", live:true },
  { id:"mail", label:"Servidor de correo", desc:"SMTP y correo de prueba", icon:Mail, tone:"red", live:true },
  { id:"billing", label:"Facturación", desc:"Reglas y comprobantes", icon:DollarSign, tone:"green" },
  { id:"electronic", label:"Facturación electrónica", desc:"SUNAT y series", icon:FileText, tone:"violet" },
  { id:"payments", label:"Pasarelas de pago", desc:"Cobros en línea", icon:CreditCard, tone:"orange" },
  { id:"templates", label:"Editor plantillas", desc:"Diseños y mensajes", icon:Code2, tone:"blue" },
  { id:"portal", label:"Portal cliente", desc:"Acceso de abonados", icon:UserCircle, tone:"pink" },
  { id:"push", label:"Notificaciones Push", desc:"Avisos al instante", icon:Bell, tone:"red" },
  { id:"tickets", label:"Tickets", desc:"Soporte y atención", icon:Headphones, tone:"cyan" },
  { id:"zendesk", label:"Zendesk Support", desc:"Integración externa", icon:Headphones, tone:"green" },
  { id:"blacklist", label:"Monitor Blacklist", desc:"Revisión de IPs", icon:ShieldAlert, tone:"red" },
  { id:"import", label:"Importar clientes", desc:"Carga masiva", icon:Package, tone:"blue" },
  { id:"bulk", label:"Cambios masivos", desc:"Actualizar registros", icon:RefreshCw, tone:"orange" },
  { id:"locations", label:"Ubicaciones", desc:"Zonas y oficinas", icon:MapPin, tone:"violet" },
  { id:"custom_fields", label:"Campos personalizados", desc:"Datos adicionales", icon:SlidersHorizontal, tone:"blue" },
  { id:"messaging", label:"Mensajería", desc:"Pasarelas de mensajería", icon:MessageSquare, tone:"green", live:true },
  { id:"cloud", label:"Cloud", desc:"Sincronización", icon:Cloud, tone:"blue" },
  { id:"google", label:"Google", desc:"Google Maps y APIs", icon:MapPin, tone:"multi", live:true },
  { id:"database", label:"Base de datos", desc:"Respaldo y datos", icon:Database, tone:"slate" },
  { id:"crontab", label:"Crontab", desc:"Tareas programadas", icon:Clock3, tone:"orange" },
  { id:"logs", label:"Logs", desc:"Registro del sistema", icon:FileText, tone:"slate" },
  { id:"system", label:"Sistema", desc:"Preferencias técnicas", icon:Wrench, tone:"red", live:true },
  { id:"config_templates", label:"Plantillas configuración", desc:"Plantillas de mensajes y ajustes reutilizables", icon:LayoutTemplate, tone:"violet", live:true },
  { id:"invoice_messages", label:"Mensajes facturas", desc:"Textos de cobro", icon:Send, tone:"cyan" },
  { id:"server", label:"Servidor", desc:"Estado y servicios", icon:Server, tone:"blue" },
  { id:"migrate", label:"Migrar", desc:"Transferir datos", icon:RefreshCw, tone:"orange" },
  { id:"freeradius", label:"FreeRADIUS", desc:"Autenticación de red", icon:KeyRound, tone:"violet" },
  { id:"license", label:"Licencia Z-Hub", desc:"Plan, estado y capacidad de abonados", icon:ShieldAlert, tone:"green", live:true },
];
export default function SettingsHome({ onOpen }) {
  const live=MODULES.filter(i=>i.live).length, developing=MODULES.length-live;
  return <div className="settings-home"><div className="settings-home-head"><div><h2><Settings /> Ajustes</h2><p>Configura cada módulo del sistema. Pasa el mouse sobre una opción para ver su estado.</p></div><div className="settings-summary"><div className="summary-pill ok"><CheckCircle2/><b>{live}</b><span>Módulos operativos<small>Funcionando actualmente</small></span></div><div className="summary-pill dev"><Hammer/><b>{developing}</b><span>En desarrollo<small>Interfaz preparada</small></span></div><div className="summary-pill err"><AlertTriangle/><b>0</b><span>Con errores<small>Sin errores declarados</small></span></div></div></div><div className="settings-module-grid">{MODULES.map(({id,label,desc,icon:Icon,tone,live})=><button key={id} type="button" className={`settings-module-card tone-${tone} ${live?"is-live":"is-dev"}`} onClick={()=>onOpen?.(id)} aria-label={`${label}: ${live?"Operativo":"En desarrollo"}`}><span className="module-icon"><Icon /></span><strong>{label}</strong><span className={`module-state ${live?"state-live":"state-dev"}`}>{live?<CheckCircle2/>:<Hammer/>}{live?"Operativo":"En desarrollo"}</span><span className="module-tooltip"><b>{label}</b><span>{desc}</span><em>{live?"Operativo":"En desarrollo"}</em></span></button>)}</div><div className="settings-legend"><span><i className="dot live"/>Operativo: función disponible</span><span><i className="dot dev"/>En desarrollo: acceso preparado</span><span>El estado es informativo y no modifica ninguna configuración.</span></div></div>;
}
