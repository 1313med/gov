/** Legal copy — Terms of Service & Privacy Policy (fr / en / ar). */

const CONTACT = {
  fr: "contact@goovoiture.ma",
  en: "contact@goovoiture.ma",
  ar: "contact@goovoiture.ma",
};

export const LEGAL_PAGES = {
  terms: {
    path: "/conditions-utilisation",
    copy: {
      fr: {
        kicker: "Mentions légales",
        title: "Conditions d'utilisation",
        intro:
          "Les présentes conditions régissent l'accès et l'utilisation de Goovoiture (goovoiture.ma), plateforme marocaine de location de voitures, vente automobile d'occasion et outils « Mon Garage ». En créant un compte ou en utilisant le service, vous acceptez ces conditions.",
        updated: "Dernière mise à jour : 12 juin 2026",
        contactTitle: "Nous contacter",
        contact: `Pour toute question relative à ces conditions :\n${CONTACT.fr}`,
        backHome: "← Retour à l'accueil",
        otherLink: "Politique de confidentialité →",
        sections: [
          {
            title: "1. Qui sommes-nous",
            body:
              "Goovoiture (« nous », « la plateforme ») exploite un service en ligne au Maroc permettant aux utilisateurs de publier et consulter des annonces de vente, de réserver des véhicules en location, de gérer leur parc automobile (Mon Garage) et d'échanger via une messagerie intégrée. Goovoiture est une place de marché et un intermédiaire technique : nous ne sommes ni concessionnaire, ni assureur, ni établissement de crédit.",
          },
          {
            title: "2. Éligibilité et compte",
            list: [
              "Vous devez avoir au moins 18 ans et la capacité juridique de contracter au Maroc.",
              "L'inscription requiert un numéro de téléphone valide, un mot de passe et le choix d'un profil (client, propriétaire vendeur, loueur ou les deux).",
              "Vous vous engagez à fournir des informations exactes et à les maintenir à jour (nom, ville, e-mail, documents d'identité).",
              "Vous êtes responsable de la confidentialité de vos identifiants et de toute activité réalisée depuis votre compte.",
            ],
          },
          {
            title: "3. Vérification d'identité (CIN, permis)",
            body:
              "Pour publier une annonce de vente, proposer une location ou réserver certains véhicules, nous pouvons exiger la vérification de votre carte nationale d'identité (CIN) et/ou de votre permis de conduire. Les scans sont traités conformément à notre politique de confidentialité. Goovoiture peut refuser, suspendre ou retirer un compte dont les documents sont incomplets, falsifiés ou non conformes.",
          },
          {
            title: "4. Annonces et contenus utilisateurs",
            list: [
              "Les vendeurs et loueurs sont seuls responsables du contenu de leurs annonces (description, prix en MAD, photos, disponibilité, état du véhicule).",
              "Sont interdits : annonces frauduleuses, véhicules volés, contenus illicites, discriminatoires, trompeurs ou portant atteinte aux droits de tiers.",
              "Les annonces approuvées peuvent être visibles publiquement (moteur de recherche, réseaux sociaux).",
              "Nous nous réservons le droit de modérer, refuser ou retirer toute annonce ou message sans préavis en cas de violation des présentes conditions.",
            ],
          },
          {
            title: "5. Location de véhicules",
            list: [
              "Une réservation lie le client et le loueur. Goovoiture facilite la mise en relation, le suivi des dates, du statut et des échanges, mais n'est pas partie au contrat de location entre les utilisateurs.",
              "Le client doit disposer d'un permis valide et respecter les conditions fixées par le loueur (carburant, kilométrage, assurance, caution, etc.).",
              "Annulation remboursable : selon les règles affichées sur la plateforme, une annulation en ligne peut être possible plus de 48 h avant la prise en charge, ou si la date de départ est à au moins deux jours calendaires ; des frais de 4 % peuvent être retenus sur le montant déjà réglé.",
              "Un changement de dates peut être autorisé une seule fois tant que le véhicule est disponible ; après ce changement, l'annulation en ligne peut ne plus être disponible.",
              "À moins de 24 h de la prise en charge, l'annulation n'est en principe pas remboursable.",
              "Les états des lieux (photos, checklist) et documents liés à une location doivent refléter la réalité au moment de la remise et du retour.",
            ],
          },
          {
            title: "6. Vente de véhicules",
            body:
              "Les transactions d'achat/vente se concluent directement entre acheteur et vendeur. Goovoiture ne garantit pas l'état mécanique, juridique ou administratif d'un véhicule (mutation à la préfecture, gage, contrôle technique, etc.). Les parties doivent effectuer les vérifications nécessaires avant tout paiement ou transfert de propriété.",
          },
          {
            title: "7. Paiements",
            body:
              "Les montants sont exprimés en dirhams marocains (MAD). Selon les fonctionnalités disponibles, la plateforme peut permettre au loueur d'indiquer qu'une réservation est payée ou non. Sauf mention contraire explicite, Goovoiture ne traite pas les paiements par carte sur le site : le règlement peut intervenir directement entre utilisateurs (espèces, virement, autre moyen convenu). Toute offre de crédit, d'assurance ou d'estimation (simulateur budget, vérification solvabilité, valeur reprise) est fournie à titre informatif sans garantie de résultat.",
          },
          {
            title: "8. Mon Garage et outils",
            body:
              "Les rappels d'échéances (assurance, visite technique, vidange…), estimations, comparatifs carburant, guides d'urgence et autres outils Mon Garage sont des aides à la gestion personnelle. Ils ne remplacent pas un professionnel (garagiste, assureur, expert). Vous restez seul responsable de l'entretien légal et sécuritaire de votre véhicule.",
          },
          {
            title: "9. Messagerie, avis et conduite",
            list: [
              "La messagerie interne sert à organiser locations et ventes. Harcèlement, spam, contenus illégaux ou tentative de fraude sont interdits.",
              "Les avis et retours après location doivent être honnêtes et fondés sur une expérience réelle.",
              "Le programme de parrainage (codes, crédits MAD) est soumis aux règles affichées dans l'application et peut être modifié ou suspendu.",
            ],
          },
          {
            title: "10. Propriété intellectuelle",
            body:
              "La marque Goovoiture, le design du site, les textes et éléments graphiques nous appartiennent ou sont licenciés. Vous conservez vos droits sur le contenu que vous publiez, mais nous accordez une licence non exclusive pour l'afficher, le promouvoir et l'héberger dans le cadre du service.",
          },
          {
            title: "11. Responsabilité",
            body:
              "Dans les limites autorisées par la loi marocaine, Goovoiture n'est pas responsable des dommages indirects, des litiges entre utilisateurs, des accidents, vols, pannes, pertes financières liées à une transaction hors plateforme, ni des interruptions temporaires du service. Notre responsabilité totale, le cas échéant, est limitée au montant des sommes que vous nous avez versées au cours des douze (12) derniers mois pour des services payants directement facturés par Goovoiture (le cas échéant).",
          },
          {
            title: "12. Suspension et résiliation",
            body:
              "Vous pouvez fermer votre compte en nous contactant. Nous pouvons suspendre ou résilier un compte en cas de violation des présentes conditions, de risque pour la sécurité des utilisateurs ou sur demande des autorités compétentes.",
          },
          {
            title: "13. Droit applicable et litiges",
            body:
              "Les présentes conditions sont régies par le droit marocain. En cas de litige, les parties rechercheront une solution amiable. À défaut, les tribunaux du Royaume du Maroc seront seuls compétents, sous réserve des règles impératives de protection des consommateurs.",
          },
          {
            title: "14. Modifications",
            body:
              "Nous pouvons mettre à jour ces conditions. La date de dernière mise à jour figure en tête de page. L'utilisation continue du service après publication vaut acceptation des modifications, sauf opposition manifeste dans un délai raisonnable.",
          },
        ],
      },
      en: {
        kicker: "Legal",
        title: "Terms of Service",
        intro:
          "These terms govern access to and use of Goovoiture (goovoiture.ma), a Moroccan platform for car rentals, used-car sales, and « My Garage » vehicle tools. By creating an account or using the service, you agree to these terms.",
        updated: "Last updated: 12 June 2026",
        contactTitle: "Contact us",
        contact: `Questions about these terms:\n${CONTACT.en}`,
        backHome: "← Back to home",
        otherLink: "Privacy Policy →",
        sections: [
          {
            title: "1. Who we are",
            body:
              "Goovoiture (« we », « the platform ») operates an online service in Morocco allowing users to publish and browse sale listings, book rental vehicles, manage their car (My Garage), and communicate via in-app messaging. Goovoiture is a marketplace and technical intermediary — we are not a car dealer, insurer, or credit institution.",
          },
          {
            title: "2. Eligibility and account",
            list: [
              "You must be at least 18 years old and legally able to contract in Morocco.",
              "Registration requires a valid phone number, password, and profile choice (customer, car owner/seller, rental owner, or combined).",
              "You agree to provide accurate information and keep it up to date (name, city, email, identity documents).",
              "You are responsible for safeguarding your credentials and all activity on your account.",
            ],
          },
          {
            title: "3. Identity verification (CIN, driving licence)",
            body:
              "To publish a sale listing, offer a rental, or book certain vehicles, we may require verification of your national ID (CIN) and/or driving licence. Scans are processed per our Privacy Policy. Goovoiture may refuse, suspend, or remove accounts with incomplete, forged, or non-compliant documents.",
          },
          {
            title: "4. Listings and user content",
            list: [
              "Sellers and rental owners are solely responsible for listing content (description, MAD price, photos, availability, vehicle condition).",
              "Prohibited: fraudulent listings, stolen vehicles, illegal, discriminatory, misleading content, or infringement of third-party rights.",
              "Approved listings may be publicly visible (search engines, social sharing).",
              "We may moderate, refuse, or remove any listing or message without notice if these terms are violated.",
            ],
          },
          {
            title: "5. Vehicle rentals",
            list: [
              "A booking creates a relationship between customer and rental owner. Goovoiture facilitates matching, dates, status, and messaging but is not a party to the rental contract between users.",
              "Customers must hold a valid licence and comply with the owner's terms (fuel, mileage, insurance, deposit, etc.).",
              "Refundable cancellation: per on-platform rules, online cancellation may be available more than 48 hours before pickup, or when pickup is at least two calendar days away; a 4% fee may apply to amounts already paid.",
              "Date changes may be allowed once while the vehicle is available; after that change, online cancellation may no longer be available.",
              "Within 24 hours of pickup, cancellation is generally non-refundable.",
              "Condition reports (photos, checklists) and rental documents must reflect the vehicle's actual state at handover and return.",
            ],
          },
          {
            title: "6. Vehicle sales",
            body:
              "Purchase/sale transactions are concluded directly between buyer and seller. Goovoiture does not guarantee a vehicle's mechanical, legal, or administrative status (title transfer at préfecture, liens, technical inspection, etc.). Parties must perform due diligence before payment or ownership transfer.",
          },
          {
            title: "7. Payments",
            body:
              "Amounts are in Moroccan dirhams (MAD). Depending on available features, the platform may let rental owners mark a booking as paid or unpaid. Unless explicitly stated otherwise, Goovoiture does not process card payments on the site — settlement may occur directly between users (cash, transfer, or other agreed means). Credit, insurance, or valuation tools (budget simulator, credit check, trade-in estimate) are informational only with no guaranteed outcome.",
          },
          {
            title: "8. My Garage and tools",
            body:
              "Deadline reminders (insurance, technical inspection, oil change…), estimates, fuel comparisons, emergency guides, and other My Garage tools are personal management aids. They do not replace a professional (mechanic, insurer, expert). You remain solely responsible for legal and safe maintenance of your vehicle.",
          },
          {
            title: "9. Messaging, reviews, and conduct",
            list: [
              "In-app messaging is for organizing rentals and sales. Harassment, spam, illegal content, or fraud attempts are prohibited.",
              "Post-rental reviews must be honest and based on a real experience.",
              "The referral programme (codes, MAD credits) is subject to in-app rules and may be changed or suspended.",
            ],
          },
          {
            title: "10. Intellectual property",
            body:
              "The Goovoiture brand, site design, text, and graphics belong to us or our licensors. You retain rights to content you publish but grant us a non-exclusive licence to display, promote, and host it to operate the service.",
          },
          {
            title: "11. Liability",
            body:
              "To the extent permitted by Moroccan law, Goovoiture is not liable for indirect damages, disputes between users, accidents, theft, breakdowns, financial losses from off-platform transactions, or temporary service interruptions. Our total liability, if any, is limited to fees you paid us in the last twelve (12) months for paid services billed directly by Goovoiture (if applicable).",
          },
          {
            title: "12. Suspension and termination",
            body:
              "You may close your account by contacting us. We may suspend or terminate accounts for breach of these terms, user safety risks, or competent authority requests.",
          },
          {
            title: "13. Governing law and disputes",
            body:
              "These terms are governed by Moroccan law. Parties will seek an amicable solution first. Failing that, courts of the Kingdom of Morocco have exclusive jurisdiction, subject to mandatory consumer protection rules.",
          },
          {
            title: "14. Changes",
            body:
              "We may update these terms. The last-updated date appears at the top. Continued use after publication constitutes acceptance unless you object within a reasonable time.",
          },
        ],
      },
      ar: {
        kicker: "قانوني",
        title: "شروط الخدمة",
        intro:
          "تحكم هذه الشروط الوصول إلى واستخدام Goovoiture (goovoiture.ma)، منصة مغربية لتأجير السيارات وبيع السيارات المستعملة وأدوات « المرآب ». بإنشاء حساب أو استخدام الخدمة، فإنك توافق على هذه الشروط.",
        updated: "آخر تحديث: 12 يونيو 2026",
        contactTitle: "اتصل بنا",
        contact: `أسئلة حول هذه الشروط:\n${CONTACT.ar}`,
        backHome: "← العودة للرئيسية",
        otherLink: "سياسة الخصوصية →",
        sections: [
          {
            title: "1. من نحن",
            body:
              "Goovoiture (« نحن »، « المنصة ») تدير خدمة إلكترونية في المغرب تتيح نشر واستعراض إعلانات البيع، حجز السيارات للإيجار، إدارة مركبتك (المرآب)، والتواصل عبر رسائل داخلية. Goovoiture سوق إلكتروني ووسيط تقني — لسنا وكالة سيارات ولا شركة تأمين ولا مؤسسة ائتمان.",
          },
          {
            title: "2. الأهلية والحساب",
            list: [
              "يجب أن يكون عمرك 18 سنة على الأقل ولديك أهلية التعاقد في المغرب.",
              "التسجيل يتطلب رقم هاتف صالح وكلمة مرور واختيار ملف (عميل، مالك سيارة/بائع، مؤجر، أو مجتمع).",
              "تلتزم بتقديم معلومات دقيقة وتحديثها (الاسم، المدينة، البريد، وثائق الهوية).",
              "أنت مسؤول عن حماية بيانات الدخول وكل نشاط على حسابك.",
            ],
          },
          {
            title: "3. التحقق من الهوية (البطاقة الوطنية، الرخصة)",
            body:
              "لنشر إعلان بيع أو عرض تأجير أو حجز بعض المركبات، قد نطلب التحقق من البطاقة الوطنية (CIN) و/أو رخصة السياقة. تُعالج المسحات وفق سياسة الخصوصية. يجوز لنا رفض أو تعليق أو حذف حسابات ذات وثائق ناقصة أو مزورة.",
          },
          {
            title: "4. الإعلانات ومحتوى المستخدم",
            list: [
              "البائعون والمؤجرون وحدهم مسؤولون عن محتوى إعلاناتهم (الوصف، السعر بالدرهم، الصور، التوفر، حالة المركبة).",
              "محظور: إعلانات احتيالية، مركبات مسروقة، محتوى غير قانوني أو مضلل أو ينتهك حقوق الغير.",
              "الإعلانات المعتمدة قد تكون ظاهرة للعموم (محركات البحث).",
              "يجوز لنا إزالة أي إعلان أو رسالة دون إشعار عند مخالفة الشروط.",
            ],
          },
          {
            title: "5. تأجير المركبات",
            list: [
              "الحجز يربط العميل والمؤجر. Goovoiture تسهّل الربط والتواريخ والحالة والرسائل لكنها ليست طرفاً في عقد الإيجار بين المستخدمين.",
              "يجب على العميل امتلاك رخصة سارية والالتزام بشروط المؤجر (الوقود، الكيلومترات، التأمين، الضمان…).",
              "إلغاء قابل للاسترداد: حسب القواعد المعروضة، قد يكون الإلغاء عبر الإنترنت ممكناً قبل أكثر من 48 ساعة من الاستلام، أو إذا كان موعد الاستلام بعد يومين تقويميين على الأقل؛ قد تُخصم رسوم 4٪ من المبلغ المدفوع.",
              "تغيير التاريخ مسموح مرة واحدة إذا كانت المركبة متاحة؛ بعدها قد لا يتوفر الإلغاء عبر الإنترنت.",
              "خلال 24 ساعة من الاستلام، الإلغاء غير قابل للاسترداد عادةً.",
              "تقارير الحالة والصور يجب أن تعكس الواقع عند التسليم والإرجاع.",
            ],
          },
          {
            title: "6. بيع المركبات",
            body:
              "صفقات البيع تتم مباشرة بين المشتري والبائع. Goovoiture لا تضمن الحالة الميكانيكية أو القانونية للمركبة (نقل الملكية، الرهن، الفحص التقني…). يجب على الطرفين التحقق قبل أي دفع.",
          },
          {
            title: "7. المدفوعات",
            body:
              "المبالغ بالدرهم المغربي (MAD). حسب الميزات المتاحة، قد يحدد المؤجر ما إذا كان الحجز مدفوعاً. ما لم يُذكر خلاف ذلك، Goovoiture لا تعالج بطاقات الدفع على الموقع — الدفع قد يتم مباشرة بين المستخدمين. أدوات التقدير والائتمان إعلامية فقط.",
          },
          {
            title: "8. المرآب والأدوات",
            body:
              "تذكيرات المواعيد (التأمين، الفحص التقني، الزيت…) والتقديرات وأدلة الطوارئ أدوات مساعدة شخصية ولا تغني عن محترف. أنت مسؤول عن صيانة مركبتك القانونية والآمنة.",
          },
          {
            title: "9. الرسائل والسلوك",
            list: [
              "الرسائل الداخلية لتنظيم الإيجار والبيع. التحرش والاحتيال محظوران.",
              "التقييمات يجب أن تكون صادقة ومبنية على تجربة حقيقية.",
              "برنامج الإحالة يخضع لقواعد التطبيق وقد يُعدّل أو يُوقف.",
            ],
          },
          {
            title: "10. الملكية الفكرية",
            body:
              "علامة Goovoiture وتصميم الموقع ملك لنا أو مرخص لنا. تحتفظ بحقوق محتواك المنشور وتمنحنا ترخيصاً غير حصري لعرضه ضمن الخدمة.",
          },
          {
            title: "11. المسؤولية",
            body:
              "في حدود القانون المغربي، Goovoiture غير مسؤولة عن أضرار غير مباشرة أو نزاعات بين المستخدمين أو حوادث أو خسائر مالية من معاملات خارج المنصة. مسؤوليتنا الإجمالية محدودة بما دفعته لنا خلال 12 شهراً لخدمات مدفوعة مباشرة (إن وُجدت).",
          },
          {
            title: "12. التعليق والإنهاء",
            body:
              "يمكنك إغلاق حسابك بالتواصل معنا. يجوز لنا تعليق أو إنهاء حساب عند مخالفة الشروط أو لأسباب أمنية.",
          },
          {
            title: "13. القانون الواجب والنزاعات",
            body:
              "تخضع الشروط للقانون المغربي. يُرجى السعي لحل ودي أولاً. وإلا تختص المحاكم المغربية.",
          },
          {
            title: "14. التعديلات",
            body:
              "قد نحدّث هذه الشروط. الاستمرار في الاستخدام بعد النشر يعني القبول ما لم تعترض في مهلة معقولة.",
          },
        ],
      },
    },
  },

  privacy: {
    path: "/politique-confidentialite",
    copy: {
      fr: {
        kicker: "Données personnelles",
        title: "Politique de confidentialité",
        intro:
          "Goovoiture s'engage à protéger vos données personnelles conformément à la loi marocaine n° 09-08 relative à la protection des personnes physiques à l'égard du traitement des données à caractère personnel. Cette politique explique quelles données nous collectons, pourquoi, et quels sont vos droits.",
        updated: "Dernière mise à jour : 12 juin 2026",
        contactTitle: "Exercer vos droits",
        contact: `Pour toute demande d'accès, rectification ou suppression :\n${CONTACT.fr}\nObjet : « Données personnelles »`,
        backHome: "← Retour à l'accueil",
        otherLink: "Conditions d'utilisation →",
        sections: [
          {
            title: "1. Responsable du traitement",
            body:
              "Le responsable du traitement est Goovoiture, exploité via le site goovoiture.ma. Pour les questions relatives à vos données, contactez-nous à l'adresse indiquée ci-dessous.",
          },
          {
            title: "2. Données que nous collectons",
            list: [
              "Compte : nom, numéro de téléphone, mot de passe (stocké de manière sécurisée côté serveur), ville, rôle(s), photo de profil.",
              "Profil : adresse e-mail, biographie, préférences de langue et de thème.",
              "Identité : numéro de CIN, numéro de permis, dates d'expiration, scans/photos de ces documents (téléversés via notre prestataire d'hébergement de fichiers).",
              "Annonces : caractéristiques du véhicule, prix, ville, description, photos et vidéos.",
              "Location : dates de réservation, montants en MAD, statut (en attente, confirmé, annulé, terminé), avis, photos d'état des lieux, documents contractuels.",
              "Mon Garage : marque, modèle, kilométrage, dates d'entretien (assurance, visite technique, vignette, vidange…), journaux carburant, documents scannés (carte grise, assurance…).",
              "Messagerie : contenu des échanges entre utilisateurs, liés à une annonce.",
              "Parrainage : code de parrainage, crédits MAD, statistiques d'invitation.",
              "Vérification solvabilité (si utilisé) : immatriculation, marque/modèle, informations fournies pour analyse manuelle.",
              "Technique : identifiant de session (cookie httpOnly), informations stockées localement dans votre navigateur (profil simplifié), journaux serveur, adresse IP, type d'appareil.",
            ],
          },
          {
            title: "3. Finalités du traitement",
            list: [
              "Créer et gérer votre compte, authentifier vos connexions.",
              "Publier et afficher des annonces, traiter les réservations et notifications.",
              "Vérifier l'identité des vendeurs, loueurs et clients (lutte contre la fraude).",
              "Fournir la messagerie, les alertes en temps réel et les rappels Mon Garage.",
              "Améliorer la sécurité, la modération et le support utilisateur.",
              "Respecter nos obligations légales et répondre aux autorités compétentes.",
            ],
          },
          {
            title: "4. Bases légales",
            body:
              "Nous traitons vos données sur la base de : (i) l'exécution du contrat lorsque vous utilisez nos services ; (ii) votre consentement pour certains documents et communications ; (iii) notre intérêt légitime à sécuriser la plateforme, prévenir la fraude et améliorer le service ; (iv) le respect d'obligations légales.",
          },
          {
            title: "5. Destinataires et sous-traitants",
            list: [
              "Hébergement du site et de l'API (serveurs cloud).",
              "Cloudinary (daqihsmib) — hébergement des images et documents que vous téléversez ; serveurs pouvant être situés hors du Maroc.",
              "Connexion temps réel (WebSocket / socket.io) pour messages et notifications.",
              "Autres utilisateurs — lorsque vous publiez une annonce, réservez ou échangez des messages, certaines informations (nom, ville, téléphone selon les fonctionnalités) sont visibles par la contrepartie.",
              "Autorités publiques — si la loi l'exige.",
            ],
          },
          {
            title: "6. Transferts internationaux",
            body:
              "Certains prestataires (notamment Cloudinary) peuvent traiter des données en dehors du Maroc. Nous veillons à ce que des garanties appropriées soient en place (clauses contractuelles, mesures de sécurité) conformément à la réglementation applicable.",
          },
          {
            title: "7. Durée de conservation",
            body:
              "Nous conservons vos données tant que votre compte est actif, puis pendant une durée limitée nécessaire aux obligations légales, litiges ou preuves de transaction (généralement jusqu'à 5 ans pour les données comptables et contractuelles, sauf obligation plus longue). Les documents d'identité peuvent être supprimés ou anonymisés après clôture du compte, sous réserve des délais légaux de conservation anti-fraude.",
          },
          {
            title: "8. Sécurité",
            list: [
              "Authentification par jeton sécurisé (cookie httpOnly) en complément du stockage local limité.",
              "Communications chiffrées (HTTPS).",
              "Accès restreint aux données sensibles côté administration.",
              "Aucune méthode n'étant infaillible, nous vous invitons à protéger vos identifiants.",
            ],
          },
          {
            title: "9. Cookies et stockage local",
            body:
              "Nous utilisons un cookie de session strictement nécessaire à la connexion, le stockage local pour mémoriser votre profil simplifié (nom, rôle, avatar), la langue et le thème, ainsi qu'un service worker pour le cache hors ligne en production. Nous n'utilisons pas de cookies publicitaires ni de traceurs analytics tiers (Google Analytics, Meta Pixel, etc.) sur le site à ce jour. Les polices Google Fonts peuvent être chargées depuis les serveurs Google.",
          },
          {
            title: "10. Vos droits",
            list: [
              "Droit d'accès, de rectification et de mise à jour de vos données.",
              "Droit de suppression (« droit à l'oubli ») sous réserve des obligations légales.",
              "Droit d'opposition ou de limitation pour certains traitements fondés sur l'intérêt légitime.",
              "Droit de retirer votre consentement lorsque le traitement en dépend.",
              "Droit d'introduire une réclamation auprès de la CNDP (Commission Nationale de contrôle de la protection des Données à caractère Personnel) au Maroc.",
            ],
          },
          {
            title: "11. Mineurs",
            body:
              "Goovoiture n'est pas destiné aux personnes de moins de 18 ans. Nous ne collectons pas sciemment de données concernant des mineurs.",
          },
          {
            title: "12. Modifications",
            body:
              "Nous pouvons mettre à jour cette politique. La date en tête de page sera révisée. En cas de changement important, nous pourrons vous en informer par notification ou e-mail.",
          },
        ],
      },
      en: {
        kicker: "Personal data",
        title: "Privacy Policy",
        intro:
          "Goovoiture is committed to protecting your personal data in line with Morocco's Law 09-08 on the protection of individuals with regard to personal data processing. This policy explains what we collect, why, and your rights.",
        updated: "Last updated: 12 June 2026",
        contactTitle: "Exercise your rights",
        contact: `Access, rectification, or deletion requests:\n${CONTACT.en}\nSubject: « Personal data »`,
        backHome: "← Back to home",
        otherLink: "Terms of Service →",
        sections: [
          {
            title: "1. Data controller",
            body:
              "The data controller is Goovoiture, operated via goovoiture.ma. For data-related questions, use the contact details below.",
          },
          {
            title: "2. Data we collect",
            list: [
              "Account: name, phone number, password (securely stored server-side), city, role(s), profile photo.",
              "Profile: email address, bio, language and theme preferences.",
              "Identity: national ID (CIN) number, driving licence number, expiry dates, scans/photos (uploaded via our file hosting provider).",
              "Listings: vehicle details, price, city, description, photos and videos.",
              "Rentals: booking dates, MAD amounts, status (pending, confirmed, cancelled, completed), reviews, condition photos, contract documents.",
              "My Garage: make, model, mileage, maintenance dates (insurance, technical inspection, vignette, oil change…), fuel logs, scanned documents (registration, insurance…).",
              "Messaging: content of exchanges between users, linked to a listing.",
              "Referrals: referral code, MAD credits, invitation statistics.",
              "Credit check (if used): plate number, make/model, information provided for manual review.",
              "Technical: session identifier (httpOnly cookie), browser local storage (simplified profile), server logs, IP address, device type.",
            ],
          },
          {
            title: "3. Purposes",
            list: [
              "Create and manage your account, authenticate logins.",
              "Publish and display listings, process bookings and notifications.",
              "Verify identity of sellers, rental owners, and customers (fraud prevention).",
              "Provide messaging, real-time alerts, and My Garage reminders.",
              "Improve security, moderation, and user support.",
              "Comply with legal obligations and competent authorities.",
            ],
          },
          {
            title: "4. Legal bases",
            body:
              "We process data based on: (i) contract performance when you use our services; (ii) your consent for certain documents and communications; (iii) our legitimate interest in securing the platform, preventing fraud, and improving the service; (iv) legal obligations.",
          },
          {
            title: "5. Recipients and processors",
            list: [
              "Website and API hosting (cloud servers).",
              "Cloudinary (daqihsmib) — hosting images and documents you upload; servers may be outside Morocco.",
              "Real-time connection (WebSocket / socket.io) for messages and notifications.",
              "Other users — when you publish, book, or message, some information (name, city, phone per features) is visible to the other party.",
              "Public authorities — when required by law.",
            ],
          },
          {
            title: "6. International transfers",
            body:
              "Some providers (notably Cloudinary) may process data outside Morocco. We ensure appropriate safeguards (contractual clauses, security measures) per applicable regulation.",
          },
          {
            title: "7. Retention",
            body:
              "We keep data while your account is active, then for a limited period for legal obligations, disputes, or transaction evidence (generally up to 5 years for accounting/contract data unless a longer period applies). Identity documents may be deleted or anonymized after account closure, subject to anti-fraud retention rules.",
          },
          {
            title: "8. Security",
            list: [
              "Secure token authentication (httpOnly cookie) plus limited local storage.",
              "Encrypted communications (HTTPS).",
              "Restricted access to sensitive admin data.",
              "No method is perfect — please protect your credentials.",
            ],
          },
          {
            title: "9. Cookies and local storage",
            body:
              "We use a strictly necessary session cookie, local storage for your simplified profile (name, role, avatar), language and theme, and a service worker for offline cache in production. We do not use advertising cookies or third-party analytics trackers (Google Analytics, Meta Pixel, etc.) on the site at this time. Google Fonts may load from Google servers.",
          },
          {
            title: "10. Your rights",
            list: [
              "Right of access, rectification, and update.",
              "Right to erasure (« right to be forgotten ») subject to legal obligations.",
              "Right to object or restrict certain processing based on legitimate interest.",
              "Right to withdraw consent where processing depends on it.",
              "Right to lodge a complaint with Morocco's CNDP (National Commission for Personal Data Protection).",
            ],
          },
          {
            title: "11. Minors",
            body:
              "Goovoiture is not intended for persons under 18. We do not knowingly collect data from minors.",
          },
          {
            title: "12. Changes",
            body:
              "We may update this policy. The date at the top will be revised. For material changes, we may notify you in-app or by email.",
          },
        ],
      },
      ar: {
        kicker: "البيانات الشخصية",
        title: "سياسة الخصوصية",
        intro:
          "تلتزم Goovoiture بحماية بياناتك الشخصية وفق القانون المغربي 09-08 المتعلق بحماية الأشخاص الذاتيين تجاه معالجة المعطيات ذات الطابع الشخصي. توضح هذه السياسة ما نجمعه ولماذا وحقوقك.",
        updated: "آخر تحديث: 12 يونيو 2026",
        contactTitle: "ممارسة حقوقك",
        contact: `طلبات الوصول أو التصحيح أو الحذف:\n${CONTACT.ar}\nالموضوع: « بيانات شخصية »`,
        backHome: "← العودة للرئيسية",
        otherLink: "شروط الخدمة →",
        sections: [
          {
            title: "1. مسؤول المعالجة",
            body:
              "مسؤول المعالجة هو Goovoiture عبر goovoiture.ma. لأسئلة البيانات، استخدم بيانات الاتصال أدناه.",
          },
          {
            title: "2. البيانات التي نجمعها",
            list: [
              "الحساب: الاسم، الهاتف، كلمة المرور (مخزنة بأمان على الخادم)، المدينة، الدور، صورة الملف.",
              "الملف: البريد الإلكتروني، السيرة، تفضيلات اللغة والمظهر.",
              "الهوية: رقم البطاقة الوطنية، رقم الرخصة، تواريخ الانتهاء، مسح الوثائق.",
              "الإعلانات: مواصفات المركبة، السعر، المدينة، الوصف، الصور والفيديو.",
              "الإيجار: تواريخ الحجز، المبالغ بالدرهم، الحالة، التقييمات، صور الحالة، المستندات.",
              "المرآب: الماركة، الموديل، الكيلومترات، مواعيد الصيانة، سجلات الوقود، وثائق ممسوحة.",
              "الرسائل: محتوى المحادثات بين المستخدمين.",
              "الإحالة: رمز الإحالة، أرصدة الدرهم، إحصائيات الدعوات.",
              "الفحص الائتماني (إن وُجد): لوحة التسجيل، معلومات للمراجعة اليدوية.",
              "تقني: ملف تعريف الارتباط للجلسة، التخزين المحلي، سجلات الخادم، عنوان IP.",
            ],
          },
          {
            title: "3. أغراض المعالجة",
            list: [
              "إنشاء وإدارة حسابك والمصادقة.",
              "نشر الإعلانات ومعالجة الحجوزات والإشعارات.",
              "التحقق من الهوية ومنع الاحتيال.",
              "توفير الرسائل والتنبيهات الفورية وتذكيرات المرآب.",
              "تحسين الأمان والإشراف والدعم.",
              "الامتثال للالتزامات القانونية.",
            ],
          },
          {
            title: "4. الأسس القانونية",
            body:
              "نعالج البيانات بناءً على: تنفيذ العقد؛ موافقتك لبعض الوثائق؛ مصلحتنا المشروعة في أمان المنصة؛ الالتزامات القانونية.",
          },
          {
            title: "5. المستلمون والمعالجون",
            list: [
              "استضافة الموقع والواجهة البرمجية.",
              "Cloudinary — استضافة الصور والوثائق المرفوعة (قد تكون خارج المغرب).",
              "اتصال فوري (socket.io) للرسائل والإشعارات.",
              "مستخدمون آخرون — عند النشر أو الحجز أو المراسلة تظهر بعض المعلومات للطرف الآخر.",
              "السلطات العامة — عند الطلب القانوني.",
            ],
          },
          {
            title: "6. التحويلات الدولية",
            body:
              "قد يعالج بعض المزودين البيانات خارج المغرب مع ضمانات تعاقدية وأمنية مناسبة.",
          },
          {
            title: "7. مدة الحفظ",
            body:
              "نحتفظ بالبيانات طوال نشاط الحساب ثم لفترة محدودة للالتزامات القانونية (غالباً حتى 5 سنوات للبيانات التعاقدية). قد تُحذف وثائق الهوية بعد إغلاق الحساب وفق قواعد مكافحة الاحتيال.",
          },
          {
            title: "8. الأمان",
            list: [
              "مصادقة آمنة (cookie httpOnly) وتخزين محلي محدود.",
              "اتصالات مشفرة (HTTPS).",
              "وصول مقيد للبيانات الحساسة في الإدارة.",
            ],
          },
          {
            title: "9. ملفات تعريف الارتباط والتخزين المحلي",
            body:
              "نستخدم ملف جلسة ضروري، تخزيناً محلياً للملف المبسط واللغة والمظهر، وخدمة عامل للتخزين المؤقت. لا نستخدم إعلانات أو تحليلات طرف ثالث حالياً. قد تُحمّل خطوط Google من خوادم Google.",
          },
          {
            title: "10. حقوقك",
            list: [
              "حق الوصول والتصحيح والتحديث.",
              "حق الحذف مع مراعاة الالتزامات القانونية.",
              "حق الاعتراض أو التقييد لبعض المعالجات.",
              "حق سحب الموافقة عند الاقتضاء.",
              "حق تقديم شكوى إلى CNDP المغربية.",
            ],
          },
          {
            title: "11. القاصرون",
            body:
              "الخدمة غير موجهة لمن دون 18 سنة ولا نجمع بيانات قاصرين عن قصد.",
          },
          {
            title: "12. التعديلات",
            body:
              "قد نحدّث هذه السياسة ونُعلمك بالتغييرات الجوهرية عبر التطبيق أو البريد.",
          },
        ],
      },
    },
  },
};

