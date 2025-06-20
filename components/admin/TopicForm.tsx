'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';

interface TopicFormData {
  id?: string;
  name: string;
  type: string;
  duration: string;
  orderIndex: number;
  chapterId: string;
  content?: {
    contentType: string;
    url?: string;
    videoUrl?: string;
    pdfUrl?: string;
    textContent?: string;
    widgetConfig?: Record<string, unknown>;
  };
}

interface TopicFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TopicFormData) => Promise<void>;
  initialData?: TopicFormData;
  mode: 'create' | 'edit';
  chapterId: string;
}

const topicTypes = [
  { value: 'VIDEO', label: 'Video' },
  { value: 'INTERACTIVE', label: 'Interactive' },
  { value: 'EXERCISE', label: 'Exercise' },
  { value: 'AUDIO', label: 'Audio' },
];

const contentTypes = [
  { value: 'EXTERNAL_LINK', label: 'External Link' },
  { value: 'VIDEO', label: 'Video' },
  { value: 'PDF', label: 'PDF' },
  { value: 'TEXT', label: 'Text' },
  { value: 'INTERACTIVE_WIDGET', label: 'Interactive Widget' },
];

export function TopicForm({ isOpen, onClose, onSubmit, initialData, mode, chapterId }: TopicFormProps) {
  const [formData, setFormData] = useState<TopicFormData>(
    initialData || { 
      name: '', 
      type: 'VIDEO', 
      duration: '', 
      orderIndex: 0, 
      chapterId,
      content: { contentType: 'EXTERNAL_LINK' }
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit({ ...formData, chapterId });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof TopicFormData, value: string | number | object) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContentChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: { 
        contentType: 'EXTERNAL_LINK',
        ...prev.content, 
        [field]: value 
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Topic' : 'Edit Topic'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Topic Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Introduction to Variables"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Topic Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {topicTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleChange('duration', e.target.value)}
                placeholder="e.g., 15 min"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="orderIndex">Order Index</Label>
            <Input
              id="orderIndex"
              type="number"
              value={formData.orderIndex}
              onChange={(e) => handleChange('orderIndex', parseInt(e.target.value))}
              min="0"
              required
            />
          </div>

          {/* Content Section */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-medium">Content Details</h4>
            
            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select 
                value={formData.content?.contentType || 'EXTERNAL_LINK'} 
                onValueChange={(value) => handleContentChange('contentType', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(formData.content?.contentType === 'EXTERNAL_LINK' || formData.content?.contentType === 'PDF') && (
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.content?.url || ''}
                  onChange={(e) => handleContentChange('url', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {formData.content?.contentType === 'VIDEO' && (
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.content?.videoUrl || ''}
                  onChange={(e) => handleContentChange('videoUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}

            {formData.content?.contentType === 'TEXT' && (
              <div>
                <Label htmlFor="textContent">Text Content</Label>
                <Textarea
                  id="textContent"
                  value={formData.content?.textContent || ''}
                  onChange={(e) => handleContentChange('textContent', e.target.value)}
                  placeholder="Enter the text content..."
                  rows={4}
                />
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner className="mr-2" />}
              {mode === 'create' ? 'Create Topic' : 'Update Topic'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
