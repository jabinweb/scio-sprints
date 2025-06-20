'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';

interface SubjectFormData {
  id?: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  orderIndex: number;
  classId: number;
}

interface SubjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubjectFormData) => Promise<void>;
  initialData?: SubjectFormData;
  mode: 'create' | 'edit';
  classId: number;
}

const colorOptions = [
  { value: 'from-blue-400 to-blue-600', label: 'Blue', color: 'bg-blue-500' },
  { value: 'from-green-400 to-green-600', label: 'Green', color: 'bg-green-500' },
  { value: 'from-purple-400 to-purple-600', label: 'Purple', color: 'bg-purple-500' },
  { value: 'from-orange-400 to-orange-600', label: 'Orange', color: 'bg-orange-500' },
  { value: 'from-red-400 to-red-600', label: 'Red', color: 'bg-red-500' },
  { value: 'from-yellow-400 to-yellow-600', label: 'Yellow', color: 'bg-yellow-500' },
];

export function SubjectForm({ isOpen, onClose, onSubmit, initialData, mode, classId }: SubjectFormProps) {
  const [formData, setFormData] = useState<SubjectFormData>(
    initialData || { 
      name: '', 
      icon: '📚', 
      color: 'from-blue-400 to-blue-600', 
      isLocked: false, 
      orderIndex: 0,
      classId 
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof SubjectFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Subject' : 'Edit Subject'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Mathematics"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="icon">Icon (Emoji)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) => handleChange('icon', e.target.value)}
                placeholder="📚"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="color">Color Theme</Label>
              <Select 
                value={formData.color} 
                onValueChange={(value) => handleChange('color', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${option.color}`} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            
            <div className="flex items-center justify-between">
              <Label htmlFor="isLocked">Locked</Label>
              <Switch
                id="isLocked"
                checked={formData.isLocked}
                onCheckedChange={(checked) => handleChange('isLocked', checked)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <LoadingSpinner className="mr-2" />}
              {mode === 'create' ? 'Create Subject' : 'Update Subject'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
