import sharp from "sharp";
import QRCode from "qrcode";
import { site } from "../src/data/site.js";

const WIDTH = 1200;
const HEIGHT = 675;
const QR_SIZE = 220;
const QR_MARGIN = 64;

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

type CardMember = {
  name: string;
  membershipNo: string;
  chapter: string;
  emirate: string;
  createdAt: string;
  isVolunteer: boolean;
};

/**
 * Renders the member's digital ID (same content as <DigitalIdCard>) as a PNG, for emailing —
 * there's no browser to run the React component server-side, so this redraws it as an SVG (sharp
 * rasterizes it, same library already used for upload image processing) and composites a QR PNG
 * (from the `qrcode` package, same one the client uses) on top.
 */
export async function renderMembershipCardPng(member: CardMember, verifyUrl: string): Promise<Buffer> {
  const accent = member.isVolunteer ? "#c45c12" : "#0b1f3a";
  const location = member.chapter || member.emirate || "UAE";
  const issued = new Date(member.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const label = member.isVolunteer ? "INDIAN PEOPLE'S FORUM UAE · IPF YUVA VOLUNTEER" : "INDIAN PEOPLE'S FORUM UAE";

  const qrBuffer = await QRCode.toBuffer(verifyUrl, { type: "png", width: QR_SIZE, margin: 1 });

  const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${accent}" />
      <stop offset="100%" stop-color="#0b1f3a" />
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" rx="28" fill="url(#bg)" />
  <rect x="0" y="0" width="${WIDTH}" height="9" fill="#ff9933" />
  <rect x="0" y="9" width="${WIDTH}" height="9" fill="#ffffff" />
  <rect x="0" y="18" width="${WIDTH}" height="9" fill="#138808" />
  <text x="64" y="104" font-family="Arial, sans-serif" font-size="19" font-weight="700" letter-spacing="2.5" fill="#c4a35a">${escapeXml(label)}</text>
  <text x="64" y="186" font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#ffffff">${escapeXml(member.name)}</text>
  <text x="64" y="226" font-family="Arial, sans-serif" font-size="23" fill="#ffffffbf">${escapeXml(location)}</text>
  <text x="64" y="318" font-family="Arial, sans-serif" font-size="33" font-weight="700" letter-spacing="2" fill="#c4a35a">${escapeXml(member.membershipNo)}</text>
  <text x="64" y="352" font-family="Arial, sans-serif" font-size="16" fill="#ffffff99">Issued ${issued} · Membership no.</text>
  <text x="64" y="${HEIGHT - 48}" font-family="Arial, sans-serif" font-size="15" fill="#ffffffb3">${escapeXml(site.office)}</text>
  <rect x="${WIDTH - QR_SIZE - QR_MARGIN - 16}" y="${HEIGHT - QR_SIZE - QR_MARGIN - 16}" width="${QR_SIZE + 32}" height="${QR_SIZE + 32}" rx="12" fill="#ffffff" />
</svg>`;

  return sharp(Buffer.from(svg))
    .composite([{ input: qrBuffer, left: WIDTH - QR_SIZE - QR_MARGIN, top: HEIGHT - QR_SIZE - QR_MARGIN }])
    .png()
    .toBuffer();
}
