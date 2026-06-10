import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import { getLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";

export type LiveCamStatus = "preparing" | "offline" | "live";

export type LiveCamItem = {
  id: string;
  name: string;
  slug: string;
  status: LiveCamStatus;
  streamUrl: string | null;
  thumbnailUrl: string | null;
  description?: string;
  placeholderMessage?: string;
};

export type LiveCamsData = {
  notice: string;
  items: LiveCamItem[];
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqCategory = {
  id: string;
  title: string;
  items: FaqItem[];
};

export type ResortData = {
  updatedAt: string;
  resort: {
    id: string;
    slug: string;
    name: string;
    displayLines?: string[];
    area: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  today: {
    notice: string;
    lastUpdated: string;
    snapshot: Array<{
      key: string;
      title: string;
      value: string;
      note: string;
      wide: boolean;
    }>;
  };
  access: {
    cards: Array<{ k: string; v: string }>;
    bullets: string[];
  };
  courses: {
    notice: string;
    items: Array<{
      name: string;
      distance: string;
      maxSlope: string;
      snowType: string;
      status: string;
    }>;
  };
  ticketsRental: {
    notice: string;
    tickets: Array<{ name: string; price: string; note: string }>;
    rentals: Array<{ item: string; status: string; note: string }>;
    payments: Array<{ method: string; status: string }>;
  };
  lessonsEvents: {
    notice: string;
    items: Array<{
      name: string;
      time: string;
      target: string;
      status: string;
      note: string;
    }>;
  };
  stayLocal: {
    notice: string;
    spots: Array<{ category: string; name: string; summary: string }>;
  };
  news: {
    items: Array<{
      id?: string;
      date: string;
      title: string;
      category: string;
      body: string;
    }>;
  };
  contact: {
    general: { description: string; phone: string; hours: string };
    group: { description: string; email: string; form: string };
  };
  liftDeals: {
    notice: string;
    sections: Array<{ title: string; body: string }>;
  };
  liveCams: LiveCamsData;
  faq: {
    notice: string;
    categories: FaqCategory[];
  };
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE_PATH = path.join(DATA_DIR, "resort-data.json");
const DATA_FILE_PATH_EN = path.join(DATA_DIR, "resort-data.en.json");
const TMP_DATA_FILE_PATH = `${DATA_FILE_PATH}.tmp`;

function dataFilePathForLocale(locale: AppLocale): string {
  return locale === "en" ? DATA_FILE_PATH_EN : DATA_FILE_PATH;
}

async function resolveDataLocale(forced?: AppLocale): Promise<AppLocale> {
  if (forced) return forced;
  try {
    const locale = await getLocale();
    return locale === "en" ? "en" : "ja";
  } catch {
    return "ja";
  }
}

const FALLBACK_RESORT_DATA: ResortData = {
  updatedAt: "fallback",
  resort: {
    id: "unknown",
    slug: "unknown",
    name: "データ準備中",
    area: "不明",
    coordinates: { lat: 0, lng: 0 },
  },
  today: {
    notice: "データ読み込みに失敗しました。しばらくしてから再度ご確認ください。",
    lastUpdated: "不明",
    snapshot: [],
  },
  access: { cards: [], bullets: [] },
  courses: { notice: "データ準備中", items: [] },
  ticketsRental: { notice: "データ準備中", tickets: [], rentals: [], payments: [] },
  lessonsEvents: { notice: "データ準備中", items: [] },
  stayLocal: { notice: "データ準備中", spots: [] },
  news: { items: [] },
  contact: {
    general: { description: "準備中", phone: "要確認", hours: "要確認" },
    group: { description: "準備中", email: "要確認", form: "要確認" },
  },
  liftDeals: { notice: "データ準備中", sections: [] },
  liveCams: { notice: "ライブカメラは準備中です。", items: [] },
  faq: { notice: "データ準備中", categories: [] },
};

function isValidResortData(value: unknown): value is ResortData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<ResortData>;
  return Boolean(
    typeof data.updatedAt === "string" &&
      data.resort &&
      typeof data.resort.id === "string" &&
      typeof data.resort.slug === "string" &&
      typeof data.resort.name === "string" &&
      typeof data.resort.area === "string" &&
      typeof data.resort.coordinates?.lat === "number" &&
      typeof data.resort.coordinates?.lng === "number" &&
      data.today &&
      Array.isArray(data.today.snapshot) &&
      data.access &&
      Array.isArray(data.access.cards) &&
      Array.isArray(data.access.bullets) &&
      data.courses &&
      Array.isArray(data.courses.items) &&
      data.ticketsRental &&
      Array.isArray(data.ticketsRental.tickets) &&
      data.lessonsEvents &&
      Array.isArray(data.lessonsEvents.items) &&
      data.stayLocal &&
      Array.isArray(data.stayLocal.spots) &&
      data.news &&
      Array.isArray(data.news.items) &&
      data.contact &&
      data.contact.general &&
      data.contact.group &&
      data.liftDeals &&
      Array.isArray(data.liftDeals.sections) &&
      data.liveCams &&
      Array.isArray(data.liveCams.items) &&
      data.faq &&
      Array.isArray(data.faq.categories),
  );
}

export async function getResortData(locale?: AppLocale): Promise<ResortData> {
  noStore();
  const resolvedLocale = await resolveDataLocale(locale);
  const filePath = dataFilePathForLocale(resolvedLocale);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidResortData(parsed)) {
      console.error(`[resort-data] invalid schema in ${filePath}`);
      return FALLBACK_RESORT_DATA;
    }
    return parsed;
  } catch (error) {
    if (resolvedLocale === "en") {
      try {
        const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw) as unknown;
        if (isValidResortData(parsed)) return parsed;
      } catch {
        // fall through
      }
    }
    console.error(`[resort-data] failed to read ${filePath}:`, error);
    return FALLBACK_RESORT_DATA;
  }
}

