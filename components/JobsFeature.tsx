import React from 'react';

export const JobsFeature = () => {
  return (
    <div className="w-full h-full overflow-hidden bg-background">
      <iframe 
        src="https://vieclam.locaith.com/jobs" 
        className="w-full h-full border-none"
        title="Sàn việc làm Locaith"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};
