import type { CollectionEntry } from "astro:content";

type Edition = CollectionEntry<"editions">["data"];
export type Season = "upcoming" | "open" | "closed" | "live" | "done";

// The site is static: the state is computed at build time, so the deploy workflow rebuilds daily.
export function todayRome(now = new Date()): string {
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

export interface Hero {
  line: string;
  action: { label: string; href: string };
}

// One sentence under the title plus the primary action, by season. hero_line overrides the sentence.
export function hero(e: Edition, s: Season, membershipUrl: string): Hero {
  const ev = e.event_date ? shortDate(e.event_date) : "";
  const hasSolutions = e.documents.some((d) => d.kind === "soluzioni");
  const hasText = e.documents.some((d) => d.kind === "testo");
  let line = "";
  let action = { label: "Tutte le edizioni", href: "/edizioni/" };
  if (s === "upcoming") {
    line = e.registration_opens ? `Le iscrizioni aprono il ${shortDate(e.registration_opens)}.` : ev ? `La gara è il ${ev}.` : "";
    action = { label: "Iscriviti ad AISF", href: membershipUrl };
  } else if (s === "open") {
    line = e.registration_closes ? `Iscrizioni aperte fino al ${shortDate(e.registration_closes)}${ev ? `, gara il ${ev}` : ""}.` : "Iscrizioni aperte.";
    action = { label: "Iscrivi la squadra", href: e.registration_url ?? "#iscrizione" };
  } else if (s === "closed") {
    line = `Iscrizioni chiuse${ev ? `. La gara è il ${ev}` : ""}.`;
    action = { label: "Come funziona", href: "#iscrizione" };
  } else if (s === "live") {
    line = `Oggi si gioca${e.where ? `: ${e.where.charAt(0).toLowerCase()}${e.where.slice(1)}` : ""}.`;
    action = { label: "Come funziona", href: "#iscrizione" };
  } else {
    line = `Si è svolta il ${ev}${hasSolutions ? ": testo e soluzioni sono online" : hasText ? ": il testo è online" : ""}.`;
    action = { label: hasSolutions ? `Soluzioni ${e.year}` : `Edizione ${e.year}`, href: `/edizioni/${e.year}/` };
  }
  return { line: e.hero_line || line || `Le informazioni su prePLANCKS ${e.year.slice(2)} arriveranno presto.`, action };
}
