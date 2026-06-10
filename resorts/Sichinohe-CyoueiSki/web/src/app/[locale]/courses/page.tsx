import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

/** LAAX 型: コース・マップは /map に統合。旧 URL は恒久リダイレクト */
export default async function CoursesPage() {
  const locale = await getLocale();
  redirect({ href: "/map", locale });
}
