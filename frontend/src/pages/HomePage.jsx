import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Hero from '../components/Hero';
import SearchHub from '../components/SearchHub';
import ConferenceCard from '../components/ConferenceCard';
import { Loader2 } from 'lucide-react';

const HomePage = () => {
  const [conferences, setConferences] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    region: 'all',
    format: 'all',
    sort: 'soonest'
  });

  useEffect(() => {
    fetchData();
    fetchUpcoming();
  }, [filters]);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/conferences', { params: filters });
      setConferences(response.data.conferences);
    } catch (error) {
      console.error('Error fetching conferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcoming = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/conferences/upcoming');
      setUpcoming(response.data);
    } catch (error) {
      console.error('Error fetching upcoming:', error);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      <Hero upcomingConferences={upcoming} />
      
      <SearchHub filters={filters} setFilters={setFilters} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-12 h-12 text-accent-blue animate-spin" />
            <p className="text-gray-400 font-medium">Scanning for celestial events...</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Discovery Grid</h2>
                <p className="text-gray-400">Found {conferences.length} missions matching your trajectory</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {conferences.map((conf) => (
                <ConferenceCard key={conf.id} conference={conf} />
              ))}
            </div>

            {conferences.length === 0 && (
              <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                <p className="text-gray-500 text-lg">No conferences found. Try adjusting your signal filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
