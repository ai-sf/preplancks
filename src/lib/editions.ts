import { getCollection, getEntry } from "astro:content";

export async function getEditions() {
  return (await getCollection("editions")).sort((a, b) => b.data.year.localeCompare(a.data.year));
}

// The newest edition is the current one.
export async function getCurrent() {
  return (await getEditions())[0];
}

export async function getSite() {
  return (await getEntry("site", "site"))!.data;
}

export function themeStyle(theme?: { paper: string; accent: string; accent_ink: string }) {
  if (!theme) return undefined;
  return `--color-paper:${theme.paper};--color-accent:${theme.accent};--color-accent-ink:${theme.accent_ink};`;
}
