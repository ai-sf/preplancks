# prePLANCKS

Sito di prePLANCKS, la preselezione italiana per PLANCKS, una gara di problem solving di fisica per squadre di 3 o 4 studenti organizzata da AISF (Associazione Italiana Studenti di Fisica). Il sito mostra l'edizione in corso, raccoglie le iscrizioni tramite un modulo esterno e conserva l'archivio di tutte le edizioni dal 2017, con testi dei problemi, soluzioni e foto.

È un sito statico fatto con Astro, modificabile da Pages CMS e pubblicato su GitHub Pages all'indirizzo `ai-sf.it/preplancks`. I testi sono in italiano.

## Come funziona

Le pagine sono di tre tipi: la home (`/`) mostra sempre l'edizione più recente, con titolo, banner, chi/quando/dove, i passaggi per iscriversi, il muro delle locandine passate e i contatti; l'archivio (`/edizioni/`) elenca tutte le edizioni; ogni edizione ha la sua pagina (`/edizioni/2026/`) con banner, PDF da scaricare e galleria fotografica.

Ogni edizione è un solo file in `src/content/editions/`, che prende il nome dall'anno. L'anno più alto è l'edizione corrente, quindi per portare avanti la home basta aggiungere l'edizione dell'anno nuovo. L'edizione corrente compare nell'archivio solo quando la gara è finita; la sua pagina esiste comunque da subito.

Ogni edizione ha un aspetto proprio, ricavato dalla grafica di quell'anno: tre colori (sfondo, accento, testo sopra l'accento) e le immagini descritte più sotto. L'impaginazione resta la stessa e i colori sono variabili CSS impostate su `<html>`, per cui il foglio di stile non cambia da un anno all'altro.

### Gli stati della home

La home cambia con il calendario. Le date stanno nell'edizione e `src/lib/season.ts` le trasforma in uno di cinque stati:

