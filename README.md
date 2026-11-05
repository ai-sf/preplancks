# prePLANCKS

Sito di prePLANCKS, la preselezione italiana per PLANCKS, una gara di fisica teorica per squadre di 3 o 4 studenti di fisica. La organizza ogni primavera AISF (Associazione Italiana Studenti di Fisica). Il sito mostra l'edizione in corso, raccoglie le iscrizioni tramite un modulo esterno e conserva l'archivio di tutte le edizioni dal 2017, con testi dei problemi, soluzioni e foto.

È un sito statico fatto con Astro, modificabile da Pages CMS e pubblicato su GitHub Pages. I testi sono in italiano.

## Com'è fatto il sito

Ci sono tre tipi di pagina:

- La home (`/`) mostra sempre l'edizione più recente: titolo, banner, chi/quando/dove, i passaggi per iscriversi, il muro delle locandine passate e i contatti.
- L'archivio (`/edizioni/`) elenca tutte le edizioni.
- Ogni edizione ha la sua pagina (`/edizioni/2026/`) con banner, PDF da scaricare e galleria fotografica.

Ogni edizione è un solo file in `src/content/editions/`, che prende il nome dall'anno. L'anno più alto è l'edizione corrente. Per portare avanti la home basta aggiungere l'edizione dell'anno nuovo.

Ogni edizione ha un aspetto suo, ricavato dalla grafica di quell'anno: tre colori (sfondo, accento, testo sopra l'accento) e quattro immagini. L'impaginazione resta la stessa. I colori vengono impostati come variabili CSS su `<html>`, quindi il foglio di stile non cambia da un anno all'altro.

### Cosa dice la home

La home cambia con il calendario. Le date stanno nell'edizione e `src/lib/season.ts` le trasforma in uno di cinque stati:

