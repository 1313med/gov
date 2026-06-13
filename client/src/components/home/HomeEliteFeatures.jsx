import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useAppLang } from "../../context/AppLangContext";
import "../../styles/home-elite-features.css";

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

function AutoStage({ variant, children }) {
  const reduced = useReducedMotion();
  return (
    <div className={`hx-tool-stage hx-tool-stage--${variant}`} aria-hidden="true">
      <div className="hx-tool-stage__grid" />
      <div className="hx-tool-stage__vignette" />
      <motion.div
        className="hx-tool-stage__glow"
        animate={reduced ? {} : { opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="hx-tool-stage__content">{children}</div>
      {!reduced ? <motion.div className="hx-tool-stage__scan" animate={{ top: ["0%", "100%"] }} transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }} /> : null}
      <div className="hx-tool-stage__bracket hx-tool-stage__bracket--tl" />
      <div className="hx-tool-stage__bracket hx-tool-stage__bracket--tr" />
      <div className="hx-tool-stage__bracket hx-tool-stage__bracket--bl" />
      <div className="hx-tool-stage__bracket hx-tool-stage__bracket--br" />
    </div>
  );
}

function SedanProfile({ className = "" }) {
  return (
    <svg className={`hx-auto-car ${className}`} viewBox="0 0 200 56" fill="none" aria-hidden="true">
      <path
        d="M12 38h8l6-8 14-4h38l18-6 22-2h28l10 4 8 8 4 10v4h-12l-2 6h-14l-2-8H70l-2 8H44l-2-6H18l-2-4H12v-6z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx="52" cy="42" r="7" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="52" cy="42" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="142" cy="42" r="7" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="142" cy="42" r="3" fill="currentColor" opacity="0.5" />
      <path d="M68 30h48M92 26v8" stroke="currentColor" strokeWidth="0.8" opacity="0.35" />
    </svg>
  );
}

