# Frontend Puglia Salute

SPA Angular 21 del portale, con PrimeNG 21.

## Stack

- Angular `21.2.21`, componenti standalone, strict mode e routing lazy;
- PrimeNG `21.1.9` con preset Aura da `@primeuix/themes`;
- PrimeIcons e PrimeFlex come dipendenze esterne;
- Signals per sessione e stato delle pagine, RxJS per i flussi API;
- Reactive Forms, Transloco e Vitest.

Al primo accesso il tema è chiaro. Poi si può scegliere scuro o sistema;
lingua e tema stanno in `localStorage`, i dati clinici no.

I componenti visivi arrivano da PrimeNG; il CSS scritto a mano è per layout,
marchio e telefono.

## Avvio

Prerequisiti: Node.js 22.12+ e backend disponibile sulla porta `3000`.

```bash
npm install
npm start
```

Il portale è raggiungibile su `http://localhost:4200`. Il proxy di sviluppo
inoltra `/api` a `http://localhost:3000`.

## Verifiche

```bash
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

## Funzioni implementate

- home, directory pubblica, profilo medico e recensioni;
- scelta pubblica dello slot e ripresa del draft dopo l'accesso;
- login e registrazione paziente;
- dashboard differenziata per paziente, medico e amministratore;
- appuntamenti, annullamento e consenso clinico;
- fascicolo personale e accesso medico contestuale;
- creazione, pubblicazione e download dei referti;
- recensioni post-visita;
- agenda medico;
- gestione amministrativa di strutture, specializzazioni e medici;
- cambio password e tema chiaro/scuro;
- cataloghi Transloco IT/EN completi per le chiavi dell'interfaccia; dati clinici
  e contenuti inseriti dagli utenti restano nella lingua originale.

Il token e le preferenze non cliniche sono gli unici dati persistiti nel
browser. Referti, anamnesi, allergie e fascicoli non vengono salvati in storage.

Account demo, diagrammi e screenshot stanno in [`../docs`](../docs).
