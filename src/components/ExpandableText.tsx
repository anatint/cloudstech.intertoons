'use client'

import { useState } from 'react'

/**
 * Clamps text to 4 lines with a "More"/"Less" toggle. `line-clamp-4` is a
 * fixed literal class (not built from a prop) so Tailwind's JIT compiler can
 * statically find and generate it — a dynamic `line-clamp-${n}` string
 * wouldn't be picked up at build time.
 */
export default function ExpandableText({
  text,
  className = '',
}: {
  text: string
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)

  if (!text) return null

  return (
    <div className={className}>
      <p className={expanded ? '' : 'line-clamp-4'}>{text}</p>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setExpanded((v) => !v)
        }}
        className="mt-1 text-brand-600 font-semibold hover:text-brand-700 transition-colors"
      >
        {expanded ? 'Less' : 'More'}
      </button>
    </div>
  )
}
