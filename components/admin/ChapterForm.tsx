'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading';

interface ChapterFormData {
  id?: string;
  name: string;
  orderIndex: number;
  subjectId: string;
}

interface ChapterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ChapterFormData) => Promise<void>;
  initialData?: ChapterFormData;
  mode: 'create' | 'edit';
  subjectId: string;
}

export function ChapterForm({ isOpen, onClose, onSubmit, initialData, mode, subjectId }: ChapterFormProps) {
  const [formData, setFormData] = useState<ChapterFormData>(
    initialData || { name: '', orderIndex: 0, subjectId }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit({ ...formData, subjectId });
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ChapterFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Chapter' : 'Edit Chapter'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Chapter Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Introduction to Algebra"
              required
            />
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
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner className="mr-2" />}
              {mode === 'create' ? 'Create Chapter' : 'Update Chapter'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
