# Account demo

Credenziali di test pre-caricate dallo script `npm run seed` (backend).

## Password condivise per ruolo

| Ruolo    | Password      |
|----------|---------------|
| Admin    | `Admin123!`   |
| Medico   | `Doctor123!`  |
| Paziente | `Patient123!` |

## Account principali (smoke test)

| Ruolo    | Email                         |
|----------|-------------------------------|
| Admin    | `admin@policlinico.it`        |
| Medico   | `dott.rossi@policlinico.it`   |
| Paziente | `mario.rossi@policlinico.it`  |

## Amministratori

| Email                    | Nome          |
|--------------------------|---------------|
| `admin@policlinico.it`   | Sara Admin    |
| `admin2@policlinico.it`  | Paolo Gestionale |

## Medici

Tutti con password **`Doctor123!`**, struttura **Policlinico di Bari "Ospedale Giovanni XXIII"**.

| Email                         | Nome              | Specializzazione           | Note        |
|-------------------------------|-------------------|----------------------------|-------------|
| `dott.rossi@policlinico.it`   | Dott. Marco Rossi | Cardiologia                | Account demo |
| `dott.bianchi@policlinico.it` | Dott.ssa Giulia Bianchi | Dermatologia         |             |
| `dott.ferrari@policlinico.it` | Dott. Andrea Ferrari | Ortopedia             |             |
| `dott.russo@policlinico.it`   | Dott.ssa Elena Russo | Pediatria             |             |
| `dott.conti@policlinico.it`   | Dott. Luca Conti  | Neurologia                 |             |
| `dott.galli@policlinico.it`   | Dott.ssa Francesca Galli | Gastroenterologia |             |
| `dott.moretti@policlinico.it` | Dott. Davide Moretti | Oncologia             |             |
| `dott.ricci@policlinico.it`   | Dott.ssa Silvia Ricci | Medicina Generale    |             |
| `dott.lombardi@policlinico.it`| Dott. Antonio Lombardi | Pediatria           |             |
| `dott.marini@policlinico.it`  | Dott.ssa Chiara Marini | Neonatologia        |             |
| `dott.costa@policlinico.it`   | Dott. Matteo Costa | Cardiologia Pediatrica |             |
| `dott.fontana@policlinico.it` | Dott.ssa Roberta Fontana | Chirurgia Generale |             |
| `dott.esposito@policlinico.it`| Dott.ssa Valentina Esposito | Ginecologia    |             |
| `dott.romano@policlinico.it`  | Dott. Stefano Romano | ORL                  |             |
| `dott.deLuca@policlinico.it`  | Dott. Filippo De Luca | Cardiologia         | **Archiviato** |

## Pazienti

Tutti con password **`Patient123!`**, struttura **Policlinico di Bari "Ospedale Giovanni XXIII"**.

| Email                         | Nome            | CF               | Note                          |
|-------------------------------|-----------------|------------------|-------------------------------|
| `mario.rossi@policlinico.it`  | Mario Rossi     | RSSMRA80A01A662H | Account demo, anamnesi completa |
| `lucia.verdi@policlinico.it`  | Lucia Verdi     | VRDLCU85H45A662S |                             |
| `anna.neri@policlinico.it`    | Anna Neri       | NREANN92D45A662L |                             |
| `giuseppe.colombo@policlinico.it` | Giuseppe Colombo | CLMGPP70C15A662T |                      |
| `elena.bruno@policlinico.it`  | Elena Bruno     | BRNLNE88M50A662Q |                             |
| `francesco.rizzi@policlinico.it` | Francesco Rizzi | RZZFNC75H20A662W |                        |
| `sara.greco@policlinico.it`   | Sara Greco      | GRCSRA95A41A662Z |                             |
| `paolo.villa@policlinico.it`  | Paolo Villa     | VLLPLA68D10A662Y |                             |
| `martina.serra@policlinico.it`| Martina Serra   | SRRMTN99L71A662P |                             |
| `lorenzo.ferri@policlinico.it`| Lorenzo Ferri   | FRRLNZ83E25A662N |                             |
| `chiara.mancini@policlinico.it`| Chiara Mancini | MNCCRH91H63A662K |                             |
| `andrea.caruso@policlinico.it`| Andrea Caruso   | CRSNDR77P12A662J |                             |
| `valentina.rizzo@policlinico.it`| Valentina Rizzo | RZZVNT86T44A662V |                       |
| `simone.barone@policlinico.it`| Simone Barone   | BRNSMN94B28A662R |                             |
| `federica.orsi@policlinico.it`| Federica Orsi   | ORSFRC89D55A662U |                             |
| `marco.santoro@policlinico.it`| Marco Santoro   | SNTMRC12A01A662B |                             |
| `giulia.palmieri@policlinico.it`| Giulia Palmieri | PLMGLI15C45A662C |                           |
| `tommaso.leone@policlinico.it`| Tommaso Leone   | LNATMS18E10A662D |                             |
| `alice.martini@policlinico.it`| Alice Martini   | MRTLCE10L71A662E |                             |
| `riccardo.gatti@policlinico.it`| Riccardo Gatti  | GTTRCR08P22A662F |                             |
| `beatrice.sala@policlinico.it`| Beatrice Sala   | SLABRC93M65A662G |                             |
| `daniele.rossetti@policlinico.it`| Daniele Rossetti | RSSDNL81A15A662I |                         |
| `silvia.monti@policlinico.it` | Silvia Monti    | MNTSLV87H45A662O |                             |
| `alessandro.bianco@policlinico.it`| Alessandro Bianco | BNCLSN79D20A662A |                       |
| `cristina.ferrara@policlinico.it`| Cristina Ferrara | FRRCST96L45A662M |                      |
| `enrico.testa@policlinico.it` | Enrico Testa    | TSTNRC84C12A662X |                             |
| `monica.parisi@policlinico.it`| Monica Parisi   | PRSMNC90T52A662H |                             |
| `gianluca.vitale@policlinico.it`| Gianluca Vitale | VTLGLC82B18A662L |                       |
| `elisa.cattaneo@policlinico.it`| Elisa Cattaneo | CTTLSA97E70A662S |                             |
| `fabio.grass@policlinico.it`  | Fabio Grassi    | GRSFBA76H01A662T |                             |

## Dati generati

Dopo il seed trovi circa:

- **1 struttura**: Policlinico di Bari "Ospedale Giovanni XXIII"
- **14 specializzazioni** (1 archiviata)
- **14 medici** (1 archiviato)
- **30 pazienti**
- **~182 appuntamenti** (oggi, futuri, completati, cancellati)
- **56 referti pubblicati** + **3 bozze** su appuntamenti futuri
- **70 recensioni** distribuite sui medici attivi

## Note

- Il paziente demo Mario Rossi ha appuntamento cardiologico imminente con il Dott. Rossi.
- È possibile registrare nuovi pazienti via `POST /api/v1/auth/register` o dal frontend.
- Per test admin: specializzazione **Medicina del Lavoro** e medico **De Luca** sono archiviati.

## Reset

```bash
cd backend && npm run seed
```
