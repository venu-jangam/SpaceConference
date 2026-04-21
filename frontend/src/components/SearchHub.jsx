import React from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';

const SearchHub = ({ filters, setFilters }) => {
  const [showFilters, setShowFilters] = React.useState(false);

  const filterPills = [
    { label: 'This Month', value: 'month' },
    { label: 'Abstract Open', value: 'abstract' },
    { label: 'Free/Student', value: 'free' },
    { label: 'Hybrid', value: 'hybrid' },
    { label: 'European', value: 'europe' },
    { label: 'International', value: 'global' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12" id="discover">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-accent-blue transition-colors" />
          <input 
            type="text" 
            placeholder="Search by conference name, organizer, or topic (e.g. 'Lunar', 'IAF')..."
            className="w-full pl-12 pr-4 py-4 bg-space-900/50 border border-white/10 rounded-2xl focus:outline-none focus:border-accent-blue/50 transition-all text-lg"
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-all sm:flex items-center gap-2 hidden"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
          </button>
        </div>

        {/* Quick Pills */}
        <div className="flex flex-wrap gap-3">
          {filterPills.map((pill) => (
            <button
              key={pill.label}
              className="px-4 py-1.5 rounded-full bg-space-800/80 border border-white/5 text-xs font-medium text-gray-400 hover:border-accent-blue/50 hover:text-white transition-all"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Advanced Filters Drawer */}
        {showFilters && (
          <div className="glass-card p-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Region</label>
              <select className="input-field bg-transparent">
                <option value="all">All Regions</option>
                <option value="europe">Europe</option>
                <option value="na">North America</option>
                <option value="apac">Asia-Pacific</option>
                <option value="global">Global/Online</option>
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Format</label>
              <select className="input-field bg-transparent">
                <option value="all">All Formats</option>
                <option value="in-person">In-person</option>
                <option value="hybrid">Hybrid</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Sort By</label>
              <select className="input-field bg-transparent">
                <option value="soonest">Soonest Start</option>
                <option value="deadline">Next Deadline</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 border-2 border-white/20 rounded-md group-hover:border-accent-blue transition-colors flex items-center justify-center">
                  <div className="w-3 h-3 bg-accent-blue rounded-sm scale-0 group-hover:scale-100 transition-transform" />
                </div>
                <span className="text-sm font-medium text-gray-300">Student Bursary</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchHub;
