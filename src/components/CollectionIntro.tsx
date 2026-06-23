import { Compass, Link2, X } from 'lucide-react';
import { UI } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { CollectionRoute, getCollectionEditorialContent, getCollectionRelatedLinks } from '../lib/collections';
import { Stay } from '../types';

type Props = {
  route: CollectionRoute;
  stays: Stay[];
  onClose: () => void;
};

export default function CollectionIntro({ route, stays, onClose }: Props) {
  const editorial = getCollectionEditorialContent(route, stays);
  const related = getCollectionRelatedLinks(stays);
  const visibleTitle = editorial.title.replace(/\s+hotels$/i, '');

  const countryLinks =
    route.kind !== 'country' && related.countries.length
      ? related.countries.slice(0, 1)
      : [];

  return (
    <section className={cn(UI.stitchPageX, 'mt-8 mb-2 md:mt-12 md:mb-5')}>
      <div className="mb-4 flex items-center justify-between gap-4 md:mb-5">
        <div className="flex items-center justify-start gap-2">
          <Compass className="h-5 w-5 shrink-0 text-primary" />
          <h2 className="font-sans text-[16px] font-semibold text-foreground">
            {editorial.eyebrow}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Back to home"
          className="flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">Close guide</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-primary bg-white md:h-8 md:w-8">
            <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </span>
        </button>
      </div>

      <div className="relative rounded-xl bg-white px-6 py-6 md:px-7 md:py-6">
        <div className="md:grid md:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] md:gap-10 md:items-center">
          <div className="min-w-0 md:self-center">
            <h2 className="max-w-[20ch] font-display text-[34px] leading-[0.98] text-foreground md:max-w-none md:text-[48px]">
              {visibleTitle}
            </h2>
          </div>

          <div className="min-w-0">
            <p className="mt-3 max-w-none text-[15px] leading-[1.75] text-foreground/74 md:mt-0 md:text-[16px]">
              {editorial.description}
            </p>

            {countryLinks.length ? (
              <div className="mt-4 border-t border-primary/15 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-primary/80 shrink-0">
                    <Link2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">Country</span>
                  </div>
                  <div className="min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {countryLinks.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="whitespace-nowrap text-[14px] font-medium text-foreground underline decoration-primary/20 underline-offset-4 transition-colors hover:text-primary"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
