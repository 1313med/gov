import type { SeoLang } from "@/lib/site";
import { getSiteUrl } from "@/lib/site";
import JsonLd from "@/components/ssr/JsonLd";
import SeoFooter from "@/components/ssr/SeoFooter";
import { buildSeoPath } from "@client-seo/seoPaths";
import { graphJsonLd, organizationJsonLd, webSiteJsonLd } from "@client-seo/jsonLd";

export function homeMetadata(lang: SeoLang) {
  if (lang === "en") {
    return {
      basePath: "/",
      title: "GoVoiture — Car rental & used cars Morocco",
      description: "Morocco's automotive ecosystem: rent, buy, sell and manage your fleet with GoVoiture Pro.",
      keywords: "car rental morocco, used cars morocco, goovoiture",
    };
  }
  if (lang === "ar") {
    return {
      basePath: "/",
      title: "GoVoiture — كراء وبيع السيارات في المغرب",
      description: "منصة السيارات في المغرب: كراء، بيع، شراء وإدارة الأسطول.",
      keywords: "كراء سيارات المغرب, سيارات مستعملة",
    };
  }
  return {
    basePath: "/",
    title: "GoVoiture — Location, occasion & écosystème auto Maroc",
    description:
      "Location de voiture, voitures d'occasion, concessionnaires et GoVoiture Pro — la plateforme automobile de référence au Maroc.",
    keywords: "location voiture maroc, voiture occasion maroc, goovoiture pro",
  };
}

export default function HomeView({ lang }: { lang: SeoLang }) {
  const siteUrl = getSiteUrl();
  const meta = homeMetadata(lang);

  return (
    <>
      <JsonLd data={graphJsonLd(organizationJsonLd(siteUrl), webSiteJsonLd(siteUrl))} />
      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-4xl font-bold mb-4">{meta.title.split("—")[0].trim()}</h1>
        <p className="text-xl text-gray-600 mb-10">{meta.description}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href={buildSeoPath(lang, "/location-voiture")} className="p-6 rounded-xl border hover:border-violet-400">
            <h2 className="font-semibold">{lang === "fr" ? "Location voiture" : "Car rental"}</h2>
            <p className="text-sm text-gray-600 mt-2">45 villes & aéroports</p>
          </a>
          <a href={buildSeoPath(lang, "/voiture-occasion")} className="p-6 rounded-xl border hover:border-violet-400">
            <h2 className="font-semibold">{lang === "fr" ? "Voiture occasion" : "Used cars"}</h2>
            <p className="text-sm text-gray-600 mt-2">{lang === "fr" ? "Acheter & vendre" : "Buy & sell"}</p>
          </a>
          <a href={buildSeoPath(lang, "/pro")} className="p-6 rounded-xl border hover:border-violet-400">
            <h2 className="font-semibold">GoVoiture Pro</h2>
            <p className="text-sm text-gray-600 mt-2">SaaS agences</p>
          </a>
          <a href={buildSeoPath(lang, "/blog")} className="p-6 rounded-xl border hover:border-violet-400">
            <h2 className="font-semibold">Blog</h2>
            <p className="text-sm text-gray-600 mt-2">{lang === "fr" ? "Guides & conseils" : "Guides"}</p>
          </a>
        </div>
      </main>
      <SeoFooter lang={lang} />
    </>
  );
}
