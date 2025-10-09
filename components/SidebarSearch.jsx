import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
const SidebarSearch = ({ isCollapsed, onSearch, onClear, searchResults, onResultClick }) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const handleSearch = (query) => {
        setSearchQuery(query);
        onSearch(query);
    };
    const handleClear = () => {
        setSearchQuery('');
        onClear();
        setIsSearchOpen(false);
    };
    const handleResultClick = (to) => {
        onResultClick(to);
        setIsSearchOpen(false);
        setSearchQuery('');
    };
    if (isCollapsed) {
        return (<div className="px-2 py-2">
        <button onClick={() => setIsSearchOpen(true)} className="w-full p-2 rounded-lg hover:bg-slate-100 transition-colors" title="Buscar">
          <Search className="w-4 h-4 text-slate-500"/>
        </button>
      </div>);
    }
    return (<div className="px-2 py-2 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"/>
        <input type="text" placeholder="Buscar funcionalidades..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} onFocus={() => setIsSearchOpen(true)} className="w-full pl-10 pr-10 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"/>
        {searchQuery && (<button onClick={handleClear} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4"/>
          </button>)}
      </div>

      {/* Search Results Dropdown */}
      {isSearchOpen && searchResults.length > 0 && (<div className="absolute top-full left-2 right-2 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {searchResults.map((result, index) => (<button key={index} onClick={() => handleResultClick(result.to)} className="w-full flex items-center px-3 py-2 text-left hover:bg-slate-50 transition-colors">
              <result.icon className="w-4 h-4 text-slate-500 mr-3"/>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{result.label}</div>
                <div className="text-xs text-slate-500">{result.group}</div>
              </div>
            </button>))}
        </div>)}

      {/* No Results */}
      {isSearchOpen && searchQuery && searchResults.length === 0 && (<div className="absolute top-full left-2 right-2 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-3">
          <div className="text-sm text-slate-500 text-center">
            Nenhuma funcionalidade encontrada
          </div>
        </div>)}
    </div>);
};
export default SidebarSearch;
