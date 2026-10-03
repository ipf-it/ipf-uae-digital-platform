const approvedArt: Record<string, string> = {
  "andhra-pradesh": "/theme/place-art/andhra-pradesh.webp", "arunachal-pradesh": "/theme/place-art/arunachal-pradesh.webp",
  "himachal-pradesh": "/theme/place-art/himachal-pradesh.webp", "madhya-pradesh": "/theme/place-art/madhya-pradesh.webp",
  "tamil-nadu": "/theme/place-art/tamil-nadu.webp", "uttar-pradesh": "/theme/place-art/uttar-pradesh.webp",
  "west-bengal": "/theme/place-art/west-bengal.webp", "abu-dhabi": "/theme/place-art/abu-dhabi.webp",
  "al-ain": "/theme/place-art/al-ain.webp", "ras-al-khaimah": "/theme/place-art/ras-al-khaimah.webp",
  "umm-al-quwain": "/theme/place-art/umm-al-quwain.webp",
  ajman: "/theme/place-art/ajman.webp", assam: "/theme/place-art/assam.webp", bihar: "/theme/place-art/bihar.webp",
  business: "/theme/place-art/business.webp", chhattisgarh: "/theme/place-art/chhattisgarh.webp",
  cultural: "/theme/place-art/cultural.webp", dubai: "/theme/place-art/dubai.webp", fujairah: "/theme/place-art/fujairah.webp",
  goa: "/theme/place-art/goa.webp", gujarat: "/theme/place-art/gujarat.webp", haryana: "/theme/place-art/haryana.webp",
  jharkhand: "/theme/place-art/jharkhand.webp", karnataka: "/theme/place-art/karnataka.webp", kerala: "/theme/place-art/kerala.webp",
  maharashtra: "/theme/place-art/maharashtra.webp", manipur: "/theme/place-art/manipur.webp", meghalaya: "/theme/place-art/meghalaya.webp",
  mizoram: "/theme/place-art/mizoram.webp", nagaland: "/theme/place-art/nagaland.webp", odisha: "/theme/place-art/odisha.webp",
  punjab: "/theme/place-art/punjab.webp", rajasthan: "/theme/place-art/rajasthan.webp", sharjah: "/theme/place-art/sharjah.webp",
  sikkim: "/theme/place-art/sikkim.webp", telangana: "/theme/place-art/telangana.webp", tripura: "/theme/place-art/tripura.webp",
  uttarakhand: "/theme/place-art/uttarakhand.webp", womens: "/theme/place-art/womens.webp",
};

export function PlaceThemeArt({ id, kind }: { id: string; kind: "council" | "chapter" }) {
  const src = approvedArt[id];
  if (!src) return null;
  return <div
    className={`place-theme-art place-theme-art--${kind}`}
    aria-hidden="true"
    data-place-art={id}
  >
    {/* Every usage of this component is inside a page's hero section — always visible on first
       paint, never scrolled-to — so this should load eagerly like any other LCP-candidate hero
       image. It was previously hardcoded to loading="lazy", which is a known anti-pattern for
       above-the-fold content (it tells the browser to deprioritize an image the user sees instantly). */}
    <img src={src} alt="" loading="eager" fetchPriority="high" decoding="async" />
  </div>;
}
