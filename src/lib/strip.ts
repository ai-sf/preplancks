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
    const cell = (k: string, label: string, v: number) => `<div hidden><b data-${k}>${two(v)}</b><small>${label}</small></div>`;
    left = `<div class="countdown" data-to="${b.to}" role="timer" aria-label="${esc(b.label)} ${r.d} giorni"><span>${esc(b.label)}</span><div><b data-d>${r.d}</b><small>giorni</small></div>${cell("h", "ore", r.h)}${cell("m", "minuti", r.m)}${cell("s", "secondi", r.s)}</div>`;
  }
  return `<div class="container">${left}${side}</div>`;
}
