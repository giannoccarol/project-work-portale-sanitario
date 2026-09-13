# Puglia Salute - Project Work PW16

Progetto di Work (PW16) per il CdS **Informatica per le Aziende Digitali (L-31)**.
Applicazione **full-stack API-based** per la rete sanitaria pugliese:
prenotazione visite online e gestione referti. Nel modello c'è l'entità
`Structure`; il seed ne crea una sola, il Policlinico di Bari.

- **Backend**: Express + TypeScript + TypeORM + SQLite + JWT + Swagger
- **Frontend**: Angular 21 standalone + PrimeNG 21 + Signals/RxJS + Transloco
- **Linguaggi**: TypeScript (backend), TypeScript (frontend), entrambi object-oriented

---

## Indice
1. [Prerequisiti](#1-prerequisiti)
2. [Struttura del repository](#2-struttura-del-repository)
3. [Avvio del Backend (passo passo)](#3-avvio-del-backend-passo-passo)
4. [Avvio del Frontend (passo passo)](#4-avvio-del-frontend-passo-passo)
5. [Account demo](#5-account-demo)
6. [Documentazione API (Swagger)](#6-documentazione-api-swagger)

---

## 1. Prerequisiti

- **Node.js** >= 20 (sviluppato con Node 22.x)
- **npm** >= 10
- Una shell (PowerShell / bash)
- Browser per il frontend

Verifica con:

```bash
node --version
npm --version
```

> Non serve un database server. SQLite sta in un file, si resetta col seed,
> gli allegati PDF vanno in `uploads/` sul disco.

### Avvio rapido

Da un clone fresco basta lanciare lo script: installa le dipendenze, crea
`backend/data` e `backend/.env` se mancano, esegue il seed **solo se** non c'è
già `backend/data/policlinico.sqlite`, alza i due processi e apre il browser.
Un riavvio successivo non cancella i dati demo.

Su **Linux/macOS**:

```bash
./avvia-portale.sh
```

`Ctrl+C` nel terminale dello script ferma backend e frontend. Timeout di attesa
predefinito: 180 secondi (`WAIT_SECONDS=240` per aumentarlo). Per non aprire il
browser: `OPEN_BROWSER=0 ./avvia-portale.sh`.

Per fermare i processi del progetto da un altro terminale:

```bash
./ferma-portale.sh
```

Su **Windows**:

```bat
avvia-portale.bat
```

Stesso comportamento: seed solo al primo avvio, attesa fino a 180 secondi,
`Ctrl+C` chiude i servizi. Stop manuale:

```bat
ferma-portale.bat
```

Serve Node.js 20 o superiore nel PATH (da file manager, se `node` non è nel PATH
di sistema, apri invece un terminale). Su Windows `better-sqlite3` può richiedere
i Build Tools per Visual Studio al primo `npm install`.

Il backend resta su `http://localhost:3000`, il frontend su
`http://localhost:4200`. Per resettare i dati: `cd backend && npm run seed`.

---

## 2. Struttura del repository

```
Project Work/
├── backend/                 # API RESTful (Express + TypeScript)
│   ├── src/
│   │   ├── config/          # data-source TypeORM, env, swagger
│   │   ├── entities/        # Entità TypeORM (classi OO)
│   │   ├── middlewares/      # autenticazione/autorizzazione JWT
│   │   ├── modules/          # auth, catalogo, appuntamenti, pazienti, referti, recensioni
│   │   ├── utils/            # auth, validatori puri, errori
│   │   ├── seed/            # popolamento dati demo
│   │   └── index.ts         # entrypoint Express
│   ├── uploads/             # allegati PDF referti (ignorati da git)
│   ├── data/                # SQLite a runtime (.gitkeep in git; .sqlite ignorato)
│   └── package.json
├── frontend/                # SPA Angular 21
│   └── src/app/
│       ├── core/            # client API, modelli, interceptor, guard e preferenze
│       ├── features/        # directory, auth e aree paziente/medico/admin
│       ├── layout/          # shell pubblica/autenticata e brand Puglia Salute
│       └── app.routes.ts    # routing con guard per ruolo
│   └── public/              # i18n Transloco e font locali
└── docs/                    # account demo, diagrammi, matrice screenshot
                                 # (la relazione tecnica resta locale, non in git)
```

---

## 3. Avvio del Backend (passo passo)

Apri una shell nella cartella `backend`:

```bash
cd backend
```

**Passo 1: installa le dipendenze**

```bash
npm install
```

**Passo 2: compila TypeScript (opzionale)**

```bash
npm run build
```

**Passo 3: popola il database con i dati demo**

```bash
npm run seed
```

Questo crea il file `data/policlinico.sqlite` e gli account demo (vedi §5).

**Passo 4: avvia il server**

In modalità sviluppo (con auto-reload):

```bash
npm run dev
```

Oppure, dopo la build, in produzione:

```bash
npm run start
```

Il server è in ascolto su **http://localhost:3000**.
Swagger UI disponibile su **http://localhost:3000/api-docs**.

> Per resettare i dati: riesegui `npm run seed` (pulisce e ricrea tutto).

---

## 4. Avvio del Frontend (passo passo)

Il frontend usa **Angular 21** perché Angular 22 non dispone ancora di tutti i
pacchetti compatibili necessari al progetto (incluso PrimeNG 21). L'interfaccia è
costruita con PrimeNG 21, tema Aura personalizzato teal/mint e componenti standalone.

Apri una **nuova** shell nella cartella `frontend`:

```bash
cd frontend
```

**Passo 1: installa le dipendenze**

```bash
npm install
```

**Passo 2: avvia il dev server**

```bash
npm start
```

> `npm start` esegue `ng serve --port 4200` con proxy verso il backend. L'app è
> servita su **http://localhost:4200**.

**Internazionalizzazione (Transloco)**

- Lingua: italiano predefinito; inglese selezionabile dalle impostazioni
- I cataloghi IT/EN coprono le chiavi dell'interfaccia; diagnosi, note e dati
  inseriti dagli utenti non vengono tradotti
- File traduzioni: `frontend/public/i18n/it.json` e `en.json`
- Preferenza lingua disponibile nelle impostazioni e persistita localmente
- Impostazioni utente: `/app/settings` (lingua, tema e cambio password); il
  primo accesso usa sempre il tema chiaro
- Sidebar sinistra fissa durante lo scroll del contenuto

**Passo 3: apri il browser**

Vai su http://localhost:4200 e accedi con uno degli account demo (§5).

> In sviluppo il proxy inoltra `/api` al backend su `http://localhost:3000`.
> Assicurati che il backend sia avviato prima del frontend.

Per generare la build di produzione:

```bash
npm run build
```

L'output finisce in `frontend/dist/`.

---

## 5. Account demo

Gli account demo sono stati verificati con risposta HTTP 200 sul backend il
23 agosto 2026:

| Ruolo | Email | Password |
|---|---|---|
| Admin | `admin@policlinico.it` | `Admin123!` |
| Medico | `dott.rossi@policlinico.it` | `Doctor123!` |
| Paziente | `mario.rossi@policlinico.it` | `Patient123!` |

L'elenco completo degli account e dei dati seed è in
[`docs/account-demo.md`](docs/account-demo.md).

> Puoi registrare nuovi pazienti da `/register` (collegata dalla login)
> oppure via `POST /api/v1/auth/register` in Swagger.

---

## 6. Documentazione API (Swagger)

Una volta avviato il backend:

- **Swagger UI interattiva**: http://localhost:3000/api-docs
- **Specifica OpenAPI (JSON)**: http://localhost:3000/api/v1/swagger.json

Principali endpoint (`/api/v1`):

| Metodo | Endpoint                              | Ruolo            | Descrizione                          |
|--------|---------------------------------------|------------------|--------------------------------------|
| POST   | `/auth/login`                         | pubblico         | Autenticazione → JWT                 |
| POST   | `/auth/register`                      | pubblico         | Registrazione paziente               |
| GET    | `/structures`                         | pubblico         | Elenco strutture (tenant)            |
| GET    | `/specializations`                    | pubblico         | Elenco specializzazioni              |
| GET    | `/doctors`                            | pubblico         | Elenco medici                        |
| GET    | `/appointments/available/:id`         | pubblico         | Slot disponibili di un medico        |
| POST   | `/appointments`                       | paziente         | Prenota una visita                   |
| GET    | `/appointments`                       | paziente/medico  | Appuntamenti propri                  |
| GET    | `/appointments/:id`                   | paziente/medico  | Dettaglio di una visita              |
| DELETE | `/appointments/:id`                   | paziente/medico  | Annulla appuntamento                 |
| PATCH  | `/appointments/:id/clinical-access`   | paziente         | Concede/revoca accesso clinico       |
| GET    | `/patients/me/folder`                 | paziente         | Cartella del paziente autenticato    |
| GET    | `/patients/:id/folder`                | medico/admin     | Cartella con contesto visita         |
| POST   | `/reports/:appointmentId`             | medico          | Crea referto (+ PDF)                 |
| GET    | `/reports`                            | paziente/medico  | Referti propri                       |
| GET    | `/reports/:id`                        | paziente/medico  | Dettaglio di un referto              |
| PUT    | `/reports/:id`                        | medico          | Aggiorna una bozza                   |
| POST   | `/reports/:id/publish`               | medico          | Pubblica referto                     |
| GET    | `/reports/:id/download`              | paziente/medico  | Scarica allegato PDF                 |
| GET    | `/doctors/all`                       | admin            | Medici inclusi archiviati            |
| PATCH  | `/doctors/:id/status`                | admin            | Archivia/ripristina medico           |

(Le mutazioni su structures/specializations/doctors sono riservate all'**admin**.)
