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

function Sparkles() {
  const reduced = useReducedMotion();
  const sparks = [
    { top: "18%", left: "58%", delay: 0 },
    { top: "42%", left: "72%", delay: 0.4 },
    { top: "28%", left: "38%", delay: 0.8 },
  ];
  return (
    <>
      {sparks.map((s, i) => (
        <motion.span
          key={i}
          className="hx-tool-spark"
          style={{ top: s.top, left: s.left }}
          animate={reduced ? {} : { opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </>
  );
}

function AiVisual() {
  const reduced = useReducedMotion();
  return (
    <div className="hx-tool-visual">
      <motion.div
        className="hx-tool-icon-wrap"
        animate={reduced ? {} : { y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3l1.4 4.3h4.5l-3.6 2.6 1.4 4.3L12 11.6 8.3 14.2l1.4-4.3-3.6-2.6h4.5L12 3z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="6" r="1.5" fill="currentColor" />
          <circle cx="5" cy="8" r="1" fill="currentColor" opacity="0.6" />
        </svg>
      </motion.div>
      <Sparkles />
    </div>
  );
}

function TcoVisual() {
  const reduced = useReducedMotion();
  const bars = [28, 42, 36, 52, 44];
  return (
    <div className="hx-tool-visual">
      <motion.div
        className="hx-tool-icon-wrap"
        animate={reduced ? {} : { rotate: [0, 3, 0, -3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v8M9.5 10.5h4a2 2 0 0 1 0 4h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </motion.div>
      <div className="hx-tool-mini-chart" aria-hidden="true">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className="hx-tool-bar"
            style={{ height: h }}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </div>
    </div>
  );
}

function CompareVisual() {
  const reduced = useReducedMotion();
  return (
    <div className="hx-tool-visual">
      <motion.div
        className="hx-tool-icon-wrap"
        animate={reduced ? {} : { scale: [1, 1.04, 1] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="5" width="7" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <rect x="14" y="5" width="7" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </motion.div>
      <div className="hx-tool-versus" aria-hidden="true">
        <motion.div
          className="hx-tool-vs-card"
          animate={reduced ? {} : { x: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="hx-tool-vs-label">VS</span>
        <motion.div
          className="hx-tool-vs-card hx-tool-vs-card--b"
          animate={reduced ? {} : { x: [0, 3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
      </div>
    </div>
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
      <motion.div
        className="hx-tool-float hx-tool-float--1"
        aria-hidden="true"
        animate={reduced ? {} : { y: [0, -12, 0], x: [0, 6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="hx-tool-float hx-tool-float--2"
        aria-hidden="true"
        animate={reduced ? {} : { y: [0, 10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="hx-tool-float hx-tool-float--3"
        aria-hidden="true"
        animate={reduced ? {} : { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

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
      {/* SECTION 1 — Smart Automotive Tools */}
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

      {/* SECTION 2 — Useful Links & Tools */}
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
