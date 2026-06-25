import { ChevronDown, Link2 } from 'lucide-react';
import { UI } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { CollectionRoute, getCollectionFaq, getCollectionRelatedLinks } from '../lib/collections';
import { Stay } from '../types';

type Props = {
  route: CollectionRoute;
  stays: Stay[];
};

export default function CollectionSeoFooter({ route, stays }: Props) {
  const faq = getCollectionFaq(route, stays);
  const related = getCollectionRelatedLinks(stays);
  const eligibleCountries = related.countries.filter((link) => link.decision !== 'support-internally');
  const eligibleDestinations = related.destinations.filter((link) => link.decision !== 'support-internally');
  const eligibleBackdrops = related.backdrops.filter((link) => link.decision !== 'support-internally');
  const eligibleVibes = related.vibes.filter((link) => link.decision !== 'support-internally');

  const relatedGroups = [
    route.kind !== 'country' && eligibleCountries.length
      ? { label: 'Country', links: eligibleCountries.slice(0, 1) }
      : null,
    route.kind !== 'destination' && eligibleDestinations.length
      ? { label: 'Destinations', links: eligibleDestinations.slice(0, 2) }
      : null,
    route.kind !== 'backdrop' && eligibleBackdrops.length
      ? { label: 'Backdrops', links: eligibleBackdrops.slice(0, 2) }
      : null,
    route.kind !== 'vibe' && eligibleVibes.length
      ? { label: 'Vibes', links: eligibleVibes.slice(0, 2) }
      : null,
  ].filter(Boolean) as Array<{ label: string; links: Array<{ href: string; label: string }> }>;

  if (!faq.length && !relatedGroups.length) return null;

  return (
    <section className={cn(UI.stitchPageX, 'mt-6 mb-20 md:mt-8 md:mb-24')}>
      <details className="group border-t border-primary/15 pt-4 pb-1 text-left md:pt-4 md:pb-1">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-0.5">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-primary/80">
            Guide notes
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-primary/70 transition-transform group-open:rotate-180" />
        </summary>

        <div className="mt-4 grid gap-5 pb-2 text-[14px] leading-[1.75] text-foreground/68 md:mt-5 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          {faq.length ? (
            <div className="space-y-4">
              {faq.slice(0, 2).map((item) => (
                <div key={item.question}>
                  <h3 className="text-[14px] font-medium text-foreground">{item.question}</h3>
                  <p className="mt-1">{item.answer}</p>
                </div>
              ))}
            </div>
          ) : null}

          {relatedGroups.length ? (
            <div className="space-y-3">
              {relatedGroups.map((group) => (
                <div key={group.label} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-primary/80">
                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">{group.label}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {group.links.map((link, index) => (
                      <span key={link.href} className="inline-flex items-center gap-3">
                        {index > 0 ? <span className="text-primary/20">•</span> : null}
                        <a
                          href={link.href}
                          className="text-[14px] text-foreground underline decoration-primary/20 underline-offset-4 transition-colors hover:text-primary"
                        >
                          {link.label}
                        </a>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </details>
    </section>
  );
}
