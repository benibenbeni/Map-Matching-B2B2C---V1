import React, { useEffect, useState, useCallback, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { MAPS_API_KEY, MAP_STYLE } from '../constants';
import { Candidate } from '../types';

interface MapContainerProps {
  candidates: Candidate[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

const DEFAULT_CENTER = { lat: 48.8566, lng: 2.3522 };
const DEFAULT_ZOOM = 10;

// Internal component to handle map movement when selection changes
const MapEffect: React.FC<{ selectedId: number | null; candidates: Candidate[] }> = ({ selectedId, candidates }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || !selectedId) return;
    
    const candidate = candidates.find(c => c.id === selectedId);
    if (candidate) {
      map.panTo({ lat: candidate.lat, lng: candidate.lng });
      map.setZoom(13);
    }
  }, [map, selectedId, candidates]);

  return null;
};

const MapContainer: React.FC<MapContainerProps> = ({ candidates, selectedId, onSelect }) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  // Helper to determine marker color
  const getPinColor = (status: string) => {
    switch (status) {
      case 'found': return { background: '#2ecc71', borderColor: '#27ae60', glyphColor: '#1e8449' };
      case 'searching': return { background: '#f39c12', borderColor: '#d35400', glyphColor: '#e67e22' };
      default: return { background: '#e63946', borderColor: '#c0392b', glyphColor: '#a93226' };
    }
  };

  const selectedCandidate = candidates.find(c => c.id === selectedId);

  return (
    <div className="w-full h-full relative bg-[#0f0f13]">
      <APIProvider apiKey={MAPS_API_KEY}>
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={DEFAULT_ZOOM}
          mapId="DEMO_MAP_ID" // Required for AdvancedMarker
          options={{
            styles: MAP_STYLE,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
            backgroundColor: '#0f0f13',
          }}
          className="w-full h-full"
          onClick={() => onSelect(null)} // Deselect on map click
        >
          <MapEffect selectedId={selectedId} candidates={candidates} />

          {candidates.map((c) => {
            const colors = getPinColor(c.alternanceStatus);
            const isSelected = selectedId === c.id;
            
            return (
              <AdvancedMarker
                key={c.id}
                position={{ lat: c.lat, lng: c.lng }}
                onClick={(e) => {
                  e.domEvent.stopPropagation(); // Prevent map click
                  onSelect(c.id);
                }}
                onMouseEnter={() => setHoveredId(c.id)}
                onMouseLeave={() => setHoveredId(null)}
                zIndex={isSelected ? 1000 : 1}
              >
                <div className={`transform transition-transform duration-200 ${isSelected || hoveredId === c.id ? 'scale-125' : 'scale-100'}`}>
                  <Pin 
                    background={colors.background} 
                    borderColor={colors.borderColor} 
                    glyphColor={colors.glyphColor} 
                  />
                </div>
              </AdvancedMarker>
            );
          })}

          {selectedCandidate && (
             <InfoWindow
               position={{ lat: selectedCandidate.lat, lng: selectedCandidate.lng }}
               onCloseClick={() => onSelect(null)}
               pixelOffset={[0, -30]}
               headerContent={
                 <div className="text-[#0f0f13] font-bold text-sm">
                   {selectedCandidate.prenom} {selectedCandidate.nom}
                 </div>
               }
             >
                <div className="text-gray-800 text-xs min-w-[150px]">
                  <p>📍 {selectedCandidate.cp} {selectedCandidate.adresse}</p>
                  <p>📧 {selectedCandidate.mail}</p>
                  {selectedCandidate.commuteTime && (
                    <div className="mt-2 font-bold text-blue-700 bg-blue-50 p-1 rounded">
                      🚗 {selectedCandidate.commuteTime} de trajet
                    </div>
                  )}
                </div>
             </InfoWindow>
          )}

        </Map>
      </APIProvider>
    </div>
  );
};

export default MapContainer;