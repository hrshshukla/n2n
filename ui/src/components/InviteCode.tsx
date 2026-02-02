"use client";

import { FileIcon, ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { FiCopy, FiCheck, FiX } from "react-icons/fi";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

interface InviteCodeProps {
  port: number | null;
  token: string | null;
  filename?: string | null;
  filesize?: number | null;
  isUploading?: boolean;
  onCancel?: () => void;
  expiryTimestamp?: number | null; // ms since epoch
}

export default function InviteCode({
  port,
  token,
  filename,
  filesize,
  isUploading,
  onCancel,
  expiryTimestamp = null,
}: InviteCodeProps) {
  const [copiedToken, setCopiedToken] = useState(false);
  const kbSize = filesize ? Math.round(filesize / 1024) : null;

  const TOTAL_DURATION = 120; // seconds

  // compute remaining seconds from expiryTimestamp (so remounts don't reset)
  const calcRemaining = () =>
    expiryTimestamp ? Math.max(0, Math.ceil((expiryTimestamp - Date.now()) / 1000)) : TOTAL_DURATION;

  const [remaining, setRemaining] = useState<number>(calcRemaining());

  useEffect(() => {
    // whenever expiryTimestamp changes, recalc immediately
    setRemaining(calcRemaining());

    // update every second
    const id = setInterval(() => {
      setRemaining(calcRemaining());
    }, 1000);

    return () => clearInterval(id);
  }, [expiryTimestamp]);

  // optional: when timer hits 0, notify parent (parent already clears UI via timeout, but this is safe)
  useEffect(() => {
    if (remaining <= 0) {
      // small delay so parent can handle cleanup first
      // we don't forcibly call onCancel here to avoid double-calls, but you can if you want:
      // onCancel && onCancel();
    }
  }, [remaining, onCancel]);

  const copyTokenToClipboard = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="h-full p-4 bg-white/5 rounded-lg backdrop-blur-3xl">
      {/* Top: filename + size + cancel */}
      <div className="mb-3 flex items-center h-[20%] border-white gap-2 bg-white/3 rounded-md relative">
        {isUploading ? (
          <div className="flex items-center gap-3 text-white/70 ">
            <div className="animate-spin rounded-full h-4 w-4 border-blue-400 border-t-transparent"></div>
            <span className="text-sm">Uploading file...</span>
          </div>
        ) : (
          <div className="text-sm text-white/80 bg-gray-400/5 cursor-pointer h-full border-white w-[28%] rounded-sm flex items-center justify-around ">
            <FileIcon className="fill-white/20 stroke-none size-8 w-1/4" />
            <div className="fileName w-3/4">
              <div
                className="font-medium truncate cursor-pointer"
                title={filename ?? ""}
              >
                {filename}
              </div>
              <div className="text-xs text-white/50">
                {kbSize !== null ? `${kbSize} KB` : ""}
              </div>
            </div>
          </div>
        )}

        <div className="timer ml-3">
          <CountdownCircleTimer
            isPlaying={remaining > 0}
            trailColor="#141415"
            duration={TOTAL_DURATION}
            initialRemainingTime={remaining} // <-- important: start from remaining seconds
            colors="#1e3761"
            strokeWidth={3}
            size={40}
            key={expiryTimestamp ?? "no-expiry"} // force re-init only when expiryTimestamp changes
          >
            {() => (
              <span className="text-white/40 fig-medium">
                {remaining}
              </span>
            )}
          </CountdownCircleTimer>
        </div>

        {!isUploading && (
          <button
            aria-label="Cancel share"
            onClick={() => onCancel && onCancel()}
            className="ml-4 p-2 rounded-md hover:bg-white/5 absolute top-1 right-1  transition-colors"
          >
            <FiX className="w-5 h-5 text-white/60" />
          </button>
        )}
      </div>

      <h3 className="text-lg font-bold text-green-500">File Ready to Share!</h3>
      <p className="text-sm font-medium text-green-500/80 mb-3">
        Share this access PIN with anyone you want to share the file with:
      </p>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-white/50 mb-1 block">
            Access PIN
          </label>
          <div className="flex items-center">
            <div
              className={`flex-1 bg-white/20 text-white p-3 h-12 rounded-l-md font-mono text-lg tracking-wider flex items-center ${
                token ? "" : "opacity-70"
              }`}
            >
              {token ? token : "Generating PIN..."}
            </div>
            <button
              onClick={copyTokenToClipboard}
              className={`p-3 h-12 rounded-r-md transition-colors ${token ? "bg-green-500 hover:bg-green-600" : "bg-white/10 cursor-not-allowed"}`}
              aria-label="Copy access PIN"
              disabled={!token}
            >
              {copiedToken ? (
                <FiCheck className="w-5 h-5" />
              ) : (
                <FiCopy className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        The access PIN is required to download the file. This adds extra
        security to your file sharing.
      </p>
    </div>
  );
}
