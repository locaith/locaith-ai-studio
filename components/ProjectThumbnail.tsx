import React from 'react';

interface ProjectThumbnailProps {
    htmlContent: string;
}

export const ProjectThumbnail: React.FC<ProjectThumbnailProps> = ({ htmlContent }) => {
    if (!htmlContent) return null;

    return (
        <div className="w-full h-full overflow-hidden relative bg-white pointer-events-none">
            <div className="w-[400%] h-[400%] origin-top-left transform scale-[0.25]">
                 <iframe 
                    srcDoc={htmlContent}
                    className="w-full h-full border-0"
                    title="Thumbnail"
                    scrolling="no"
                    sandbox="allow-scripts"
                />
            </div>
            {/* Overlay to prevent interaction */}
            <div className="absolute inset-0 z-10 bg-transparent" />
        </div>
    );
};
