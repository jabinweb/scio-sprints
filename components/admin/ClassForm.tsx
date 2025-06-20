'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LoadingSpinner } from '@/components/ui/loading';

interface ClassFormData {
  id?: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface ClassFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClassFormData) => Promise<void>;
  initialData?: ClassFormData;
  mode: 'create' | 'edit';
}

export function ClassForm({ isOpen, onClose, onSubmit, initialData, mode }: ClassFormProps) {
  const [formData, setFormData] = useState<ClassFormData>(
    initialData || { name: '', description: '', isActive: true }
  );
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', description: '', isActive: true });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Ensure id is included for edit mode
      const submitData = mode === 'edit' && initialData?.id 
        ? { ...formData, id: initialData.id }
        : formData;
      
      await onSubmit(submitData);
      onClose();
      
      // Reset form after successful submission
      if (mode === 'create') {
        setFormData({ name: '', description: '', isActive: true });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof ClassFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Class' : 'Edit Class'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Class Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Class 5"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief description of the class"
                rows={3}
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleChange('isActive', checked)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner className="mr-2" />}
              {mode === 'create' ? 'Create Class' : 'Update Class'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
