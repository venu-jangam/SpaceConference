import React, { useState } from 'react';
import { Bookmark, Rocket, Search } from 'lucide-react';
import ConferenceCard from '../components/ConferenceCard';

const SavedPage = () => {
  // Placeholder data for demonstration
  const [savedConferences, setSavedConferences] = useState([
    {
      id: "1",
      name: "77th International Astronautical Congress (IAC 2026)",
      slug: "iac-2026",
      organizer: "IAF",
      start_date: "2026-10-05",
      city: "Milan",
      country: "Italy",
      format: "In-person",
      status: "upcoming",
      abstract_deadline: "2026-03-15",
      topics: ["exploration", "policy"],
      is_saved: true
    }
  ]);

  return (
    <div className="min-h-screen pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold font-['Outfit'] mb-2 flex items-center gap-3">
              <Bookmark className="w-8 h-8 text-accent-blue" />
              My Saved Missions
            </h1>
            <p className="text-gray-400">Track deadlines and updates for your personal space roadmap.</p>
          </div>
        </div>

        {savedConferences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedConferences.map(conf => (
              <ConferenceCard key={conf.id} conference={conf} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass-card">
            <div className="p-4 rounded-full bg-white/5 border border-white/10 w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-8 h-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Your list is currently in deep space</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Start bookmarking conferences from the discovery grid to build your schedule.</p>
            <button className="btn-primary">Return to Discovery</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;
