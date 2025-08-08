import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Heart, MessageCircle, Bookmark, BookmarkCheck, Send, MoreHorizontal } from 'lucide-react'

/**
 * PostCard — a polished, high‑engagement travel post card.
 *
 * Drop this into: src/components/PostCard.tsx
 * Tailwind required. Framer Motion + lucide-react for micro‑interactions/icons.
 *
 * Props are framework‑agnostic so you can wire to Supabase easily.
 */
export type PostAuthor = {
  id: string
  name: string
  avatarUrl?: string | null
}

export type PostImage = {
  url: string
  alt?: string
  width?: number
  height?: number
}

export type PostLocation = {
  name: string
  lat?: number
  lng?: number
}

export type PostCardProps = {
  id: string
  title: string
  excerpt?: string
  images: PostImage[]
  author: PostAuthor
  createdAt: string | Date
  location?: PostLocation
  likeCount: number
  commentCount: number
  bookmarked?: boolean
  hasLiked?: boolean
  /**
   * Handlers are optional. If provided, card will call them optimistically.
   */
  onOpen?: (postId: string) => void
  onLikeToggle?: (postId: string, next: boolean) => Promise<void> | void
  onBookmarkToggle?: (postId: string, next: boolean) => Promise<void> | void
  onShare?: (postId: string) => void
  className?: string
}

function timeAgo(input: string | Date) {
  const d = typeof input === 'string' ? new Date(input) : input
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  const u = [
    ['y', 31536000],
    ['mo', 2592000],
    ['w', 604800],
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
  ] as const
  for (const [label, secs] of u) {
    const v = Math.floor(s / secs)
    if (v >= 1) return `${v}${label}`
  }
  return 'now'
}

export default function PostCard({
  id,
  title,
  excerpt,
  images,
  author,
  createdAt,
  location,
  likeCount,
  commentCount,
  bookmarked: initialBookmarked = false,
  hasLiked: initialLiked = false,
  onOpen,
  onLikeToggle,
  onBookmarkToggle,
  onShare,
  className = '',
}: PostCardProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [likes, setLikes] = useState(likeCount)
  const [bookmarked, setBookmarked] = useState(initialBookmarked)

  const cover = useMemo(() => images?.[0], [images])

  const handleLike = async () => {
    const next = !liked
    setLiked(next)
    setLikes((n) => n + (next ? 1 : -1))
    try {
      await onLikeToggle?.(id, next)
    } catch {
      // rollback on error
      setLiked(!next)
      setLikes((n) => n + (next ? -1 : 1))
    }
  }

  const handleBookmark = async () => {
    const next = !bookmarked
    setBookmarked(next)
    try {
      await onBookmarkToggle?.(id, next)
    } catch {
      setBookmarked(!next)
    }
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group relative overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm transition hover:shadow-lg ${className}`}
    >
      {/* Cover image */}
      {cover && (
        <button
          onClick={() => onOpen?.(id)}
          className="relative block aspect-[16/10] w-full overflow-hidden"
          aria-label={`Open ${title}`}
        >
          <img
            src={cover.url}
            alt={cover.alt ?? title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {/* Top overlays */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

          <div className="absolute left-3 top-3 flex items-center gap-2 text-white">
            {location?.name && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-1 text-xs font-medium backdrop-blur">
                <MapPin className="h-3.5 w-3.5" />
                {location.name}
              </span>
            )}
          </div>

          <div className="absolute right-3 top-3">
            <button
              type="button"
              className="inline-flex items-center rounded-full bg-black/40 p-2 text-white backdrop-blur transition hover:bg-black/60"
              aria-label="More options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex flex-col gap-1 text-white">
            <h3 className="line-clamp-2 text-balance text-lg font-semibold drop-shadow">{title}</h3>
            {excerpt && (
              <p className="line-clamp-2 text-sm opacity-90">{excerpt}</p>
            )}
          </div>
        </button>
      )}

      {/* Footer / actions */}
      <div className="flex items-center justify-between gap-3 px-3 py-3">
        <div className="flex items-center gap-3">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition active:scale-95 ${
              liked
                ? 'border-rose-200 bg-rose-50 text-rose-600'
                : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
            aria-pressed={liked}
          >
            <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
            <span>{likes}</span>
          </button>

          {/* Comments */}
          <button
            onClick={() => onOpen?.(id)}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{commentCount}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => onShare?.(id)}
            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 active:scale-95"
          >
            <Send className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition active:scale-95 ${
            bookmarked
              ? 'border-amber-200 bg-amber-50 text-amber-700'
              : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
          aria-pressed={bookmarked}
        >
          {bookmarked ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          <span>{bookmarked ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Author bar */}
      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-3 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <img
            src={author.avatarUrl ?? `https://api.dicebear.com/8.x/thumbs/svg?seed=${author.id}`}
            alt={author.name}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
            loading="lazy"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-neutral-900">{author.name}</p>
            <p className="truncate text-xs text-neutral-500">{timeAgo(createdAt)} ago</p>
          </div>
        </div>

        <button
          onClick={() => onOpen?.(id)}
          className="rounded-full bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-95"
        >
          Read trip
        </button>
      </div>
    </motion.article>
  )
}

// Optional: lightweight skeleton for loading states
export function PostCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200/70 bg-white">
      <div className="aspect-[16/10] w-full bg-neutral-200" />
      <div className="space-y-2 px-3 py-3">
        <div className="h-4 w-3/5 rounded bg-neutral-200" />
        <div className="h-3 w-4/5 rounded bg-neutral-200" />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-neutral-200" />
          <div className="space-y-1">
            <div className="h-3 w-28 rounded bg-neutral-200" />
            <div className="h-3 w-20 rounded bg-neutral-200" />
          </div>
        </div>
        <div className="h-8 w-20 rounded-full bg-neutral-200" />
      </div>
    </div>
  )
}
