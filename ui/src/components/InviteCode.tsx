"use client";

import { FileIcon } from "lucide-react";
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
  expiryTimestamp?: number | null; // ms since epoch (from parent)
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

  // calc remaining from expiryTimestamp; if expiryTimestamp absent, return TOTAL_DURATION
  const calcRemaining = () =>
    expiryTimestamp ? Math.max(0, Math.ceil((expiryTimestamp - Date.now()) / 1000)) : TOTAL_DURATION;

  const [remaining, setRemaining] = useState<number>(calcRemaining());

  useEffect(() => {
    // whenever expiryTimestamp changes, recalc immediately
    setRemaining(calcRemaining());

    // if no expiryTimestamp, we don't need to tick; but keep updating so UI shows correct remaining as soon as expiryTimestamp appears
    const id = setInterval(() => {
      setRemaining(calcRemaining());
    }, 1000);

    return () => clearInterval(id);
  }, [expiryTimestamp]);

  // copy token
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
          {/* ONLY render & start the countdown when token AND expiryTimestamp are available.
              If not available yet, show a neutral placeholder (or nothing). */}
          {token && expiryTimestamp ? (
            <CountdownCircleTimer
              isPlaying={remaining > 0}
              trailColor="#141415"
              duration={TOTAL_DURATION}
              initialRemainingTime={remaining}
              colors="#1e3761"
              strokeWidth={3}
              size={40}
              key={expiryTimestamp ?? "no-expiry"}
            >
              {() => (
                <span className="text-white/40 fig-medium">
                  {remaining}
                </span>
              )}
            </CountdownCircleTimer>
          ) : (
            // placeholder while generating token / uploading
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/3">
              <span className="text-white/30 text-sm">--</span>
            </div>
          )}
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
