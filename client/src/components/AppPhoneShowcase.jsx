/** Homepage app download — same mockup in light & dark (layout parity). */
export default function AppPhoneShowcase({ className = "" }) {
  return (
    <div className={`hx-app-phones ${className}`.trim()} aria-hidden="true">
      <div className="hx-app-phones-float">
        <img
          src="/images/app-phones-light.png"
          alt=""
          className="hx-app-phones-img"
          loading="lazy"
          decoding="async"
          width={1024}
          height={1024}
        />
      </div>
    </div>
  );
}
