/** Password condivise per tutti gli account demo dello stesso ruolo. */
export const PASSWORDS = {
  admin: 'Admin123!',
  doctor: 'Doctor123!',
  patient: 'Patient123!',
} as const;

export interface StructureSeed {
  name: string;
  address: string;
  phone: string;
  isActive?: boolean;
}

export interface SpecializationSeed {
  structureIndex: number;
  name: string;
  description: string;
  isActive?: boolean;
}

export interface AdminSeed {
  email: string;
  firstName: string;
  lastName: string;
}

export interface DoctorSeed {
  email: string;
  firstName: string;
  lastName: string;
  structureIndex: number;
  specializationName: string;
  bio: string;
  isActive?: boolean;
}

export interface PatientSeed {
  email: string;
  firstName: string;
  lastName: string;
  structureIndex: number;
  fiscalCode: string;
  birthDate: string;
  anamnesi?: string;
  allergie?: string;
}

export const STRUCTURES: StructureSeed[] = [
  {
    name: 'Policlinico di Bari "Ospedale Giovanni XXIII"',
    address: 'Piazza Giulio Cesare, 11 - Bari (BA)',
    phone: '+39 080 5478111',
  },
];

export const SPECIALIZATIONS: SpecializationSeed[] = [
  { structureIndex: 0, name: 'Cardiologia', description: 'Visite specialistiche cardiovascolari e prevenzione' },
  { structureIndex: 0, name: 'Dermatologia', description: 'Diagnosi e cura di patologie cutanee' },
  { structureIndex: 0, name: 'Ortopedia', description: 'Traumatologia e chirurgia ortopedica' },
  { structureIndex: 0, name: 'Pediatria', description: 'Medicina pediatrica, day hospital e visite acute' },
  { structureIndex: 0, name: 'Neurologia', description: 'Disturbi del sistema nervoso centrale e periferico' },
  { structureIndex: 0, name: 'Gastroenterologia', description: 'Apparato digerente e epatologia' },
  { structureIndex: 0, name: 'Oncologia', description: 'Diagnosi e follow-up oncologico ambulatoriale' },
  { structureIndex: 0, name: 'Medicina Generale', description: 'Medicina di base e prevenzione' },
  { structureIndex: 0, name: 'Neonatologia', description: 'Assistenza neonatale e follow-up' },
  { structureIndex: 0, name: 'Cardiologia Pediatrica', description: 'Cardiopatie congenite e acquisite' },
  { structureIndex: 0, name: 'Chirurgia Generale', description: 'Chirurgia ambulatoriale e day surgery' },
  { structureIndex: 0, name: 'Ginecologia', description: 'Visite ginecologiche e ostetriche' },
  { structureIndex: 0, name: 'Otorinolaringoiatria', description: 'ORL diagnostica e terapeutica' },
  { structureIndex: 0, name: 'Medicina del Lavoro', description: 'Sorveglianza sanitaria (specializzazione archiviata)', isActive: false },
];

export const ADMINS: AdminSeed[] = [
  { email: 'admin@policlinico.it', firstName: 'Sara', lastName: 'Admin' },
  { email: 'admin2@policlinico.it', firstName: 'Paolo', lastName: 'Gestionale' },
];

