'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

interface FaqBlockRendererProps {
  heading?: string
  items: Array<{ question: string; answer: any }>
}

export function FaqBlockRenderer({ heading, items }: FaqBlockRendererProps) {
  if (!items.length) return null
  return (
    <section className="py-16 bg-white">
      <div className="container max-w-3xl">
        {heading && <h2 className="mb-8 text-[38px] font-extrabold text-slate-900">{heading}</h2>}
        <Accordion type="single" collapsible>
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                {typeof item.answer === 'string' ? (
                  item.answer
                ) : (
                  <div className="prose prose-sm max-w-none text-slate-600" />
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
