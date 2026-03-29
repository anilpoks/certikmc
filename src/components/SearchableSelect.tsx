import { ChevronDown, Search } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  error?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  label,
  error
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{label}</label>
      <div 
        className={`relative w-full px-3 py-2.5 text-sm rounded-xl border ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-neutral-200'} focus-within:ring-2 focus-within:ring-neutral-900 focus-within:border-transparent outline-none transition-all bg-white cursor-pointer flex items-center justify-between`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-neutral-900' : 'text-neutral-400'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50">
            <Search className="w-4 h-4 text-neutral-400" />
            <input
              autoFocus
              type="text"
              className="w-full bg-transparent border-none outline-none text-sm py-1"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option}
                  className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    value === option 
                      ? 'bg-neutral-900 text-white' 
                      : 'hover:bg-neutral-100 text-neutral-700'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-neutral-400 italic">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
      {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  );
}
