/** Runs before paint — syncs html.dark with the same localStorage keys as the SPA ThemeProvider. */
export default function ThemeInit() {
  const script = `(function(){try{var keys=['goo-theme','cars-theme','rentals-theme','home2-theme','rental-details-theme'],dark=null;for(var i=0;i<keys.length;i++){var v=localStorage.getItem(keys[i]);if(v==='dark'){dark=true;break}if(v==='light'){dark=false;break}}if(dark===null){dark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches}var root=document.documentElement;root.classList.toggle('dark',!!dark);root.setAttribute('data-theme',dark?'dark':'light');root.style.colorScheme=dark?'dark':'light'}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
