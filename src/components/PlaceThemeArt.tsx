const approvedArt: Record<string, string> = {
  "andhra-pradesh": "/theme/place-art/andhra-pradesh.png", "arunachal-pradesh": "/theme/place-art/arunachal-pradesh.png",
  "himachal-pradesh": "/theme/place-art/himachal-pradesh.png", "madhya-pradesh": "/theme/place-art/madhya-pradesh.png",
  "tamil-nadu": "/theme/place-art/tamil-nadu.png", "uttar-pradesh": "/theme/place-art/uttar-pradesh.png",
  "west-bengal": "/theme/place-art/west-bengal.png", "abu-dhabi": "/theme/place-art/abu-dhabi.png",
  "al-ain": "/theme/place-art/al-ain.png", "ras-al-khaimah": "/theme/place-art/ras-al-khaimah.png",
  "umm-al-quwain": "/theme/place-art/umm-al-quwain.png",
  ajman: "/theme/place-art/ajman.png", assam: "/theme/place-art/assam.png", bihar: "/theme/place-art/bihar.png",
  business: "/theme/place-art/business.png", chhattisgarh: "/theme/place-art/chhattisgarh.png",
  cultural: "/theme/place-art/cultural.png", dubai: "/theme/place-art/dubai.png", fujairah: "/theme/place-art/fujairah.png",
  goa: "/theme/place-art/goa.png", gujarat: "/theme/place-art/gujarat.png", haryana: "/theme/place-art/haryana.png",
  jharkhand: "/theme/place-art/jharkhand.png", karnataka: "/theme/place-art/karnataka.png", kerala: "/theme/place-art/kerala.png",
  maharashtra: "/theme/place-art/maharashtra.png", manipur: "/theme/place-art/manipur.png", meghalaya: "/theme/place-art/meghalaya.png",
  mizoram: "/theme/place-art/mizoram.png", nagaland: "/theme/place-art/nagaland.png", odisha: "/theme/place-art/odisha.png",
  punjab: "/theme/place-art/punjab.png", rajasthan: "/theme/place-art/rajasthan.png", sharjah: "/theme/place-art/sharjah.png",
  sikkim: "/theme/place-art/sikkim.png", telangana: "/theme/place-art/telangana.png", tripura: "/theme/place-art/tripura.png",
  uttarakhand: "/theme/place-art/uttarakhand.png", womens: "/theme/place-art/womens.png",
};

export function PlaceThemeArt({ id, kind }: { id: string; kind: "council" | "chapter" }) {
  const src = approvedArt[id];
  if (!src) return null;
  return <div
    className={`place-theme-art place-theme-art--${kind}`}
    aria-hidden="true"
    data-place-art={id}
  >
    <img src={src} alt="" />
  </div>;
}