function SuvProfile({ className = "" }) {
  return (
    <svg className={`hx-auto-car ${className}`} viewBox="0 0 200 56" fill="none" aria-hidden="true">
      <path
        d="M10 36h10l8-10 16-6h36l20-8 26-2h24l12 6 8 10 4 10v6h-14l-3 6h-16l-2-8H78l-2 8H48l-2-6H16l-2-6H10v-4z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx="54" cy="42" r="8" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="54" cy="42" r="3.5" fill="currentColor" opacity="0.45" />
      <circle cx="148" cy="42" r="8" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="148" cy="42" r="3.5" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

function Gauge({ label, value, max, delay = 0, color }) {
  const reduced = useReducedMotion();
  const pct = value / max;
  const angle = -120 + pct * 240;

  return (
    <div className="hx-auto-gauge">
      <svg viewBox="0 0 80 80" className="hx-auto-gauge__svg">
        <circle cx="40" cy="40" r="32" stroke="rgba(255,255,255,0.08)" strokeWidth="3" fill="none" />
        <circle
          cx="40"
          cy="40"
          r="32"
          stroke={color}
          strokeWidth="3"
          fill="none"
          strokeDasharray={`${pct * 201} 201`}
          strokeLinecap="round"
          transform="rotate(-120 40 40)"
          opacity="0.85"
        />
        <motion.g
          animate={reduced ? { rotate: angle } : { rotate: [-120, angle] }}
          transition={reduced ? {} : { duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "40px 40px" }}
        >
          <line x1="40" y1="40" x2="40" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </motion.g>
        <circle cx="40" cy="40" r="4" fill={color} opacity="0.9" />
      </svg>
      <span className="hx-auto-gauge__label">{label}</span>
      <span className="hx-auto-gauge__val">{value}%</span>
    </div>
  );
}

function AiVisual() {
  const reduced = useReducedMotion();
  const chips = ["Budget", "Usage", "Match"];

  return (
    <AutoStage variant="ai">
      <div className="hx-auto-ai">
        <div className="hx-auto-ai__radar">
          {[1, 2, 3].map((ring) => (
            <motion.span
              key={ring}
              className="hx-auto-ai__ring"
              style={{ width: `${ring * 28}%`, height: `${ring * 28}%` }}
              animate={reduced ? {} : { scale: [0.92, 1.04, 0.92], opacity: [0.15, 0.45, 0.15] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: ring * 0.4, ease: "easeInOut" }}
            />
          ))}
          <motion.div
            className="hx-auto-ai__sweep"
            animate={reduced ? {} : { rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.div
          className="hx-auto-ai__car"
          animate={reduced ? {} : { y: [0, -3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <SedanProfile />
        </motion.div>
        <div className="hx-auto-ai__chips">
          {chips.map((chip, i) => (
            <motion.span
              key={chip}
              className="hx-auto-ai__chip"
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.1 }}
            >
              <span className="hx-auto-ai__chip-dot" />
              {chip}
            </motion.span>
          ))}
        </div>
        <div className="hx-auto-ai__readout">
          <span className="hx-auto-ai__readout-k">GOOVOITURE AI</span>
          <motion.span
            className="hx-auto-ai__readout-v"
            animate={reduced ? {} : { opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            SCANNING
          </motion.span>
        </div>
      </div>
    </AutoStage>
  );
}

function TcoVisual() {
  const reduced = useReducedMotion();

  return (
    <AutoStage variant="tco">
      <div className="hx-auto-tco">
        <div className="hx-auto-tco__panel">
          <span className="hx-auto-tco__panel-label">TCO / AN</span>
          <motion.span
            className="hx-auto-tco__panel-val"
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            42 800 <small>MAD</small>
          </motion.span>
        </div>
        <div className="hx-auto-tco__gauges">
          <Gauge label="Fuel" value={38} max={50} delay={0.1} color="#38bdf8" />
          <Gauge label="Insur." value={22} max={50} delay={0.25} color="#7c6bff" />
          <Gauge label="Maint." value={18} max={50} delay={0.4} color="#a78bfa" />
        </div>
        <div className="hx-auto-tco__bars">
          {[
            { w: "72%", label: "Dépréciation" },
            { w: "48%", label: "Carburant" },
            { w: "31%", label: "Assurance" },
          ].map((bar, i) => (
            <div key={bar.label} className="hx-auto-tco__bar-row">
              <span>{bar.label}</span>
              <div className="hx-auto-tco__bar-track">
                <motion.div
                  className="hx-auto-tco__bar-fill"
                  initial={{ width: 0 }}
                  whileInView={{ width: bar.w }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          ))}
        </div>
        {!reduced ? (
          <motion.div
            className="hx-auto-tco__pulse"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        ) : null}
      </div>
    </AutoStage>
  );
}

function CompareVisual() {
  const reduced = useReducedMotion();
  const specs = [
    { a: 78, b: 62, label: "Prix" },
    { a: 55, b: 72, label: "Confort" },
    { a: 68, b: 58, label: "TCO" },
  ];

  return (
    <AutoStage variant="compare">
      <div className="hx-auto-cmp">
        <div className="hx-auto-cmp__lane hx-auto-cmp__lane--a">
          <SedanProfile />
          <span className="hx-auto-cmp__model">Logan</span>
        </div>
        <div className="hx-auto-cmp__center">
          <div className="hx-auto-cmp__vs-line" />
          <span className="hx-auto-cmp__vs">VS</span>
          <div className="hx-auto-cmp__specs">
            {specs.map((s, i) => (
              <div key={s.label} className="hx-auto-cmp__spec">
                <span className="hx-auto-cmp__spec-label">{s.label}</span>
                <div className="hx-auto-cmp__spec-bars">
                  <motion.div
                    className="hx-auto-cmp__spec-bar hx-auto-cmp__spec-bar--a"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: s.a / 100 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <motion.div
                    className="hx-auto-cmp__spec-bar hx-auto-cmp__spec-bar--b"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: s.b / 100 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hx-auto-cmp__lane hx-auto-cmp__lane--b">
          <SuvProfile />
          <span className="hx-auto-cmp__model">Clio</span>
        </div>
        {!reduced ? (
          <motion.div
            className="hx-auto-cmp__divider"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        ) : null}
      </div>
    </AutoStage>
  );
}

const TOOL_VISUALS = {
  ai: AiVisual,
  tco: TcoVisual,
  compare: CompareVisual,
};

function SmartToolCard({ tool, index }) {
  const reduced = useReducedMotion();
  const Visual = TOOL_VISUALS[tool.id];

  return (
    <motion.article
      className={`hx-tool hx-tool--${tool.id}`}
      variants={fadeUp}
      custom={index}
      whileHover={reduced ? {} : { y: -10, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
    >
      <div className="hx-tool-glow" aria-hidden="true" />
      {Visual ? <Visual /> : null}

      <div className="hx-tool-body">
        <div className="hx-tool-tag">{tool.tag}</div>
        <h3 className="hx-tool-title">{tool.title}</h3>
        <p className="hx-tool-desc">{tool.desc}</p>
        <motion.div whileHover={reduced ? {} : { scale: 1.02 }} whileTap={reduced ? {} : { scale: 0.98 }}>
          <Link to={tool.href} className="hx-tool-btn">
            {tool.cta}
            <span className="hx-tool-btn-arr">→</span>
          </Link>
        </motion.div>
      </div>
    </motion.article>
  );
}

function UsefulLinkCard({ item, index, linkCta }) {
  const reduced = useReducedMotion();

  return (
    <motion.div variants={fadeUp} custom={index}>
      <motion.div whileHover={reduced ? {} : { y: -6 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
        <Link to={item.href} className="hx-link-card">
          <div className="hx-link-ico">{item.icon}</div>
          <h4 className="hx-link-title">{item.title}</h4>
          <p className="hx-link-desc">{item.desc}</p>
          <span className="hx-link-arr">
            {linkCta} <span aria-hidden="true">→</span>
          </span>
        </Link>
      </motion.div>
    </motion.div>
  );
}

const LINK_ICONS = {
  assurance: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3.5 5.5 6v5.6c0 4.2 2.7 7.7 6.5 9 3.8-1.3 6.5-4.8 6.5-9V6L12 3.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  financement: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 10h17M7 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  demarches: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 4.5h6m-5-2h4a1 1 0 0 1 1 1v1h2.5A1.5 1.5 0 0 1 19 6v13.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5V6a1.5 1.5 0 0 1 1.5-1.5H9v-1a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  questions: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 9.2a2.7 2.7 0 0 1 4.8 1.4c0 1.8-2.3 2.2-2.3 3.6M12 17h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  possession: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 13.5h15l-1.2-4.1a2 2 0 0 0-1.9-1.4H7.6a2 2 0 0 0-1.9 1.4L4.5 13.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="8.2" cy="16.8" r="1.3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17.2" cy="16.8" r="1.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
};

export default function HomeEliteFeatures() {
  const { copy } = useAppLang();
  const t = copy.home.eliteTools;
  const reduced = useReducedMotion();

  const tools = t.cards.map((c) => ({ ...c, id: c.id }));

  const links = t.links.map((l) => ({
    ...l,
    icon: LINK_ICONS[l.id],
  }));

  return (
    <>
      <section className="hx-elite-sec hx-elite-sec--tools" aria-labelledby="hx-elite-tools-title">
        <motion.div
          className="hx-elite-bg hx-elite-bg--1"
          aria-hidden="true"
          animate={reduced ? {} : { x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="hx-elite-bg hx-elite-bg--2"
          aria-hidden="true"
          animate={reduced ? {} : { x: [0, -15, 0], y: [0, 12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <motion.div
          className="hx-elite-head"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
        >
          <div className="hx-ey">{t.toolsEyebrow}</div>
          <h2 id="hx-elite-tools-title" className="hx-h2">
            {t.toolsTitle1}
            <br />
            <em>{t.toolsTitle2}</em>
          </h2>
          <p className="hx-h2-sub" style={{ maxWidth: 520, marginTop: 14 }}>
            {t.toolsSub}
          </p>
        </motion.div>

        <motion.div
          className="hx-elite-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          {tools.map((tool, i) => (
            <SmartToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </motion.div>
      </section>

      <section className="hx-elite-sec hx-elite-sec--links" aria-labelledby="hx-elite-links-title">
        <motion.div
          className="hx-elite-head"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={fadeUp}
        >
          <div className="hx-ey">{t.linksEyebrow}</div>
          <h2 id="hx-elite-links-title" className="hx-h2">
            {t.linksTitle1} <em>{t.linksTitle2}</em>
          </h2>
          <p className="hx-h2-sub" style={{ maxWidth: 480, marginTop: 14 }}>
            {t.linksSub}
          </p>
        </motion.div>

        <motion.div
          className="hx-links-grid"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={stagger}
        >
          {links.map((item, i) => (
            <UsefulLinkCard key={item.id} item={item} index={i} linkCta={t.linkCta} />
          ))}
        </motion.div>
      </section>
    </>
  );
}
