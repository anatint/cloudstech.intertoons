import Image from 'next/image'
import Link from 'next/link'
import { Linkedin, Twitter, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Member = {
  id: string
  name: string
  slug: string
  role: string
  photo?: { url: string; alt?: string } | null
  linkedin?: string
  twitter?: string
  email?: string
}

interface TeamRendererProps {
  eyebrow?: string
  heading?: string
  members: Member[]
  showViewAll?: boolean
  viewAllLabel?: string
}

export function TeamRenderer({ eyebrow, heading, members, showViewAll, viewAllLabel }: TeamRendererProps) {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        {(eyebrow || heading) && (
          <div className="text-center mb-12">
            {eyebrow && <p className="text-[15px] font-bold uppercase tracking-[0.2em] text-brand-600 mb-3">{eyebrow}</p>}
            {heading && <h2 className="text-[38px] font-extrabold text-slate-900">{heading}</h2>}
          </div>
        )}
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
          {members.map((m) => (
            <div key={m.id} className="group flex flex-col items-center text-center">
              <div className="relative h-20 w-20 mb-3 rounded-full overflow-hidden bg-slate-100 ring-2 ring-slate-200 group-hover:ring-brand-300 transition-all">
                {m.photo ? (
                  <Image src={m.photo.url} alt={m.photo.alt || m.name} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400 font-bold text-2xl">
                    {m.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-base">{m.name}</h3>
              <p className="text-sm text-slate-500 mt-0.5">{m.role}</p>
              <div className="flex gap-2 mt-2">
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-600">
                    <Linkedin className="h-3.5 w-3.5" />
                  </a>
                )}
                {m.twitter && (
                  <a href={m.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-500">
                    <Twitter className="h-3.5 w-3.5" />
                  </a>
                )}
                {m.email && (
                  <a href={`mailto:${m.email}`} className="text-slate-400 hover:text-brand-600">
                    <Mail className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        {showViewAll && (
          <div className="mt-10 text-center">
            <Button variant="outline" asChild>
              <Link href="/about-us">{viewAllLabel || 'View The Full Team'} →</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
