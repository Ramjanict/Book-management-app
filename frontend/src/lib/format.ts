import type { Book, BookStatus, BorrowStatus, Role } from "../types";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function authorName(book: { author?: Book["author"] }) {
  return book.author?.penName || book.author?.user?.name || "Unknown author";
}

export function money(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return null;
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function day(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function withProtocol(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function apiError(error: unknown) {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: { message?: string | string[] } }).data;
    if (Array.isArray(data?.message)) return data.message.join(" ");
    if (typeof data?.message === "string") return data.message;
  }
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: number | string }).status;
    if (status === "FETCH_ERROR") return "The library API is not reachable.";
  }
  return "Something went wrong. Try again.";
}

export function homeFor(role?: Role) {
  if (role === "ADMIN") return "/admin";
  if (role === "AUTHOR") return "/studio";
  return "/";
}

export const NEXT_BORROW: Record<BorrowStatus, BorrowStatus[]> = {
  REQUESTED: ["APPROVED", "CANCELLED"],
  APPROVED: ["BORROWED", "CANCELLED"],
  BORROWED: ["RETURNED", "OVERDUE", "CANCELLED"],
  OVERDUE: ["RETURNED"],
  RETURNED: [],
  CANCELLED: [],
};

export function countBy(values: string[]) {
  const map = new Map<string, number>();
  for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

const COVER_TONES = ["#d7ebe3", "#f3e4cf", "#e6e3f4", "#f6dfdf", "#e3ead4"];

export function coverTone(title: string) {
  let index = 0;
  for (const char of title) index = (index + char.charCodeAt(0)) % COVER_TONES.length;
  return COVER_TONES[index];
}

export function statusTone(status?: BookStatus | BorrowStatus | string) {
  if (status === "PUBLISHED" || status === "BORROWED" || status === "ACTIVE" || status === "APPROVED") {
    return "bg-pine-soft text-pine-dark";
  }
  if (status === "PENDING_REVIEW" || status === "REQUESTED" || status === "PENDING") {
    return "bg-amber-50 text-gold";
  }
  if (status === "BLOCKED" || status === "CANCELLED" || status === "OVERDUE") return "bg-red-50 text-clay";
  return "bg-stone-100 text-stone-600";
}
