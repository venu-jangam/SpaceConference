import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Globe, Clock, Bookmark, ChevronRight } from 'lucide-react';
import { formatDistanceToNow, isAfter, parseISO } from 'date-fns';
import { clsx } from 'clsx';

const ConferenceCard = ({ conference }) => {
  const {
    name, slug, organizer, start_date, city, country, format,
    status, abstract_deadline, registration_deadline, topics, is_saved
  } = conference;

  const nextDeadline = abstract_deadline || registration_deadline;
  const daysUntil = nextDeadline ? Math.ceil((new Date(nextDeadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'abstract_open': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'registration_open': return 'bg-accent-blue/20 text-accent-blue border-accent-blue/30';
      case 'upcoming': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'ongoing': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'past': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const getUrgencyColor = (days) => {
    if (days === null) return 'text-gray-500';
    if (days < 7) return 'text-red-400';
    if (days < 30) return 'text-accent-amber';
    return 'text-accent-blue';
  };

  return (
    <div className="glass-card group flex flex-col h-full overflow-hidden">
      {/* Card Header & Badge */}
      <div className="p-6 pb-2 flex justify-between items-start gap-4">
        <span className={clsx("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", getStatusColor(status))}>
          {status.replace('_', ' ')}
        </span>
        <button className={clsx("p-2 rounded-full transition-colors", is_saved ? "text-accent-blue bg-accent-blue/10" : "text-gray-500 hover:text-white hover:bg-white/5")}>
          <Bookmark className={clsx("w-5 h-5", is_saved && "fill-current")} />
        </button>
      </div>

      {/* Content */}
      <Link to={`/conference/${slug}`} className="p-6 pt-2 flex-grow cursor-pointer">
        <h3 className="text-xl font-bold mb-2 group-hover:text-accent-blue transition-colors line-clamp-2">
          {name}
        </h3>
        <p className="text-sm text-gray-400 font-medium mb-4 flex items-center gap-1.5">
          <span className="text-accent-blue/80">{organizer}</span>
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-300">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span>{new Date(start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-300">
            {format === 'Online' ? <Globe className="w-4 h-4 text-gray-500" /> : <MapPin className="w-4 h-4 text-gray-500" />}
            <span className="truncate">{city ? `${city}, ${country}` : format}</span>
          </div>
          {nextDeadline && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className={clsx("font-medium", getUrgencyColor(daysUntil))}>
                {daysUntil <= 0 ? 'Deadline today!' : `Deadline in ${daysUntil} days`}
              </span>
            </div>
          )}
        </div>

        {/* Topics/Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {topics.slice(0, 3).map(topic => (
            <span key={topic} className="text-[10px] px-2 py-0.5 rounded bg-space-800 text-gray-400 border border-white/5">
              {topic}
            </span>
          ))}
          {topics.length > 3 && <span className="text-[10px] text-gray-500">+{topics.length - 3}</span>}
        </div>
      </Link>

      {/* Footer Button */}
      <div className="px-6 py-4 border-t border-white/5 mt-auto bg-white/[0.02]">
        <Link 
          to={`/conference/${slug}`} 
          className="flex items-center justify-between w-full text-xs font-bold text-gray-400 group-hover:text-white transition-colors"
        >
          VIEW DETAILS
          <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ConferenceCard;
