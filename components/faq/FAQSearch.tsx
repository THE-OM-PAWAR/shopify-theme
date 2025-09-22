'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FAQSearchProps {
  onSearch: (query: string) => void;
  searchQuery: string;
  onClear: () => void;
}

export default function FAQSearch({ onSearch, searchQuery, onClear }: FAQSearchProps) {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localQuery);
  };

  const handleClear = () => {
    setLocalQuery('');
    onClear();
  };

  return (
    <div className="mb-8">
      <form onSubmit={handleSubmit} className="relative flex flex-row items-center max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search FAQ questions..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            className="pl-10 pr-20 py-3 text-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
          />
          {localQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button
          type="submit"
          className="ml-2 w-min sm:w-min"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
