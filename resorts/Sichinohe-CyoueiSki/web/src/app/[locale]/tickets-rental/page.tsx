import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getResortData } from "@/lib/resort-data";
import { AwardFold } from "@/components/AwardFold";
import { AwardPageShell } from "@/components/AwardPageShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ticketsRental");
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function TicketsRentalPage() {
  const data = await getResortData();
  const t = await getTranslations("ticketsRental");
  const ticketRows = data.ticketsRental.tickets;
  const rentalRows = data.ticketsRental.rentals;
  const paymentRows = data.ticketsRental.payments;

  return (
    <AwardPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("shellDescription")}
    >
      <p role="note" className="notice-banner">
        {data.ticketsRental.notice}
      </p>

      <AwardFold title={t("ticketsSection")}>
        <table className="award-table" aria-label={t("tableAria.tickets")}>
          <thead>
            <tr>
              <th scope="col">{t("cols.ticketName")}</th>
              <th scope="col">{t("cols.price")}</th>
              <th scope="col">{t("cols.note")}</th>
            </tr>
          </thead>
          <tbody>
            {ticketRows.map((row) => (
              <tr key={row.name}>
                <td className="font-semibold">{row.name}</td>
                <td className="award-stat-inline">{row.price}</td>
                <td className="text-[color:var(--award-color-muted)]">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AwardFold>

      <AwardFold title={t("rentalSection")}>
        <table className="award-table" aria-label={t("tableAria.rentals")}>
          <thead>
            <tr>
              <th scope="col">{t("cols.item")}</th>
              <th scope="col">{t("cols.status")}</th>
            </tr>
          </thead>
          <tbody>
            {rentalRows.map((row) => (
              <tr key={row.item}>
                <td>
                  <p className="font-semibold">{row.item}</p>
                  <p className="mt-1 text-sm text-[color:var(--award-color-muted)]">
                    {row.note}
                  </p>
                </td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AwardFold>

      <AwardFold title={t("paymentSection")}>
        <table className="award-table" aria-label={t("tableAria.payments")}>
          <thead>
            <tr>
              <th scope="col">{t("cols.method")}</th>
              <th scope="col">{t("cols.paymentStatus")}</th>
            </tr>
          </thead>
          <tbody>
            {paymentRows.map((row) => (
              <tr key={row.method}>
                <td className="font-semibold">{row.method}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AwardFold>
    </AwardPageShell>
  );
}
