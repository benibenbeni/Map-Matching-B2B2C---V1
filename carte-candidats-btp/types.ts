export interface Candidate {
  id: number;
  nom: string;
  prenom: string;
  mail: string;
  tel: string;
  note: number | null;
  cp: string;
  permis: string;
  visa: string; // New field
  dateNaissance: string;
  age: number | null; // Changed to number for range filtering
  cvPdf: string;
  alternance: string;
  alternanceStatus: 'found' | 'searching' | 'unknown';
  adresse: string;
  lat: number;
  lng: number;
  commuteTime?: string; // Calculated field (text)
  commuteDistance?: string; // Calculated field (text)
  commuteValue?: number; // Calculated field (seconds) for sorting
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export type FilterType = 'all' | 'found' | 'searching';

export interface AppState {
  candidates: Candidate[];
  filteredCandidates: Candidate[];
  loading: boolean;
  error: string | null;
  selectedCandidateId: number | null;
  filter: FilterType;
  searchTerm: string;
  jobSiteAddress: string;
  calculatingCommute: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}