import { Candidate } from '../types';
import { SHEET_ID, SHEET_NAME, SHEETS_API_KEY, CP_COORDS, CP_PRECIS } from '../constants';

export async function fetchCandidates(): Promise<Candidate[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}?key=${SHEETS_API_KEY}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Erreur HTTP ${response.status}`);
  }
  
  const data = await response.json();
  return parseSheetDataAPI(data);
}

function getCoords(cp: string) {
    if (!cp) return null;
    const cpStr = String(cp).replace(/\s/g, '').substring(0, 5);
    
    // Exact match
    if (CP_PRECIS[cpStr]) {
        const base = CP_PRECIS[cpStr];
        // Add tiny jitter to avoid stacking markers perfectly
        return {
            lat: base.lat + (Math.random() - 0.5) * 0.002,
            lng: base.lng + (Math.random() - 0.5) * 0.002
        };
    }
    
    // Department match
    const dept = cpStr.substring(0, 2);
    if (CP_COORDS[dept]) {
        const base = CP_COORDS[dept];
        return {
            lat: base.lat + (Math.random() - 0.5) * 0.04,
            lng: base.lng + (Math.random() - 0.5) * 0.04
        };
    }
    
    return null;
}

function parseSheetDataAPI(data: any): Candidate[] {
    if (!data.values || data.values.length < 2) {
        return [];
    }

    // Normalize headers
    const headers = data.values[0].map((h: string) => (h || '').toLowerCase().trim());
    const rows = data.values.slice(1);
    
    const findCol = (terms: string[]) => {
      for (const term of terms) {
          const idx = headers.findIndex((h: string) => h.includes(term));
          if (idx !== -1) return idx;
      }
      return -1;
    };

    // Robust column detection
    const colIdx = {
        nom: findCol(['nom']),
        prenom: findCol(['prénom', 'prenom']),
        mail: findCol(['mail', 'email']),
        tel: findCol(['téléphone', 'telephone', 'tel']),
        note: findCol(['note']),
        cp: findCol(['code postal', 'cp', 'postal']),
        permis: findCol(['permis b', 'permis', 'vehicul']),
        visa: findCol(['visa', 'titre', 'séjour', 'nationalité', 'situation']), // New column detection
        dateNaissance: findCol(['date naissance', 'naissance']),
        age: findCol(['age', 'âge']),
        cvPdf: findCol(['lien cv pdf', 'cv pdf']),
        alternance: findCol(['alternance']),
        adresse: findCol(['adresse']),
    };

    const result: Candidate[] = [];
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const getValue = (idx: number) => (idx >= 0 && idx < row.length) ? (row[idx] || '') : '';

        const nom = getValue(colIdx.nom);
        const prenom = getValue(colIdx.prenom);
        
        if (!nom) continue; // Minimal requirement

        const cp = String(getValue(colIdx.cp)).replace(/\s/g, '');
        const coords = getCoords(cp);
        
        if (!coords) continue;

        const noteStr = String(getValue(colIdx.note));
        const noteMatch = noteStr.match(/(\d)/);
        const note = noteMatch ? parseInt(noteMatch[1]) : null;

        // Parse Age as Number
        const ageStr = String(getValue(colIdx.age));
        const ageMatch = ageStr.match(/(\d+)/);
        const age = ageMatch ? parseInt(ageMatch[1]) : null;

        const alternance = String(getValue(colIdx.alternance)).toLowerCase();
        let alternanceStatus: 'found' | 'searching' | 'unknown' = 'unknown';
        if (alternance.includes('oui') || alternance.includes('contrat') || alternance.includes('trouvé')) {
            alternanceStatus = 'found';
        } else if (alternance.includes('recherche') || alternance.includes('cours')) {
            alternanceStatus = 'searching';
        }

        result.push({
            id: i + 1,
            nom: nom,
            prenom: prenom,
            mail: getValue(colIdx.mail),
            tel: getValue(colIdx.tel),
            note: note,
            cp: cp,
            permis: getValue(colIdx.permis),
            visa: getValue(colIdx.visa),
            dateNaissance: getValue(colIdx.dateNaissance),
            age: age,
            cvPdf: getValue(colIdx.cvPdf),
            alternance: getValue(colIdx.alternance),
            alternanceStatus: alternanceStatus,
            adresse: getValue(colIdx.adresse),
            lat: coords.lat,
            lng: coords.lng
        });
    }
    
    return result;
}