| Stato | Quando | Frase sotto il titolo | Pulsante principale |
| --- | --- | --- | --- |
| upcoming | prima dell'apertura delle iscrizioni, o senza date | Le iscrizioni aprono il giorno X | Iscriviti ad AISF |
| open | tra apertura e chiusura | Iscrizioni aperte fino al giorno X, gara il giorno Y | Iscrivi la squadra |
| closed | dopo la chiusura | Iscrizioni chiuse, la gara è il giorno Y | Come funziona |
| live | il giorno della gara | Oggi si gioca | Come funziona |
| done | dopo la gara | Si è svolta il giorno Y, con testo e soluzioni online se ci sono | Soluzioni (o la pagina dell'edizione) |

Finita l'edizione, la sezione sulle iscrizioni sparisce. Il campo `hero_line` dell'edizione sostituisce la frase generata, se serve dire altro.

Il sito è statico, quindi lo stato si calcola al momento della build. Una pianificazione di GitHub Actions lo ricostruisce ogni mattina alle 03:00 UTC, così la home segue le date senza che nessuno intervenga.

## Sviluppo in locale

Serve Node 22.23 o più recente.

```sh
npm install
npm run dev          # http://localhost:4321/preplancks/
npm run build        # output statico in dist/
npm run preview      # serve dist/ in locale
```

Il sito vive sotto `/preplancks`, quindi anche gli indirizzi locali hanno quel prefisso. Nel codice ogni percorso assoluto passa da `u()` in `src/lib/url.ts`. Un link `/edizioni/` scritto a mano funziona in sviluppo e si rompe su Pages.

## Modificare i contenuti

Per tutto ciò che può cambiare un redattore si usa il CMS. Vai su [app.pagescms.org](https://app.pagescms.org), accedi con GitHub e apri questo repository. La configurazione è in `.pages.yml`. Ogni salvataggio nel CMS fa un commit nel repository e il workflow ripubblica il sito.

Le sezioni sono due:

- Edizioni: una voce per anno.
- Sito: i testi uguali ogni anno (organizzazione, contatti, social, i paragrafi su PLANCKS e prePLANCKS, i loghi di IAPS e AISF).

### Aggiungere una nuova edizione

1. In Edizioni crea una voce. L'anno (quattro cifre) diventa il nome del file e l'indirizzo.
2. Compila la data della gara e le date di apertura e chiusura delle iscrizioni. Lascia vuota l'apertura se le iscrizioni partono subito.
3. Incolla il link del modulo in `registration_url`. Il pulsante «Iscrivi la squadra» compare solo se il campo è compilato.
4. Aggiungi la città di PLANCKS e il suo sito, se li conosci.
5. Imposta i tre colori del tema. Lo sfondo deve essere scuro, perché il testo è chiaro.
6. Carica la grafica (vedi sotto) e il logo dell'edizione, per esempio quello di PLANCKS dell'anno.
7. Salva. Alla prossima pubblicazione la home mostra la nuova edizione e quella vecchia passa nell'archivio.

Puoi creare la voce anche subito e completarla man mano: i campi vuoti sono ammessi e la home mostra «Le informazioni arriveranno presto» finché mancano le date. Senza grafica e colori la pagina usa l'aspetto di base (sfondo scuro, accento giallo).

Dopo la gara aggiungi i PDF in «Testi e soluzioni» ed eventuali foto in «Foto». La pagina dell'edizione e la home si aggiornano da sole.

### Grafica

Ogni edizione usa quattro immagini:

| Campo | Dove si usa | Dimensione consigliata |
| --- | --- | --- |
| `banner` | Locandina completa con titolo e loghi, accanto ai dettagli e nell'archivio | 2400 px di larghezza, WebP |
| `banner_mobile` | La stessa locandina in verticale, per la pagina dell'edizione sui telefoni | 1080 x 1920, WebP |
| `background` | Grafica senza testo, dietro il titolo scritto in home | 2400 px di larghezza, WebP |
| `background_mobile` | Grafica senza testo, in verticale | 1080 x 1920, WebP |

In home il titolo è testo vero sopra lo sfondo, quindi lo sfondo non deve contenerlo. Sui telefoni il titolo sta sul colore scuro della pagina, sotto la grafica e mai sopra, così resta leggibile qualunque sia l'illustrazione.

Pages CMS non ridimensiona le immagini: esportale alle misure indicate prima di caricarle.

### Loghi

Nell'intestazione della home compaiono prima i loghi dell'edizione, poi quelli della sezione Sito (IAPS e AISF). Servono loghi chiari su sfondo trasparente. I file stanno in `public/logos/`.

## Come sono collegati i contenuti

`.pages.yml` e `src/content.config.ts` descrivono gli stessi campi due volte: il primo per l'editor del CMS, il secondo come schema zod per Astro. Vanno tenuti allineati. Un campo presente solo nello schema fa fallire la build quando manca. Un campo presente solo in `.pages.yml` viene scartato al salvataggio successivo del CMS.

Cambiare il modello dei dati richiede tre modifiche: aggiungere il campo in `.pages.yml`, aggiungerlo allo schema, usarlo in un componente.

I percorsi dei file multimediali sono salvati nei contenuti come stringhe assolute, per esempio `/editions/2026/banner.webp`. Pages CMS le scrive a partire dalle sorgenti `media` di `.pages.yml`: `public/editions` per i file delle edizioni e `public/logos` per i loghi.

## Struttura del codice

```
.pages.yml                 configurazione del CMS
src/content.config.ts      schemi di edizioni e impostazioni del sito
src/content/editions/      un file Markdown per anno (solo front matter)
src/data/site.yml          testi comuni, contatti, social, loghi IAPS e AISF
src/lib/season.ts          stato della home in base alle date dell'edizione
src/lib/editions.ts        ordinamento, edizione corrente, variabili del tema
src/lib/url.ts             u(): aggiunge il prefisso di deploy ai percorsi
src/layouts/Base.astro     head, font, navigazione, piè di pagina
src/components/            Nav, Footer, Banner (picture con sorgente mobile), EditionWall
src/pages/                 index, edizioni/index, edizioni/[year], 404
src/styles/global.css      variabili, impaginazione, componenti (un solo file)
public/editions/<anno>/    banner, PDF, foto della galleria
public/logos/              loghi
scripts/migrate.py         importazione una tantum dal vecchio sito Jekyll
```

### Stile

Un solo foglio di stile, CSS semplice, nessun framework. Spaziature, dimensioni del testo e colori sono variabili in cima al file. I colori dell'edizione (`--color-paper`, `--color-accent`, `--color-accent-ink`) arrivano dal CMS e vengono impostati su `<html>`; tutti gli altri colori delle superfici si ricavano da questi con `color-mix`. I font sono Dela Gothic One (titoli) e Hanken Grotesk (testo), installati con `@fontsource`, quindi nessuna richiesta parte verso una CDN di font.

L'aspetto nasce da un'esplorazione grafica conservata in `design-options/`: mockup HTML statici di tre direzioni, di cui è stata scelta `a2.html`. È solo materiale di riferimento e non fa parte della build.

## Reimportare il vecchio sito

`scripts/migrate.py` ha ricostruito l'archivio a partire dal vecchio sito Jekyll (`ai-sf/preplancks`). Legge i file dati e la cronologia git di quel repository, copia e ridimensiona PDF e foto, e scrive i file delle edizioni. Si può rilanciare senza danni, ma sovrascrive i file delle edizioni che gestisce: non va eseguito dopo aver modificato quei file dal CMS.

```sh
python3 scripts/migrate.py /percorso/del/vecchio/preplancks
```

Servono Python 3 con `Pillow` e `PyYAML`.

Alcuni dati importati sono incompleti o dedotti e vanno controllati nel CMS:

- I banner 2023 e 2024 sono composizioni. Il vecchio sito sovrapponeva un'immagine con il titolo a una grafica senza testo, e lo script riproduce quella sovrapposizione. Se hai i banner originali, sostituiscili.
- La data della gara 2024 è il 16 febbraio 2024. Nei vecchi dati c'era scritto 2023, un refuso, quindi l'anno è dedotto.
- Per la maggior parte degli anni mancano le date di apertura delle iscrizioni e la città di PLANCKS, perché il vecchio repository non le contiene.
- Le palette dei colori per il 2023, il 2024 e il 2025 sono state scelte a occhio dalla grafica.

## Sviluppo con agenti

Il progetto è pensato per essere sviluppato anche con agenti di programmazione. Le istruzioni per loro stanno in `AGENTS.md` (`CLAUDE.md` è un collegamento allo stesso file): comandi, modello dei contenuti, regole grafiche, convenzioni sui commit e punti noti da controllare.

Le competenze usate per la grafica sono `hallmark` e `design-taste-frontend`. `skills-lock.json` ne fissa le versioni con un hash, mentre le copie installate (`.agents/skills/` e i collegamenti in `.claude/skills/`) non sono nel repository: dopo il clone si ripristinano con `npx skills experimental_install`. Il file `mcp.json` aggiunge il server MCP della documentazione di Astro.

## Pubblicazione

Il workflow `.github/workflows/deploy.yml` compila con l'azione ufficiale di Astro e pubblica su GitHub Pages a ogni push su `main`, a ogni esecuzione manuale e ogni mattina alle 03:00 UTC.

Nelle impostazioni del repository, imposta Pages sulla pubblicazione da GitHub Actions. Finché il dominio definitivo non è attivo, aggiungi una variabile del repository `SITE_URL` con l'origine di Pages (per esempio `https://dariozar.github.io`). In produzione lasciala vuota e il sito usa `https://ai-sf.it`. Il percorso base è sempre `/preplancks`, quindi l'indirizzo pubblico è `ai-sf.it/preplancks`.
