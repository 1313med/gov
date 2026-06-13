/** Homepage FAQ — visible on page + matches FAQPage schema. */
import { useAppLang } from "../../context/AppLangContext";
import { defaultFaqs } from "../../seo/programmaticSeo";

export default function HomeFaqSection() {
  const { lang } = useAppLang();
  const faqs = defaultFaqs(lang, { cityName: "Maroc", intent: "rental" });

  const title =
    lang === "fr" ? "Questions fréquentes" : lang === "ar" ? "أسئلة شائعة" : "Frequently asked questions";

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 border-t border-gray-200/60 dark:border-white/10" aria-labelledby="home-faq-title">
      <h2 id="home-faq-title" className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
        {title}
      </h2>
      <dl className="space-y-4">
        {faqs.map((item) => (
          <div key={item.q} className="rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <dt className="font-medium text-gray-900 dark:text-white">{item.q}</dt>
            <dd className="mt-2 text-sm text-gray-600 dark:text-gray-400">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
