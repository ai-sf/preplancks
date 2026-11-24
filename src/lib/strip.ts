import { remaining, type Strip } from "./season.ts";

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const two = (n: number) => String(n).padStart(2, "0");

// The band under the hero. One renderer for the build and for the browser, which redraws it when the state has changed since the build.
export function stripHtml(b: Strip | null): string {
  if (!b) return "";
  const side = b.side ? `<p class="side">${esc(b.side.text)}${b.side.date ? `<b>${esc(b.side.date)}</b>` : ""}</p>` : "";
  let left = `<div class="countdown"><b class="headline">${esc(b.label)}</b></div>`;
  if (b.to) {
    const r = remaining(b.to);
    // hours to seconds start hidden: only the script keeps them current, without it the band shows days
    const unit = (v: number, one: string, many: string) => `<small data-one="${one}" data-n="${many}">${v === 1 ? one : many}</small>`;
    const cell = (k: string, v: number, one: string, many: string) => `<div hidden><b data-${k}>${two(v)}</b>${unit(v, one, many)}</div>`;
    left = `<div class="countdown" data-to="${b.to}" role="timer" aria-label="${esc(b.label)} ${r.d} giorni"><span>${esc(b.label)}</span><div><b data-d>${r.d}</b>${unit(r.d, "giorno", "giorni")}</div>${cell("h", r.h, "ora", "ore")}${cell("m", r.m, "minuto", "minuti")}${cell("s", r.s, "secondo", "secondi")}</div>`;
  }
  return `<div class="container">${left}${side}</div>`;
}
