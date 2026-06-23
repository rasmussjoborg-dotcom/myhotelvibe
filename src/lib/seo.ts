import { Stay } from '../types';
import { DEFAULT_DESCRIPTION, SITE_NAME, buildHotelPath, getHotelSlug, toAbsoluteMediaUrl, toAbsoluteUrl } from './site';
import { getStayCardBodyCopy } from './stayCardCopy';
import {
  CollectionRoute,
  getCollectionEditorialContent,
  getCollectionDisplayLabel,
  getCollectionFaq,
  getCollectionItemList,
  getCollectionPath,
  getCollectionRelatedLinks,
  getPriorityCollectionRoutes,
} from './collections';

type SeoPayload = {
  title: string;
  description: string;
  canonicalPath?: string;
  image?: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
};

function upsertMeta(name: 'name' | 'property', key: string, content: string) {
  let node = document.head.querySelector<HTMLMetaElement>(`meta[${name}="${key}"]`);
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(name, key);
    document.head.appendChild(node);
  }
  node.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let node = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!node) {
    node = document.createElement('link');
    node.setAttribute('rel', rel);
    document.head.appendChild(node);
  }
  node.setAttribute('href', href);
}

function upsertStructuredData(data?: Record<string, unknown> | Array<Record<string, unknown>>) {
  const existing = document.head.querySelector<HTMLScriptElement>('script[data-seo-schema="true"]');
  if (!data) {
    existing?.remove();
    return;
  }

  const node = existing ?? document.createElement('script');
  node.type = 'application/ld+json';
  node.dataset.seoSchema = 'true';
  node.textContent = JSON.stringify(data);
  if (!existing) {
    document.head.appendChild(node);
  }
}

function normalizeDescription(text?: string) {
  if (!text) return DEFAULT_DESCRIPTION;
  return text.replace(/\s+/g, ' ').trim();
}

export function applySeo(payload: SeoPayload) {
  if (typeof document === 'undefined') return;

  const canonicalPath = payload.canonicalPath || '/';
  const canonicalUrl = toAbsoluteUrl(canonicalPath);
  const description = normalizeDescription(payload.description);
  const title = payload.title.trim();
  const image = toAbsoluteMediaUrl(payload.image);
  const type = payload.type || 'website';

  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('name', 'robots', 'index,follow,max-image-preview:large');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:type', type);
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:site_name', SITE_NAME);
  if (image) {
    upsertMeta('property', 'og:image', image);
    upsertMeta('name', 'twitter:image', image);
  }
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertLink('canonical', canonicalUrl);
  upsertStructuredData(payload.structuredData);
}

export function buildHomeSeo(stays: Stay[] = []) {
  const title = `${SITE_NAME} | Editorial Hotel Discovery by Vibe, Setting & Stay Style`;
  const description =
    'Find hotels by feeling first. My Hotel Vibe curates editorial stays by backdrop, mood, and travel style for travelers with sharper taste.';
  const related = getCollectionRelatedLinks(stays);
  const featuredGuides = getPriorityCollectionRoutes(stays, 6);
  const featuredDestinations = related.destinations.slice(0, 6);
  const featuredCountries = related.countries.slice(0, 4);
  const featuredVibes = related.vibes.slice(0, 6);
  const featuredBackdrops = related.backdrops.slice(0, 4);
  const featuredHotels = stays.slice(0, 6);
  const image = toAbsoluteMediaUrl(featuredHotels[0]?.images?.[0] || featuredHotels[0]?.image);

  return {
    title,
    description,
    canonicalPath: '/',
    image,
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: toAbsoluteUrl('/'),
        email: 'contact@myhotelvibe.com',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: toAbsoluteUrl('/'),
        description,
      },
      ...(featuredDestinations.length > 0
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Featured hotel destinations',
              itemListElement: featuredDestinations.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.label,
                url: toAbsoluteUrl(item.href),
              })),
            },
          ]
        : []),
      ...(featuredCountries.length > 0
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Featured hotel countries',
              itemListElement: featuredCountries.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.label,
                url: toAbsoluteUrl(item.href),
              })),
            },
          ]
        : []),
      ...(featuredVibes.length > 0
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Featured hotel vibes',
              itemListElement: featuredVibes.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.label,
                url: toAbsoluteUrl(item.href),
              })),
            },
          ]
        : []),
      ...(featuredBackdrops.length > 0
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Featured hotel backdrops',
              itemListElement: featuredBackdrops.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.label,
                url: toAbsoluteUrl(item.href),
              })),
            },
          ]
        : []),
      ...(featuredGuides.length > 0
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Priority hotel guides',
              itemListElement: featuredGuides.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.label,
                url: toAbsoluteUrl(getCollectionPath(item)),
              })),
            },
          ]
        : []),
      ...(featuredHotels.length > 0
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: 'Featured hotels',
              itemListElement: featuredHotels.map((stay, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: stay.name,
                url: toAbsoluteUrl(buildHotelPath(getHotelSlug(stay))),
              })),
            },
          ]
        : []),
    ],
  } satisfies SeoPayload;
}

