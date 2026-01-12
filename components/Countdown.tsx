
import React, { useState, useEffect, useCallback } from 'react';

interface CountdownProps {
  targetDate: Date;
}

const Countdown: React.FC<CountdownProps> = ({ targetDate }) => {
  const calculateTimeLeft = useCallback(() => {
    const difference = +targetDate - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const TimeUnit: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center justify-center bg-white/50 p-4 rounded-lg shadow-md w-24 h-24">
      <span className="text-4xl font-bold text-[#800020]">{value}</span>
      <span className="text-sm uppercase tracking-wider text-gray-600">{label}</span>
    </div>
  );

  return (
    <div className="my-8">
        <h3 className="font-serif text-2xl mb-4 text-[#a77b3b]">Faltan:</h3>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
            <TimeUnit value={timeLeft.days} label="Días" />
            <TimeUnit value={timeLeft.hours} label="Horas" />
            <TimeUnit value={timeLeft.minutes} label="Minutos" />
            <TimeUnit value={timeLeft.seconds} label="Segundos" />
        </div>
    </div>
  );
};

export default Countdown;
