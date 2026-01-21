import React from 'react';
import { Candidate } from '../types';
import { MapPin, Mail, Phone, Car, Star, Clock, FileText, Globe } from 'lucide-react';

interface CandidateListProps {
  candidates: Candidate[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const CandidateList: React.FC<CandidateListProps> = ({ candidates, selectedId, onSelect }) => {
  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500 h-64 text-center">
        <p>Aucun candidat ne correspond à vos critères</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3 pb-24">
      {candidates.map((c) => {
        const isSelected = selectedId === c.id;
        return (
          <div
            key={c.id}
            onClick={() => onSelect(c.id)}
            className={`
              relative p-4 rounded-xl border transition-all duration-200 cursor-pointer group
              ${isSelected 
                ? 'bg-[rgba(230,57,70,0.08)] border-[#e63946] shadow-[0_0_15px_rgba(230,57,70,0.15)]' 
                : 'bg-[#22222d] border-[#2d2d3a] hover:border-gray-500 hover:translate-x-1 hover:bg-[#2a2a35]'
              }
            `}
          >
            {/* Header: Name, Age, Note */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex flex-col">
                <h3 className="font-bold text-white text-lg leading-tight flex items-center gap-2">
                  {c.prenom} {c.nom}
                  {c.age && (
                    <span className="text-xs font-normal text-gray-500 bg-[#1a1a23] px-1.5 py-0.5 rounded border border-[#2d2d3a]">
                      {c.age} ans
                    </span>
                  )}
                </h3>
                {/* Stars */}
                <div className="flex items-center gap-0.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={`${
                        c.note && c.note >= star 
                          ? 'fill-[#f39c12] text-[#f39c12]' 
                          : 'fill-[#2d2d3a] text-[#3d3d4a]'
                      }`}
                    />
                  ))}
                  {c.note ? <span className="text-[10px] text-gray-500 ml-1">({c.note}/5)</span> : null}
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex flex-col items-end gap-1">
                {c.alternanceStatus === 'found' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                    ALTERNANCE ✅
                  </span>
                )}
                {c.alternanceStatus === 'searching' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 border border-orange-500/20">
                    RECHERCHE 🔍
                  </span>
                )}
                {c.alternanceStatus === 'unknown' && (
                   <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-500 border border-gray-500/20">
                    INCONNU
                  </span>
                )}
              </div>
            </div>

            {/* Body: Contact & Location */}
            <div className="flex flex-col gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-2.5">
                <div className="w-5 flex justify-center"><MapPin size={14} className="text-gray-500" /></div>
                <span className="text-gray-300">{c.cp} {c.adresse}</span>
              </div>
              
              {c.mail && (
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-5 flex justify-center"><Mail size={14} className="text-gray-500"/></div>
                  <span className="truncate hover:text-white transition-colors" title={c.mail}>{c.mail}</span>
                </div>
              )}

              {c.tel && (
                <div className="flex items-center gap-2.5">
                   <div className="w-5 flex justify-center"><Phone size={14} className="text-gray-500"/></div>
                   <a href={`tel:${c.tel}`} onClick={(e) => e.stopPropagation()} className="hover:text-[#e63946] hover:underline transition-colors">
                     {c.tel}
                   </a>
                </div>
              )}
            </div>

            {/* Commute - Only if calculated */}
            {c.commuteTime && (
              <div className="mt-3 flex items-center justify-between gap-2 text-white bg-gradient-to-r from-blue-900/40 to-blue-900/20 p-2.5 rounded-lg border border-blue-500/30">
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-400" />
                    <span className="font-bold text-sm">{c.commuteTime}</span>
                </div>
                <span className="text-xs text-blue-300 font-medium">{c.commuteDistance}</span>
              </div>
            )}

            {/* Footer Actions & Info */}
            <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-[#2d2d3a] gap-2">
               <div className="flex flex-wrap items-center gap-2">
                 {c.permis && (
                   <span className="text-[10px] px-2 py-1 rounded-md bg-[#1a1a23] text-gray-300 border border-[#2d2d3a] flex items-center gap-1.5" title="Permis">
                     <Car size={12} className="text-[#e63946]" /> {c.permis}
                   </span>
                 )}
                 {c.visa && (
                   <span className="text-[10px] px-2 py-1 rounded-md bg-[#1a1a23] text-gray-300 border border-[#2d2d3a] flex items-center gap-1.5" title="Visa / Statut">
                     <Globe size={12} className="text-blue-400" /> {c.visa}
                   </span>
                 )}
               </div>

               {c.cvPdf && c.cvPdf.startsWith('http') && (
                  <a 
                    href={c.cvPdf} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] px-3 py-1.5 rounded-md bg-white text-black font-bold hover:bg-gray-200 transition-colors flex items-center gap-1.5 ml-auto"
                  >
                    <FileText size={12} /> CV
                  </a>
               )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CandidateList;