'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Save, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

interface NameplateSectionProps {
  productId: string;
  onTextChange: (text: string) => void;
}

export default function NameplateSection({ productId, onTextChange }: NameplateSectionProps) {
  const [nameplateText, setNameplateText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load nameplate text from localStorage on component mount
  useEffect(() => {
    const storageKey = `nameplate_text_${productId}`;
    const savedText = localStorage.getItem(storageKey);
    if (savedText) {
      setNameplateText(savedText);
      onTextChange(savedText);
    }
  }, [productId, onTextChange]);

  // Save nameplate text to localStorage whenever it changes
  useEffect(() => {
    const storageKey = `nameplate_text_${productId}`;
    if (nameplateText.trim()) {
      localStorage.setItem(storageKey, nameplateText);
      onTextChange(nameplateText);
    } else {
      localStorage.removeItem(storageKey);
      onTextChange('');
    }
  }, [nameplateText, productId, onTextChange]);

  const handleSave = () => {
    if (nameplateText.trim()) {
      setIsEditing(false);
      toast.success('Nameplate text saved!', {
        duration: 2000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
    } else {
      toast.error('Please enter some text for the nameplate', {
        duration: 3000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="nameplate-text" className="text-sm font-medium text-gray-900">
          Nameplate Text
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          Enter the text you want to appear on your nameplate
        </p>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            id="nameplate-text"
            placeholder="Enter your name or custom text..."
            value={nameplateText}
            onChange={(e) => setNameplateText(e.target.value)}
            className="min-h-[100px] resize-none"
            maxLength={50}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {nameplateText.length}/50 characters
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={!nameplateText.trim()}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {nameplateText ? (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-gray-900 font-medium">{nameplateText}</p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-dashed">
              <p className="text-gray-500 text-center">No text entered yet</p>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="w-full"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            {nameplateText ? 'Edit Text' : 'Add Text'}
          </Button>
        </div>
      )}
    </div>
  );
}
