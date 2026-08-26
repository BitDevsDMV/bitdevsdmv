export const SITE_NAME = 'BitDevs DMV';
export const SITE_URL = 'https://bitdevsdmv.com';
export const DEFAULT_DESCRIPTION =
  'Technical Bitcoin Socratic Seminars in Washington, DC, Maryland, and Virginia. Chatham House Rule, no recordings.';

export type Crumb = { name: string; href?: string };

export function absoluteUrl(path: string, site = SITE_URL): string {
  if (path.startsWith('http')) return path;
  if (path === '/' || path === '') return `${site}/`;
  return `${site}${path.startsWith('/') ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: absoluteUrl('/brand/bitdevs-dmv-logo.png'),
    description: DEFAULT_DESCRIPTION,
    areaServed: [
      { '@type': 'AdministrativeArea', name: 'Washington, DC' },
      { '@type': 'State', name: 'Maryland' },
      { '@type': 'State', name: 'Virginia' },
    ],
    sameAs: ['https://www.bitdevsmap.org/'],
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en-US',
    publisher: { '@id': `${SITE_URL}/#organization` },
  };
}

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      ...(crumb.href ? { item: absoluteUrl(crumb.href) } : {}),
    })),
  };
}

export function webPageJsonLd(opts: {
  title: string;
  description: string;
  path: string;
  type?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': opts.type || 'WebPage',
    name: opts.title,
    description: opts.description,
    url: absoluteUrl(opts.path),
    isPartOf: { '@id': `${SITE_URL}/#website` },
    about: { '@id': `${SITE_URL}/#organization` },
    inLanguage: 'en-US',
  };
}