export const DOCTORS: DoctorSeed[] = [
  {
    email: 'dott.rossi@policlinico.it',
    firstName: 'Marco',
    lastName: 'Rossi',
    structureIndex: 0,
    specializationName: 'Cardiologia',
    bio: 'Cardiologo con 15 anni di esperienza in cardiologia interventistica e prevenzione secondaria.',
  },
  {
    email: 'dott.bianchi@policlinico.it',
    firstName: 'Giulia',
    lastName: 'Bianchi',
    structureIndex: 0,
    specializationName: 'Dermatologia',
    bio: 'Dermatologa specializzata in diagnosi precoci del melanoma e dermatologia pediatrica.',
  },
  {
    email: 'dott.ferrari@policlinico.it',
    firstName: 'Andrea',
    lastName: 'Ferrari',
    structureIndex: 0,
    specializationName: 'Ortopedia',
    bio: 'Ortopedico traumatologo, esperto in riabilitazione post-operatoria e artroscopia.',
  },
  {
    email: 'dott.russo@policlinico.it',
    firstName: 'Elena',
    lastName: 'Russo',
    structureIndex: 0,
    specializationName: 'Pediatria',
    bio: 'Pediatra di libera scelta con focus su allergologie infantili e crescita.',
  },
  {
    email: 'dott.conti@policlinico.it',
    firstName: 'Luca',
    lastName: 'Conti',
    structureIndex: 0,
    specializationName: 'Neurologia',
    bio: 'Neurologo clinico, specializzato in cefalee, epilessia e disturbi cognitivi lievi.',
  },
  {
    email: 'dott.galli@policlinico.it',
    firstName: 'Francesca',
    lastName: 'Galli',
    structureIndex: 0,
    specializationName: 'Gastroenterologia',
    bio: 'Gastroenterologa con esperienza in patologie infiammatorie croniche intestinali.',
  },
  {
    email: 'dott.moretti@policlinico.it',
    firstName: 'Davide',
    lastName: 'Moretti',
    structureIndex: 0,
    specializationName: 'Oncologia',
    bio: 'Oncologo medico, follow-up ambulatoriale e gestione terapie orali domiciliari.',
  },
  {
    email: 'dott.ricci@policlinico.it',
    firstName: 'Silvia',
    lastName: 'Ricci',
    structureIndex: 0,
    specializationName: 'Medicina Generale',
    bio: 'Medico di medicina generale, visite di controllo e prescrizioni ricorrenti.',
  },
  {
    email: 'dott.lombardi@policlinico.it',
    firstName: 'Antonio',
    lastName: 'Lombardi',
    structureIndex: 0,
    specializationName: 'Pediatria',
    bio: 'Pediatra ospedaliero, day hospital e visite acute.',
  },
  {
    email: 'dott.marini@policlinico.it',
    firstName: 'Chiara',
    lastName: 'Marini',
    structureIndex: 0,
    specializationName: 'Neonatologia',
    bio: 'Neonatologa, follow-up dei neonati pretermine e consulenze ambulatoriali.',
  },
  {
    email: 'dott.costa@policlinico.it',
    firstName: 'Matteo',
    lastName: 'Costa',
    structureIndex: 0,
    specializationName: 'Cardiologia Pediatrica',
    bio: 'Cardiologo pediatrico, ecocardiografia e monitoraggio cardiopatie congenite.',
  },
  {
    email: 'dott.fontana@policlinico.it',
    firstName: 'Roberta',
    lastName: 'Fontana',
    structureIndex: 0,
    specializationName: 'Chirurgia Generale',
    bio: 'Chirurga generale, day surgery e consulenze pre-operatorie ambulatoriali.',
  },
  {
    email: 'dott.esposito@policlinico.it',
    firstName: 'Valentina',
    lastName: 'Esposito',
    structureIndex: 0,
    specializationName: 'Ginecologia',
    bio: 'Ginecologa, visite di routine, ecografie e consulenza fertilità di base.',
  },
  {
    email: 'dott.romano@policlinico.it',
    firstName: 'Stefano',
    lastName: 'Romano',
    structureIndex: 0,
    specializationName: 'Otorinolaringoiatria',
    bio: 'ORL, disturbi respiratori notturni, otite ricorrente e vertigini.',
  },
  {
    email: 'dott.deLuca@policlinico.it',
    firstName: 'Filippo',
    lastName: 'De Luca',
    structureIndex: 0,
    specializationName: 'Cardiologia',
    bio: 'Medico cardiologo in pensionamento parziale (profilo archiviato per test admin).',
    isActive: false,
  },
];

