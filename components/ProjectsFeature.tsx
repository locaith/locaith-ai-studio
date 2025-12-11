import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Folder } from 'lucide-react';

export const ProjectsFeature = () => {
  const navigate = useNavigate();

  return (
    <div className="h-full w-full bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="bg-secondary/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto">
          <Folder className="h-12 w-12 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Không có nội dung</h2>
          <p className="text-muted-foreground">
            Danh sách dự án của bạn hiện đang trống hoặc đã được chuyển sang mục Việc làm & Ứng tuyển.
          </p>
        </div>
        <Button onClick={() => navigate('/jobs/my-jobs')} variant="outline">
          Đi tới Việc làm & Ứng tuyển
        </Button>
      </div>
    </div>
  );
};
