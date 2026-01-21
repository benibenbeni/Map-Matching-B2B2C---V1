import React, { useState, useEffect, useMemo } from 'react';
import { fetchCandidates } from './services/sheetService';
import { Candidate, FilterType } from './types';
import { Search, RefreshCw, Navigation, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import CandidateList from './components/CandidateList';
import MapContainer from './components/MapContainer';

const DEPTS_IDF = ['75', '77', '78', '91', '92', '93', '94', '95'];
const AGE_RANGES = [
  { id: '-18', label: '-18 ans' },
  { id: '18-21', label: '18-21 ans' },
  { id: '21-26', label: '21-26 ans' },
  { id: '+26', label: '+26 ans' },
];

const App = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Basic Search & State
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState<FilterType>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  // Advanced Filters
  const [showFilters, setShowFilters] = useState(true);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedAgeRanges, setSelectedAgeRanges] = useState<string[]>([]);
  const [selectedPermis, setSelectedPermis] = useState<string[]>([]);
  const [selectedVisas, setSelectedVisas] = useState<string[]>([]);
  
  // Computed Options (from data)
  const [availablePermis, setAvailablePermis] = useState<string[]>([]);
  const [availableVisas, setAvailableVisas] = useState<string[]>([]);

  // Job Site / Travel Time State
  const [jobSite, setJobSite] = useState('');
  const [calculating, setCalculating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCandidates();
      setCandidates(data);
      
      // Extract unique values for dynamic filters
      const uniquePermis = Array.from(new Set(data.map(c => c.permis).filter(Boolean))).sort();
      const uniqueVisas = Array.from(new Set(data.map(c => c.visa).filter(Boolean))).sort();
      setAvailablePermis(uniquePermis);
      setAvailableVisas(uniqueVisas);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter Logic
  const filteredCandidates = useMemo(() => {
    let result = candidates.filter(c => {
      // 1. Search Term
      const matchesSearch = 
        !searchTerm || 
        c.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.cp.includes(searchTerm);
      
      // 2. Status Filter
      let matchesStatus = true;
      if (activeStatus === 'found') matchesStatus = c.alternanceStatus === 'found';
      if (activeStatus === 'searching') matchesStatus = c.alternanceStatus === 'searching';

      // 3. Dept Filter (Inclusive OR)
      let matchesDept = true;
      if (selectedDepts.length > 0) {
        matchesDept = selectedDepts.some(d => c.cp.startsWith(d));
      }

      // 4. Rating Filter (Inclusive OR)
      let matchesRating = true;
      if (selectedRatings.length > 0) {
        matchesRating = selectedRatings.includes(c.note || 0);
      }

      // 5. Age Filter (Inclusive OR)
      let matchesAge = true;
      if (selectedAgeRanges.length > 0 && c.age !== null) {
        matchesAge = selectedAgeRanges.some(range => {
          if (range === '-18') return c.age! < 18;
          if (range === '18-21') return c.age! >= 18 && c.age! <= 21;
          if (range === '21-26') return c.age! > 21 && c.age! <= 26;
          if (range === '+26') return c.age! > 26;
          return false;
        });
      }

      // 6. Permis Filter (Inclusive OR)
      let matchesPermis = true;
      if (selectedPermis.length > 0) {
         matchesPermis = selectedPermis.includes(c.permis);
      }

      // 7. Visa Filter (Inclusive OR)
      let matchesVisa = true;
      if (selectedVisas.length > 0) {
        matchesVisa = selectedVisas.includes(c.visa);
      }

      return matchesSearch && matchesStatus && matchesDept && matchesRating && matchesAge && matchesPermis && matchesVisa;
    });

    // Sort Logic
    result.sort((a, b) => {
        // Commute time priority
        if (a.commuteValue && b.commuteValue) return a.commuteValue - b.commuteValue;
        if (a.commuteValue && !b.commuteValue) return -1;
        if (!a.commuteValue && b.commuteValue) return 1;

        // Then Note (desc)
        const noteA = a.note || 0;
        const noteB = b.note || 0;
        if (noteA !== noteB) return noteB - noteA;

        // Then Name (asc)
        return a.nom.localeCompare(b.nom);
    });

    return result;
  }, [candidates, searchTerm, activeStatus, selectedDepts, selectedRatings, selectedAgeRanges, selectedPermis, selectedVisas]);

  // Generic Toggle Helper
  const toggleFilter = (list: any[], setList: (l: any[]) => void, item: any) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const resetAllFilters = () => {
    setSelectedDepts([]);
    setSelectedRatings([]);
    setSelectedAgeRanges([]);
    setSelectedPermis([]);
    setSelectedVisas([]);
    setActiveStatus('all');
    setSearchTerm('');
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      found: candidates.filter(c => c.alternanceStatus === 'found').length,
      searching: candidates.filter(c => c.alternanceStatus === 'searching').length
    };
  }, [candidates]);

  // Travel Time Calculation
  const calculateCommutes = async () => {
    if (!jobSite) return;
    setCalculating(true);
    try {
      if (!window.google || !window.google.maps) {
        throw new Error("Google Maps API not yet loaded.");
      }
      const service = new window.google.maps.DistanceMatrixService();
      const visibleCandidates = filteredCandidates; 
      const targets = visibleCandidates.slice(0, 25);
      
      if (targets.length === 0) {
          setCalculating(false);
          return;
      }

      const destinations = targets.map(c => ({ lat: c.lat, lng: c.lng }));

      service.getDistanceMatrix({
        origins: [jobSite],
        destinations: destinations,
        travelMode: window.google.maps.TravelMode.DRIVING,
        unitSystem: window.google.maps.UnitSystem.METRIC,
      }, (response, status) => {
        if (status === 'OK' && response) {
          const results = response.rows[0].elements;
          setCandidates(prev => {
             const next = [...prev];
             targets.forEach((t, index) => {
                const element = results[index];
                const candIdx = next.findIndex(c => c.id === t.id);
                if (candIdx !== -1 && element.status === 'OK') {
                   next[candIdx] = {
                     ...next[candIdx],
                     commuteTime: element.duration.text,
                     commuteValue: element.duration.value, // Seconds
                     commuteDistance: element.distance.text
                   };
                }
             });
             return next;
          });
        }
        setCalculating(false);
      });
    } catch (err: any) {
      alert("Erreur: " + err.message);
      setCalculating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0f0f13] text-[#f1f1f1]">
      
      {/* Header */}
      <header className="h-[60px] bg-[#1a1a23] border-b border-[#2d2d3a] px-4 flex items-center justify-between shrink-0 z-20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#e63946] to-[#ff6b6b] rounded-lg flex items-center justify-center text-sm shadow-lg shadow-red-900/20 text-white font-bold">
            BTP
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white">Campus BTP</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
             onClick={resetAllFilters} 
             className="text-[10px] text-gray-400 hover:text-white underline decoration-gray-600 hover:decoration-white transition-all"
           >
             Réinitialiser tout
           </button>
          <button 
            onClick={loadData}
            className="p-1.5 bg-[#22222d] border border-[#2d2d3a] rounded-lg hover:bg-[#343440] text-gray-400 transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar */}
        <aside className="w-[450px] bg-[#1a1a23] border-r border-[#2d2d3a] flex flex-col z-10 shadow-2xl relative flex-shrink-0">
          
          {/* Scrollable Controls Area */}
          <div className="flex-none overflow-y-auto custom-scrollbar max-h-[60vh] border-b border-[#2d2d3a]">
             <div className="p-4 space-y-5">
                
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#e63946] transition-colors" size={14} />
                  <input
                    type="text"
                    placeholder="Recherche rapide..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0f0f13] border border-[#2d2d3a] rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#e63946] focus:ring-1 focus:ring-[#e63946] transition-all"
                  />
                </div>

                {/* Commute Widget */}
                <div className="bg-[#22222d] p-3 rounded-lg border border-[#2d2d3a] space-y-2">
                    <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Adresse du chantier pour trajet..."
                          value={jobSite}
                          onChange={(e) => setJobSite(e.target.value)}
                          className="flex-1 bg-[#0f0f13] border border-[#2d2d3a] rounded-md px-3 py-1.5 text-xs focus:border-[#e63946] outline-none text-white transition-all"
                        />
                        <button 
                            onClick={calculateCommutes}
                            disabled={!jobSite || calculating}
                            className="bg-[#e63946] hover:bg-[#d62839] disabled:bg-gray-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-lg shadow-red-900/20"
                        >
                            <Navigation size={12} />
                        </button>
                    </div>
                </div>

                {/* --- FILTERS SECTION --- */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowFilters(!showFilters)}>
                    <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Filter size={12} /> Filtres Avancés
                    </h3>
                    {showFilters ? <ChevronUp size={14} className="text-gray-500"/> : <ChevronDown size={14} className="text-gray-500"/>}
                  </div>

                  {showFilters && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      
                      {/* Status */}
                      <div>
                        <span className="text-[10px] text-gray-500 font-semibold mb-2 block">STATUT</span>
                        <div className="flex gap-2">
                           {[{id: 'all', label: 'Tous'}, {id: 'found', label: 'Trouvés'}, {id: 'searching', label: 'En recherche'}].map(s => (
                             <button
                               key={s.id}
                               onClick={() => setActiveStatus(s.id as FilterType)}
                               className={`px-3 py-1 rounded-md text-[10px] border transition-all ${activeStatus === s.id ? 'bg-white text-black font-bold' : 'bg-[#1a1a23] border-[#2d2d3a] text-gray-400'}`}
                             >
                               {s.label}
                             </button>
                           ))}
                        </div>
                      </div>

                      {/* Note */}
                      <div>
                        <span className="text-[10px] text-gray-500 font-semibold mb-2 block">NOTE /5</span>
                        <div className="flex gap-2">
                          {[5, 4, 3, 2, 1].map(n => (
                             <button
                               key={n}
                               onClick={() => toggleFilter(selectedRatings, setSelectedRatings, n)}
                               className={`w-7 h-7 rounded-full text-[10px] font-bold border transition-all flex items-center justify-center ${selectedRatings.includes(n) ? 'bg-[#f39c12] text-black border-[#f39c12]' : 'bg-[#1a1a23] border-[#2d2d3a] text-gray-400'}`}
                             >
                               {n}
                             </button>
                          ))}
                        </div>
                      </div>

                      {/* Age */}
                      <div>
                        <span className="text-[10px] text-gray-500 font-semibold mb-2 block">ÂGE</span>
                        <div className="flex flex-wrap gap-2">
                           {AGE_RANGES.map(r => (
                             <button
                               key={r.id}
                               onClick={() => toggleFilter(selectedAgeRanges, setSelectedAgeRanges, r.id)}
                               className={`px-2 py-1 rounded text-[10px] border transition-all ${selectedAgeRanges.includes(r.id) ? 'bg-[#e63946] text-white border-[#e63946]' : 'bg-[#1a1a23] border-[#2d2d3a] text-gray-400'}`}
                             >
                               {r.label}
                             </button>
                           ))}
                        </div>
                      </div>

                      {/* Permis */}
                      {availablePermis.length > 0 && (
                        <div>
                          <span className="text-[10px] text-gray-500 font-semibold mb-2 block">PERMIS</span>
                          <div className="flex flex-wrap gap-2">
                            {availablePermis.map(p => (
                               <button
                                 key={p}
                                 onClick={() => toggleFilter(selectedPermis, setSelectedPermis, p)}
                                 className={`px-2 py-1 rounded text-[10px] border transition-all ${selectedPermis.includes(p) ? 'bg-blue-600 text-white border-blue-600' : 'bg-[#1a1a23] border-[#2d2d3a] text-gray-400'}`}
                               >
                                 {p}
                               </button>
                            ))}
                          </div>
                        </div>
                      )}

                       {/* Visa */}
                       {availableVisas.length > 0 && (
                        <div>
                          <span className="text-[10px] text-gray-500 font-semibold mb-2 block">VISA / STATUT</span>
                          <div className="flex flex-wrap gap-2">
                            {availableVisas.map(v => (
                               <button
                                 key={v}
                                 onClick={() => toggleFilter(selectedVisas, setSelectedVisas, v)}
                                 className={`px-2 py-1 rounded text-[10px] border transition-all ${selectedVisas.includes(v) ? 'bg-purple-600 text-white border-purple-600' : 'bg-[#1a1a23] border-[#2d2d3a] text-gray-400'}`}
                               >
                                 {v}
                               </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Depts */}
                      <div>
                        <span className="text-[10px] text-gray-500 font-semibold mb-2 block">DÉPARTEMENT</span>
                        <div className="flex flex-wrap gap-1.5">
                           {DEPTS_IDF.map(dept => (
                             <button
                                key={dept}
                                onClick={() => toggleFilter(selectedDepts, setSelectedDepts, dept)}
                                className={`w-7 h-7 rounded text-[10px] font-bold flex items-center justify-center border transition-all ${selectedDepts.includes(dept) ? 'bg-gray-200 text-black border-white' : 'bg-[#1a1a23] border-[#2d2d3a] text-gray-500'}`}
                             >
                               {dept}
                             </button>
                           ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* List Header Stats */}
          <div className="px-4 py-2 border-b border-[#2d2d3a] bg-[#22222d] text-[10px] text-gray-400 flex justify-between items-center shrink-0">
               <span>{filteredCandidates.length} profils filtrés</span>
               <div className="flex gap-3">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {stats.found}</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> {stats.searching}</span>
               </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#1a1a23]">
             <CandidateList 
                candidates={filteredCandidates} 
                selectedId={selectedId}
                onSelect={setSelectedId}
             />
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative bg-[#0f0f13]">
          <MapContainer 
            candidates={filteredCandidates} 
            selectedId={selectedId} 
            onSelect={setSelectedId} 
          />
          
          {/* Legend Overlay */}
          <div className="absolute bottom-6 left-6 bg-[#1a1a23]/90 backdrop-blur-md border border-[#2d2d3a] p-4 rounded-xl shadow-2xl z-10 max-w-[200px]">
             <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Légende</h4>
             <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#2ecc71] shadow-[0_0_8px_rgba(46,204,113,0.5)]"></div>
                   <span className="text-gray-300">Alternance trouvée</span>
                </div>
                <div className="flex items-center gap-2.5">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#f39c12] shadow-[0_0_8px_rgba(243,156,18,0.5)]"></div>
                   <span className="text-gray-300">En recherche</span>
                </div>
             </div>
          </div>
        </main>

      </div>
    </div>
  );
};

export default App;