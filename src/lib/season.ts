import type { CollectionEntry } from "astro:content";

type Edition = CollectionEntry<"editions">["data"];
export type Season = "upcoming" | "open" | "closed" | "live" | "done";

// PREVIEW_DATE (yyyy-MM-dd) fakes today, to look at the other states while developing.
// The same file runs in the browser (index.astro), where `process` does not exist.
const preview = typeof process !== "undefined" ? process.env.PREVIEW_DATE : undefined;
export function todayRome(now = new Date()): string {
  if (preview) return preview;
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Rome" }).format(now);
}

// Registrations end at their closing time (end of that day when no time is set); the race day is "live" all day.
const closesAt = (e: Edition) => e.registration_closes && at(e.registration_closes, e.registration_closes_time ? `${e.registration_closes_time}:00` : "23:59:59");
const startsAt = (e: Edition) => e.event_date && at(e.event_date, e.event_start ? `${e.event_start}:00` : "00:00:00");

export function season(e: Edition, now = new Date(buildNow())): Season {
  const today = todayRome(now);
  const closes = closesAt(e);
  if (e.event_date && today > e.event_date) return "done";
  if (e.event_date && today === e.event_date) return "live";
  if (closes && now.getTime() > Date.parse(closes)) return "closed";
  if (e.registration_opens && today < e.registration_opens) return "upcoming";
  if (!e.registration_opens && !e.registration_url) return "upcoming"; // no opening date and no form: nothing to open yet
  return "open";
}

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("it-IT", { ...opts, timeZone: "UTC" })
    .format(new Date(iso + "T12:00:00Z"))
    .replace(/^1 /, "1° "); // Italian ordinal for the first of the month

export const longDate = (iso: string) => fmt(iso, { day: "numeric", month: "long", year: "numeric" });
export const shortDate = (iso: string) => fmt(iso, { day: "numeric", month: "long" });
// "il 2 marzo", "l'8 dicembre", "l'11 dicembre": Italian elides the article before 8 and 11.
export const withArticle = (iso: string) => `${[8, 11].includes(Number(iso.slice(8, 10))) ? "l'" : "il "}${shortDate(iso)}`;
/** "dalle 14:30 alle 17:30" (empty when no start is set). */
export const hours = (e: Edition) => (e.event_start ? `dalle ${e.event_start}${e.event_end ? ` alle ${e.event_end}` : ""}` : "");
/** "11 dicembre 2026, dalle 14:30 alle 17:30" (the hours only when they are set). */
export const when = (e: Edition) => e.event_date && longDate(e.event_date) + (e.event_start ? `, ${hours(e)}` : "");

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

// The band under the hero: what happens next and when.
export function strip(e: Edition, s: Season, now = buildNow()): Strip | null {
  const race = e.event_date ? { text: "La gara", date: shortDate(e.event_date) } : undefined;
  const start = startsAt(e);
  const toRace = start ? { label: "La gara è tra", to: start } : null;
  const closes = closesAt(e);
  if (s === "upcoming") {
    if (e.registration_opens) return { label: "Le iscrizioni aprono tra", to: at(e.registration_opens, "00:00:00"), side: race };
    return toRace && { ...toRace, side: undefined };
  }
  if (s === "open") {
    if (closes) return { label: "Le iscrizioni chiudono tra", to: closes, side: race };
    return toRace && { ...toRace, side: undefined };
  }
  if (s === "closed") return toRace && { ...toRace, side: { text: "Iscrizioni chiuse" } };
  const where = e.where ? { text: e.where } : undefined;
  if (s === "live") return start && e.event_start && now < Date.parse(start) ? { label: "La gara inizia tra", to: start, side: where } : { label: "Oggi si gioca", side: where };
  return { label: "Gara conclusa" };
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
