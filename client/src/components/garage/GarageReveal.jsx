import { useInViewReveal } from "../../hooks/useInViewReveal";

export default function GarageReveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const { ref, visible } = useInViewReveal({ once: true });
  return (
    <Tag
      ref={ref}
      className={`ge-reveal ${visible ? "ge-revealed" : ""} ${className}`.trim()}
      style={{ "--ge-reveal-delay": `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
