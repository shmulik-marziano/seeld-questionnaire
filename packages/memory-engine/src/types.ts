// We avoid importing the concrete SupabaseClient type to keep this package
// independent of a specific generated Database. The web app passes its
// service-role client; we type only the methods we use.

export interface SupabaseLike {
  from: (table: string) => any;
  rpc: (fn: string, args: Record<string, unknown>) => any;
}
