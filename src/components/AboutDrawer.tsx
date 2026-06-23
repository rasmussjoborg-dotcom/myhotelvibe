import { useState } from 'react';
import { BookOpen, CircleHelp, Copyright, Database, ExternalLink, FileImage, Mail, MessageSquareQuote, ShieldCheck, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UI } from '@/lib/ui';
import { cn } from '@/lib/utils';

type AboutDrawerProps = {
  onClose: () => void;
};

const principles = [
  {
    title: 'What This Is',
    body:
      'My Hotel Vibe is an independent hotel discovery project built and curated by one person. The goal is to make hotel search feel more editorial, more specific, and a little less exhausting.',
    icon: Sparkles,
  },
  {
    title: 'How It Works',
    body:
      'Hotels are grouped through structured tags, visual curation, editorial notes, and vibe-based filters. The language is intentionally more emotional than a traditional booking site, but still meant to help narrow the field quickly.',
    icon: BookOpen,
  },
  {
    title: 'What It Is Not',
    body:
      'This is not a booking platform, a travel agency, or a guarantee of price, availability, amenities, or hotel policies. Final details should always be verified with the hotel or booking provider before you book.',
    icon: CircleHelp,
  },
];

const notes = [
  {
    icon: Database,
    title: 'Local preferences and saved stays',
    body: 'Preferences and saved hotels are stored locally in your browser so the experience can remember your selections between visits.',
  },
  {
    icon: ExternalLink,
    title: 'Affiliate links',
    body: 'All hotel links on My Hotel Vibe are affiliate links. If you book through them, My Hotel Vibe may earn a commission at no extra cost to you.',
  },
  {
    icon: FileImage,
    title: 'Content can change over time',
    body: 'Hotel descriptions, imagery, amenities, and booking details can change over time and may not always reflect the latest update from the property.',
  },
  {
    icon: ExternalLink,
    title: 'Third-party links',
    body: 'Links to third-party booking sites or hotel pages are governed by those services and their own terms, privacy practices, and availability rules.',
  },
  {
    icon: Copyright,
    title: 'Hotel names and trademarks',
    body: 'Hotel names, brands, logos, and related trademarks remain the property of their respective owners.',
  },
];

export default function AboutDrawer({ onClose }: AboutDrawerProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col md:flex-row fill-mode-forwards',
        isClosing ? 'animate-out fade-out duration-300 ease-out' : 'animate-in fade-in duration-200 ease-out'
      )}
      role="dialog"
      aria-modal="true"
      aria-label="About My Hotel Vibe"
    >
      <div
        className="absolute inset-0 bg-transparent backdrop-blur-[4px] [-webkit-backdrop-filter:blur(4px)] md:bg-black/70 md:backdrop-blur-none"
        onClick={handleClose}
      />

      <div
        className={cn(
          'pointer-events-auto relative z-30 mt-auto flex h-[92vh] w-full flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl md:relative md:ml-auto md:mt-0 md:h-full md:w-1/2 md:rounded-none md:shrink-0',
          isClosing ? 'animate-out slide-out-to-bottom-[100%] md:slide-out-to-right-[100%] md:slide-out-to-bottom-0' : 'animate-in slide-in-from-bottom-[100%] md:slide-in-from-right-[100%] md:slide-in-from-bottom-0'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute right-4 top-4 z-40">
          <Button
            onClick={handleClose}
            type="button"
            variant="outline"
            size="icon"
            className={cn('border-primary bg-white text-primary hover:bg-background transition-colors duration-150 ease-out', UI.pillRadius)}
            aria-label="Close about drawer"
          >
            <X className="h-5 w-5 text-primary" />
          </Button>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden bg-white no-scrollbar min-h-0">
          <div className="pb-[98px] md:pb-[180px]">
            <div className="z-40 flex flex-col border-b border-border/60 bg-white px-5 pb-3 pt-6 md:sticky md:top-0 md:bg-white/95 md:px-8 md:pb-4 md:pt-8 md:backdrop-blur-md">
              <div className="mx-auto mb-4 h-1.5 w-[56px] rounded-full bg-foreground/14 md:hidden" />
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="mb-1.5 font-display text-[26px] leading-[1.05] tracking-tight text-foreground md:mb-2 md:text-[40px]">
                    About
                  </h2>
                </div>
              </div>
              <div className="hidden md:flex items-center justify-between mt-0.5 w-full">
                <p className="text-muted-foreground font-semibold text-[13px] md:text-[14px]">
                  Hotel search, with better taste.
                </p>
              </div>
            </div>

            <div className="w-full p-5 md:p-8 flex flex-col gap-8 md:gap-10 pt-4 md:pt-6">
              <div className="w-full shrink-0 flex flex-col gap-6 md:gap-8 transition-all duration-300">
                <div className="relative pl-6">
                  <div className="absolute left-0 top-1 bottom-1 w-[3px] rounded-full bg-primary opacity-80" />
                  <p className="font-serif text-[18px] italic leading-relaxed tracking-tight text-foreground md:text-[20px]">
                    "A one-person hotel project for people who want the search to feel sharper, calmer, and a little more human."
                  </p>
                </div>

                <div className="w-full shrink-0 transition-all duration-300">
                  <div className="mb-4 flex items-center gap-2">
                    <MessageSquareQuote className="h-5 w-5 shrink-0 text-primary" />
                    <h3 className="font-sans text-[18px] font-semibold text-foreground">The Context</h3>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-white divide-y divide-primary/30">
                    {principles.map(({ title, body, icon: Icon }) => (
                      <div key={title} className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background">
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col pt-0.5">
                            <span className="mb-1.5 text-[14px] font-bold leading-none text-foreground">{title}</span>
                            <span className="text-[13px] leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
                              {body}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full shrink-0 transition-all duration-300">
                  <div className="mb-4 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                    <h3 className="font-sans text-[18px] font-semibold text-foreground">Privacy and practical notes</h3>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-white divide-y divide-primary/30">
                    <div className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-primary">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col pt-0.5">
                          <span className="mb-1.5 text-[14px] font-bold leading-none text-foreground">What the app keeps</span>
                          <span className="text-[13px] leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
                            The experience is intentionally lightweight. For most users, the main data kept by the app is local preference state and saved stays stored in the browser to make revisiting easier.
                          </span>
                        </div>
                      </div>
                    </div>
                    {notes.map(({ icon: Icon, title, body }) => (
                      <div key={title} className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background">
                        <div className="flex items-start gap-4">
                          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col pt-0.5">
                            <span className="mb-1.5 text-[14px] font-bold leading-none text-foreground">{title}</span>
                            <span className="text-[13px] leading-relaxed text-muted-foreground transition-colors group-hover:text-foreground">
                              {body}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full shrink-0 transition-all duration-300">
                  <div className="mb-4 flex items-center gap-2">
                    <CircleHelp className="h-5 w-5 shrink-0 text-primary" />
                    <h3 className="font-sans text-[18px] font-semibold text-foreground">Contact</h3>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-white">
                    <div className="group flex flex-col gap-1.5 p-5 py-4 transition-colors hover:bg-background">
                      <div className="flex items-start gap-4">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center text-primary">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col pt-0.5">
                          <span className="mb-1.5 text-[14px] font-bold leading-none text-foreground">Questions, corrections, or general feedback</span>
                          <a
                            href="mailto:contact@myhotelvibe.com"
                            className="text-[13px] leading-relaxed text-primary underline-offset-4 hover:underline"
                          >
                            contact@myhotelvibe.com
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
