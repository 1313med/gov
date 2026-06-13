export default function JsonLd({ data }: { data: object | object[] | null }) {
  if (!data) return null;
  const payload = Array.isArray(data) ? { "@context": "https://schema.org", "@graph": data } : data;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
