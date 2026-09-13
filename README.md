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

Gli script nella cartella principale automatizzano l'avvio locale. Prima del
primo avvio, o dopo un reset dei dati, popolare il database demo una volta:

```bash
cd backend
npm install --no-audit --no-fund
npm run seed
cd ../frontend
npm install --no-audit --no-fund
cd ..
```

Gli script ripetono `npm install` in modo sicuro a ogni avvio, così è possibile
clonare il repository e lanciare direttamente il progetto anche su una
macchina nuova.

Su **Linux/macOS**:

```bash
./avvia-portale.sh
```

`avvia-portale.sh` installa le dipendenze con `npm install --no-audit --no-fund`,
avvia backend e frontend solo se le porte 3000 e 4200 sono libere, attende che
rispondano, apre il frontend e Swagger nel browser e stampa periodicamente lo
stato dei due servizi. Non esegue il seed automaticamente, così il riavvio non
cancella i dati locali.

Per fermare soltanto i processi del progetto:

```bash
./ferma-portale.sh
```

È possibile disabilitare l'apertura del browser (`OPEN_BROWSER=0`) o aumentare
il timeout di attesa (`WAIT_SECONDS=120`).

Su **Windows** usare gli equivalenti:

```bat
avvia-portale.bat
```

Lo script esegue `npm install` in `backend` e `frontend`, apre due finestre per
i servizi se non sono già attivi, attende le porte 3000 e 4200 e apre frontend e
Swagger nel browser. Per arrestare i processi del progetto:

```bat
ferma-portale.bat
```

Gli script rendono ripetibile l'avvio senza dover lanciare manualmente due
server o ricordare le porte; il backend resta raggiungibile su
`http://localhost:3000` e il frontend su `http://localhost:4200`.

---

## 2. Struttura del repository

```
Project Work/
├── backend/                 # API RESTful (Express + TypeScript)
│   ├── src/
│   │   ├── config/          # data-source TypeORM, env, swagger
│   │   ├── entities/        # Entità TypeORM (classi OO)
│   │   ├── middlewares/      # autenticazione/autorizzazione JWT
│   │   ├── modules/          # auth, structures, specializations, doctors, appointments, reports
│   │   ├── utils/            # auth, validatori puri, errori
│   │   ├── seed/            # popolamento dati demo
│   │   └── index.ts         # entrypoint Express
│   ├── uploads/             # allegati PDF referti (ignorati da git)
│   ├── data/                # file SQLite generato a runtime (ignorato da git)
│   └── package.json
├── frontend/                # SPA Angular 21
│   └── src/app/
│       ├── core/            # client API, modelli, interceptor, guard e preferenze
│       ├── features/        # directory, auth e aree paziente/medico/admin
│       ├── layout/          # shell pubblica/autenticata e brand Puglia Salute
│       └── app.routes.ts    # routing con guard per ruolo
│   └── public/i18n/         # traduzioni Transloco (it.json, en.json)
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

> Puoi registrare nuovi pazienti dalla schermata di login tramite l'endpoint
> `POST /api/v1/auth/register` (automatizzato nel frontend dalla pagina di login,
> oppure via Swagger).

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
