import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

/**
 * shadcn Accordion. Answers are force-mounted so they stay in the static HTML
 * (crawlable); a <noscript> rule in BrandOverview reveals them without JS.
 */
export default function BrandFaq({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <Accordion type="multiple" className="border bg-card px-5">
      {items.map((f, i) => (
        <AccordionItem key={i} value={`faq-${i}`}>
          <AccordionTrigger className="text-base">{f.question}</AccordionTrigger>
          <AccordionContent forceMount className="text-muted-foreground data-[state=closed]:hidden">
            {f.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
