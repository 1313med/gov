export default function FaqSection({ faqs }: { faqs: { q: string; a: string }[] }) {
  if (!faqs?.length) return null;
  return (
    <section className="border-t border-gray-200 pt-8 mt-10">
      <h2 className="text-lg font-semibold mb-4">FAQ</h2>
      <dl className="space-y-4">
        {faqs.map((f) => (
          <div key={f.q}>
            <dt className="font-medium text-gray-900">{f.q}</dt>
            <dd className="text-gray-600 mt-1">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
