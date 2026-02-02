"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import FileDownload from "@/components/FileDownload";
import InviteCode from "@/components/InviteCode";
import axios from "axios";
import Lightning from "@/components/Lightning";
import Navbar from "@/components/Navbar";
import GradientText from "@/components/GradientText";
import DecryptedText from "@/components/DecryptedText";
import { DownloadCloud, Upload, UploadCloud } from "lucide-react";

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
    <div className="container h-screen w-screen relative bg-black pt-5 md:pt-0">
      <Navbar />

      {/* Mobile */}
      <div className="block md:hidden">
        <Lightning hue={228} xOffset={1} speed={0.5} intensity={1} size={6} />
      </div>

      <div className="hidden md:block">
        <Lightning hue={228} xOffset={-1} speed={0.5} intensity={1} size={1} />
      </div>

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
              {/* slider */}
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
                    isUploading={isUploading}
                    onCancel={handleCancelInviteUI}
                  />
                )}
              </div>
            ) : (
              <div className="border-white h-[80%] flex items-center justify-center">
                {!isDownloading ? (
                  <FileDownload
                    onDownload={handleDownload}
                    isDownloading={isDownloading}
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
