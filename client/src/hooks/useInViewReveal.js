import { useEffect, useRef, useState } from "react";

export function useInViewReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (options.once !== false) obs.disconnect();
        } else if (!options.once) {
          setVisible(false);
        }
      },
      { threshold: options.threshold ?? 0.12, rootMargin: options.rootMargin ?? "0px 0px -40px 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [options.once, options.threshold, options.rootMargin]);

  return { ref, visible, className: visible ? "ge-revealed" : "" };
}
