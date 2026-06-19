/* eslint-disable @next/next/no-img-element */
import { createQrDataUrl } from "@/lib/qr";

export const runtime = "nodejs";

type TicketPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TicketPage({ params }: TicketPageProps) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);

  const qrDataUrl = await createQrDataUrl(id);

  return (
    <main className="ticketPage">
      <section className="ticketPanel">
        <h1>Xác nhận tham gia</h1>
        <p>Bách Thiện Hiếu Vi Tiên - Lễ tri ân Cha Mẹ 2026</p>
        <img
          className="qrImage"
          src={qrDataUrl}
          alt={`QR xác nhận đăng ký ${id}`}
        />
        <p>
          <strong>Mã đăng ký:</strong> {id}
        </p>
      </section>
    </main>
  );
}
