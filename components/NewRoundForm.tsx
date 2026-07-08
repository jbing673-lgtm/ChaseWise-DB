'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import type { OpponentResponse } from '@/lib/types';

interface NewRoundFormProps {
  caseId: string;
  nextRoundNumber: number;
  onRoundCreated: () => void;
}

const RESPONSE_OPTIONS: { value: OpponentResponse; label: string }[] = [
  { value: 'positive', label: 'Positive — they agreed to pay' },
  { value: 'neutral', label: 'Neutral — they acknowledged but no commitment' },
  { value: 'negative', label: 'Negative — they refused or disputed' },
  { value: 'no_response', label: 'No Response — they ignored the message' },
];

type Step = 'select' | 'generating' | 'preview' | 'sending' | 'success';

export function NewRoundForm({ caseId, nextRoundNumber, onRoundCreated }: NewRoundFormProps) {
  const supabase = useMemo(() => createBrowserClient(), []);
  const [opponentResponse, setOpponentResponse] = useState<OpponentResponse>('no_response');
  const [step, setStep] = useState<Step>('select');
  const [emailContent, setEmailContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Step 1: Generate preview (preview=true, API returns email without saving)
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setStep('generating');
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mountedRef.current) return;
      const res = await fetch(`/api/cases/${caseId}/rounds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({ opponent_response: opponentResponse, preview: true }),
        signal: controller.signal,
      });
      if (!mountedRef.current) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to generate email');
      if (!mountedRef.current) return;
      setEmailContent(data?.email ?? '');
      setStep('preview');
    } catch (err: unknown) {
      if (err instanceof DOMException && (err as DOMException).name === 'AbortError') return;
      if (mountedRef.current) {
        setError((err as Error)?.message ?? 'Unknown error');
        setStep('select');
      }
    }
  }

  // Step 2: Confirm & save (send edited content to API)
  async function handleConfirm() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setStep('sending');
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mountedRef.current) return;
      const res = await fetch(`/api/cases/${caseId}/rounds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token ?? ''}`,
        },
        body: JSON.stringify({
          opponent_response: opponentResponse,
          email_content: emailContent,
        }),
        signal: controller.signal,
      });
      if (!mountedRef.current) return;
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? 'Failed to save round');
      if (!mountedRef.current) return;
      setStep('success');
    } catch (err: unknown) {
      if (err instanceof DOMException && (err as DOMException).name === 'AbortError') return;
      if (mountedRef.current) {
        setError((err as Error)?.message ?? 'Unknown error');
        setStep('preview');
      }
    }
  }

  function handleContinue() {
    setStep('select');
    setEmailContent('');
    setError(null);
    onRoundCreated();
  }

  function handleCancel() {
    setStep('select');
    setEmailContent('');
    setError(null);
  }

  // Step: generating
  if (step === 'generating') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="animate-spin h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full" />
          <span className="text-gray-600">AI is generating Round {nextRoundNumber} email...</span>
        </div>
      </div>
    );
  }

  // Step: sending
  if (step === 'sending') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-3 py-6">
          <div className="animate-spin h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full" />
          <span className="text-gray-600">Saving email...</span>
        </div>
      </div>
    );
  }

  // Step: success
  if (step === 'success') {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 010 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-800">Round {nextRoundNumber} email saved successfully!</span>
          </div>
          <p className="text-sm text-green-700">The email is now ready. You can copy it from the timeline above and send it to your customer.</p>
        </div>
        <button type="button" onClick={handleContinue} className="btn-primary w-full">
          Continue
        </button>
      </div>
    );
  }

  // Step: preview (editable textarea)
  if (step === 'preview') {
    return (
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
        )}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Review & Edit Email (Round {nextRoundNumber})</label>
            <span className="text-xs text-gray-400">You can edit the content before sending</span>
          </div>
          <textarea
            className="input-field min-h-[200px] font-mono text-sm"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={handleCancel} className="btn-secondary flex-1">Cancel</button>
          <button type="button" onClick={handleConfirm} className="btn-primary flex-1">
            Confirm & Save
          </button>
        </div>
      </div>
    );
  }

  // Step: select (default)
  return (
    <form onSubmit={handleGenerate} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">How did they respond?</label>
        <select
          className="input-field"
          value={opponentResponse}
          onChange={(e) => setOpponentResponse(e.target.value as OpponentResponse)}
        >
          {RESPONSE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn-primary w-full">
        Generate Round {nextRoundNumber} Email
      </button>
    </form>
  );
}