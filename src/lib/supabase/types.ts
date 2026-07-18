// Tipos escritos a mano a partir de supabase/migrations/*.sql (el proyecto no tiene
// Docker/Podman disponible para `supabase gen types` con --db-url). Si en algún momento
// hay un container runtime a mano, se puede regenerar con:
//   npx supabase gen types typescript --db-url "$POSTGRES_URL_NON_POOLING"

// Sin este "aplanado", `Partial<Row>` (y cualquier intersección con un mapped type) no
// satisface estructuralmente `Record<string, unknown>` una vez diferido dentro de un
// genérico anidado (TableDef -> Database.public.Tables.x.Update) — postgrest-js necesita
// esa relación para resolver `.from("tabla")`, así que sin esto todo colapsa a `never`
// en silencio (no da error hasta que usás una columna del resultado).
type Simplify<T> = { [K in keyof T]: T[K] } & {};

type GeneratedRow<Row, GeneratedKeys extends keyof Row> = Simplify<
  Omit<Row, GeneratedKeys> & Partial<Pick<Row, GeneratedKeys>>
>;

// Toda columna nullable en Postgres acepta omitirse en un insert (queda NULL).
// Detectarlo automáticamente evita tener que listar a mano cada campo opcional
// (seo_title, description, deleted_at, etc.) en cada tabla — listar solo a mano
// las columnas NOT NULL que además tienen DEFAULT (booleans, status, sort_order...).
type NullableKeys<T> = { [K in keyof T]: null extends T[K] ? K : never }[keyof T];

export type ContentStatus = "draft" | "published" | "scheduled" | "archived";

export interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRow {
  user_id: string;
  role: "admin" | "editor";
  granted_at: string;
  granted_by: string | null;
}

export interface SiteSettingsRow {
  id: true;
  business_name: string;
  logo_url: string | null;
  favicon_url: string | null;
  description: string | null;
  address: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  whatsapp_message_template: string | null;
  email: string | null;
  hours: Record<string, unknown>;
  maps_url: string | null;
  catalog_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  seo_image_url: string | null;
  seo_canonical_url: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface LandingSectionRow {
  id: string;
  type: string;
  content: Record<string, unknown>;
  is_active: boolean;
  status: ContentStatus;
  scheduled_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface SocialLinkRow {
  id: string;
  platform: string;
  url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface BannerRow {
  id: string;
  title: string | null;
  message: string;
  cta_text: string | null;
  cta_url: string | null;
  image_url: string | null;
  position: "top" | "hero" | "footer";
  is_active: boolean;
  status: "draft" | "published" | "scheduled" | "archived";
  start_at: string | null;
  end_at: string | null;
  sort_order: number;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface CategoryRow {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export type ProductStatus = "draft" | "published" | "hidden" | "agotado" | "archived";

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  sale_price: number | null;
  cost: number | null;
  category_id: string | null;
  status: ProductStatus;
  stock: number;
  is_featured: boolean;
  is_new: boolean;
  is_on_sale: boolean;
  sale_start_at: string | null;
  sale_end_at: string | null;
  material: string | null;
  tags: string[];
  sort_order: number;
  seo_title: string | null;
  seo_description: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  url: string;
  alt_text: string;
  title: string | null;
  is_primary: boolean;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductVariantRow {
  id: string;
  product_id: string;
  size: string | null;
  color: string | null;
  sku: string | null;
  stock: number;
  extra_price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromotionRow {
  id: string;
  name: string;
  description: string | null;
  discount_type: "percentage" | "fixed_price";
  discount_percentage: number | null;
  fixed_price: number | null;
  category_id: string | null;
  start_at: string;
  end_at: string;
  is_active: boolean;
  show_countdown: boolean;
  banner_enabled: boolean;
  banner_position: "top" | "hero" | "footer" | null;
  cta_text: string | null;
  cta_url: string | null;
  status: "draft" | "published" | "archived";
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface PromotionProductRow {
  promotion_id: string;
  product_id: string;
}

export interface TestimonialRow {
  id: string;
  customer_name: string;
  content: string;
  rating: number | null;
  photo_url: string | null;
  testimonial_date: string;
  status: "draft" | "published" | "archived";
  sort_order: number;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface FaqRow {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  is_active: boolean;
  sort_order: number;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface GalleryItemRow {
  id: string;
  image_url: string;
  alt_text: string;
  title: string | null;
  description: string | null;
  related_product_id: string | null;
  is_active: boolean;
  sort_order: number;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface AuditLogRow {
  id: number;
  actor_id: string | null;
  action: "INSERT" | "UPDATE" | "DELETE";
  table_name: string;
  record_id: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface NotificationRow {
  id: string;
  user_id: string | null;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  related_table: string | null;
  related_id: string | null;
  created_at: string;
}

export interface NewsletterSubscriberRow {
  id: string;
  email: string;
  segment: "bebes" | "ninas" | "ninos" | "general";
  is_active: boolean;
  created_at: string;
}

type TableDef<
  Row,
  ExtraGeneratedKeys extends keyof Row = never,
> = {
  Row: Simplify<Row>;
  Insert: GeneratedRow<Row, ExtraGeneratedKeys | NullableKeys<Row>>;
  Update: Simplify<Partial<Row>>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: TableDef<ProfileRow, "created_at" | "updated_at">;
      user_roles: TableDef<UserRoleRow, "granted_at">;
      site_settings: TableDef<SiteSettingsRow, "id" | "updated_at">;
      landing_sections: TableDef<
        LandingSectionRow,
        "id" | "created_at" | "updated_at" | "is_active" | "status" | "sort_order"
      >;
      social_links: TableDef<SocialLinkRow, "id" | "created_at" | "updated_at" | "is_active" | "sort_order">;
      banners: TableDef<
        BannerRow,
        "id" | "created_at" | "updated_at" | "is_active" | "status" | "sort_order"
      >;
      categories: TableDef<CategoryRow, "id" | "created_at" | "updated_at" | "is_active" | "sort_order">;
      products: TableDef<
        ProductRow,
        | "id"
        | "created_at"
        | "updated_at"
        | "status"
        | "stock"
        | "is_featured"
        | "is_new"
        | "is_on_sale"
        | "tags"
        | "sort_order"
      >;
      product_images: TableDef<ProductImageRow, "id" | "created_at" | "is_primary" | "sort_order" | "is_active">;
      product_variants: TableDef<
        ProductVariantRow,
        "id" | "created_at" | "updated_at" | "stock" | "extra_price" | "is_active"
      >;
      promotions: TableDef<
        PromotionRow,
        | "id"
        | "created_at"
        | "updated_at"
        | "is_active"
        | "show_countdown"
        | "banner_enabled"
        | "banner_position"
        | "status"
      >;
      promotion_products: TableDef<PromotionProductRow>;
      testimonials: TableDef<
        TestimonialRow,
        "id" | "created_at" | "updated_at" | "testimonial_date" | "status" | "sort_order"
      >;
      faqs: TableDef<FaqRow, "id" | "created_at" | "updated_at" | "is_active" | "sort_order">;
      gallery_items: TableDef<
        GalleryItemRow,
        "id" | "created_at" | "updated_at" | "is_active" | "sort_order"
      >;
      audit_logs: TableDef<AuditLogRow, "id" | "created_at">;
      notifications: TableDef<NotificationRow, "id" | "created_at" | "is_read">;
      newsletter_subscribers: TableDef<
        NewsletterSubscriberRow,
        "id" | "created_at" | "segment" | "is_active"
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
