import { Accordion, AccordionItem, AccordionPanel, AccordionTrigger } from "@/components/ui/accordion";
import DisplayHeading, { Eyebrow } from "@/components/vera/display-heading";

interface FaqSectionProps {
  lead: string;
  accent: string;
  items: { question: string; answer: string }[];
}

/** Questions in the app's voice: the heading on the left, the answers on hairlines beside it. */
const FaqSection = ({ lead, accent, items }: FaqSectionProps) => (
  <section className="mx-auto flex max-w-[1240px] flex-wrap gap-[clamp(32px,5vw,64px)] px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,96px)]">
    <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-5">
      <Eyebrow>Questions</Eyebrow>
      <DisplayHeading lead={lead} accent={accent} breakBeforeAccent className="text-[clamp(40px,5vw,72px)]" />
    </div>
    <Accordion defaultValue={[0]} className="min-w-0 flex-[1.4_1_480px] border-t border-border">
      {items.map((faq, index) => (
        <AccordionItem key={faq.question} value={index}>
          <AccordionTrigger className="py-6 text-lg">{faq.question}</AccordionTrigger>
          <AccordionPanel className="text-base leading-relaxed text-muted-foreground">{faq.answer}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  </section>
);

export default FaqSection;