export async function updateResortData(
  patch: Partial<ResortData>,
): Promise<ResortData> {
  const current = await getResortData();
  if (current.updatedAt === "fallback") {
    throw new Error("cannot_update_on_fallback_data");
  }

  const next: ResortData = {
    ...current,
    ...patch,
    resort: patch.resort
      ? {
          ...current.resort,
          ...patch.resort,
          coordinates: patch.resort.coordinates
            ? { ...current.resort.coordinates, ...patch.resort.coordinates }
            : current.resort.coordinates,
        }
      : current.resort,
    today: patch.today
      ? {
          ...current.today,
          ...patch.today,
          snapshot: patch.today.snapshot ?? current.today.snapshot,
        }
      : current.today,
    access: patch.access
      ? {
          ...current.access,
          ...patch.access,
          cards: patch.access.cards ?? current.access.cards,
          bullets: patch.access.bullets ?? current.access.bullets,
        }
      : current.access,
    courses: patch.courses
      ? {
          ...current.courses,
          ...patch.courses,
          items: patch.courses.items ?? current.courses.items,
        }
      : current.courses,
    ticketsRental: patch.ticketsRental
      ? {
          ...current.ticketsRental,
          ...patch.ticketsRental,
          tickets: patch.ticketsRental.tickets ?? current.ticketsRental.tickets,
          rentals: patch.ticketsRental.rentals ?? current.ticketsRental.rentals,
          payments: patch.ticketsRental.payments ?? current.ticketsRental.payments,
        }
      : current.ticketsRental,
    lessonsEvents: patch.lessonsEvents
      ? {
          ...current.lessonsEvents,
          ...patch.lessonsEvents,
          items: patch.lessonsEvents.items ?? current.lessonsEvents.items,
        }
      : current.lessonsEvents,
    stayLocal: patch.stayLocal
      ? {
          ...current.stayLocal,
          ...patch.stayLocal,
          spots: patch.stayLocal.spots ?? current.stayLocal.spots,
        }
      : current.stayLocal,
    news: patch.news
      ? {
          ...current.news,
          ...patch.news,
          items: patch.news.items ?? current.news.items,
        }
      : current.news,
    contact: patch.contact
      ? {
          ...current.contact,
          ...patch.contact,
          general: patch.contact.general
            ? { ...current.contact.general, ...patch.contact.general }
            : current.contact.general,
          group: patch.contact.group
            ? { ...current.contact.group, ...patch.contact.group }
            : current.contact.group,
        }
      : current.contact,
    liftDeals: patch.liftDeals
      ? {
          ...current.liftDeals,
          ...patch.liftDeals,
          sections: patch.liftDeals.sections ?? current.liftDeals.sections,
        }
      : current.liftDeals,
    liveCams: patch.liveCams
      ? {
          ...current.liveCams,
          ...patch.liveCams,
          items: patch.liveCams.items ?? current.liveCams.items,
        }
      : current.liveCams,
    faq: patch.faq
      ? {
          ...current.faq,
          ...patch.faq,
          categories: patch.faq.categories ?? current.faq.categories,
        }
      : current.faq,
    updatedAt: new Date().toISOString(),
  };

  if (!isValidResortData(next)) {
    throw new Error("patch_produces_invalid_schema");
  }

  await fs.writeFile(TMP_DATA_FILE_PATH, JSON.stringify(next, null, 2), "utf-8");
  await fs.rename(TMP_DATA_FILE_PATH, DATA_FILE_PATH);
  return next;
}
