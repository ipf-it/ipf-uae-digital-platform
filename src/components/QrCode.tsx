type QrCodeProps = {
  value: string;
  size?: number;
  alt: string;
};

export function QrCode({ value, size = 148, alt }: QrCodeProps) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(value)}`;
  return <img src={src} width={size} height={size} alt={alt} className="rounded-lg bg-white p-1" />;
}
