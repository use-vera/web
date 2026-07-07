import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HOW_IT_WORKS_FAQS } from "@/lib/how-it-works-content";

const HowItWorksFaq = () => {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
      <div className="mb-8 flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Questions
        </span>
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
          Still wondering how it works?
        </h2>
      </div>

      <Accordion defaultValue={[0]}>
        {HOW_IT_WORKS_FAQS.map((faq, index) => (
          <AccordionItem key={faq.question} value={index}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionPanel>{faq.answer}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};

export default HowItWorksFaq;
