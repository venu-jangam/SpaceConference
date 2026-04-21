import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, MapPin, Globe, ExternalLink, Bookmark, 
  ChevronLeft, Info, DollarSign, Award, Tag, Clock
} from 'lucide-react';
import { clsx } from 'clsx';

const ConferenceDetailPage = () => {
  const { slug } = useParams();
  const [conference, setConference] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/conferences/${slug}`);
        setConference(response.data);
      } catch (error) {
        console.error('Error fetching detail:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-accent-blue border-t-transparent rounded-full animate-spin" /></div>;
  if (!conference) return <div className="min-h-screen pt-40 px-8 text-center text-2xl font-bold">Signal Lost: Conference Not Found</div>;

  const timelineEvents = [
    { label: 'Abstract Deadline', date: conference.abstract_deadline, type: 'critical' },
    { label: 'Registration Deadline', date: conference.registration_deadline, type: 'important' },
    { label: 'Conference Start', date: conference.start_date, type: 'event' },
    { label: 'Conference End', date: conference.end_date, type: 'event' },
  ].filter(e => e.date).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="min-h-screen pb-32">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-blue/5 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-12 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          BACK TO DISCOVER
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="px-3 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/30 text-accent-blue text-[10px] font-bold uppercase tracking-widest">
                {conference.format}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-bold uppercase tracking-widest">
                {conference.region}
              </span>
              {conference.is_verified && (
                <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  Verified
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight font-['Outfit']">
              {conference.name}
            </h1>
            
            <p className="text-xl text-accent-blue font-semibold mb-8">
              Hosted by {conference.organizer}
            </p>

            <div className="glass-card p-8 mb-12">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-accent-blue" />
                About the Conference
              </h3>
              <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                {conference.description}
              </p>
            </div>

            {/* Timeline Bar */}
            <div className="mb-12">
              <h3 className="text-lg font-bold mb-8 uppercase tracking-[0.2em] text-gray-500 pl-2">Critical Timeline</h3>
              <div className="relative pt-8 pb-4">
                {/* Horizontal Line */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/10 -translate-y-1/2" />
                
                <div className="flex justify-between relative px-2">
                  {timelineEvents.map((event, idx) => {
                    const isPast = new Date(event.date) < new Date();
                    return (
                      <div key={idx} className="flex flex-col items-center gap-4 relative">
                        {/* Vertical Indicator */}
                        <div className={clsx(
                          "w-4 h-4 rounded-full border-4 transition-all z-10",
                          isPast ? "bg-gray-700 border-space-950" : "bg-accent-blue border-space-950 shadow-[0_0_10px_rgba(0,212,255,0.4)]"
                        )} />
                        
                        <div className="absolute top-[-3rem] text-center w-32 left-1/2 -translate-x-1/2">
                          <div className={clsx("text-[10px] font-bold uppercase tracking-widest mb-1", isPast ? "text-gray-600" : "text-accent-blue")}>
                            {event.label}
                          </div>
                          <div className="text-xs font-medium text-gray-400">
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Topics */}
            <div className="flex flex-wrap gap-2">
              {conference.topics?.map(topic => (
                <div key={topic} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-space-800 border border-white/5 text-sm text-gray-300">
                  <Tag className="w-3 h-3 text-accent-blue" />
                  {topic}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar / Core Actions */}
          <div className="space-y-8">
            <div className="glass-card p-8 border-accent-blue/20 bg-space-900/60 sticky top-32">
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-accent-blue/10">
                    <Calendar className="w-6 h-6 text-accent-blue" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Event Date</div>
                    <div className="font-bold text-gray-200">
                      {new Date(conference.start_date).toLocaleDateString()} — {new Date(conference.end_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-purple-500/10">
                    <MapPin className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Location</div>
                    <div className="font-bold text-gray-200">{conference.venue || 'TBD'}</div>
                    <div className="text-sm text-gray-400">{conference.city}, {conference.country}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-accent-amber/10">
                    <DollarSign className="w-6 h-6 text-accent-amber" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Fees</div>
                    <div className="font-bold text-gray-200">{conference.regular_fee} {conference.currency} (Regular)</div>
                    <div className="text-sm text-accent-amber font-semibold">{conference.student_fee} {conference.currency} (Student)</div>
                  </div>
                </div>

                {conference.student_bursary_available && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-green-500/10">
                      <Award className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Support</div>
                      <div className="font-bold text-green-400">Bursaries Available</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <a 
                  href={conference.website_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn-primary w-full flex items-center justify-center gap-3"
                >
                  Official Website
                  <ExternalLink className="w-4 h-4 text-space-950" />
                </a>
                <button className="btn-secondary w-full flex items-center justify-center gap-3 group">
                  <Bookmark className="w-4 h-4 group-hover:fill-current" />
                  Save to My List
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <div className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2 flex items-center justify-center gap-2">
                  <Clock className="w-3 h-3" />
                  Next Deadline
                </div>
                <div className="text-2xl font-bold text-accent-blue amber-glow">
                   {new Date(conference.abstract_deadline).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConferenceDetailPage;