export const PATIENTS: PatientSeed[] = [
  {
    email: 'mario.rossi@policlinico.it',
    firstName: 'Mario',
    lastName: 'Rossi',
    structureIndex: 0,
    fiscalCode: 'RSSMRA80A01A662H',
    birthDate: '1980-01-01',
    anamnesi: 'Ipertensione in trattamento farmacologico. Precedente infarto miocardico (2021). Familiarità per cardiopatia.',
    allergie: 'Allergia alla penicillina. Intolleranza al lattosio.',
  },
  {
    email: 'lucia.verdi@policlinico.it',
    firstName: 'Lucia',
    lastName: 'Verdi',
    structureIndex: 0,
    fiscalCode: 'VRDLCU85H45A662S',
    birthDate: '1985-06-15',
    anamnesi: 'Asma lieve controllata. Nessuna patologia cronica rilevante.',
    allergie: 'Pollini graminacei.',
  },
  {
    email: 'anna.neri@policlinico.it',
    firstName: 'Anna',
    lastName: 'Neri',
    structureIndex: 0,
    fiscalCode: 'NREANN92D45A662L',
    birthDate: '1992-04-05',
    anamnesi: 'Tiroidite di Hashimoto in terapia sostitutiva.',
    allergie: 'Nessuna nota.',
  },
  {
    email: 'giuseppe.colombo@policlinico.it',
    firstName: 'Giuseppe',
    lastName: 'Colombo',
    structureIndex: 0,
    fiscalCode: 'CLMGPP70C15A662T',
    birthDate: '1970-03-15',
    anamnesi: 'Diabete tipo 2, ipertensione arteriosa, dislipidemia.',
    allergie: 'Contrasto iodato (reazione lieve).',
  },
  {
    email: 'elena.bruno@policlinico.it',
    firstName: 'Elena',
    lastName: 'Bruno',
    structureIndex: 0,
    fiscalCode: 'BRNLNE88M50A662Q',
    birthDate: '1988-08-10',
    anamnesi: 'Emicrania cronica. Ansia generalizzata in follow-up psichiatrico.',
    allergie: 'Aspirina.',
  },
  {
    email: 'francesco.rizzi@policlinico.it',
    firstName: 'Francesco',
    lastName: 'Rizzi',
    structureIndex: 0,
    fiscalCode: 'RZZFNC75H20A662W',
    birthDate: '1975-06-20',
    anamnesi: 'Artrosi cervicale. Intervento di ernia discale L4-L5 (2019).',
    allergie: 'Nessuna.',
  },
  {
    email: 'sara.greco@policlinico.it',
    firstName: 'Sara',
    lastName: 'Greco',
    structureIndex: 0,
    fiscalCode: 'GRCSRA95A41A662Z',
    birthDate: '1995-01-01',
    anamnesi: 'Dermatite atopica. Reflusso gastroesofageo.',
    allergie: 'Lattice, frutta secca.',
  },
  {
    email: 'paolo.villa@policlinico.it',
    firstName: 'Paolo',
    lastName: 'Villa',
    structureIndex: 0,
    fiscalCode: 'VLLPLA68D10A662Y',
    birthDate: '1968-04-10',
    anamnesi: 'BPCO moderata. Ex fumatore (20 sigarette/die per 25 anni).',
    allergie: 'Nessuna.',
  },
  {
    email: 'martina.serra@policlinico.it',
    firstName: 'Martina',
    lastName: 'Serra',
    structureIndex: 0,
    fiscalCode: 'SRRMTN99L71A662P',
    birthDate: '1999-07-31',
    anamnesi: 'Anemia ferropenica ricorrente. Ciclo mestruale abbondante.',
    allergie: 'Metalli (nickel).',
  },
  {
    email: 'lorenzo.ferri@policlinico.it',
    firstName: 'Lorenzo',
    lastName: 'Ferri',
    structureIndex: 0,
    fiscalCode: 'FRRLNZ83E25A662N',
    birthDate: '1983-05-25',
    anamnesi: 'Epilessia ben controllata con farmaci. Patente con limitazioni.',
    allergie: 'Nessuna.',
  },
  {
    email: 'chiara.mancini@policlinico.it',
    firstName: 'Chiara',
    lastName: 'Mancini',
    structureIndex: 0,
    fiscalCode: 'MNCCRH91H63A662K',
    birthDate: '1991-06-23',
    anamnesi: 'Sindrome dell\'ovaio policistico. Insulino-resistenza lieve.',
    allergie: 'Glutine (celiachia).',
  },
  {
    email: 'andrea.caruso@policlinico.it',
    firstName: 'Andrea',
    lastName: 'Caruso',
    structureIndex: 0,
    fiscalCode: 'CRSNDR77P12A662J',
    birthDate: '1977-09-12',
    anamnesi: 'Epatite B guarita. Colelitiasi asintomatica.',
    allergie: 'Nessuna.',
  },
  {
    email: 'valentina.rizzo@policlinico.it',
    firstName: 'Valentina',
    lastName: 'Rizzo',
    structureIndex: 0,
    fiscalCode: 'RZZVNT86T44A662V',
    birthDate: '1986-12-04',
    anamnesi: 'Follow-up oncologico mammario post chirurgia (2023).',
    allergie: 'Chemioterapici (reazione documentata).',
  },
  {
    email: 'simone.barone@policlinico.it',
    firstName: 'Simone',
    lastName: 'Barone',
    structureIndex: 0,
    fiscalCode: 'BRNSMN94B28A662R',
    birthDate: '1994-02-28',
    anamnesi: 'Disturbo del sonno. Russamento notturno.',
    allergie: 'Nessuna.',
  },
  {
    email: 'federica.orsi@policlinico.it',
    firstName: 'Federica',
    lastName: 'Orsi',
    structureIndex: 0,
    fiscalCode: 'ORSFRC89D55A662U',
    birthDate: '1989-04-15',
    anamnesi: 'Gravidanza a termine (2024). Follow-up post-partum.',
    allergie: 'Penicillina.',
  },
  {
    email: 'marco.santoro@policlinico.it',
    firstName: 'Marco',
    lastName: 'Santoro',
    structureIndex: 0,
    fiscalCode: 'SNTMRC12A01A662B',
    birthDate: '2012-01-01',
    anamnesi: 'Asma pediatrico. Disturbo da deficit di attenzione.',
    allergie: 'Acari della polvere.',
  },
  {
    email: 'giulia.palmieri@policlinico.it',
    firstName: 'Giulia',
    lastName: 'Palmieri',
    structureIndex: 0,
    fiscalCode: 'PLMGLI15C45A662C',
    birthDate: '2015-03-05',
    anamnesi: 'Cardiopatia congenita lieve in follow-up.',
    allergie: 'Nessuna.',
  },
  {
    email: 'tommaso.leone@policlinico.it',
    firstName: 'Tommaso',
    lastName: 'Leone',
    structureIndex: 0,
    fiscalCode: 'LNATMS18E10A662D',
    birthDate: '2018-05-10',
    anamnesi: 'Prematurità 34 settimane. Sviluppo neurologico regolare.',
    allergie: 'Latte vaccino (intolleranza).',
  },
  {
    email: 'alice.martini@policlinico.it',
    firstName: 'Alice',
    lastName: 'Martini',
    structureIndex: 0,
    fiscalCode: 'MRTLCE10L71A662E',
    birthDate: '2010-07-31',
    anamnesi: 'Scoliosi lieve in osservazione ortopedica.',
    allergie: 'Nessuna.',
  },
  {
    email: 'riccardo.gatti@policlinico.it',
    firstName: 'Riccardo',
    lastName: 'Gatti',
    structureIndex: 0,
    fiscalCode: 'GTTRCR08P22A662F',
    birthDate: '2008-09-22',
    anamnesi: 'Otite media ricorrente. Ipertrofia adenoidea trattata.',
    allergie: 'Nessuna.',
  },
  {
    email: 'beatrice.sala@policlinico.it',
    firstName: 'Beatrice',
    lastName: 'Sala',
    structureIndex: 0,
    fiscalCode: 'SLABRC93M65A662G',
    birthDate: '1993-08-05',
    anamnesi: 'Endometriosi. Dolore pelvico cronico.',
    allergie: 'FANS.',
  },
  {
    email: 'daniele.rossetti@policlinico.it',
    firstName: 'Daniele',
    lastName: 'Rossetti',
    structureIndex: 0,
    fiscalCode: 'RSSDNL81A15A662I',
    birthDate: '1981-01-15',
    anamnesi: 'Ernia inguinale operata. Reflusso lieve.',
    allergie: 'Nessuna.',
  },
  {
    email: 'silvia.monti@policlinico.it',
    firstName: 'Silvia',
    lastName: 'Monti',
    structureIndex: 0,
    fiscalCode: 'MNTSLV87H45A662O',
    birthDate: '1987-06-15',
    anamnesi: 'Vertigini posizionali parossistiche benigne.',
    allergie: 'Nessuna.',
  },
  {
    email: 'alessandro.bianco@policlinico.it',
    firstName: 'Alessandro',
    lastName: 'Bianco',
    structureIndex: 0,
    fiscalCode: 'BNCLSN79D20A662A',
    birthDate: '1979-04-20',
    anamnesi: 'Gotta. Iperuricemia in terapia.',
    allergie: 'Allopurinolo (rash cutaneo).',
  },
  {
    email: 'cristina.ferrara@policlinico.it',
    firstName: 'Cristina',
    lastName: 'Ferrara',
    structureIndex: 0,
    fiscalCode: 'FRRCST96L45A662M',
    birthDate: '1996-07-05',
    anamnesi: 'Acne cystica in trattamento dermatologico.',
    allergie: 'Nessuna.',
  },
  {
    email: 'enrico.testa@policlinico.it',
    firstName: 'Enrico',
    lastName: 'Testa',
    structureIndex: 0,
    fiscalCode: 'TSTNRC84C12A662X',
    birthDate: '1984-03-12',
    anamnesi: 'Colon irritabile. Follow-up gastroenterologico.',
    allergie: 'Nessuna.',
  },
  {
    email: 'monica.parisi@policlinico.it',
    firstName: 'Monica',
    lastName: 'Parisi',
    structureIndex: 0,
    fiscalCode: 'PRSMNC90T52A662H',
    birthDate: '1990-12-12',
    anamnesi: 'Depressione maggiore in remissione. Terapia antidepressiva.',
    allergie: 'Nessuna.',
  },
  {
    email: 'gianluca.vitale@policlinico.it',
    firstName: 'Gianluca',
    lastName: 'Vitale',
    structureIndex: 0,
    fiscalCode: 'VTLGLC82B18A662L',
    birthDate: '1982-02-18',
    anamnesi: 'Prostatite cronica. Ipertrofia prostatica benigna iniziale.',
    allergie: 'Nessuna.',
  },
  {
    email: 'elisa.cattaneo@policlinico.it',
    firstName: 'Elisa',
    lastName: 'Cattaneo',
    structureIndex: 0,
    fiscalCode: 'CTTLSA97E70A662S',
    birthDate: '1997-05-30',
    anamnesi: 'Lupus eritematoso sistemico lieve. Follow-up reumatologico.',
    allergie: 'Solfiti.',
  },
  {
    email: 'fabio.grass@policlinico.it',
    firstName: 'Fabio',
    lastName: 'Grassi',
    structureIndex: 0,
    fiscalCode: 'GRSFBA76H01A662T',
    birthDate: '1976-06-01',
    anamnesi: 'Obesità grado II. Sindrome metabolica.',
    allergie: 'Nessuna.',
  },
];

