import React, { useEffect, useMemo, useState } from 'react';
import { Stay, TRIP_PERSONAS, BACKDROP_OPTIONS, PRICE_TIERS } from '../types';
import { fetchHotels, updateHotel, deleteHotel, insertHotel } from '../lib/api';
import { ExternalLink, CheckCircle2, AlertCircle, Link as LinkIcon, Image as ImageIcon, Sparkles, Trash2, Clock, Loader2, Edit2, Globe, Map as MapIcon, Save, ChevronDown, ChevronUp, Lock, Unlock, ChevronRight } from 'lucide-react';
import { discoverReplacementHotelDraft } from '../lib/ai';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { normalizeLocation } from '../lib/location';

interface Props {
  onClose: () => void;
}

function getRelativeTime(dateString?: string) {
  if (!dateString) return "Never saved";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Updated just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Updated ${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Updated ${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `Updated ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  return `Updated on ${date.toLocaleDateString()}`;
}

function upgradeBookingImageUrl(url: string) {
  if (!url) return url;
  
  // Booking.com image upgrade
  if (url.includes('bstatic.com') && url.includes('/images/hotel/')) {
    return url.replace(/\/images\/hotel\/[^\/]+\//i, '/images/hotel/max2000/');
  }
  
  // Expedia / Hotels.com image upgrade (replace size suffix like _y.jpg, _b.jpg, _d.jpg with _z.jpg for 1000px)
  if (url.includes('images.trvl-media.com') || url.includes('expedia.com')) {
    // If there is an impolicy query parameter, we can remove it or set a huge size, but typically we can just return it.
    // If it's a static image with a suffix:
    return url.replace(/_[a-z]\.(jpg|jpeg|png)$/i, '_z.$1');
  }

  return url;
}

function formatLocationTab(loc: string) {
  if (!loc) return "Unknown";
  
  if (loc.includes(' - ')) {
    return loc.split(' - ')[0].trim();
  }
  
  if (loc.includes(',')) {
    const parts = loc.split(',');
    return parts[parts.length - 1].trim();
  }
  
  return loc.trim();
}

function getLocationNode(loc: string, region?: string) {
  const normalized = normalizeLocation(loc, region);
  return {
    country: normalized.country,
    place: normalized.place,
  };
}

function buildBookingSearchUrl(hotel: Stay) {
  const searchQuery = `${hotel.name} ${hotel.location} site:booking.com/hotel`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}`;
}

function useLocalUpdateTracking(hotelId: string) {
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('curation_updates');
      if (stored) {
        const data = JSON.parse(stored);
        if (data[hotelId]) {
          setUpdatedAt(data[hotelId]);
        }
      }
    } catch (e) {}
  }, [hotelId]);

  const markUpdated = () => {
    const now = new Date().toISOString();
    setUpdatedAt(now);
    try {
      const stored = localStorage.getItem('curation_updates');
      const data = stored ? JSON.parse(stored) : {};
      data[hotelId] = now;
      localStorage.setItem('curation_updates', JSON.stringify(data));
    } catch (e) {}
  };

  return { updatedAt, markUpdated };
}

