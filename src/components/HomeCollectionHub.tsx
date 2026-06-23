import { useState } from 'react';
import { Compass, Link2, ChevronDown } from 'lucide-react';
import { UI } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { getCollectionRelatedLinks } from '../lib/collections';
import { Stay } from '../types';

type Props = {
  stays: Stay[];
};

export default function HomeCollectionHub({ stays }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const related = getCollectionRelatedLinks(stays);

  const groups = [
    {
      label: 'Countries',
      links: related.countries.slice(0, 4),
    },
    {
      label: 'Destinations',
      links: related.destinations.slice(0, 8),
    },
    {
      label: 'Vibes',
      links: related.vibes.slice(0, 6),
    },
    {
      label: 'Backdrops',
      links: related.backdrops.slice(0, 6),
    },
  ].filter((group) => group.links.length > 0);

  if (groups.length === 0) return null;

  return (
    <section
      className={cn(
        UI.stitchPageX,
        'mt-8 md:mt-10',
        isOpen ? 'mb-24 md:mb-32' : 'mb-1 md:mb-2'
      )}
    >
      <details
        className="border-t border-primary/15 pt-5 md:pt-6"
        open={isOpen}
        onToggle={(event) => setIsOpen((event.currentTarget as HTMLDetailsElement).open)}
      >
        <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-primary">
                <Compass className="h-4 w-4 shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Browse more ways in</span>
              </div>

              <p className="max-w-3xl text-[14px] leading-[1.7] text-foreground/68 md:text-[15px]">
                A lighter way to keep exploring by country, destination, vibe, or setting.
              </p>
            </div>

            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-white text-primary">
              <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', isOpen ? 'rotate-180' : '')} />
            </div>
          </div>
        </summary>

        <div className="mt-4 flex flex-col gap-4 md:mt-5">
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-2 md:flex-row md:items-start md:gap-4">
              <div className="flex items-center gap-2 text-primary/80 md:min-w-28">
                <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em]">{group.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-primary/20 bg-background px-3 py-1.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
