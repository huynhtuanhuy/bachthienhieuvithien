import QRCode from "qrcode";

export function getTicketUrl(id: string) {
  const baseUrl = process.env.PUBLIC_BASE_URL?.replace(/\/$/, "");
  return baseUrl ? `${baseUrl}/ticket/${id}` : String(id);
}

export async function createQrDataUrl(id: string) {
  return QRCode.toDataURL(getTicketUrl(id), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}

export async function createQrPngBuffer(id: string) {
  return QRCode.toBuffer(getTicketUrl(id), {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 320,
  });
}
