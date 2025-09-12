'use client';

import { Play, Clock, CheckCircle, Video, FileText, Headphones, BookOpen } from 'lucide-react';
import { type DbTopic } from '@/hooks/useClassData';

const getTopicIcon = (contentType: string | undefined) => {
  switch (contentType) {
    case 'VIDEO': return <Video className="h-4 w-4" />;
    case 'EXTERNAL_LINK': return <Play className="h-4 w-4" />;
    case 'PDF': return <FileText className="h-4 w-4" />;
    case 'TEXT': return <FileText className="h-4 w-4" />;
    case 'INTRACTIVE_WIGET': return <Play className="h-4 w-4" />;
    case 'AUDIO': return <Headphones className="h-4 w-4" />;
    default: return <BookOpen className="h-4 w-4" />;
  }
};

interface TopicItemProps {
  topic: DbTopic;
  isCompleted: boolean;
  hasAccess: boolean;
  isEnabled?: boolean;
  onClick: (topic: DbTopic) => void;
}

export function TopicItem({ topic, isCompleted, hasAccess, isEnabled = true, onClick }: TopicItemProps) {
  const contentType = topic.content?.contentType;
  const canClick = hasAccess && isEnabled;

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all group ${
        !hasAccess 
          ? 'border-red-200 bg-red-50 opacity-60 cursor-not-allowed'
          : !isEnabled
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
          : isCompleted 
          ? 'border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md cursor-pointer'
      }`}
      onClick={() => canClick && onClick(topic)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-green-200' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
            {getTopicIcon(contentType)}
          </div>
          <div className="font-medium text-xs text-gray-700">
            {topic.name}
          </div>
        </div>
        {isCompleted ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
        )}
      </div>
      
      <h4 className="font-medium text-sm mb-2 line-clamp-2 text-muted-foreground">
        {topic.description || 'No description available'}
      </h4>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{topic.duration}</span>
        </div>
        <Play className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
      </div>
    </div>
  );
}