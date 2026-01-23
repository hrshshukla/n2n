'use client';

import { useState } from 'react';
import { FiDownload, FiKey } from 'react-icons/fi';

interface FileDownloadProps {
  onDownload: (port: number, token?: string) => Promise<void>;
  isDownloading: boolean;
}

export default function FileDownload({ onDownload, isDownloading }: FileDownloadProps) {
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken.trim()) {
      setError('Please enter a valid access PIN');
      return;
    }

    setError('');

    const port = Number(accessToken.split('-')[0]);
    if (isNaN(port)) {
      setError('Invalid PIN format');
      return;
    }

    await onDownload(port, accessToken);
  };

  return (
    <div className="  p-5 bg-white/5 rounded-lg">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-blue-500">Receive a File</h3>
        <p className="text-sm text-white/60">
          Enter the access PIN shared with you to download the file.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* PIN input */}
        <div>
          <label className="text-xs font-medium text-white/50 mb-1 block">
            Access PIN
          </label>
          <div className="flex items-center bg-white/10 rounded-md px-3">
            <FiKey className="text-white/40 mr-2" />
            <input
              type="text"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="e.g. 8080-ABCD"
              className="w-full bg-transparent text-white py-3 outline-none placeholder:text-white/30 font-mono tracking-wide"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={isDownloading}
          className={`w-full flex items-center justify-center py-3 rounded-md font-medium transition-colors
            ${
              isDownloading
                ? 'bg-white/10 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
          {isDownloading ? (
            <span>Downloading...</span>
          ) : (
            <>
              <FiDownload className="mr-2" />
              <span>Download File</span>
            </>
          )}
        </button>
      </form>

      {/* Footer hint */}
      <p className="mt-3 text-xs text-white/40">
        Make sure the sender’s device is online while downloading.
      </p>
    </div>
  );
}
