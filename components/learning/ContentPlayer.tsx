'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Play, FileText, Monitor } from 'lucide-react';
import { type DbTopic } from '@/hooks/useClassData';


interface ContentPlayerProps {
  topic: DbTopic | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onNext?: () => void;
  isCompleted?: boolean;
  canProceedToNext?: boolean;
}

export function ContentPlayer({ topic, isOpen, onClose, onComplete, onNext, isCompleted = false, canProceedToNext = true }: ContentPlayerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Reset completion state when topic changes or dialog opens
  useEffect(() => {
    if (topic) {
      setHasCompleted(isCompleted);
    }
  }, [topic, isCompleted]);

  if (!topic) return null;

  const handleComplete = () => {
    setHasCompleted(true);
    onComplete();
  };

  const handleContentAction = () => {
    setIsLoading(true);
    
    switch (topic.content.contentType?.toLowerCase()) {
      case 'external_link':
        if (topic.content.url) {
          window.open(topic.content.url, '_blank');
        }
        break;
      case 'video':
        // For video content, we'll embed it in the player instead of opening in new tab
        console.log('Video will be embedded in player');
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
      case 'iframe':
        // Iframe content is displayed inline
        console.log('Iframe content displayed inline');
        break;
      default:
        console.warn('Unknown content type:', topic.content.contentType);
        break;
    }
    
    setTimeout(() => setIsLoading(false), 1000);
  };

  const getContentIcon = () => {
    const contentType = topic.content.contentType?.toLowerCase();
    switch (contentType) {
      case 'external_link': return <ExternalLink className="h-5 w-5" />;
      case 'video': return <Play className="h-5 w-5" />;
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'text': return <FileText className="h-5 w-5" />;
      case 'interactive_widget': return <Monitor className="h-5 w-5" />;
      case 'iframe': return <Monitor className="h-5 w-5" />;
      default: return <Play className="h-5 w-5" />;
    }
  };

  const getActionText = () => {
    const contentType = topic.content.contentType?.toLowerCase();
    switch (contentType) {
      case 'external_link': return 'Open Link';
      case 'video': return 'Play Video';
      case 'pdf': return 'View PDF';
      case 'text': return 'Read Content';
      case 'interactive_widget': return 'Start Activity';
      case 'iframe': return 'Start Activity';
      default: return 'Start Learning';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-none max-h-none w-screen h-screen p-0 flex flex-col bg-gray-900 text-white border-gray-800 [&>button]:hidden">
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">{topic.name}</DialogTitle>
        
        {/* Minimal header with only essential controls */}
        <div className="flex-shrink-0 px-4 py-2 border-b border-gray-800 bg-gray-900 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-white text-sm">
            {getContentIcon()}
            <span className="truncate">{topic.name}</span>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              onClick={handleComplete} 
              size="sm" 
              disabled={hasCompleted || isCompleted}
              className={`gap-1 text-white text-xs px-3 py-1 ${
                hasCompleted || isCompleted 
                  ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {hasCompleted || isCompleted ? 'Completed' : 'Complete'}
            </Button>
            {onNext && (
              <Button 
                onClick={onNext} 
                size="sm" 
                disabled={!canProceedToNext || (!hasCompleted && !isCompleted)}
                className={`gap-1 text-white text-xs px-3 py-1 ${
                  !canProceedToNext || (!hasCompleted && !isCompleted)
                    ? 'bg-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
                title={!canProceedToNext || (!hasCompleted && !isCompleted) ? 'Complete current topic to proceed' : 'Go to next topic'}
              >
                Next Topic
              </Button>
            )}
            <Button variant="outline" onClick={onClose} size="sm" className="border-gray-700 bg-gray-800 text-gray-200 hover:bg-gray-700 hover:text-white text-xs px-3 py-1">
              Close
            </Button>
          </div>
        </div>
        
        <div className="flex-1 min-h-0">
          {/* Content Display Area - Maximum space */}
          <div className="h-full bg-gray-900 overflow-hidden flex items-center justify-center">
            {topic.content.contentType?.toLowerCase() === 'text' && topic.content.textContent ? (
              <div className="prose prose-invert max-w-4xl h-full overflow-auto p-4">
                <p className="text-gray-200">{topic.content.textContent}</p>
              </div>
            ) : topic.content.contentType?.toLowerCase() === 'video' && topic.content.videoUrl ? (
              <div className="w-full h-full max-w-full bg-black overflow-hidden flex items-center justify-center">
                {/* Handle different video URL formats */}
                {topic.content.videoUrl.includes('youtube.com') || topic.content.videoUrl.includes('youtu.be') ? (
                  <iframe 
                    src={topic.content.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={topic.name}
                  />
                ) : topic.content.videoUrl.includes('vimeo.com') ? (
                  <iframe 
                    src={topic.content.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={topic.name}
                  />
                ) : (
                  <video 
                    controls
                    className="w-full h-full object-contain"
                    title={topic.name}
                  >
                    <source src={topic.content.videoUrl} type="video/mp4" />
                    <source src={topic.content.videoUrl} type="video/webm" />
                    <source src={topic.content.videoUrl} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            ) : topic.content.contentType?.toLowerCase() === 'pdf' && topic.content.pdfUrl ? (
              <div className="w-full h-full bg-white overflow-hidden">
                <iframe 
                  src={topic.content.pdfUrl}
                  className="w-full h-full"
                  title="PDF Viewer"
                />
              </div>
            ) : topic.content.contentType?.toLowerCase() === 'interactive_widget' ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="mb-4 p-4 bg-gray-800 rounded-full">
                  <Monitor className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-white">Interactive Widget</h3>
                <p className="text-gray-400 mb-4">
                  This content will load an interactive learning experience.
                </p>
                {topic.content.widgetConfig && (
                  <pre className="text-xs bg-gray-800 text-green-400 p-2 rounded max-w-md overflow-auto">
                    {JSON.stringify(topic.content.widgetConfig, null, 2)}
                  </pre>
                )}
              </div>
            ) : topic.content.contentType?.toLowerCase() === 'iframe' && topic.content.textContent ? (
              <div className="w-full h-full bg-gray-900 overflow-hidden flex items-center justify-center">
                <div 
                  dangerouslySetInnerHTML={{ __html: topic.content.textContent }}
                  className="flex items-center justify-center"
                  style={{ width: '90%', height: '90%' }}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="mb-4 p-4 bg-gray-800 rounded-full">
                  {getContentIcon()}
                </div>
                <h3 className="text-lg font-medium mb-2 text-white">{topic.name}</h3>
                <p className="text-gray-400 mb-4">
                  Duration: {topic.duration} • Type: {topic.content.contentType || 'content'}
                </p>
                <Button 
                  onClick={handleContentAction}
                  disabled={isLoading}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {getContentIcon()}
                  {getActionText()}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