export function buildHotelSeo(stay: Stay) {
  const image = toAbsoluteMediaUrl(stay.images?.[0] || stay.image);
  const bodyCopy = getStayCardBodyCopy(stay);
  const description = normalizeDescription(bodyCopy || stay.description || DEFAULT_DESCRIPTION);
  const title = `${stay.name} in ${stay.location} | ${SITE_NAME}`;
  const canonicalPath = buildHotelPath(getHotelSlug(stay));

  return {
    title,
    description,
    canonicalPath,
    image,
    type: 'article',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        name: stay.name,
        description,
        image: image ? [image] : undefined,
        url: toAbsoluteUrl(canonicalPath),
        address: {
          '@type': 'PostalAddress',
          addressLocality: stay.location.split(',')[0]?.trim() || stay.location,
          addressCountry: stay.location.split(',').at(-1)?.trim() || '',
        },
        amenityFeature: (stay.amenities || []).slice(0, 8).map((amenity) => ({
          '@type': 'LocationFeatureSpecification',
          name: amenity,
          value: true,
        })),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: SITE_NAME,
            item: toAbsoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: stay.name,
            item: toAbsoluteUrl(canonicalPath),
          },
        ],
      },
    ],
  } satisfies SeoPayload;
}

export function buildCollectionSeo(route: CollectionRoute, stays: Stay[]) {
  const label = getCollectionDisplayLabel(route, stays);
  const canonicalPath = getCollectionPath(route);
  const image = toAbsoluteMediaUrl(stays[0]?.images?.[0] || stays[0]?.image);
  const editorial = getCollectionEditorialContent(route, stays);
  const faq = getCollectionFaq(route, stays);

  const title =
    route.kind === 'destination'
      ? `${label} Hotels | ${SITE_NAME}`
      : route.kind === 'country'
        ? `${label} Hotel Guide | ${SITE_NAME}`
        : route.kind === 'vibe'
          ? `${label} Hotels | ${SITE_NAME}`
          : `${label} Hotels | ${SITE_NAME}`;

  const description = editorial.seoDescription;

  return {
    title,
    description,
    canonicalPath,
    image,
    type: 'website',
    structuredData: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: toAbsoluteUrl(canonicalPath),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: SITE_NAME,
            item: toAbsoluteUrl('/'),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: label,
            item: toAbsoluteUrl(canonicalPath),
          },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${label} hotels`,
        itemListElement: getCollectionItemList(stays).map((item) => ({
          ...item,
          url: toAbsoluteUrl(item.url),
        })),
      },
      ...(faq.length
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faq.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: item.answer,
                },
              })),
            },
          ]
        : []),
    ],
  } satisfies SeoPayload;
}
