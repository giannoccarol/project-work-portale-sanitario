# Verifica funzionale

La verifica funzionale è stata eseguita con i dati generati dal seed demo, senza
utilizzare dati sanitari reali. La matrice collega i percorsi osservati ai
requisiti della relazione e indica il ruolo necessario per ripeterli.

| Flusso | Requisiti | Ruolo | Verifica |
|---|---|---|---|
| Directory, filtri e dettaglio medico | FR-01, FR-02 | pubblico | smoke browser |
| Registrazione e ripresa del booking draft | FR-03, FR-04 | nuovo paziente | test + smoke browser |
| Dashboard, visite, dettaglio visita e referti | FR-05, FR-08 | paziente demo | smoke browser |
| Consenso e fascicolo clinico strutturato | FR-05, FR-07 | paziente demo | smoke browser |
| Agenda, cartella contestuale e refertazione | FR-06, FR-07 | medico demo | test automatici |
| Pubblicazione e download del referto PDF | FR-07, FR-08 | medico/paziente demo | smoke browser + test |
| Anagrafiche e archiviazione | FR-09 | admin demo | test automatici |
| Tema chiaro predefinito, scuro e responsive | FR-10 | tutti i ruoli | smoke browser |
| Catalogo italiano/inglese | FR-10 | tutti i ruoli | typecheck + cataloghi |
| Contratto API e schema `ApiError` | tutti | Swagger | test OpenAPI |

Le verifiche automatiche sono riproducibili con i comandi riportati nei README:

```bash
cd backend && npm test
cd ../frontend && npm run typecheck && npm test -- --watch=false && npm run build
```

Per il controllo manuale usare esclusivamente gli account elencati in
[`../account-demo.md`](../account-demo.md), con backend su `localhost:3000` e
frontend su `localhost:4200`.

## Evidenze acquisite

Le schermate sono state acquisite il 23 agosto 2026 con Chromium 151 su dati
seed locali. Le viste desktop usano viewport 1440×1000; la vista responsive usa
390×844.

| File | Evidenza |
|---|---|
| [`fig1-directory.png`](final/fig1-directory.png) | directory pubblica |
| [`fig2-dashboard-paziente.png`](final/fig2-dashboard-paziente.png) | dashboard paziente |
| [`fig3-appuntamenti.png`](final/fig3-appuntamenti.png) | elenco visite |
| [`fig4-dettaglio-visita.png`](final/fig4-dettaglio-visita.png) | dettaglio visita |
| [`fig5-fascicolo.png`](final/fig5-fascicolo.png) | fascicolo strutturato |
| [`fig6-referti.png`](final/fig6-referti.png) | elenco referti |
| [`fig7-dettaglio-referto.png`](final/fig7-dettaglio-referto.png) | dettaglio referto |
| [`fig8-agenda-medico.png`](final/fig8-agenda-medico.png) | agenda medico |
| [`fig9-admin.png`](final/fig9-admin.png) | amministrazione |
| [`fig10-mobile.png`](final/fig10-mobile.png) | layout responsive |
| [`fig11-swagger.png`](final/fig11-swagger.png) | Swagger UI e contratto API |
