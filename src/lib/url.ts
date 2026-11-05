// Prefix root-absolute paths with the deploy base ("/preplancks"). External URLs pass through.
export function u(path: string): string {
  if (/^(https?:|mailto:|#)/.test(path)) return path;
  const base = import.meta.env.BASE_URL || "/";
  return base.replace(/\/$/, "") + "/" + path.replace(/^\/+/, "");
}
