import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const Hero = ({ upcomingConferences }) => {
  const [timeLeft, setTimeLeft] = useState({});
  const targetConference = upcomingConferences?.[0];

  useEffect(() => {
    if (!targetConference) return;

    const timer = setInterval(() => {
      const difference = new Date(targetConference.start_date) - new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetConference]);

  return (
    <div className="relative overflow-hidden pt-20 pb-32">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-accent-blue/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-3/4 bg-purple-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-accent-blue text-sm font-medium mb-8 animate-glow-pulse">
            <Sparkles className="w-4 h-4" />
            <span>Discover the future of Space Exploration</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight max-w-4xl mx-auto">
            Every Space Deadline. <br />
            <span className="bg-gradient-to-r from-accent-blue via-purple-400 to-accent-amber bg-clip-text text-transparent">
              One Unified Orbit.
            </span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The definitive global aggregator for planetary science, propulsion, policy, and exploration conferences. 
            Join 5,000+ space professionals never missing a deadline.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#discover" className="btn-primary flex items-center gap-2 group">
              Explore Conferences
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </a>
            <button className="btn-secondary">
              Alert Preferences
            </button>
          </div>
        </div>

        {/* Countdown Section */}
        {targetConference && (
          <div className="glass-card max-w-4xl mx-auto p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent-blue text-space-950 text-[10px] font-black rounded-lg uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(0,212,255,0.3)]">
              Next Launch In
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
              {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
                <div key={unit} className="text-center">
                  <div className="text-4xl md:text-5xl font-['Outfit'] font-bold mb-1 blue-glow">
                    {String(timeLeft[unit] || 0).padStart(2, '0')}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest">{unit}</div>
                </div>
              ))}
            </div>

            <div className="text-center pt-8 border-t border-white/5">
              <h3 className="text-lg font-bold mb-1">{targetConference.name}</h3>
              <p className="text-sm text-gray-400">
                {targetConference.city}, {targetConference.country} • {new Date(targetConference.start_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Hero;
