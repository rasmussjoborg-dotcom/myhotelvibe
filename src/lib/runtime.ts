export function isLocalHost() {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
}

export function isLocalAdminEnabled() {
  const envFlag = import.meta.env.VITE_ENABLE_LOCAL_ADMIN;
  if (envFlag === 'true') return true;
  if (envFlag === 'false') return false;
  return isLocalHost();
}

