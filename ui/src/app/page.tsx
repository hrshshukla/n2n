// Replace your existing page.tsx (Home) with this (only small changes from original)
"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import FileDownload from "@/components/FileDownload";
import InviteCode from "@/components/InviteCode";
import axios from "axios";
import Lightning from "@/components/Lightning";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [port, setPort] = useState<number | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "download">("upload");

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Increase timeout for large files (5 minutes)
      const response = await axios.post("/api/upload", formData, {
        timeout: 300000, // 5 minutes in milliseconds
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
      setToken(response.data.token); // Store the access token
    } catch (error: any) {
      console.error("Error uploading file:", error);

      // Show the actual error message from the server
      let errorMessage = "Failed to upload file. Please try again.";
      if (error.response?.data) {
        // If the server sent a text error message
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
      // If upload failed, clear selected file so user can try again
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (port: number, downloadToken?: string) => {
    setIsDownloading(true);

    try {
      // Request download from Java backend with token
      const response = await axios.get(
        `/api/download/${port}?token=${downloadToken || ""}`,
        {
          responseType: "blob",
        },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Try to get filename from response headers
      const headers = response.headers;
      let contentDisposition = "";

      // Look for content-disposition header regardless of case
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
      alert(
        "Failed to download file. Please check the invite code and try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelInviteUI = () => {
    // clear local UI state only (so user can upload again)
    setUploadedFile(null);
    setToken(null);
    setPort(null);
  };

  return (
    <div className="container h-screen w-screen relative">
      <Navbar />
      <Lightning hue={228} xOffset={-1} speed={0.5} intensity={1} size={1} />

      <div className="container border-white backdrop-blur-lg bg-black/20 flex items-center rounded-lg justify-center w-1/2 h-[53%]  absolute transform translate-x-1/2 translate-y-1/2">
        <div className=" rounded-lg  border-white shadow-lg w-full h-full bg-gray-400/5 px-6 py-4 ">
          <div className="flex mb-4">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "upload"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("upload")}
            >
              Share a File
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "download"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("download")}
            >
              Receive a File
            </button>
          </div>

          {activeTab === "upload" ? (
            <div className=" border-white h-[80%]">
              {/* Show upload box only when no file selected */}
              {!uploadedFile ? (
                <FileUpload
                  onFileUpload={handleFileUpload}
                  isUploading={isUploading}
                />
              ) : (
                // Show InviteCode when a file has been selected/uploaded.
                <InviteCode
                  port={port}
                  token={token}
                  filename={uploadedFile.name}
                  filesize={uploadedFile.size}
                  onCancel={handleCancelInviteUI}
                />
              )}

              {/* keep the uploading spinner as before */}
              {isUploading && (
                <div className="mt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Uploading file...</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <FileDownload
                onDownload={handleDownload}
                isDownloading={isDownloading}
              />

              {isDownloading && (
                <div className="mt-6 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Downloading file...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="w-full py-4 text-center text-sm text-white/50 absolute bottom-0">
        Made with ❤️ by{" "}
        <span className="font-medium text-white/70">Harsh Shukla</span>
      </footer>
    </div>
  );
}
