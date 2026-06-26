import { Stay } from '../types';
import { DEFAULT_DESCRIPTION, SITE_NAME, buildHotelPath, getHotelSlug, toAbsoluteMediaUrl, toAbsoluteUrl } from './site';
import { getStayCardBodyCopy } from './stayCardCopy';
import {
  CollectionRoute,
  getCollectionEditorialContent,
  getCollectionDisplayLabel,
  getCollectionFaq,
  getCollectionIndexDecision,
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
  robots?: string;
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

function removeMeta(name: 'name' | 'property', key: string) {
  document.head.querySelector<HTMLMetaElement>(`meta[${name}="${key}"]`)?.remove();
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
  const robots = payload.robots || 'index,follow,max-image-preview:large';

  document.title = title;
  upsertMeta('name', 'description', description);
  upsertMeta('name', 'robots', robots);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:type', type);
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('property', 'og:site_name', SITE_NAME);
  if (image) {
    upsertMeta('property', 'og:image', image);
    upsertMeta('name', 'twitter:image', image);
  } else {
    removeMeta('property', 'og:image');
    removeMeta('name', 'twitter:image');
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
  const image = toAbsoluteUrl('/og-image.png');

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

function getHotelFaq(stay: Stay) {
  const faqs = [];

  if (stay.primaryPersona) {
    faqs.push({
      question: `What kind of traveler is ${stay.name} best for?`,
      answer: `${stay.name} is highly recommended for travelers seeking a ${stay.primaryPersona.toLowerCase()} experience. It caters to those who appreciate thoughtful design and a specific aesthetic mood.`,
    });
  }

  if (stay.primaryBackdrop) {
    faqs.push({
      question: `What is the setting and location like at ${stay.name}?`,
      answer: `The hotel is located in ${stay.location}, offering a stunning ${stay.primaryBackdrop.toLowerCase()} setting. This backdrop plays a major role in the overall atmosphere of the stay.`,
    });
  }

  const notableAmenities = (stay.amenities || []).slice(0, 3).join(', ').toLowerCase();
  if (notableAmenities) {
    faqs.push({
      question: `What are the standout amenities at ${stay.name}?`,
      answer: `Guests can expect premium amenities including ${notableAmenities}, contributing to a highly curated and comfortable experience.`,
    });
  }

  if (stay.vibe) {
    faqs.push({
      question: `What is the overall vibe and aesthetic of ${stay.name}?`,
      answer: `The vibe at ${stay.name} can be described as: ${stay.vibe}. It is an ideal destination for travelers who prioritize atmosphere and aesthetic in their stays.`,
    });
  }
  
  if (stay.whyWeLoveIt) {
    faqs.push({
      question: `Why is ${stay.name} considered a curated or standout hotel?`,
      answer: `We particularly love this property because: ${stay.whyWeLoveIt}. This makes it a standout choice for discerning guests looking for unique experiences rather than generic accommodations.`,
    });
  }

  if (stay.tags && stay.tags.length > 0) {
    faqs.push({
      question: `What are some key highlights or tags associated with ${stay.name}?`,
      answer: `Key highlights include: ${stay.tags.join(', ')}. These elements contribute to making it a unique and memorable place to stay.`,
    });
  }

  if (stay.settings && stay.settings.length > 0) {
    faqs.push({
      question: `What is the surrounding environment like at ${stay.name}?`,
      answer: `The property is situated in an environment that features: ${stay.settings.join(', ')}. This natural setting enhances the overall guest experience.`,
    });
  }

  if (stay.isAdultsOnly) {
    faqs.push({
      question: `Is ${stay.name} adults only or family friendly?`,
      answer: `${stay.name} is an adults-only property, making it perfect for romantic getaways, honeymoons, or peaceful retreats without children.`,
    });
  }

  return faqs;
}

export function buildHotelSeo(stay: Stay) {
  const image = toAbsoluteMediaUrl(stay.images?.[0] || stay.image);
  const bodyCopy = getStayCardBodyCopy(stay);
  const baseDescription = normalizeDescription(bodyCopy || stay.description || DEFAULT_DESCRIPTION);
  
  // LLM Optimization: Inject vibe and editorial notes into the hidden description and schema
  const llmoContext = stay.vibe || stay.whyWeLoveIt ? `Vibe & Experience: ${stay.vibe || ''} ${stay.whyWeLoveIt || ''}`.trim() : '';
  const description = normalizeDescription(`${baseDescription} ${llmoContext}`);
  
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
      ...(getHotelFaq(stay).length > 0
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: getHotelFaq(stay).map((item) => ({
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

export function buildCollectionSeo(route: CollectionRoute, stays: Stay[]) {
  const label = getCollectionDisplayLabel(route, stays);
  const canonicalPath = getCollectionPath(route);
  const image = toAbsoluteMediaUrl(stays[0]?.images?.[0] || stays[0]?.image);
  const editorial = getCollectionEditorialContent(route, stays);
  const faq = getCollectionFaq(route, stays);
  const indexDecision = getCollectionIndexDecision(route, stays);

  const title =
    route.kind === 'destination'
      ? `${label} Hotels | ${SITE_NAME}`
      : route.kind === 'country'
        ? `${label} Hotel Guide | ${SITE_NAME}`
        : route.kind === 'vibe'
          ? `${label} Hotels | ${SITE_NAME}`
          : `${label} Hotels | ${SITE_NAME}`;

  const description = editorial.seoDescription;
  const robots =
    indexDecision === 'index-now' || indexDecision === 'index-lightly'
      ? 'index,follow,max-image-preview:large'
      : 'noindex,follow,max-image-preview:large';

  return {
    title,
    description,
    canonicalPath,
    image,
    type: 'website',
    robots,
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
