import { test } from "node:test";
import assert from "node:assert/strict";
import { season, strip, action, remaining, withArticle, when } from "./season.ts";

// Only the fields the season logic reads; the rest of the schema does not matter here.
const ed = (over: Record<string, unknown> = {}) =>
  ({ year: "2026", documents: [], ...over }) as Parameters<typeof season>[0];
const at = (iso: string) => new Date(iso); // an instant, with its offset

const e26 = ed({ event_date: "2026-03-06", registration_opens: "2026-01-12", registration_closes: "2026-03-02", registration_url: "https://form" });

test("season follows the calendar", () => {
  assert.equal(season(e26, at("2026-01-11T12:00:00+01:00")), "upcoming");
  assert.equal(season(e26, at("2026-01-12T00:00:00+01:00")), "open");
  assert.equal(season(e26, at("2026-03-02T23:00:00+01:00")), "open");
  assert.equal(season(e26, at("2026-03-03T00:00:00+01:00")), "closed");
  assert.equal(season(e26, at("2026-03-06T09:00:00+01:00")), "live");
  assert.equal(season(e26, at("2026-03-07T00:00:00+01:00")), "done");
});

test("registrations close at the closing time, not at the end of the day", () => {
  const e = ed({ registration_url: "https://form", registration_closes: "2026-12-08", registration_closes_time: "20:00", event_date: "2026-12-11" });
  assert.equal(season(e, at("2026-12-08T19:59:00+01:00")), "open");
  assert.equal(season(e, at("2026-12-08T20:00:01+01:00")), "closed");
  assert.equal(strip(e, "open")!.to, "2026-12-08T20:00:00+01:00");
});

test("season without dates, and without a form or an opening date", () => {
  assert.equal(season(ed(), at("2026-02-01T12:00:00+01:00")), "upcoming");
  assert.equal(season(ed({ registration_url: "https://form" }), at("2026-02-01T12:00:00+01:00")), "open");
  assert.equal(season(ed({ registration_closes: "2026-12-08" }), at("2026-11-24T12:00:00+01:00")), "upcoming");
});

test("strip counts to the next deadline, in Rome time", () => {
  assert.deepEqual(strip(e26, "upcoming"), { label: "Le iscrizioni aprono tra", to: "2026-01-12T00:00:00+01:00", side: { text: "La gara", date: "6 marzo" } });
  assert.equal(strip(e26, "open")!.to, "2026-03-02T23:59:59+01:00");
  assert.equal(strip(e26, "closed")!.to, "2026-03-06T00:00:00+01:00");
  assert.equal(strip(e26, "done")!.label, "Gara conclusa");
});

test("race day counts to the start time, then says it is on", () => {
  const e = ed({ event_date: "2026-12-11", event_start: "14:30" });
  assert.equal(strip(e, "closed")!.to, "2026-12-11T14:30:00+01:00");
  assert.equal(strip(e, "live", Date.parse("2026-12-11T10:00:00+01:00"))!.label, "La gara inizia tra");
  assert.equal(strip(e, "live", Date.parse("2026-12-11T15:00:00+01:00"))!.label, "Oggi si gioca");
  assert.equal(strip(ed({ event_date: "2026-12-11" }), "live", Date.parse("2026-12-11T10:00:00+01:00"))!.label, "Oggi si gioca");
});

test("strip falls back to the race when a date is missing, and to nothing without dates", () => {
  assert.equal(strip(ed({ event_date: "2026-03-06" }), "upcoming")!.label, "La gara è tra");
  assert.equal(strip(ed(), "upcoming"), null);
});

test("the offset follows daylight saving, also on the day it changes", () => {
  assert.equal(strip(ed({ event_date: "2026-07-10" }), "closed")!.to, "2026-07-10T00:00:00+02:00");
  assert.equal(strip(ed({ event_date: "2026-03-29" }), "closed")!.to, "2026-03-29T00:00:00+01:00");
  assert.equal(strip(ed({ event_date: "2026-10-25" }), "closed")!.to, "2026-10-25T00:00:00+02:00");
  assert.equal(strip(ed({ registration_closes: "2026-03-29" }), "open")!.to, "2026-03-29T23:59:59+02:00");
});

test("action by season", () => {
  assert.equal(action(e26, "upcoming", "https://aisf").href, "https://aisf");
  assert.equal(action(e26, "open", "https://aisf").href, "https://form");
  assert.equal(action(e26, "done", "https://aisf").label, "Edizione 2026");
});

test("Italian dates", () => {
  assert.equal(withArticle("2026-03-02"), "il 2 marzo");
  assert.equal(withArticle("2026-12-08"), "l'8 dicembre");
  assert.equal(withArticle("2026-12-11"), "l'11 dicembre");
  assert.equal(withArticle("2026-03-01"), "il 1° marzo");
  assert.equal(when(ed({ event_date: "2026-12-11", event_start: "14:30", event_end: "17:30" })), "11 dicembre 2026, dalle 14:30 alle 17:30");
  assert.equal(when(ed({ event_date: "2026-12-11" })), "11 dicembre 2026");
});

test("remaining splits a duration and never goes negative", () => {
  const now = Date.parse("2026-02-10T09:00:00+01:00");
  assert.deepEqual(remaining("2026-03-02T23:59:59+01:00", now), { d: 20, h: 14, m: 59, s: 59 });
  assert.deepEqual(remaining("2026-02-01T00:00:00+01:00", now), { d: 0, h: 0, m: 0, s: 0 });
});

test("stripHtml escapes CMS text and counts only when there is a target", async () => {
  const { stripHtml } = await import("./strip.ts");
  assert.equal(stripHtml(null), "");
  assert.match(stripHtml({ label: "x", side: { text: "<b>dove</b>" } }), /&#60;b&#62;dove/);
  assert.doesNotMatch(stripHtml({ label: "Gara conclusa" }), /data-to/);
  assert.match(stripHtml({ label: "x", to: "2999-01-01T00:00:00+01:00" }), /data-to="2999-01-01T00:00:00\+01:00"/);
});
