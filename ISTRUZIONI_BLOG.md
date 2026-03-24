# Guida al Blog — Angelo Guarnerio

Questa guida ti spiega come gestire il blog del tuo sito in modo semplice, senza toccare codice complesso.

---

## Come funziona (in breve)

```
posts/
  index.json        ← il registro di tutti gli articoli
  nome-articolo.md  ← il testo dell'articolo in formato Markdown

blog/
  index.html        ← la pagina del blog (lista articoli)
  post.html         ← il lettore di articoli (non toccare)
```

Ogni articolo è un file `.md` (Markdown) nella cartella `posts/`.
Il file `posts/index.json` dice al sito quali articoli esistono e come si chiamano.

---

## FASE 1 — Rimuovere il "Coming Soon"

Quando sei pronto a mostrare gli articoli, devi fare **due piccole modifiche** al file `blog/index.html`.

### Passo 1 — Elimina la sezione "Coming Soon"

Apri `blog/index.html` con un editor di testo (es. VS Code).
Trova e **cancella** tutto il blocco seguente (circa righe 70–90):

```html
<!-- ══════════════════════════════════════════════
     SEZIONE COMING SOON
     Quando sei pronto, rimuovi tutto questo blocco
     e togli "hidden" dalla sezione posts-section.
══════════════════════════════════════════════ -->
<section class="cs-section" id="coming-soon">
  ...
</section>
```

Cancella dall'apertura del commento `<!-- ═══...` fino a `</section>` incluso.

### Passo 2 — Rendi visibile la lista degli articoli

Sempre in `blog/index.html`, trova questa riga:

```html
<div class="posts-section container" id="posts-section" hidden>
```

Rimuovi solo la parola `hidden`, lasciando il resto:

```html
<div class="posts-section container" id="posts-section">
```

**Fatto!** Salva il file, fai il commit e il blog sarà visibile con tutti gli articoli presenti in `posts/index.json`.

---

## FASE 2 — Creare un nuovo articolo

Ci sono **tre passi** per pubblicare un nuovo articolo.

### Passo 1 — Crea il file Markdown

Crea un nuovo file nella cartella `posts/`.
Il nome deve essere in minuscolo, senza spazi (usa i trattini), con estensione `.md`.

**Esempio:** `posts/la-mia-passione-per-il-trekking.md`

Il contenuto del file deve iniziare con il titolo così:

```markdown
# La mia passione per il trekking

Scrivi qui il tuo articolo. Puoi usare la formattazione Markdown:

## Sottotitolo

Testo normale, **grassetto**, *corsivo*.

- Lista
- Di
- Elementi

> Una citazione in evidenza.

E così via...
```

### Passo 2 — Registra l'articolo in `posts/index.json`

Apri il file `posts/index.json` e aggiungi una riga per il tuo articolo.

Se il file è ancora vuoto (appena creato), sarà così:

```json
[

]
```

Aggiungici la voce del tuo articolo:

```json
[
  {
    "slug": "la-mia-passione-per-il-trekking",
    "title": "La mia passione per il trekking",
    "date": "2026-03-24",
    "description": "Una breve frase di descrizione dell'articolo, che appare nell'anteprima."
  }
]
```

Se hai **già altri articoli** e vuoi aggiungerne uno, separa le voci con una virgola:

```json
[
  {
    "slug": "articolo-precedente",
    "title": "Articolo precedente",
    "date": "2026-01-10",
    "description": "Descrizione del primo articolo."
  },
  {
    "slug": "la-mia-passione-per-il-trekking",
    "title": "La mia passione per il trekking",
    "date": "2026-03-24",
    "description": "Una breve frase di descrizione dell'articolo."
  }
]
```

> ⚠️ **Attenzione:** lo `"slug"` deve essere identico (uguale carattere per carattere) al nome del file `.md` che hai creato, senza l'estensione `.md`.

### Passo 3 — Pubblica su GitHub

Aggiungi i file, fai commit e push:

```bash
git add posts/
git commit -m "nuovo articolo: la mia passione per il trekking"
git push
```

GitHub Pages aggiornerà il sito automaticamente in pochi secondi.

---

## FASE 3 — Eliminare un articolo vecchio

### Passo 1 — Rimuovi la voce da `posts/index.json`

Apri `posts/index.json` e cancella il blocco `{...}` che corrisponde all'articolo che vuoi eliminare.
Ricordati di non lasciare virgole di troppo — l'ultimo elemento dell'array non deve avere la virgola finale.

**Prima (due articoli):**
```json
[
  {
    "slug": "articolo-da-eliminare",
    "title": "Articolo da eliminare",
    "date": "2026-01-01",
    "description": "..."
  },
  {
    "slug": "articolo-da-tenere",
    "title": "Articolo da tenere",
    "date": "2026-03-24",
    "description": "..."
  }
]
```

**Dopo (un articolo rimasto):**
```json
[
  {
    "slug": "articolo-da-tenere",
    "title": "Articolo da tenere",
    "date": "2026-03-24",
    "description": "..."
  }
]
```

### Passo 2 — Elimina il file `.md`

Cancella il file dalla cartella `posts/`. Ad esempio: `posts/articolo-da-eliminare.md`.

### Passo 3 — Pubblica su GitHub

```bash
git add posts/
git commit -m "rimosso articolo: articolo-da-eliminare"
git push
```

---

## Breve guida alla sintassi Markdown

Quando scrivi un articolo, puoi usare questi elementi:

| Cosa vuoi fare         | Cosa scrivi                         |
|------------------------|-------------------------------------|
| Titolo principale      | `# Titolo`                          |
| Sottotitolo            | `## Sottotitolo`                    |
| Sottosottotitolo       | `### Titolo piccolo`                |
| **Grassetto**          | `**testo in grassetto**`            |
| *Corsivo*              | `*testo in corsivo*`                |
| Link                   | `[testo del link](https://url.com)` |
| Immagine               | `![descrizione](percorso/foto.jpg)` |
| Lista puntata          | `- elemento`                        |
| Lista numerata         | `1. primo punto`                    |
| Citazione              | `> testo della citazione`           |
| Codice inline          | `` `codice` ``                      |
| Blocco di codice       | ` ```python ` (seguito dal codice)  |
| Linea separatrice      | `---`                               |

---

## Struttura completa del progetto (per riferimento)

```
AngeloGuarnerio/
├── index.html              ← Portfolio principale
├── style.css               ← Stili condivisi
├── 404.html
├── assets/
│   └── profile.JPG
├── blog/
│   ├── index.html          ← Pagina blog (lista articoli)
│   └── post.html           ← Lettore articoli (non toccare)
├── posts/
│   ├── index.json          ← Registro degli articoli ← MODIFICA QUI
│   └── nome-articolo.md    ← I tuoi articoli vanno qui
└── ISTRUZIONI_BLOG.md      ← Questa guida
```
