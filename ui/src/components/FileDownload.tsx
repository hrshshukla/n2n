'use client';

import { useEffect, useState } from 'react';
import { FiDownload, FiKey } from 'react-icons/fi';

interface FileDownloadProps {
  onDownload: (port: number, token?: string) => Promise<void>;
  isDownloading: boolean;
  // NEW props
  downloadError?: string;
  clearDownloadError?: () => void;
}

export default function FileDownload({
  onDownload,
  isDownloading,
  downloadError,
  clearDownloadError,
}: FileDownloadProps) {
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState('');

  // If parent passes downloadError, show it in local error state
  useEffect(() => {
    if (downloadError) {
      setError(downloadError);
    }
  }, [downloadError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // keep only digits and limit to 6
    const raw = e.target.value.replace(/\D/g, '').slice(0, 6);
    setAccessToken(raw);

    // clear errors when user edits
    if (error) setError('');
    if (clearDownloadError) clearDownloadError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validation: 4-6 digits
    if (accessToken.length < 4 || accessToken.length > 6) {
      setError('Enter 4–6 digits');
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
    <div className="p-5 bg-white/5 rounded-lg w-full">
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
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={accessToken}
              onChange={handleChange}
              placeholder="0000"
              className="w-full bg-transparent text-white py-3 px-2 outline-none placeholder:text-white/30 font-mono tracking-wide"
            />
          </div>
          {/* Hint or error: show error in red if present, otherwise small hint */}
          {error ? (
            <p className="mt-1 text-sm text-red-400">{error}</p>
          ) : (
            <p className="mt-1 text-xs text-white/40">Enter 4–6 digits</p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isDownloading || accessToken.length < 4 || accessToken.length > 6}
          className={`w-full flex items-center justify-center py-3 rounded-md font-medium transition-colors
            ${
              isDownloading || accessToken.length < 4 || accessToken.length > 6
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
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
