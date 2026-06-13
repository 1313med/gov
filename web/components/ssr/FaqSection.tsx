import FAQAccordion from "@/components/ui/FAQAccordion";

/** SSR-friendly FAQ wrapper — accordion hydrates on client. */
export default function FaqSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  return <FAQAccordion faqs={faqs} />;
}