export const REVIEW_COMMENTS = [
  'Medico molto preparato, spiegazioni chiare e visita accurata.',
  'Ottima accoglienza, tempi di attesa accettabili.',
  'Professionale e rassicurante, consigliato.',
  'Visita completa, follow-up ben organizzato.',
  'Competente e disponibile, sala d\'attesa un po\' lunga.',
  'Esperienza positiva, tornerò per i controlli.',
  'Cortesia e attenzione al paziente, ottimo rapporto.',
  'Spiegazioni dettagliate, mi sono sentito seguito.',
  'Buona organizzazione ambulatoriale.',
  'Medico puntuale e attento ai dettagli.',
  'Visita approfondita, materiali informativi utili.',
  'Consigli pratici e terapia efficace.',
];

export const REPORT_TEMPLATES = [
  {
    diagnosis: 'Cardiopatia ischemica lieve. Si consiglia ECG di controllo e profilo lipidico.',
    prescriptions: 'ASA 100mg 1cp/die. Atorvastatina 20mg la sera.',
    notes: 'Paziente stabile, rivalutazione tra 6 mesi.',
  },
  {
    diagnosis: 'Dermatite seborroica del cuoio capelluto.',
    prescriptions: 'Shampoo ketoconazolo 2% due volte a settimana per 4 settimane.',
    notes: 'Controllo a 30 giorni se persistenza sintomi.',
  },
  {
    diagnosis: 'Gonalgia meccanica destra. Sospetta tendinopatia rotulea.',
    prescriptions: 'Fisioterapia 10 sedute. Ibuprofene al bisogno.',
    notes: 'Evitare sport di impatto per 3 settimane.',
  },
  {
    diagnosis: 'Influenza-like illness in risoluzione. Esame obiettivo nella norma.',
    prescriptions: 'Paracetamolo 500mg al bisogno. Idratazione e riposo.',
    notes: 'Rivalutare se febbre oltre 48 ore.',
  },
  {
    diagnosis: 'Cefalea tensiva ricorrente.',
    prescriptions: 'Diario cefalee. Valutare risonanza se peggioramento.',
    notes: 'Consigliata igiene del sonno.',
  },
  {
    diagnosis: 'Reflusso gastroesofageo non complicato.',
    prescriptions: 'PPI al mattino a digiuno per 8 settimane.',
    notes: 'Dieta anti-reflusso e sollevamento testata del letto.',
  },
  {
    diagnosis: 'Follow-up oncologico: assenza di recidiva clinica al controllo attuale.',
    prescriptions: 'Continuare terapia ormonale come da schema oncologo.',
    notes: 'Prossimo controllo con marker e imaging programmato.',
  },
  {
    diagnosis: 'Otite media acuta in risoluzione.',
    prescriptions: 'Completare ciclo antibiotico. Controllo ORL tra 10 giorni.',
    notes: 'Genitore informato su segnali di allarme.',
  },
  {
    diagnosis: 'Disturbo da deficit di attenzione in follow-up pediatrico.',
    prescriptions: 'Mantenere supporto psicopedagogico. Rivalutazione tra 3 mesi.',
    notes: 'Scuola informata con consenso genitoriale.',
  },
  {
    diagnosis: 'Vertigine posizionale parossistica benigna trattata con manovra di Epley.',
    prescriptions: 'Esercizi di Brandt-Daroff. Evitare movimenti bruschi.',
    notes: 'Recidiva possibile, contattare ambulatorio se necessario.',
  },
];

export const DRAFT_REPORT_TEMPLATES = [
  {
    diagnosis: 'Bozza: controllo post-operatorio in corso di redazione.',
    prescriptions: '',
    notes: 'Completare referto dopo esito esami.',
  },
  {
    diagnosis: 'Bozza: valutazione neurologica — in attesa RM encefalo.',
    prescriptions: '',
    notes: '',
  },
  {
    diagnosis: 'Bozza: prima visita dermatologica — biopsia programmata.',
    prescriptions: 'Crema emolliente fino a esito histo.',
    notes: '',
  },
];

export const APPOINTMENT_REASONS = [
  'Controllo periodico',
  'Prima visita',
  'Follow-up terapeutico',
  'Rinnovo prescrizione',
  'Dolori muscolo-scheletrici',
  'Controllo post-operatorio',
  'Visita urgente ambulatoriale',
  'Second opinion',
  'Screening preventivo',
  'Valutazione esami di laboratorio',
];
