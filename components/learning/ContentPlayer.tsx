'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play, FileText, Monitor } from 'lucide-react';
import { Topic } from '@/data/classData';

interface ContentPlayerProps {
  topic: Topic | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function ContentPlayer({ topic, isOpen, onClose, onComplete }: ContentPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!topic) return null;

  const handleContentAction = () => {
    setIsLoading(true);
    
    switch (topic.content.type) {
      case 'external_link':
        if (topic.content.url) {
          window.open(topic.content.url, '_blank');
        }
        break;
      case 'video':
        // Handle video playback
        console.log('Playing video:', topic.content.videoUrl);
        break;
      case 'pdf':
        // Handle PDF viewing
        if (topic.content.pdfUrl) {
          window.open(topic.content.pdfUrl, '_blank');
        }
        break;
      case 'text':
        // Text content is displayed inline
        break;
      case 'interactive_widget':
        // Handle interactive widget
        console.log('Loading widget:', topic.content.widgetConfig);
        break;
    }
    
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getContentIcon = () => {
    switch (topic.content.type) {
      case 'external_link': return <ExternalLink className="h-5 w-5" />;
      case 'video': return <Play className="h-5 w-5" />;
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'text': return <FileText className="h-5 w-5" />;
      case 'interactive_widget': return <Monitor className="h-5 w-5" />;
      default: return <Play className="h-5 w-5" />;
    }
  };

  const getActionText = () => {
    switch (topic.content.type) {
      case 'external_link': return 'Open Link';
      case 'video': return 'Play Video';
      case 'pdf': return 'View PDF';
      case 'text': return 'Read Content';
      case 'interactive_widget': return 'Start Activity';
      default: return 'Start Learning';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getContentIcon()}
            {topic.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Content Display Area */}
          <div className="min-h-[300px] bg-gray-50 rounded-lg p-6">
            {topic.content.type === 'text' && topic.content.textContent ? (
              <div className="prose max-w-none">
                <p>{topic.content.textContent}</p>
              </div>
            ) : topic.content.type === 'video' && topic.content.videoUrl ? (
              <div className="aspect-video">
                <iframe 
                  src={topic.content.videoUrl}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-4 p-4 bg-white rounded-full">
                  {getContentIcon()}
                </div>
                <h3 className="text-lg font-medium mb-2">{topic.name}</h3>
                <p className="text-muted-foreground mb-4">
                  Duration: {topic.duration} • Type: {topic.type}
                </p>
                <Button 
                  onClick={handleContentAction}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {getContentIcon()}
                  {getActionText()}
                </Button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={onComplete} className="gap-2">
              Mark as Complete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
