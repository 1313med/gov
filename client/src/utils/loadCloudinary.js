/** Load Cloudinary upload widget only on pages that need it (not on home). */
let loading = null;

export function loadCloudinary() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.cloudinary) return Promise.resolve();
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Cloudinary failed to load"));
    document.head.appendChild(script);
  });

  return loading;
}
