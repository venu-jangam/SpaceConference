import React from 'react';
import { 
  BarChart3, Users, Newspaper, CheckCircle, 
  Upload, Plus, Search, MoreVertical 
} from 'lucide-react';

const AdminPage = () => {
  const stats = [
    { label: 'Total Conferences', val: '142', change: '+12%', icon: Newspaper },
    { label: 'Registered Users', val: '1,204', change: '+5%', icon: Users },
    { label: 'Verified Missions', val: '98', change: '85%', icon: CheckCircle },
    { label: 'Save Growth', val: '+240', change: 'weekly', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen pt-12 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold font-['Outfit'] mb-2">Command Center</h1>
            <p className="text-gray-400">Manage global conferences and monitor platform growth.</p>
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <Upload className="w-4 h-4" />
              CSV Import
            </button>
            <button className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4 text-space-950" />
              New Conference
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="glass-card p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 rounded-xl bg-accent-blue/10">
                  <stat.icon className="w-6 h-6 text-accent-blue" />
                </div>
                <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                  {stat.change}
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">{stat.val}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity Table */}
        <div className="glass-card">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold">Recent Submissions</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text" 
                placeholder="Search database..." 
                className="bg-space-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:border-accent-blue/50" 
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-white/5">
                  <th className="px-6 py-4 font-bold">Conference Name</th>
                  <th className="px-6 py-4 font-bold">Organizer</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Verification</th>
                  <th className="px-6 py-4 font-bold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: 'Moon Settlement Expo 2026', org: 'NASA', status: 'Upcoming', v: true },
                  { name: 'Mars Robotics Summit', org: 'ESA', status: 'Abstract Open', v: false },
                  { name: 'Global Propulsion Forum', org: 'IAF', status: 'Registration Open', v: true },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-200 group-hover:text-accent-blue transition-colors">{row.name}</div>
                      <div className="text-xs text-gray-500">Slug: {row.name.toLowerCase().replace(/ /g, '-')}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">{row.org}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10">
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {row.v ? (
                        <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </div>
                      ) : (
                        <button className="text-xs text-accent-blue font-bold px-3 py-1 rounded bg-accent-blue/10 border border-accent-blue/20 hover:bg-accent-blue/20 transition-all">
                          Verify Now
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-600 hover:text-white">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