/** SEO metadata for STATIC_PAGES */
export const LEGAL_SEO = {
  "/conditions-utilisation": {
    fr: {
      title: "Conditions d'utilisation | Goovoiture",
      description:
        "Conditions générales d'utilisation de Goovoiture : location de voiture, vente auto et Mon Garage au Maroc.",
      keywords: "conditions utilisation goovoiture, CGU marketplace auto maroc",
      h1: "Conditions d'utilisation",
      intro:
        "Règles d'utilisation de la plateforme Goovoiture pour la location, la vente et la gestion automobile au Maroc.",
    },
    en: {
      title: "Terms of Service | Goovoiture",
      description:
        "Goovoiture terms of service for car rental, used-car sales, and My Garage in Morocco.",
      keywords: "goovoiture terms of service, morocco car marketplace",
      h1: "Terms of Service",
      intro: "Rules for using Goovoiture for rentals, sales, and vehicle management in Morocco.",
    },
    ar: {
      title: "شروط الخدمة | Goovoiture",
      description: "شروط استخدام Goovoiture لتأجير وبيع السيارات والمرآب في المغرب.",
      keywords: "شروط الخدمة goovoiture المغرب",
      h1: "شروط الخدمة",
      intro: "قواعد استخدام منصة Goovoiture للإيجار والبيع وإدارة المركبات في المغرب.",
    },
  },
  "/politique-confidentialite": {
    fr: {
      title: "Politique de confidentialité | Goovoiture",
      description:
        "Comment Goovoiture collecte et protège vos données personnelles au Maroc (CIN, réservations, annonces).",
      keywords: "politique confidentialité goovoiture, données personnelles maroc",
      h1: "Politique de confidentialité",
      intro:
        "Transparence sur vos données : compte, identité, annonces, réservations et outils Mon Garage.",
    },
    en: {
      title: "Privacy Policy | Goovoiture",
      description:
        "How Goovoiture collects and protects your personal data in Morocco.",
      keywords: "goovoiture privacy policy morocco",
      h1: "Privacy Policy",
      intro: "Transparency on account, identity, listings, bookings, and My Garage data.",
    },
    ar: {
      title: "سياسة الخصوصية | Goovoiture",
      description: "كيف تجمع Goovoiture بياناتك وتحميها في المغرب.",
      keywords: "سياسة الخصوصية goovoiture",
      h1: "سياسة الخصوصية",
      intro: "شفافية حول بيانات الحساب والهوية والإعلانات والحجوزات والمرآب.",
    },
  },
};
