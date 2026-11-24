import { test } from "node:test";
import assert from "node:assert/strict";
import { season, strip, action, remaining } from "./season.ts";

// Only the fields the season logic reads; the rest of the schema does not matter here.
const ed = (over: Record<string, unknown> = {}) =>
  ({ year: "2026", documents: [], ...over }) as Parameters<typeof season>[0];

const e26 = ed({ event_date: "2026-03-06", registration_opens: "2026-01-12", registration_closes: "2026-03-02", registration_url: "https://form" });

test("season follows the calendar", () => {
  assert.equal(season(e26, "2026-01-11"), "upcoming");
  assert.equal(season(e26, "2026-01-12"), "open");
  assert.equal(season(e26, "2026-03-02"), "open");
  assert.equal(season(e26, "2026-03-03"), "closed");
  assert.equal(season(e26, "2026-03-06"), "live");
  assert.equal(season(e26, "2026-03-07"), "done");
});

test("season without dates", () => {
  assert.equal(season(ed(), "2026-02-01"), "upcoming");
  assert.equal(season(ed({ registration_url: "https://form" }), "2026-02-01"), "open");
});

test("strip counts to the next deadline, in Rome time", () => {
  assert.deepEqual(strip(e26, "upcoming"), { label: "Le iscrizioni aprono tra", to: "2026-01-12T00:00:00+01:00", side: { text: "La gara", date: "6 marzo" } });
  assert.equal(strip(e26, "open")!.to, "2026-03-02T23:59:59+01:00");
  assert.equal(strip(e26, "closed")!.to, "2026-03-06T00:00:00+01:00");
  assert.equal(strip(e26, "live")!.to, undefined);
  assert.equal(strip(e26, "done")!.label, "Gara conclusa");
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

test("done shows the documents note only when there are documents", () => {
  assert.equal(strip(e26, "done")!.side, undefined);
  const docs = ed({ documents: [{ kind: "testo" }] });
  assert.equal(strip(docs, "done")!.side!.text, "Testo e soluzioni online");
});

test("action by season", () => {
  assert.equal(action(e26, "upcoming", "https://aisf").href, "https://aisf");
  assert.equal(action(e26, "open", "https://aisf").href, "https://form");
  assert.equal(action(e26, "done", "https://aisf").label, "Edizione 2026");
});

test("remaining splits a duration and never goes negative", () => {
  const now = Date.parse("2026-02-10T09:00:00+01:00");
  assert.deepEqual(remaining("2026-03-02T23:59:59+01:00", now), { d: 20, h: 14, m: 59, s: 59 });
  assert.deepEqual(remaining("2026-02-01T00:00:00+01:00", now), { d: 0, h: 0, m: 0, s: 0 });
});
