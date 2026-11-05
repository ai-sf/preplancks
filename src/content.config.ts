import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
import { readFile } from "node:fs/promises";
import { parse } from "yaml";

// Keep in sync with .pages.yml: a field missing there is dropped when the CMS saves.

// PagesCMS writes dates as 'yyyy-MM-dd'; YAML may also hand us a Date. Both end up as a string.
const day = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v))
  .optional();

const logo = z.object({ name: z.string(), image: z.string(), href: z.string().optional() });

const editions = defineCollection({
  loader: glob({ base: "./src/content/editions", pattern: "*.md" }),
  schema: z.object({
    year: z.string(),
    event_date: day,
    registration_opens: day,
    registration_closes: day,
    registration_url: z.string().optional(),
    host: z.string().optional(),
    host_url: z.string().optional(),
    who: z.string().optional(),
    who_detail: z.string().optional(),
    where: z.string().optional(),
    hero_line: z.string().optional(),
    logos: z.array(logo).default([]),
    theme: z
      .object({ paper: z.string(), accent: z.string(), accent_ink: z.string() })
      .optional(),
    art: z
      .object({
        banner: z.string().optional(),
        banner_mobile: z.string().optional(),
        background: z.string().optional(),
        background_mobile: z.string().optional(),
        alt: z.string().optional(),
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
