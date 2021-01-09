
# SITO TEMPLATE

Template per i siti AISF

## Struttura del sito 
Ci sono 4 pagine di esempio
- `home.html` -> homepage
- `facilities.html` -> esempio di pagina con cards
- `programme.html` -> esempio di pagina con schedule
- `registration.html` -> esempio di pagina con informazioni varie

La cartella `data` raccoglie _il contenuto_ del sito. Le pagine `.html` invece definiscono _come viene presentato_.

### CSS e fogli di stile
Il _CSS_ del sito è diviso tra le cartelle `/_sass` e `/css`. In `/_sass` va messo *solo* il file `main.css`, che include i file necessari di `/_sass`. Il css personalizzato *non* va scritto in `main.css` (per una questione di ordine). 

Vengono importati automaticamente:
- i file di Materializecss (`_sass/_materialize.scss` e la cartella `_sass/components/`)
- `_sass/base.scss`
- `_sass/_layout.scss`
- `_social.scss`
- `_syntax-highlighting.scss`


Per aggiungere altri file da importare, inserirli in coda alla variabile `custom-css` in `/_data/generic.yml`. Il nome del file da importare deve iniziare con `_` (underscore) ed avere estensione `.scss`. La stringa da aggiungere a `custom-css`, invece, deve contenere solo il "titolo" del file (quindi senza `_` e `.scss`). Il codice che si occupa dell'importazione degli altri file è in `/css/main.css`.

### Javascript
Vengono importati automaticamente:
- `js/init.js` -> importato in tutte le pagine contiene codice da eseguire sempre 
- `js/jquery.min.js`
- `js/materialize.min.js`

È possibile specificare, pagina per pagina, un file nella cartella `js/` da importare aggiungendo `script: nomefile.js` nel _front matter_ del file `.html` in questione. Per un esempio, guardare `facilities.html`.

Per quanto riguarda i due file di esempio:
- `js/facilities.js` contiene un esempio di animazione sulle cards, per cui se viene aperta la pagina `ai-sf.it/nomedelsito/facilities#id-card` risulta evidenziata la card corrisondente all'id dato. Per adattarlo, bisogna modificare la riga marcata con commento cambiando nome del sito e della pagina.
- `js/home.js` contiene poche righe necessarie alla creazione della home con immagina grande e freccia in basso a destra per scorrere in basso