| Stato | Quando | Fascia in fondo allo hero | Pulsante principale |
| --- | --- | --- | --- |
| upcoming | prima dell'apertura delle iscrizioni, o senza date | conto alla rovescia all'apertura (alla gara, se manca l'apertura), a destra la data della gara | Iscriviti ad AISF |
| open | tra apertura e chiusura | conto alla chiusura delle iscrizioni, a destra la data della gara | Iscrivi la squadra |
| closed | dopo la chiusura | conto alla gara, a destra «Iscrizioni chiuse» | Come funziona |
| live | il giorno della gara | «Oggi si gioca» e il luogo | Come funziona |
| done | dopo la gara | «Gara conclusa» | Soluzioni (o la pagina dell'edizione) |

Lo hero contiene loghi, titolo e pulsanti, mentre date e stato stanno solo nella fascia; il campo `hero_line`, se compilato, aggiunge una frase sotto il titolo. Le iscrizioni chiudono all'ora indicata (altrimenti a fine giornata) e la gara conta fino al suo orario di inizio (altrimenti fino a mezzanotte). Finita l'edizione, la sezione sulle iscrizioni sparisce.

Il sito è statico: la build scrive nella pagina lo stato del momento, e uno script nel browser lo ricalcola con le stesse funzioni di `src/lib/season.ts`. Se nel frattempo è passata la scadenza, pulsante, fascia e sezione iscrizioni si aggiornano da soli, senza una nuova pubblicazione. Senza JavaScript resta lo stato dell'ultima build e la fascia mostra solo i giorni; i link «Iscrizione» delle altre pagine seguono sempre l'ultima build.

Per vedere uno stato senza cambiare le date si imposta `PREVIEW_DATE` (aaaa-mm-gg), per esempio `PREVIEW_DATE=2026-02-10 npm run dev`.

## Sviluppo in locale

Serve Node 22.23.4 o più recente.

```sh
npm install
npm run dev          # http://localhost:4321/preplancks/
npm run build        # output statico in dist/
npm run preview      # serve dist/ in locale
npm test             # test della logica degli stati
```

Il sito vive sotto `/preplancks`, quindi anche gli indirizzi locali hanno quel prefisso. Nel codice ogni percorso assoluto passa da `u()` in `src/lib/url.ts`: un link `/edizioni/` scritto a mano funziona in sviluppo e si rompe su Pages.

## Modificare i contenuti

Tutto ciò che può cambiare un redattore si modifica dal CMS. Si accede da [app.pagescms.org](https://app.pagescms.org) con GitHub, aprendo questo repository; la configurazione è in `.pages.yml`. Ogni salvataggio fa un commit sul ramo `main` e il workflow ripubblica il sito.

Le sezioni sono due: Edizioni (una voce per anno) e Sito (i testi uguali ogni anno: organizzazione, contatti, social, i paragrafi su PLANCKS e prePLANCKS, i loghi di IAPS e AISF).

### Aggiungere una nuova edizione

1. In Edizioni crea una voce: l'anno (quattro cifre) diventa il nome del file e l'indirizzo.
2. Compila la data della gara e le date di apertura e chiusura delle iscrizioni. Gli orari sono facoltativi: inizio e fine della gara (il conto alla rovescia arriva all'inizio) e ora di chiusura delle iscrizioni (senza, valgono fino a fine giornata). Se l'apertura è vuota e non c'è il link al modulo, le iscrizioni risultano non aperte; con il link e senza data di apertura sono aperte da subito.
3. Incolla il link del modulo in `registration_url`: il pulsante «Iscrivi la squadra» compare solo se il campo è compilato.
4. Aggiungi la città di PLANCKS con il paese (per esempio «San Pedro Sula, Honduras», perché compare nei titoli) e il suo sito, se li conosci.
5. Imposta i tre colori del tema. Lo sfondo deve essere scuro, perché il testo è chiaro.
6. Carica la grafica (vedi sotto) e il logo dell'edizione, per esempio quello di PLANCKS dell'anno.
7. Salva. Alla prossima pubblicazione la home mostra la nuova edizione e quella vecchia passa nell'archivio, quando la sua gara è finita.

La voce si può creare subito e completare man mano: i campi vuoti sono ammessi e la home mostra «Le informazioni arriveranno presto» finché mancano le date. Senza grafica e colori la pagina usa l'aspetto di base (sfondo scuro, accento giallo). La descrizione per i motori di ricerca e per le anteprime della pagina di un'edizione si scrive da sola, a partire da anno, ospitante e data della gara.

Dopo la gara si aggiungono i PDF in «Testi e soluzioni» ed eventuali foto in «Foto»: la pagina dell'edizione e la home si aggiornano da sole.

### Grafica

Ogni edizione usa fino a sei immagini:

| Campo | Dove si usa | Dimensione consigliata |
| --- | --- | --- |
| `banner` | Locandina completa con titolo e loghi, accanto ai dettagli e nell'archivio | 2400 px di larghezza, WebP |
| `banner_mobile` | La stessa locandina in verticale, per la pagina dell'edizione sui telefoni | 1080 x 1920, WebP |
| `background` | Grafica senza testo, dietro il titolo scritto in home | 2400 px di larghezza, WebP |
| `background_mobile` | Grafica senza testo, in verticale | 1080 x 1920, WebP |
| `separator` | Striscia decorativa (facoltativa) tra le sezioni della home | una sola immagine larga per tutti gli schermi, SVG o WebP |
| `share` | Anteprima del link su WhatsApp e sui social (facoltativa) | 1200 x 630, JPG o PNG |

In home il titolo è testo vero sopra lo sfondo, quindi lo sfondo non deve contenerlo. Sui telefoni la grafica sta dietro a loghi, titolo, pulsanti e fascia come su desktop, per cui la versione verticale deve essere abbastanza scura da reggere il testo chiaro.

Il separatore ha altezza fissa (3 rem, 2,5 su telefono), è centrato e sui telefoni viene tagliato dai bordi dello schermo; sta a cavallo del bordo superiore delle sezioni «Una gara di problem solving…», «Come iscrivere una squadra», «Le edizioni precedenti» e «Contatti». L'animazione (la striscia si scopre da sinistra quando entra nello schermo) è fatta dal CSS sull'immagine intera, quindi funziona con qualunque disegno e non va riscritta ogni anno; con il movimento ridotto nelle preferenze del sistema l'immagine resta ferma.

Pages CMS non ridimensiona le immagini: vanno esportate alle misure indicate prima di caricarle.

### Loghi

Nell'intestazione della home compaiono prima i loghi dell'edizione, poi quelli della sezione Sito (IAPS e AISF). Servono loghi chiari su sfondo trasparente; i file stanno in `public/logos/`.

## Struttura del codice

```
.pages.yml                 configurazione del CMS
src/content.config.ts      schemi di edizioni e impostazioni del sito
src/content/editions/      un file Markdown per anno (solo front matter)
src/data/site.yml          testi comuni, contatti, social, loghi IAPS e AISF
src/lib/season.ts          stato della home in base alle date dell'edizione
src/lib/strip.ts           la fascia sotto lo hero (build e browser)
src/lib/editions.ts        ordinamento, edizione corrente, archivio, variabili del tema
src/lib/url.ts             u(): aggiunge il prefisso di deploy ai percorsi
src/layouts/Base.astro     head, anteprime social, font, navigazione, piè di pagina
src/components/            Nav, Footer, Banner, Separator, EditionWall
src/pages/                 index, edizioni/index, edizioni/[year], 404
src/styles/global.css      variabili, impaginazione, componenti (un solo file)
public/editions/<anno>/    immagini, PDF e foto della galleria
public/logos/              loghi
```

`.pages.yml` e `src/content.config.ts` descrivono gli stessi campi due volte, il primo per l'editor del CMS e il secondo come schema zod per Astro, e vanno tenuti allineati: un campo presente solo nello schema fa fallire la build quando manca; un campo presente solo in `.pages.yml` viene scartato al salvataggio successivo del CMS. Aggiungere un campo richiede quindi tre modifiche: in `.pages.yml`, nello schema e nel componente che lo usa.

I percorsi dei file multimediali sono salvati nei contenuti come stringhe assolute, per esempio `/editions/2026/banner.webp`. Pages CMS le scrive a partire dalle sorgenti `media` di `.pages.yml`: `public/editions` per i file delle edizioni e `public/logos` per i loghi.

Lo stile è un solo foglio CSS semplice, senza framework: spaziature, dimensioni e colori sono variabili in cima al file e i colori delle superfici si ricavano da quelli dell'edizione con `color-mix`. I font (Dela Gothic One per i titoli, Hanken Grotesk per il testo) sono installati con `@fontsource`, quindi nessuna richiesta parte verso una CDN.

## Pubblicazione

Il workflow `.github/workflows/deploy.yml` compila con l'azione ufficiale di Astro e pubblica su GitHub Pages a ogni push su `main` (quindi anche a ogni salvataggio del CMS) e a ogni esecuzione manuale; non c'è nessuna build programmata. Nelle impostazioni del repository Pages è impostato sulla pubblicazione da GitHub Actions e l'ambiente `github-pages` ammette solo il ramo `main`.

L'indirizzo pubblico è `ai-sf.it/preplancks`: il dominio è quello del sito principale dell'associazione e il percorso base del progetto è sempre `/preplancks`. Per provare il sito su un altro indirizzo (per esempio un repository personale) si imposta la variabile del repository `SITE_URL` con l'origine di Pages; sul repository dell'associazione resta vuota e il sito usa `https://ai-sf.it`.

## L'archivio importato

L'archivio 2017-2026 è stato importato una volta dal vecchio sito Jekyll, che resta nel ramo `legacy` e nel tag `sito-vecchio`; lo script d'importazione è nella cronologia git. Alcuni dati sono incompleti o dedotti e vanno controllati nel CMS:

- I banner 2023 e 2024 sono composizioni: il vecchio sito sovrapponeva un'immagine con il titolo a una grafica senza testo, e l'importazione ha riprodotto quella sovrapposizione. Se si hanno i banner originali, conviene sostituirli.
- La data della gara 2024 è il 16 febbraio 2024; nei vecchi dati c'era scritto 2023, un refuso, quindi l'anno è dedotto.
- Per la maggior parte degli anni mancano le date di apertura delle iscrizioni e la città di PLANCKS, perché il vecchio repository non le contiene.
- Le palette dei colori per il 2023, il 2024 e il 2025 sono state scelte a occhio dalla grafica.

## Sviluppo con agenti

Il progetto si può sviluppare anche con agenti di programmazione. Le istruzioni per loro stanno in `AGENTS.md` (`CLAUDE.md` è un collegamento allo stesso file): comandi, modello dei contenuti, regole grafiche, convenzioni sui commit e punti noti da controllare. Le competenze usate per la grafica sono `hallmark` e `design-taste-frontend`; `skills-lock.json` ne fissa le versioni con un hash, mentre le copie installate non sono nel repository e dopo il clone si ripristinano con `npx skills experimental_install`. Il file `mcp.json` aggiunge il server MCP della documentazione di Astro.
