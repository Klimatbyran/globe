import React, { useState, useEffect, useRef } from 'react';
import { Company } from '../types/emissions';
import { Search, X } from 'lucide-react';

interface CompanySearchProps {
  companies: Company[];
  onSelectCompany: (company: Company) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function CompanySearch({ companies, onSelectCompany, isOpen, onClose }: CompanySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCompanies([]);
      return;
    }
    
    const lowercasedSearch = searchTerm.toLowerCase();
    const results = companies
      .filter(company => 
        company.name.toLowerCase().includes(lowercasedSearch) ||
        company.description?.toLowerCase().includes(lowercasedSearch)
      )
      .slice(0, 10); // Limit to 10 results
    
    setFilteredCompanies(results);
  }, [searchTerm, companies]);
  
  const handleSelectCompany = (company: Company) => {
    onSelectCompany(company);
    setSearchTerm('');
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-gray-800 flex items-center">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Sök efter företag..."
            className="bg-transparent text-white w-full outline-none"
            autoFocus
          />
          <button onClick={onClose} className="ml-2 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredCompanies.length > 0 ? (
            <ul>
              {filteredCompanies.map((company) => (
                <li 
                  key={company.wikidataId} 
                  className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-800"
                  onClick={() => handleSelectCompany(company)}
                >
                  <div className="font-medium text-white">{company.name}</div>
                  {company.description && (
                    <div className="text-sm text-gray-400 truncate">{company.description}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {company.reportingPeriods[0]?.emissions?.calculatedTotalEmissions?.toLocaleString() || 'N/A'} tons CO2
                  </div>
                </li>
              ))}
            </ul>
          ) : searchTerm ? (
            <div className="p-4 text-gray-400 text-center">Inga företag hittades</div>
          ) : (
            <div className="p-4 text-gray-400 text-center">Börja skriva för att söka</div>
          )}
        </div>
      </div>
    </div>
  );
}
