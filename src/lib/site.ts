export const SITE_NAME = 'My Hotel Vibe';
export const SITE_URL_FALLBACK = 'https://myhotelvibe.com';
export const DEFAULT_DESCRIPTION =
  'Editorial hotel discovery for travelers choosing by mood, setting, and the kind of stay they want to remember.';

export function slugifyHotelValue(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

export function getSiteUrl() {
  const envUrl = import.meta.env.VITE_SITE_URL;
  if (typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }

  return SITE_URL_FALLBACK;
}

export function buildHotelPath(slug: string) {
  return `/hotels/${slug}/`;
}

export function getHotelSlug(input: { slug?: string; id?: string; name?: string }) {
  if (typeof input.slug === 'string' && input.slug.trim()) {
    return slugifyHotelValue(input.slug);
  }

  if (typeof input.name === 'string' && input.name.trim()) {
    return slugifyHotelValue(input.name);
  }

  return slugifyHotelValue(input.id || '');
}

export function toAbsoluteUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}

export function toAbsoluteMediaUrl(url?: string | null) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return toAbsoluteUrl(url);
}
