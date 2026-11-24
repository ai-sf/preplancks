import type { CollectionEntry } from "astro:content";

type Edition = CollectionEntry<"editions">["data"];
export type Season = "upcoming" | "open" | "closed" | "live" | "done";

// The site is static: the state is computed at build time, so the deploy workflow rebuilds daily.
// PREVIEW_DATE (yyyy-MM-dd) fakes today, to look at the other states while developing.
// The same file runs in the browser (index.astro), where `process` does not exist.
const preview = typeof process !== "undefined" ? process.env.PREVIEW_DATE : undefined;
export function todayRome(now = new Date()): string {
  if (preview) return preview;
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(now);
}

export function season(e: Edition, today = todayRome()): Season {
  if (e.event_date && today > e.event_date) return "done";
  if (e.event_date && today === e.event_date) return "live";
  if (e.registration_closes && today > e.registration_closes) return "closed";
  if (e.registration_opens && today < e.registration_opens) return "upcoming";
  if (!e.registration_opens && !e.registration_closes && !e.registration_url) return "upcoming";
  return "open";
}

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("it-IT", { ...opts, timeZone: "UTC" })
    .format(new Date(iso + "T12:00:00Z"))
    .replace(/^1 /, "1° "); // Italian ordinal for the first of the month

export const longDate = (iso: string) => fmt(iso, { day: "numeric", month: "long", year: "numeric" });
export const shortDate = (iso: string) => fmt(iso, { day: "numeric", month: "long" });

// Europe/Rome offset ("+01:00" or "+02:00") at that clock time, so deadlines are Rome time whatever the server's zone.
// Read at the same hh:mm in UTC: the switch happens at 01:00 UTC, so midnight and 23:59 both land on the right side.
function romeOffset(iso: string, time: string): string {
  const name = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", timeZoneName: "shortOffset" })
    .formatToParts(new Date(`${iso}T${time}Z`))
    .find((p) => p.type === "timeZoneName")!.value;
  const h = Number(name.replace("GMT", "") || 0);
  return `${h < 0 ? "-" : "+"}${String(Math.abs(h)).padStart(2, "0")}:00`;
}
const at = (iso: string, time: string) => `${iso}T${time}${romeOffset(iso, time)}`;

export interface Strip {
  /** Text before the countdown, or the headline when there is no countdown. */
  label: string;
  /** ISO instant the countdown runs to; absent when there is nothing to count. */
  to?: string;
  /** Right-hand side: a lead-in and an optional highlighted date. */
  side?: { text: string; date?: string };
}

// The band under the hero: what happens next and when. Registrations close at the end of their day,
// the race counts to midnight at its start (the time of day is not in the data).
export function strip(e: Edition, s: Season): Strip | null {
  const race = e.event_date ? { text: "La gara", date: shortDate(e.event_date) } : undefined;
  const toRace = e.event_date ? { label: "La gara è tra", to: at(e.event_date, "00:00:00") } : null;
  if (s === "upcoming") {
    if (e.registration_opens) return { label: "Le iscrizioni aprono tra", to: at(e.registration_opens, "00:00:00"), side: race };
    return toRace && { ...toRace, side: undefined };
  }
  if (s === "open") {
    if (e.registration_closes) return { label: "Le iscrizioni chiudono tra", to: at(e.registration_closes, "23:59:59"), side: race };
    return toRace && { ...toRace, side: undefined };
  }
  if (s === "closed") return toRace && { ...toRace, side: { text: "Iscrizioni chiuse" } };
  if (s === "live") return { label: "Oggi si gioca", side: e.where ? { text: e.where } : undefined };
  const online = e.documents.some((d) => d.kind === "testo" || d.kind === "soluzioni");
  return { label: "Gara conclusa", side: online ? { text: "Testo e soluzioni online" } : undefined };
}

// Primary action of the hero, by season.
export function action(e: Edition, s: Season, membershipUrl: string): { label: string; href: string } {
  if (s === "upcoming") return { label: "Iscriviti ad AISF", href: membershipUrl };
  if (s === "open") return { label: "Iscrivi la squadra", href: e.registration_url ?? "#iscrizione" };
  if (s === "closed" || s === "live") return { label: "Come funziona", href: "#iscrizione" };
  const hasSolutions = e.documents.some((d) => d.kind === "soluzioni");
  return { label: hasSolutions ? `Soluzioni ${e.year}` : `Edizione ${e.year}`, href: `/edizioni/${e.year}/` };
}

// "Now" as the page is built; with PREVIEW_DATE it is 10:00 Rome on that day, and the page tells the browser so.
export const previewNow = preview ? at(preview, "10:00:00") : undefined;
export const buildNow = () => (previewNow ? Date.parse(previewNow) : Date.now());

/** Whole days, hours, minutes and seconds left to an ISO instant (zeros once it has passed). */
export function remaining(to: string, now = buildNow()) {
  const ms = Math.max(0, Date.parse(to) - now);
  return { d: Math.floor(ms / 864e5), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
}
