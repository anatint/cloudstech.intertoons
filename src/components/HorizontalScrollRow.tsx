'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

/**
 * Wraps a horizontally-scrolling row with left/right nav arrows that signal
 * "this scrolls" and let visitors click instead of dragging. Each arrow only
 * shows when there's actually more content in that direction — at the very
 * start there's nothing to scroll back to, so no left arrow, and likewise at
 * the end.
 */
export default function HorizontalScrollRow({ children, rowClassName }: { children: ReactNode; rowClassName: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Rows built with the `-mx-4 px-4` edge-peek trick rest at a non-zero
    // `scrollLeft` (the padding itself), not 0 — comparing against a fixed
    // threshold like `> 4` treated that natural resting position as "already
    // scrolled" and showed the left arrow immediately on page load. Anchor
    // to wherever the row actually starts instead of assuming it's 0.
    const restingScrollLeft = el.scrollLeft
    const update = () => {
      setCanScrollLeft(el.scrollLeft > restingScrollLeft + 4)
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const scrollByPage = (direction: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    // `px-9` reserves a dedicated blank strip on each side — wide enough
    // for the 36px button — that the row's own content never renders into.
    // A "peek" row always shows a card partly cut off right at its edge by
    // design (that's the scroll hint), so overlaying a button on top of the
    // row itself always lands on top of some card no matter how it's offset
    // or faded; only genuinely reserved, card-free space avoids that.
    <div className="relative px-9">
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByPage(-1)}
          // A plain white circle on this section's white background barely
          // read as a button at all — a visibly shaded fill (not just a
          // faint border) is what actually makes it look clickable.
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-slate-100 border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-slate-600" />
        </button>
      )}
      <div ref={ref} className={rowClassName}>
        {children}
      </div>
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByPage(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-slate-100 border border-slate-200 shadow-md flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-slate-600" />
        </button>
      )}
    </div>
  )
}
