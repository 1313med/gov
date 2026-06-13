"use client";

import { useState } from "react";

export default function FAQAccordion({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  if (!faqs?.length) return null;

  return (
    <section className="gv-sec-sm">
      <div className="gv-ey">FAQ</div>
      <h2 className="gv-h2 mb-5">Questions fréquentes</h2>
      <div>
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="gv-faq-item">
              <button type="button" className="gv-faq-q" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                <span>{f.q}</span>
                <span className="text-[var(--gv-brand)] text-lg shrink-0">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen ? <div className="gv-faq-a">{f.a}</div> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
