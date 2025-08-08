import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Clock, Heart, MessageCircle, Share2, ArrowLeft } from 'lucide-react'

/**
 * TripDetail — immersive story view for a travel post.
 */

export type TDImage = { url: string; alt?: string }
export type TDItineraryItem = {
  dayLabel: string // e.g., "Day 1"
  title?: string // e.g., "Arrival & Old Town Walk"
  description?: string
  images?: TDImage[]
}

export type TripDetailProps = {
  id: string
  title: string
  cover: TDImage
  images?: TDImage[] // additional gallery
  author: { id: string; name: string; avatarUrl?: string | null }
  createdAt: string | Date
  startDate?: string | Date
  endDate?: string | Date
  location?: { name: string; lat?: number; lng?: number }
  itinerary?: TDItineraryItem[]
  stats: { likes: number; comments: number; hasLiked?: boolean }
  onBack?: () => void
  onLikeToggle?: (id: string, next: boolean) => Promise<void> | void
  onShare?: (id: string) => void
}

function fmtDate(input?: string | Date) {
  if (!input) return undefined
  const d = typeof input === 'string' ? new Date(input) : input
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TripDetail({
  id,
  title,
  cover,
  images = [],
  author,
  createdAt,
  startDate,
  endDate,
  location,
  itinerary = [],
  stats,
  onBack,
  onLikeToggle,
  onShare,
}: TripDetailProps) {
  const dateRange = useMemo(() => {
    const s = fmtDate(startDate)
    const e = fmtDate(endDate)
    if (s && e) return `${s} — ${e}`
    return s || e || undefined
  }, [startDate, endDate])

  const hasMap = Boolean(location?.lat && location?.lng)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="relative aspect-[16/9] w-full">
          <img
            src={cover.url}
            alt={cover.alt ?? title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

          <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-3 text-white">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1.5 text-sm backdrop-blur transition hover:bg-black/60"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {location?.name && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs font-medium backdrop-blur">
                <MapPin className="h-3.5 w-3.5" /> {location.name}
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h1 className="text-balance text-2xl font-semibold drop-shadow md:text-3xl">{title}</h1>
          </div>
        </div>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src={author.avatarUrl ?? `https://api.dicebear.com/8.x/thumbs/svg?seed=${author.id}`}
              alt={author.name}
              className="h-9 w-9 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-medium text-neutral-900">{author.name}</p>
              <p className="text-xs text-neutral-500">Posted {fmtDate(createdAt)}</p>
            </div>
          </div>

          {dateRange && (
            <div className="ml-auto inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-700">
              <Calendar className="h-4 w-4" />
              <span>{dateRange}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLikeToggle?.(id, !stats.hasLiked)}
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition active:scale-95 ${
                stats.hasLiked
                  ? 'border-rose-200 bg-rose-50 text-rose-600'
                  : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <Heart className={`h-4 w-4 ${stats.hasLiked ? 'fill-current' : ''}`} />
              <span>{stats.likes}</span>
            </button>
            <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700">
              <MessageCircle className="h-4 w-4" />
              <span>{stats.comments}</span>
            </div>
          </div>

          <button
            onClick={() => onShare?.(id)}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-95"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </div>

      {/* Map + quick facts */}
      {(hasMap || dateRange) && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {hasMap && (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm md:col-span-2">
              <div className="aspect-[16/9]">
                <iframe
                  title="Map"
                  className="h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${location!.lng! - 0.1}%2C${location!.lat! - 0.1}%2C${location!.lng! + 0.1}%2C${location!.lat! + 0.1}&layer=mapnik&marker=${location!.lat!}%2C${location!.lng!}`}
                />
              </div>
            </div>
          )}

          {dateRange && (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <h3 className="mb-2 text-sm font-semibold text-neutral-900">Trip facts</h3>
              <ul className="space-y-2 text-sm text-neutral-700">
                <li className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" /> {dateRange}</li>
                {location?.name && (
                  <li className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {location.name}</li>
                )}
                <li className="inline-flex items-center gap-2"><Clock className="h-4 w-4" /> {itinerary.length} {itinerary.length === 1 ? 'day' : 'days'}</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Gallery */}
      {images.length > 0 && (
        <section className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-neutral-900">Gallery</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {images.map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <img src={img.url} alt={img.alt ?? ''} className="h-44 w-full rounded-xl object-cover" />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Itinerary */}
      {itinerary.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 text-base font-semibold text-neutral-900">Itinerary</h3>
          <ol className="space-y-3">
            {itinerary.map((item, idx) => (
              <li key={idx} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">{item.dayLabel}</div>
                {item.title && <h4 className="text-lg font-medium text-neutral-900">{item.title}</h4>}
                {item.description && <p className="mt-1 text-sm text-neutral-700">{item.description}</p>}
                {item.images && item.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {item.images.map((img, j) => (
                      <img key={j} src={img.url} alt={img.alt ?? ''} className="h-36 w-full rounded-xl object-cover" />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Comments placeholder (hook up later) */}
      <section className="mt-6">
        <h3 className="mb-3 text-base font-semibold text-neutral-900">Comments</h3>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-600 shadow-sm">
          Comment thread goes here…
        </div>
      </section>

      {/* Related trips placeholder */}
      <section className="mt-6">
        <h3 className="mb-3 text-base font-semibold text-neutral-900">Related trips</h3>
        <div className="rounded-2xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
          Show similar posts by location or tags.
        </div>
      </section>
    </div>
  )
}
