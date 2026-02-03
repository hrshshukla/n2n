"use client";

import { useState, useEffect, useRef } from "react";
import FileUpload from "@/components/FileUpload";
import FileDownload from "@/components/FileDownload";
import InviteCode from "@/components/InviteCode";
import axios from "axios";
import Lightning from "@/components/Lightning";
import Navbar from "@/components/Navbar";
import GradientText from "@/components/GradientText";
import DecryptedText from "@/components/DecryptedText";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { DownloadCloud, UploadCloud } from "lucide-react";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [port, setPort] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "download">("upload");

  const [downloadError, setDownloadError] = useState<string>("");

  const [inviteExpiresAt, setInviteExpiresAt] = useState<number | null>(null);
  const inviteTimerRef = useRef<number | null>(null);
  const INVITE_TIMEOUT_MS = 120000; // 2 minutes

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/upload", formData, {
        timeout: 300000,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });

      setPort(response.data.port);
      setToken(response.data.token);

      // NEW: set expiry timestamp and start/replace the timeout
      const expiry = Date.now() + INVITE_TIMEOUT_MS;
      setInviteExpiresAt(expiry);

      // clear any existing timer
      if (inviteTimerRef.current) {
        clearTimeout(inviteTimerRef.current);
        inviteTimerRef.current = null;
      }
      inviteTimerRef.current = window.setTimeout(() => {
        // when timer ends, hide invite UI and show upload box
        handleCancelInviteUI();
      }, INVITE_TIMEOUT_MS);
    } catch (error: any) {
      console.error("Error uploading file:", error);
      let errorMessage = "Failed to upload file. Please try again.";
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      alert(errorMessage);
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (port: number, downloadToken?: string) => {
    setIsDownloading(true);
    setDownloadError("");

    try {
      const response = await axios.get(
        `/api/download/${port}?token=${downloadToken || ""}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const headers = response.headers;
      let contentDisposition = "";

      for (const key in headers) {
        if (key.toLowerCase() === "content-disposition") {
          contentDisposition = headers[key];
          break;
        }
      }

      let filename = "downloaded-file";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
      setDownloadError(
        "Failed to download file. Please check the invite code and try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  // Cancel invite UI and clear state; also clear any running invite timer
  const handleCancelInviteUI = () => {
    if (inviteTimerRef.current) {
      clearTimeout(inviteTimerRef.current);
      inviteTimerRef.current = null;
    }
    setUploadedFile(null);
    setToken(null);
    setPort(null);
    setInviteExpiresAt(null); // NEW: clear expiry
    setDownloadError("");
  };

  // cleanup on unmount
  useEffect(() => {
    return () => {
      if (inviteTimerRef.current) {
        clearTimeout(inviteTimerRef.current);
        inviteTimerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="container h-screen w-screen relative bg-black pt-5 md:pt-0">
      <Navbar />

      <div className="container mx-auto flex rounded-lg justify-center w-full h-full md:pt-10 md:border-white md:items-center md:w-1/2">
        <div className="wrapper h-[75%] w-full border-white flex-col md:mt-5">
          <div className="Heading h-1/4 backdrop-blur-0 text-2xl md:text-5xl flex justify-center items-center text-white fig-extralight border-white">
            <span className="text-white/80">When</span>

            <GradientText
              colors={["#017AFF", "#FEFEFF", "#0AFF"]}
              animationSpeed={0.4}
              showBorder={false}
              yoyo={false}
              direction="horizontal"
              className="!mx-[1px] p-2 fig-medium md:!mx-[6px]"
            >
              Speed
            </GradientText>
            <span className="mr-2 md:mr-3 text-white/80">meets</span>
            <DecryptedText
              text="Security"
              animateOn="view"
              className="fig-medium transition-all"
              revealDirection="start"
              sequential
              speed={200}
              useOriginalCharsOnly={false}
            />
          </div>

          <div className="text-sm md:text-base rounded-lg backdrop-blur-lg bg-black/30 border-white shadow-lg w-full h-3/4 px-6 py-4 ">
            <div className="relative flex mb-4 items-center justify-between bg-white/5 rounded-full p-1">
              <div
                className={`absolute top-1 left-1 h-[calc(100%-0.5rem)] w-1/2 rounded-full 
bg-blue-500/15 border border-blue-500/40 transition-transform duration-300 ease-in-out
${activeTab === "download" ? "translate-x-full" : "translate-x-0"}`}
              />

              <button
                className={`relative z-10 px-4 py-2 font-medium rounded-full flex items-center justify-center gap-4 w-1/2 transition-colors ${
                  activeTab === "upload"
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("upload")}
              >
                <UploadCloud />
                <span>Share File</span>
              </button>

              <button
                className={`relative z-10 px-4 py-2 font-medium rounded-full flex items-center justify-center gap-4 w-1/2 transition-colors ${
                  activeTab === "download"
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setActiveTab("download")}
              >
                <DownloadCloud />
                <span>Receive File</span>
              </button>
            </div>

            {activeTab === "upload" ? (
              <div className=" h-[80%] ">
                {!uploadedFile ? (
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    isUploading={isUploading}
                  />
                ) : (
                  <InviteCode
                    port={port}
                    token={token}
                    filename={uploadedFile.name}
                    filesize={uploadedFile.size}
                    isUploading={isUploading}
                    onCancel={handleCancelInviteUI}
                    expiryTimestamp={inviteExpiresAt} // NEW prop
                  />
                )}
              </div>
            ) : (
              <div className="border-white h-[80%] flex items-center justify-center">
                {!isDownloading ? (
                  <FileDownload
                    onDownload={handleDownload}
                    isDownloading={isDownloading}
                    downloadError={downloadError}
                    clearDownloadError={() => setDownloadError("")}
                  />
                ) : (
                  <div className=" text-center  ">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-2 text-gray-600">Downloading file...</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <footer className="w-full border-white py-4 mb-10 flex items-center justify-center text-center text-sm text-white/50 absolute bottom-2 md:mb-0 md:bottom-0 md:border-0">
        Made with{" "}
        <GradientText
          colors={["#d9262f", "#7c0315"]}
          animationSpeed={0.4}
          showBorder={false}
          yoyo={false}
          direction="horizontal"
          className="!mx-[5px] fig-medium"
        >
          ❤️
        </GradientText>
        by <span className="font-medium ml-1 text-white/70">Harsh Shukla</span>
      </footer>
    </div>
  );
}
