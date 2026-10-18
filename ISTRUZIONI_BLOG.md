# Guida al Blog — Angelo Guarnerio

Gli articoli si scrivono **solo su Substack** (<https://angeloguarnerio.substack.com>).
Il sito li mostra da solo: non devi mai toccare il codice per pubblicare.

## Come funziona

1. Pubblichi un articolo su Substack.
2. Ogni giorno, verso le 07:17 (ora di Zurigo), GitHub legge il feed di Substack
   e aggiorna il sito.
3. Gli ultimi 3 articoli compaiono nella sezione **Writing** della home, e tutti
   nella pagina **/blog/**. Ogni scheda apre l'articolo su Substack.

Finché non c'è nessun articolo, il sito mostra "in arrivo" e il pulsante per iscriversi.

## Vuoi vederlo subito, senza aspettare il giorno dopo?

GitHub → repository **AngeloGuarnerio** → tab **Actions** → **Deploy site** →
pulsante **Run workflow**. In circa un minuto il sito è aggiornato.

## Consigli per gli articoli su Substack

- **Sottotitolo**: compilalo sempre, è il testo che appare sotto il titolo nelle schede del sito.
- **Immagine di copertina**: se la aggiungi, compare in cima alla scheda.
- **Articoli a pagamento**: se un giorno li attivi, sul sito compaiono comunque
  titolo e anteprima; il paywall resta gestito da Substack.

## Una sola configurazione da fare (una volta)

GitHub → **Settings** → **Pages** → **Source** = **GitHub Actions**.
Senza questa impostazione l'aggiornamento automatico non può pubblicare il sito.

## Se gli articoli smettono di aggiornarsi

Se nel repository non ci sono commit per 60 giorni, GitHub mette in pausa
l'aggiornamento giornaliero e ti manda un'email. Per riattivarlo: tab **Actions** →
**Deploy site** → **Enable workflow** (oppure fai un qualsiasi commit).

## Dove sta il codice (per riferimento)

```text
scripts/fetch_substack.py      legge il feed di Substack e crea data/substack.json
.github/workflows/deploy.yml   esegue lo script e pubblica il sito (ogni push + ogni giorno)
data/substack.json             elenco articoli (generato in automatico, non modificarlo)
```

L'indirizzo di Substack è scritto in `scripts/fetch_substack.py` e nei link di
`index.html` / `blog/index.html`: se un giorno cambia, va aggiornato lì.
