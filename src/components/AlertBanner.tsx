import React from 'react';

interface AlertBannerProps {
  type: 'festival' | 'weather' | 'info';
  title: string;
  message: string;
  icon?: string;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, title, message, icon }) => {
  const styles = {
    festival: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-900',
    weather: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 text-blue-900',
    info: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 text-amber-900',
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[type]}`}>
      <div className="flex items-start space-x-3">
        <span className="text-2xl">{icon || (type === 'festival' ? '🎉' : type === 'weather' ? '🌦️' : 'ℹ️')}</span>
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-sm opacity-80 mt-0.5">{message}</p>
        </div>
      </div>
    </div>
  );
};
