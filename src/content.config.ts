import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { readFile } from "node:fs/promises";
import { parse } from "yaml";

// Keep in sync with .pages.yml: a field missing there is dropped when the CMS saves.

// PagesCMS writes dates as 'yyyy-MM-dd'; YAML may also hand us a Date. Both end up as a string.
// The CMS writes '' for fields left empty; that means "not set".
const str = z.string().optional().transform((v) => v || undefined);

const day = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v || undefined))
  .optional();

const logo = z.object({ name: z.string(), image: z.string(), href: str });

const editions = defineCollection({
  loader: glob({ base: "./src/content/editions", pattern: "*.md" }),
  schema: z.object({
    year: z.string(),
    event_date: day,
    registration_opens: day,
    registration_closes: day,
    registration_url: str,
    host: str,
    host_url: str,
    who: str,
    who_detail: str,
    where: str,
    hero_line: str,
    logos: z.array(logo).default([]),
    // all three colours or none: a half-filled theme falls back to the defaults
    theme: z
      .object({ paper: str, accent: str, accent_ink: str })
      .optional()
      .transform((t) => (t?.paper && t.accent && t.accent_ink ? { paper: t.paper, accent: t.accent, accent_ink: t.accent_ink } : undefined)),
    art: z
      .object({
        banner: str,
        banner_mobile: str,
        background: str,
        background_mobile: str,
        alt: str,
      })
      .optional(),
    documents: z
      .array(z.object({ label: z.string(), kind: z.enum(["testo", "soluzioni", "altro"]), file: z.string() }))
      .default([]),
    gallery: z
      .array(z.object({ image: z.string(), alt: z.string().default(""), caption: z.string().default("") }))
      .default([]),
  }),
});

const site = defineCollection({
  loader: async () => {
    const data = parse(await readFile("./src/data/site.yml", "utf8"));
    return [{ id: "site", ...data }];
  },
  schema: z.object({
    name: z.string(),
    organiser: z.string(),
    organiser_url: z.string(),
    organiser_description: z.string(),
    membership_url: z.string(),
    plancks_intro: z.string(),
    preselection_intro: z.string(),
    archive_intro: z.string(),
    email: z.string(),
    socials: z.array(z.object({ name: z.string(), label: z.string(), url: z.string() })).default([]),
    logos: z.array(logo).default([]),
  }),
});

export const collections = { editions, site };
