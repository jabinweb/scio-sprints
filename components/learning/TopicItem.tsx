'use client';

import { Play, Clock, CheckCircle, Video, FileText, Headphones, BookOpen, Star, Lock } from 'lucide-react';
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
  userRating?: number;  // Individual user's rating (1-5)
  hasRated?: boolean;   // Whether user has rated this topic
  isDisabled?: boolean; // Whether this topic is locked/disabled
  onClick: (topic: DbTopic) => void;
}

export function TopicItem({ 
  topic, 
  isCompleted, 
  userRating,
  hasRated,
  isDisabled = false,
  onClick 
}: TopicItemProps) {
  const contentType = topic.content?.contentType;
  // Check if topic can be clicked (not disabled)
  const canClick = !isDisabled;

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all group ${
        isDisabled 
          ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' 
          : isCompleted 
            ? 'border-green-200 bg-green-50 hover:bg-green-100 cursor-pointer' 
            : 'border-blue-200 bg-blue-50 hover:border-blue-300 hover:shadow-md hover:bg-blue-100 cursor-pointer'
      }`}
      onClick={() => canClick && onClick(topic)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${
            isDisabled 
              ? 'bg-gray-200' 
              : isCompleted 
                ? 'bg-green-200' 
                : 'bg-blue-200 group-hover:bg-blue-300'
          }`}>
            {isDisabled ? <Lock className="h-4 w-4 text-gray-500" /> : getTopicIcon(contentType)}
          </div>
          <div className={`font-medium text-xs ${isDisabled ? 'text-gray-500' : 'text-gray-700'}`}>
            {topic.name}
          </div>
        </div>
        {isDisabled ? (
          <Lock className="h-5 w-5 text-gray-400" />
        ) : isCompleted ? (
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
        <div className="flex items-center gap-2">
          {/* Individual User's Difficulty Rating Display */}
          {hasRated && userRating && (
            <div 
              className="flex items-center gap-1 text-xs"
              title={`Your difficulty rating: ${userRating}/5 stars`}
            >
              <Star className={`h-3 w-3 ${
                userRating >= 4 ? 'text-red-500 fill-red-500' :
                userRating >= 3 ? 'text-yellow-500 fill-yellow-500' :
                'text-green-500 fill-green-500'
              }`} />
              <span className={`font-medium ${
                userRating >= 4 ? 'text-red-600' :
                userRating >= 3 ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {userRating >= 4 ? 'Hard' :
                 userRating >= 3 ? 'Medium' :
                 'Easy'}
              </span>
            </div>
          )}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
            isDisabled 
              ? 'bg-gray-100 cursor-not-allowed' 
              : 'bg-blue-100 group-hover:bg-blue-200'
          }`}>
            {isDisabled ? (
              <Lock className="h-4 w-4 text-gray-500" />
            ) : (
              <Play className="h-4 w-4 text-blue-600 fill-blue-600" />
            )}
            <span className={`text-xs font-medium ${
              isDisabled ? 'text-gray-500' : 'text-blue-700'
            }`}>
              {isDisabled ? 'Locked' : 'Play'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}