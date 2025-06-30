import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus } from 'lucide-react';

interface Props {
  onNext: () => void;
  onBack: () => void;
  setData?: (data: any) => void;
}

export default function AddHostingStep({ onNext, onBack, setData }: Props) {
  const [domains, setDomains] = useState<string[]>([]);
  const [input, setInput] = useState('');

  function handleAddDomain() {
    const domain = input.trim();
    if (domain && !domains.includes(domain)) {
      setDomains([...domains, domain]);
      setInput('');
    }
  }

  function handleRemoveDomain(domain: string) {
    setDomains(domains => domains.filter(d => d !== domain));
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleAddDomain();
    }
  }

  function handleContinue() {
    setData?.(domains)
    onNext()
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">Hosting</h2>
      <div className="mb-8 text-gray-400">Specify the domain(s) where your app should be hosted.</div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter domain (e.g. example.com)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
          className="flex-1"
        />
        <Button onClick={handleAddDomain} disabled={!input.trim()} size="sm" variant="outline">
          <Plus className="h-4 w-4 mr-1" /> Add
        </Button>
      </div>
      {domains.length > 0 && (
        <ul className="mb-6 space-y-2">
          {domains.map(domain => (
            <li key={domain} className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full text-sm">
              <span className="flex-1 truncate">{domain}</span>
              <Button size="icon" variant="ghost" onClick={() => handleRemoveDomain(domain)} title="Remove domain">
                <Trash2 className="h-4 w-4 text-red-400" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-between mt-8">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </div>
  );
} 