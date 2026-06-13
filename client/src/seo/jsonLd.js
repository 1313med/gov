import { SITE_NAME, DEFAULT_SITE_URL, getSiteUrl } from "./seoLocales";

export function organizationJsonLd(siteUrl = DEFAULT_SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    logo: `${siteUrl}/og-default.svg`,
    description:
      "Écosystème automobile marocain : location, vente, agences et logiciel pro — car rental & marketplace Morocco.",
    areaServed: { "@type": "Country", name: "Morocco" },
    sameAs: [
      "https://www.facebook.com/goovoiture",
      "https://www.instagram.com/goovoiture",
      "https://www.linkedin.com/company/goovoiture",
    ],
  };
}

export function webSiteJsonLd(siteUrl = DEFAULT_SITE_URL) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    inLanguage: ["fr-MA", "ar-MA", "en-MA"],
    potentialAction: [
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/location-voiture?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
      {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/voiture-occasion?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    ],
  };
}

function absImage(image, siteUrl) {
  if (!image) return `${siteUrl}/og-default.svg`;
  return image.startsWith("http") ? image : `${siteUrl}${image}`;
}

export function vehicleJsonLd({
  name,
  brand,
  model,
  year,
  description,
  image,
  price,
  priceUnit = "DAY",
  currency = "MAD",
  url,
  city,
  fuel,
  transmission,
  ratingValue,
  reviewCount,
  intent = "rental",
}) {
  const siteUrl = typeof window !== "undefined" ? getSiteUrl() : DEFAULT_SITE_URL;
  const graph = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name,
    description,
    brand: brand ? { "@type": "Brand", name: brand } : undefined,
    model,
    vehicleModelDate: year ? String(year) : undefined,
    fuelType: fuel,
    vehicleTransmission: transmission,
    image: absImage(image, siteUrl),
    offers: {
      "@type": "Offer",
      price: String(price),
      priceCurrency: currency,
      availability: "https://schema.org/InStock",
      url,
      areaServed: city || "Morocco",
      ...(priceUnit === "DAY"
        ? {
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: String(price),
              priceCurrency: currency,
              unitText: "DAY",
            },
          }
        : {}),
    },
  };
  if (ratingValue && reviewCount >= 1) {
    graph.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(ratingValue),
      reviewCount: String(reviewCount),
    };
  }
  if (intent === "sale") graph.offers.itemCondition = "https://schema.org/UsedCondition";
  return graph;
}

/** @deprecated use vehicleJsonLd */
export function productJsonLd(opts) {
  return vehicleJsonLd({ ...opts, intent: "sale" });
}

export function collectionPageJsonLd({ name, url, description, items = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    url,
    description,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.slice(0, 20).map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: item.url,
        name: item.name,
      })),
    },
  };
}

export function faqPageJsonLd(faqs) {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function breadcrumbJsonLd(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function localBusinessJsonLd({ name, cityName, siteUrl, pageUrl, ratingValue, reviewCount, phone, email, address }) {
  const graph = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    name: name || `${SITE_NAME} — ${cityName}`,
    url: pageUrl,
    areaServed: cityName,
    parentOrganization: { "@type": "Organization", name: SITE_NAME, url: siteUrl },
    telephone: phone || undefined,
    email: email || undefined,
    address: address ? { "@type": "PostalAddress", addressLocality: cityName, addressCountry: "MA" } : undefined,
  };
  if (ratingValue && reviewCount >= 1) {
    graph.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(ratingValue),
      reviewCount: String(reviewCount),
    };
  }
  return graph;
}

export function autoDealerJsonLd({ name, cityName, siteUrl, pageUrl, ratingValue, reviewCount, phone, email, address }) {
  const graph = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name,
    url: pageUrl,
    areaServed: cityName,
    parentOrganization: { "@type": "Organization", name: SITE_NAME, url: siteUrl },
    telephone: phone || undefined,
    email: email || undefined,
    address: address ? { "@type": "PostalAddress", addressLocality: cityName, addressCountry: "MA" } : undefined,
  };
  if (ratingValue && reviewCount >= 1) {
    graph.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(ratingValue),
      reviewCount: String(reviewCount),
    };
  }
  return graph;
}

export function reviewJsonLd({ authorName, rating, body, datePublished, itemReviewed }) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    author: { "@type": "Person", name: authorName || "Client GoVoiture" },
    reviewRating: { "@type": "Rating", ratingValue: String(rating), bestRating: "5" },
    reviewBody: body,
    datePublished,
    itemReviewed,
  };
}

export function reviewsGraphJsonLd(reviews, itemReviewed) {
  if (!reviews?.length) return null;
  return reviews.slice(0, 5).map((r) =>
    reviewJsonLd({
      authorName: r.authorName,
      rating: r.rating,
      body: r.body,
      datePublished: r.datePublished,
      itemReviewed,
    })
  );
}

export function softwareApplicationJsonLd({ name, description, url, price, currency = "MAD" }) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    offers: price
      ? { "@type": "Offer", price: String(price), priceCurrency: currency }
      : undefined,
  };
}

export function articleJsonLd({ headline, description, url, datePublished, author = SITE_NAME }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url,
    datePublished,
    author: { "@type": "Organization", name: author },
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function personJsonLd({ name, url, jobTitle, image }) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url,
    jobTitle,
    image,
    worksFor: { "@type": "Organization", name: SITE_NAME },
  };
}

export function datasetJsonLd({ name, description, url, dateModified, variableMeasured = [] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name,
    description,
    url,
    dateModified,
    variableMeasured,
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function qaPageJsonLd({ question, answers = [], url }) {
  return {
    "@context": "https://schema.org",
    "@type": "QAPage",
    mainEntity: {
      "@type": "Question",
      name: question,
      text: question,
      answerCount: answers.length,
      acceptedAnswer: answers.find((a) => a.accepted)
        ? {
            "@type": "Answer",
            text: answers.find((a) => a.accepted).text,
            author: { "@type": "Person", name: answers.find((a) => a.accepted).authorName || SITE_NAME },
          }
        : undefined,
      suggestedAnswer: answers
        .filter((a) => !a.accepted)
        .map((a) => ({
          "@type": "Answer",
          text: a.text,
          author: { "@type": "Person", name: a.authorName || SITE_NAME },
        })),
    },
    url,
  };
}

export function carJsonLd({ name, brand, model, description, url, vehicleEngine, fuelType, numberOfSeats }) {
  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name,
    description,
    url,
    brand: { "@type": "Brand", name: brand },
    model,
    vehicleEngine,
    fuelType,
    numberOfSeats,
  };
}

export function mergeJsonLd(...graphs) {
  return graphs.filter(Boolean);
}

export function graphJsonLd(...graphs) {
  const nodes = graphs.filter(Boolean);
  if (nodes.length === 0) return null;
  if (nodes.length === 1) return nodes[0];
  return { "@context": "https://schema.org", "@graph": nodes };
}
