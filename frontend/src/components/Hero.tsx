import React, { useState, useEffect } from 'react';
import { Timer, Flame } from 'lucide-react';

const Hero: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 15,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev; // Timer stopped
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  return (
    <div className="hero">
      <div className="hero-content">
        <div className="hero-badge">
          <Flame size={18} color="#ef4444" />
          <span>Live Now</span>
        </div>
        <h1 className="hero-title">Epic Tech Flash Sale</h1>
        <p className="hero-subtitle">
          Up to 70% off premium gaming gear and components. Extremely limited stock!
        </p>
        
        <div className="countdown">
          <div className="countdown-header">
            <Timer size={20} />
            <span>Sale ends in:</span>
          </div>
          <div className="countdown-timer">
            <div className="time-box">
              <span className="time-value">{formatTime(timeLeft.hours)}</span>
              <span className="time-label">HOURS</span>
            </div>
            <span className="time-colon">:</span>
            <div className="time-box">
              <span className="time-value">{formatTime(timeLeft.minutes)}</span>
              <span className="time-label">MINS</span>
            </div>
            <span className="time-colon">:</span>
            <div className="time-box">
              <span className="time-value">{formatTime(timeLeft.seconds)}</span>
              <span className="time-label">SECS</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements for glassmorphism background */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
    </div>
  );
};

export default Hero;