function HotelEditorRow({ hotel, onReload, onClose }: { hotel: Stay, onReload: () => Promise<void>, onClose: () => void }) {
  const [editImage, setEditImage] = useState(hotel.image || hotel.images?.[0] || '');
  const initialImages = hotel.images || [hotel.image].filter(Boolean);
  const [editImages, setEditImages] = useState<string[]>(Array.from({ length: 10 }, (_, i) => initialImages[i] || ''));
  const [isFetchingImages, setIsFetchingImages] = useState(false);
  const [editPersona, setEditPersona] = useState(hotel.primaryPersona || hotel.tags?.[0] || TRIP_PERSONAS[0]);
  const [editBackdrop, setEditBackdrop] = useState(hotel.primaryBackdrop || hotel.tags?.[1] || BACKDROP_OPTIONS[0]);
  const [editPriceTier, setEditPriceTier] = useState(hotel.priceTier || PRICE_TIERS[0]);
  const [editOtaUrl, setEditOtaUrl] = useState('');
  const initialYtUrls = (hotel.youtubeUrl || '').split(',').map(s => s.trim());
  const [editYoutubeUrls, setEditYoutubeUrls] = useState<string[]>(Array.from({ length: 6 }, (_, i) => initialYtUrls[i] || ''));
  const [isSaving, setIsSaving] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [justUpdated, setJustUpdated] = useState(false);
  const [isLocked, setIsLocked] = useState(hotel.is_locked || false);
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem(`hotel-expanded-${hotel.id}`) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(`hotel-expanded-${hotel.id}`, isExpanded.toString());
  }, [isExpanded, hotel.id]);

  const updatedAt = hotel.updated_at || null;


  const hasImage = !!hotel.image && !hotel.image.includes('placeholder');
  const hasLink = !!hotel.bookingUrl;

  const handleSave = async (forceLock?: boolean) => {
    setIsSaving(true);
    try {
      const finalImages = editImages.filter(Boolean);
      await updateHotel(hotel.id, {
        image: finalImages[0] || editImage,
        image2: '',
        image3: '',
        images: finalImages.length > 0 ? finalImages : [editImage].filter(Boolean),
        tags: [editPersona, editBackdrop],
        primaryPersona: editPersona,
        primaryBackdrop: editBackdrop,
        priceTier: editPriceTier,
        bookingUrl: editOtaUrl.trim() || hotel.bookingUrl || '',
        youtubeUrl: editYoutubeUrls.filter(Boolean).join(', '),
        localGems: hotel.localGems,
        updated_at: new Date().toISOString(),
        is_locked: forceLock !== undefined ? forceLock : isLocked
      });
      setJustUpdated(true);
      await onReload();
    } catch (err) {
      console.error(err);
      alert('Failed to save hotel.');
    } finally {
      setIsSaving(false);
    }
  };

  const [fetchStatus, setFetchStatus] = useState({ type: '', msg: '' });

  const handleFetchImages = async () => {
    if (!editOtaUrl) return setFetchStatus({ type: 'error', msg: 'Please provide an OTA link first' });
    setIsFetchingImages(true);
    setFetchStatus({ type: 'info', msg: 'Scraping in progress... this may take up to 20 seconds.' });
    try {
      const res = await fetch('/api/scrape-hotel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: editOtaUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch images');
      if (data.images && data.images.length > 0) {
        setEditImages(prev => {
          const newImgs = [...data.images];
          while (newImgs.length < 10) newImgs.push('');
          return newImgs.slice(0, 10);
        });
        if (data.images[0]) setEditImage(data.images[0]);
        setFetchStatus({ type: 'success', msg: `Successfully extracted ${data.images.length} images!` });
      } else {
        setFetchStatus({ type: 'error', msg: 'No images found or extraction failed.' });
      }
    } catch (err: any) {
      console.error(err);
      setFetchStatus({ type: 'error', msg: 'Error: ' + err.message });
    } finally {
      setIsFetchingImages(false);
    }
  };

  const handlePreview = async () => {
    await handleSave();
    onClose();
  };

  const handleSaveAndDone = async () => {
    setIsSaving(true);
    await handleSave(true);
    setIsLocked(true);
    setIsExpanded(false);
    setIsSaving(false);
    
    const isSupabaseUrl = (url: string) => url && url.includes('supabase.co/storage');
    const needsUpscale = editImages.some(img => img && !isSupabaseUrl(img));
    if (!needsUpscale) {
      setFetchStatus({ type: 'success', msg: 'Saved successfully!' });
      return;
    }

    // Trigger background upscaling and wait for it
    setFetchStatus({ type: 'info', msg: 'Upscaling to 5K resolution... this will take a few minutes.' });
    try {
      const res = await fetch('/api/upscale', {
        method: 'POST',
        body: JSON.stringify({ hotelId: hotel.id })
      });
      if (res.ok) {
        setFetchStatus({ type: 'success', msg: 'Upscaling complete! Images are now 5K.' });
        // Auto reload to show the new local images
        setTimeout(onReload, 2000);
      } else {
        const errorData = await res.json();
        setFetchStatus({ type: 'error', msg: `Upscale failed: ${errorData.error}` });
      }
    } catch (err) {
      console.error(err);
      setFetchStatus({ type: 'error', msg: 'Upscale request failed.' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this hotel?")) return;
    try {
      await deleteHotel(hotel.id);
      await onReload();
    } catch (err) {
      console.error(err);
      alert('Failed to delete hotel.');
    }
  };

  const handleReplace = async () => {
    setIsReplacing(true);
    try {
      const vibe = hotel.primaryPersona || hotel.tags?.[0] || TRIP_PERSONAS[0];
      const draft = await discoverReplacementHotelDraft(hotel.name, hotel.location, vibe);
      
      const finalHotel = {
        ...draft,
        id: draft.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        priceCategory: hotel.priceCategory,
        priceTier: hotel.priceTier,
        primaryPersona: hotel.primaryPersona,
        primaryBackdrop: hotel.primaryBackdrop,
        priceValue: 0,
        luxuriousValue: Math.round(Number(draft.luxuriousValue) || 0),
        distanceValue: Math.round(Number(draft.distanceValue) || 0),
        spaScore: Math.round(Number(draft.spaScore) || 0),
        tags: Array.from(new Set([vibe, ...(draft.tags || [])])),
        image: '',
        imageAlt: draft.name,
      };

      await insertHotel(finalHotel);
      if (hotel.id !== finalHotel.id) {
        await deleteHotel(hotel.id);
      }
      await onReload();
    } catch (err) {
      console.error(err);
      alert('Failed to replace hotel. Check console for details.');
    } finally {
      setIsReplacing(false);
    }
  };

  const isUpscaled = hotel.images && hotel.images.filter(Boolean).length > 0 && hotel.images.filter(Boolean).every(img => img.includes('supabase.co/storage'));

  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden mb-4 relative">
      {fetchStatus.msg && (
        <div className={`m-4 px-4 py-3 rounded-xl shadow-sm text-sm font-medium flex items-center justify-between ${fetchStatus.type === 'error' ? 'bg-red-100 text-red-700' : fetchStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
          <div className="flex items-center">
            {fetchStatus.type === 'info' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {fetchStatus.msg}
          </div>
          {(fetchStatus.type === 'error' || fetchStatus.type === 'success') && (
            <button onClick={() => setFetchStatus({ type: '', msg: '' })} className="ml-4 opacity-50 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      <div className="p-5 flex items-start justify-between gap-4 border-b border-border/60">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <a 
              href={buildBookingSearchUrl(hotel)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-lg truncate hover:text-primary hover:underline transition-colors"
              title="Find the hotel on Booking.com"
            >
              {hotel.name}
            </a>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {formatLocationTab(hotel.location)}
            </span>

          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">

            <span className="flex items-center gap-1.5 text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-medium border border-purple-100">
              {hotel.tags?.[0] || 'Vibe'}
            </span>
            {hotel.tags?.[1] && (
              <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-medium border border-amber-100">
                {hotel.tags[1]}
              </span>
            )}

            <span className={cn(
              "flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md font-medium border",
              justUpdated || (updatedAt && new Date(updatedAt).getTime() > Date.now() - 5 * 60 * 1000)
                ? "bg-green-50 text-green-700 border-green-100"
                : "bg-gray-50 text-gray-500 border-gray-200"
            )}>
              <Clock className="w-3 h-3" /> 
              {justUpdated ? "Updated just now" : getRelativeTime(updatedAt || undefined)}
            </span>
            {isUpscaled && (
              <span className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" />
                Upscaled
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handlePreview} 
            disabled={isSaving}
            size="sm"
            variant="outline"
            className="rounded-full gap-2 h-9 text-slate-700 hover:bg-slate-100"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Preview
          </Button>

          <Button 
            onClick={handleSaveAndDone} 
            disabled={isSaving}
            size="sm"
            variant="outline"
            className="rounded-full gap-2 h-9 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800"
          >
            Save & Done
          </Button>

          <Button onClick={handleDelete} variant="ghost" size="sm" className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full ml-2">
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button 
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost" 
            size="sm" 
            className="h-9 w-9 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 bg-gray-50/50">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="font-sans font-medium text-[13px] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5" /> OTA Link (Booking.com)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={editOtaUrl}
                  onChange={(e) => setEditOtaUrl(e.target.value)}
                  className="flex-1 h-10 px-3 text-sm rounded-xl border border-border/80 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder={hotel.bookingUrl || "https://www.booking.com/hotel/..."}
                />
                  <button
                    type="button"
                    onClick={handleFetchImages}
                    disabled={isFetchingImages}
                    className="flex items-center gap-2 px-4 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors border border-gray-200/50 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isFetchingImages ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                    <span>{isFetchingImages ? 'Scraping...' : 'Auto-Grab Images'}</span>
                  </button>
                </div>
                {fetchStatus.msg && (
                  <div className={`mt-2 text-sm px-3 py-2 rounded-lg ${fetchStatus.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : fetchStatus.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                    {fetchStatus.msg}
                  </div>
                )}
              </div>
            <div className="col-span-2 grid grid-cols-3 gap-3 mt-1">
              <div>
                <label className="font-sans font-medium text-[13px] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Vibe
                </label>
                <select 
                  value={editPersona}
                  onChange={(e) => setEditPersona(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-border/80 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                >
                  {TRIP_PERSONAS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="font-sans font-medium text-[13px] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <MapIcon className="w-3.5 h-3.5" /> Backdrop
                </label>
                <select 
                  value={editBackdrop}
                  onChange={(e) => setEditBackdrop(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-border/80 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                >
                  {BACKDROP_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="font-sans font-medium text-[13px] text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Price Tier
                </label>
                <select 
                  value={editPriceTier}
                  onChange={(e) => setEditPriceTier(e.target.value)}
                  className="w-full h-10 px-3 text-sm rounded-xl border border-border/80 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                >
                  {PRICE_TIERS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            
            <div className="col-span-2 mt-2">
              <label className="font-sans font-medium text-[13px] text-muted-foreground mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" /> Image Gallery & Cover Selection (Up to 10)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {editImages.map((img, i) => (
                  <div key={i} className={cn("flex flex-col gap-2 p-2 rounded-xl border transition-all", i === 0 ? "border-primary bg-primary/5" : "border-border/60 bg-muted/20")}>
                    <div className="w-full aspect-[4/5] bg-muted/40 rounded-lg overflow-hidden relative group">
                      {img ? (
                        <>
                          <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                          
                          <button
                            type="button"
                            onClick={() => {
                              const newImgs = [...editImages];
                              newImgs[i] = '';
                              setEditImages(newImgs);
                              if (img === editImage) setEditImage(newImgs.find(Boolean) || '');
                            }}
                            className="absolute top-2 left-2 p-1.5 bg-red-500/90 hover:bg-red-600 backdrop-blur-md text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            title="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {i !== 0 && (
                            <button 
                              onClick={() => {
                                const newImgs = [...editImages];
                                const temp = newImgs[0];
                                newImgs[0] = newImgs[i];
                                newImgs[i] = temp;
                                setEditImages(newImgs);
                                setEditImage(newImgs[0]);
                              }}
                              className="absolute top-2 right-2 px-2 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-[10px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Set Cover
                            </button>
                          )}
                          {i === 0 && (
                            <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Cover</div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <input 
                      type="text" 
                      value={img}
                      onChange={(e) => {
                        const newImgs = [...editImages];
                        newImgs[i] = upgradeBookingImageUrl(e.target.value);
                        setEditImages(newImgs);
                        if (i === 0) setEditImage(upgradeBookingImageUrl(e.target.value));
                      }}
                      className="w-full h-8 px-2 text-[11px] rounded-md border border-border/80 focus:ring-1 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder={`URL ${i + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
      )}
    </div>
  );
}

export default function CurationStudio({ onClose }: Props) {
  const [hotels, setHotels] = useState<Stay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCountry, setActiveCountry] = useState<string>('All');
  const [activePlace, setActivePlace] = useState<string | null>(null);
  const [expandedCountries, setExpandedCountries] = useState<Record<string, boolean>>({});

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchHotels();
      
      setHotels(prevHotels => {
        if (silent && prevHotels.length > 0) {
          const orderMap = new Map(prevHotels.map((h, i) => [h.id, i]));
          return [...data].sort((a, b) => {
            const indexA = orderMap.has(a.id) ? orderMap.get(a.id)! : 99999;
            const indexB = orderMap.has(b.id) ? orderMap.get(b.id)! : 99999;
            return indexA - indexB;
          });
        }
        
        return [...data].sort((a, b) => {
          const aNeedsWork = !a.image || !a.bookingUrl;
          const bNeedsWork = !b.image || !b.bookingUrl;
          if (aNeedsWork && !bNeedsWork) return -1;
          if (!aNeedsWork && bNeedsWork) return 1;
          return 0;
        });
      });
    } catch (error) {
      console.error(error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const locationTree = useMemo(() => {
    const tree = new Map<string, Map<string, Stay[]>>();

    hotels.forEach((hotel) => {
      const { country, place } = getLocationNode(hotel.location, hotel.region);
      if (!tree.has(country)) tree.set(country, new Map());
      const placeMap = tree.get(country)!;
      if (!placeMap.has(place)) placeMap.set(place, []);
      placeMap.get(place)!.push(hotel);
    });

    return Array.from(tree.entries())
      .map(([country, placesMap]) => {
        const places = Array.from(placesMap.entries())
          .map(([place, stays]) => ({
            place,
            hotels: stays,
            isComplete: stays.length > 0 && stays.every((h) => !!h.image && !h.image.includes('placeholder') && !!h.bookingUrl),
          }))
          .sort((a, b) => a.place.localeCompare(b.place));

        const countryHotels = places.flatMap((entry) => entry.hotels);

        return {
          country,
          places,
          hotels: countryHotels,
          isComplete: countryHotels.length > 0 && countryHotels.every((h) => !!h.image && !h.image.includes('placeholder') && !!h.bookingUrl),
        };
      })
      .sort((a, b) => a.country.localeCompare(b.country));
  }, [hotels]);

  useEffect(() => {
    setExpandedCountries((prev) => {
      const next = { ...prev };
      locationTree.forEach(({ country }) => {
        if (next[country] === undefined) next[country] = false;
      });
      return next;
    });
  }, [locationTree]);

  const filteredHotels = hotels.filter((hotel) => {
    if (activeCountry === 'All') return true;
    const node = getLocationNode(hotel.location, hotel.region);
    if (node.country !== activeCountry) return false;
    if (!activePlace) return true;
    return node.place === activePlace;
  });

  const activeLabel =
    activeCountry === 'All'
      ? 'All hotels'
      : activePlace
        ? `${activePlace}, ${activeCountry}`
        : activeCountry;

  const toggleCountry = (country: string) => {
    setExpandedCountries((prev) => ({ ...prev, [country]: !prev[country] }));
  };


  return (
    <div className="h-full overflow-y-auto bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-border/60 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Curation Studio</h1>
          <p className="text-sm text-muted-foreground">Manage AI drafts and inject legal assets.</p>
        </div>
        <Button onClick={onClose} variant="outline" className="rounded-full">
          Back to App
        </Button>
      </header>

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="h-fit rounded-2xl border border-primary/20 bg-white p-4 lg:sticky lg:top-24">
                <div className="mb-4">
                  <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-primary">Location Tree</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Browse by country, then drill into the places within each market.</p>
                </div>

                <button
                  onClick={() => {
                    setActiveCountry('All');
                    setActivePlace(null);
                  }}
                  className={cn(
                    'mb-3 flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors',
                    activeCountry === 'All'
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border/60 bg-white text-foreground hover:bg-gray-50'
                  )}
                >
                  <span className="font-semibold">All hotels</span>
                  <span className={cn('text-xs font-semibold', activeCountry === 'All' ? 'text-primary-foreground/85' : 'text-muted-foreground')}>
                    {hotels.length}
                  </span>
                </button>

                <div className="space-y-2">
                  {locationTree.map(({ country, places, hotels: countryHotels, isComplete }) => {
                    const isCountryActive = activeCountry === country && !activePlace;
                    const isExpanded = expandedCountries[country];

                    return (
                      <div key={country} className="rounded-xl border border-border/50 bg-white">
                        <div className="flex items-stretch">
                          <button
                            type="button"
                            onClick={() => toggleCountry(country)}
                            className="flex items-center px-3 text-muted-foreground hover:text-foreground"
                            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${country}`}
                          >
                            <ChevronRight className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveCountry(country);
                              setActivePlace(null);
                              if (!isExpanded) toggleCountry(country);
                            }}
                            className={cn(
                              'flex min-w-0 flex-1 items-center justify-between rounded-r-xl px-3 py-2.5 text-left transition-colors',
                              isCountryActive
                                ? (isComplete ? 'bg-green-600 text-white' : 'bg-primary text-primary-foreground')
                                : isComplete
                                  ? 'bg-green-50 text-green-800 hover:bg-green-100'
                                  : 'hover:bg-gray-50'
                            )}
                          >
                            <span className="truncate font-semibold">{country}</span>
                            <span className={cn('ml-3 text-xs font-semibold', isCountryActive ? 'text-current/85' : isComplete ? 'text-green-800/80' : 'text-muted-foreground')}>
                              {countryHotels.length}
                            </span>
                          </button>
                        </div>

                        {isExpanded ? (
                          <div className="border-t border-border/40 px-2 py-2">
                            <div className="space-y-1">
                              {places.map(({ place, hotels: placeHotels, isComplete: placeComplete }) => {
                                const isPlaceActive = activeCountry === country && activePlace === place;
                                return (
                                  <button
                                    key={place}
                                    type="button"
                                    onClick={() => {
                                      setActiveCountry(country);
                                      setActivePlace(place);
                                    }}
                                    className={cn(
                                      'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                                      isPlaceActive
                                        ? (placeComplete ? 'bg-green-50 text-green-800' : 'bg-primary/10 text-primary')
                                        : placeComplete
                                          ? 'bg-green-50 text-green-800 hover:bg-green-100'
                                          : 'text-muted-foreground hover:bg-gray-50 hover:text-foreground'
                                    )}
                                  >
                                    <span className="truncate">{place}</span>
                                    <span className={cn('ml-3 text-xs font-semibold', isPlaceActive ? 'text-current/80' : placeComplete ? 'text-green-800/80' : 'text-muted-foreground')}>
                                      {placeHotels.length}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </aside>

              <section>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold tracking-tight text-foreground">{activeLabel}</h2>
                    <p className="text-sm text-muted-foreground">
                      {filteredHotels.length} hotel{filteredHotels.length === 1 ? '' : 's'} in this view.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {filteredHotels.map(hotel => (
                    <HotelEditorRow key={hotel.id} hotel={hotel} onReload={() => loadData(true)} onClose={onClose} />
                  ))}

                  {hotels.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border text-muted-foreground">
                      No hotels found in the database. Run the AI curator!
                    </div>
                  )}
                  {hotels.length > 0 && filteredHotels.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border text-muted-foreground">
                      No hotels found in {activeLabel}.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
