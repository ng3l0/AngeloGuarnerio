# Guida al Blog — Angelo Guarnerio

Il blog si attiva da solo: finché `posts/index.json` è vuoto, la pagina mostra un
messaggio "in arrivo". Appena aggiungi il primo articolo compare la lista, e gli ultimi
3 articoli appaiono anche nella sezione **Writing** della home. Non c'è niente da
"accendere" a mano.

```
posts/
  index.json        ← il registro di tutti gli articoli
  nome-articolo.md  ← il testo dell'articolo in Markdown
blog/
  index.html        ← lista articoli (non toccare)
  post.html         ← lettore articoli (non toccare)
```

---

## Pubblicare un articolo (3 passi)

### 1 — Crea il file Markdown

Crea `posts/nome-articolo.md`: minuscole, trattini al posto degli spazi.
La prima riga è il titolo:

```markdown
# Perché il tuo smartwatch non sa davvero quanto sei stressato

Testo dell'articolo, con **grassetto**, *corsivo* e [link](https://esempio.com).

## Un sottotitolo

- elenco
- puntato

> Una citazione.

![Didascalia](../assets/img/nome-immagine.jpg)
```

Le immagini vanno in `assets/img/` e si richiamano con `../assets/img/…`.
Il tempo di lettura viene calcolato in automatico.

### 2 — Registralo in `posts/index.json`

```json
[
  {
    "slug": "nome-articolo",
    "title": "Perché il tuo smartwatch non sa davvero quanto sei stressato",
    "date": "2026-11-02",
    "description": "Una frase che appare nell'anteprima."
  }
]
```

Per aggiungerne altri, separa le voci con una virgola (niente virgola dopo l'ultima).

> ⚠️ `slug` deve essere identico al nome del file `.md`, senza estensione.

### 3 — Pubblica

```bash
git add posts/ assets/img/
git commit -m "nuovo articolo: nome-articolo"
git push
```

GitHub Pages aggiorna il sito in circa un minuto.

---

## Eliminare un articolo

1. Cancella la sua voce da `posts/index.json` (attenzione alle virgole).
2. Cancella il file `posts/nome-articolo.md`.
3. `git add -A posts/ && git commit -m "rimosso articolo" && git push`

---

## Sintassi Markdown in breve

| Cosa              | Come                                  |
|-------------------|---------------------------------------|
| Sottotitolo       | `## Sottotitolo`                      |
| Grassetto/corsivo | `**grassetto**`, `*corsivo*`          |
| Link              | `[testo](https://url.com)`            |
| Immagine          | `![descrizione](../assets/img/x.jpg)` |
| Elenco            | `- elemento` oppure `1. elemento`     |
| Citazione         | `> testo`                             |
| Codice            | `` `inline` `` o blocchi ```` ```python ```` |
| Tabella           | sintassi GitHub (`\| a \| b \|`)      |
| Separatore        | `---`                                 |

## Anteprima in locale

```bash
python3 -m http.server 8000
```

Poi apri <http://localhost:8000/blog/> (serve un server locale: aprendo il file con
doppio clic, il blog non riesce a leggere gli articoli).
