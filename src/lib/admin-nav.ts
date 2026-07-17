import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Layers,
  ShoppingBag,
  FolderTree,
  Images,
  Tag,
  MessageSquareQuote,
  HelpCircle,
  Building2,
  Share2,
  Settings,
  Users,
  History,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};

export const adminNavItems: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Contenido de la landing", href: "/admin/landing", icon: Layers },
  { label: "Productos", href: "/admin/productos", icon: ShoppingBag },
  { label: "Categorías", href: "/admin/categorias", icon: FolderTree },
  { label: "Imágenes y archivos", href: "/admin/galeria", icon: Images },
  { label: "Promociones", href: "/admin/promociones", icon: Tag },
  { label: "Testimonios", href: "/admin/testimonios", icon: MessageSquareQuote },
  { label: "Preguntas frecuentes", href: "/admin/faqs", icon: HelpCircle },
  { label: "Información del negocio", href: "/admin/negocio", icon: Building2 },
  { label: "Redes sociales", href: "/admin/redes", icon: Share2 },
  { label: "Configuración", href: "/admin/configuracion", icon: Settings },
  { label: "Usuarios y permisos", href: "/admin/usuarios", icon: Users, adminOnly: true },
  { label: "Historial de cambios", href: "/admin/historial", icon: History, adminOnly: true },
];
