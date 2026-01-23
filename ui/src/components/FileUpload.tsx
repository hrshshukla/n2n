'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
}

export default function FileUpload({ onFileUpload, isUploading }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);
  
  const { getRootProps, getInputProps } = useDropzone({ 
    onDrop,
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false),
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        w-full h-full p-8 border-2 bg-gray-500/5 flex items-center justify-center border-dashed rounded-lg text-center cursor-pointer transition-all
        ${dragActive 
          ? 'border-blue-500 bg-blue-50/5' 
          : 'border-gray-300 hover:border-blue-400 hover:bg-white/5'
        }
        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="p-3 rounded-full">
          <FiUpload className={`w-6 h-6 text-blue-400`} />
        </div>
        <p className={` text-lg font-medium text-gray-400`}>Drag & drop a file here, or click to select</p>
        <p className="text-sm text-gray-500">
          Share any file with your peers securely
        </p>
      </div>
    </div>
  );
}
