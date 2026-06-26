import React from 'react';
import { MapPin, X } from 'lucide-react';
import { Stay } from '../types';
import { Button } from '@/components/ui/button';
import { UI } from '@/lib/ui';
import { cn } from '@/lib/utils';
import { buildAffiliateUrl } from '../lib/affiliate';

type Props = {
  children: React.ReactNode;
  stay: Stay;
  onClose: () => void;
};

type State = {
  hasError: boolean;
};

export default class HotelDetailBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Hotel detail render failed:', error);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.stay.id !== this.props.stay.id && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const { stay, onClose } = this.props;
    const name = typeof stay.name === 'string' ? stay.name : 'Hotel';
    const location = typeof stay.location === 'string' ? stay.location : 'Unknown location';
    const description =
      typeof stay.description === 'string' && stay.description.trim()
        ? stay.description
        : 'This hotel opened with incomplete details. You can still continue to the booking page while we tighten the content.';
    const bookingUrl = buildAffiliateUrl(stay.bookingUrl || '', name, location);

    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="mx-auto flex h-full max-w-3xl flex-col px-6 py-8 md:px-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">Hotel details</p>
              <h2 className="font-display text-[32px] leading-[1.05] text-foreground md:text-[46px]">{name}</h2>
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {location}
              </p>
            </div>
            <Button
              onClick={onClose}
              type="button"
              variant="outline"
              size="icon"
              className={cn('rounded-full border border-primary bg-white text-primary hover:bg-background', UI.pillRadius)}
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {stay.image ? (
            <img
              src={stay.image}
              alt={stay.imageAlt || name}
              className="mb-8 aspect-[16/10] w-full rounded-2xl object-cover"
            />
          ) : null}

          <div className="max-w-2xl space-y-5">
            <p className="text-lg italic leading-8 text-foreground/82">{description}</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Some parts of this hotel entry are still being normalized. The main booking link still works while we clean up the rest.
            </p>
          </div>

          <div className="mt-auto pt-8">
            <Button
              onClick={() => window.open(bookingUrl, '_blank', 'noopener,noreferrer')}
              className="h-12 rounded-full px-6 text-[15px] font-semibold"
            >
              Book now
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
