import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'

export const revalidate = false

const CAREERS_URL = 'https://in.indeed.com/cmp/Intertoons-Internet-Services-Pvt.ltd./jobs'

export function generateMetadata(): Metadata {
  const title = 'Careers - Intertoons Internet Services Pvt.Ltd.'
  const description =
    "At Intertoons, we are passionate about innovation and excellence in web and app development. We are looking for talented individuals who thrive in a dynamic environment and love creating impactful digital solutions. If you're ready to grow your career with a team of experts, explore our exciting opportunities today!"
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: '/careers' },
    openGraph: { title, description },
  }
}

export default function CareersPage() {
  return (
    <section className="bg-[#050B2A] relative overflow-hidden pt-28 pb-24 sm:pt-32 lg:pt-40 lg:pb-32 min-h-[70vh] flex items-center">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute left-1/2 -translate-x-1/2 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-b from-brand-600/25 to-transparent" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle,#3B73F6 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="container relative z-10 text-center max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-400 mb-4">
          Join Our Team
        </p>
        <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl text-white leading-tight">
          Build the future with <span className="text-brand-400">Intertoons</span>
        </h1>
        <p className="mt-6 text-base font-inter text-blue-200 leading-relaxed max-w-xl mx-auto">
          At Intertoons, we are passionate about innovation and excellence in web and app development. We are looking
          for talented individuals who thrive in a dynamic environment and love creating impactful digital
          solutions. If you&apos;re ready to grow your career with a team of experts, explore our exciting
          opportunities today!
        </p>
        <div className="mt-8">
          <a
            href={CAREERS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base transition-colors"
          >
            View our Opening <ArrowRight className="h-4 w-4 shrink-0" />
          </a>
        </div>
      </div>
    </section>
  )
}
