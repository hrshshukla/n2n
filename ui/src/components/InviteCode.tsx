// Replace your existing InviteCode.tsx with this
'use client';

import { useState } from 'react';
import { FiCopy, FiCheck, FiX } from 'react-icons/fi';

interface InviteCodeProps {
  port: number | null;
  token: string | null;
  filename?: string | null;
  filesize?: number | null; // in bytes
  onCancel?: () => void;
}

export default function InviteCode({ port, token, filename, filesize, onCancel }: InviteCodeProps) {
  const [copiedToken, setCopiedToken] = useState(false);
  const kbSize = filesize ? Math.round(filesize / 1024) : null;

  const copyTokenToClipboard = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="h-full p-4 bg-white/5 rounded-lg backdrop-blur-3xl">
      {/* Top: filename + size + cancel */}
      {filename && (
        <div className="mb-3 flex items-center justify-between bg-white/3 p-2 rounded-md">
          <div className="text-sm text-white/80">
            <div className="font-medium truncate" title={filename}>{filename}</div>
            <div className="text-xs text-white/50">{kbSize !== null ? `${kbSize} KB` : ''}</div>
          </div>

          <button
            aria-label="Cancel share"
            onClick={() => onCancel && onCancel()}
            className="ml-4 p-2 rounded-md hover:bg-white/5 transition-colors"
            title="Cancel and choose another file"
          >
            <FiX className="w-5 h-5 text-white/60" />
          </button>
        </div>
      )}

      <h3 className="text-lg font-bold text-green-500">File Ready to Share!</h3>
      <p className="text-sm font-medium text-green-500/80 mb-3">
        Share this access PIN with anyone you want to share the file with:
      </p>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-white/50 mb-1 block">Access PIN</label>
          <div className="flex items-center">
            <div
              className={`flex-1 bg-white/20 text-white p-3 h-12 rounded-l-md font-mono text-lg tracking-wider flex items-center ${
                token ? '' : 'opacity-70'
              }`}
            >
              {token ? token : 'Generating PIN...'}
            </div>
            <button
              onClick={copyTokenToClipboard}
              className={`p-3 h-12 rounded-r-md transition-colors ${token ? 'bg-green-500 hover:bg-green-600' : 'bg-white/10 cursor-not-allowed'}`}
              aria-label="Copy access PIN"
              disabled={!token}
            >
              {copiedToken ? <FiCheck className="w-5 h-5" /> : <FiCopy className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        The access PIN is required to download the file. This adds extra security to your file sharing.
      </p>
    </div>
  );
}
