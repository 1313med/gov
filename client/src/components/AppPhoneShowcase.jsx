/**
 * Homepage app download visual — composite phone mockup with theme-aware backdrop.
 * Light mode: screen blend hides the image's black background.
 * Dark mode: image sits naturally on the dark gradient.
 */
export default function AppPhoneShowcase({ className = "" }) {
  return (
    <div className={`hx-app-phones ${className}`.trim()} aria-hidden="true">
      <div className="hx-app-phones-bg" />
      <div className="hx-app-phones-glow hx-app-phones-glow--teal" />
      <div className="hx-app-phones-glow hx-app-phones-glow--purple" />
      <div className="hx-app-phones-grid" />
      <img
        src="/images/app-phones.png"
        alt=""
        className="hx-app-phones-img"
        loading="lazy"
        decoding="async"
        width={1024}
        height={1024}
      />
    </div>
  );
}
