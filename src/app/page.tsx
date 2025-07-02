'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, Download, Undo2, Settings } from 'lucide-react';
import JSZip from 'jszip';
import { processImage, ProcessingOptions } from '@/utils/imageProcessor';

interface FileItem {
  id: string;
  file: File;
  originalSize: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  processedBlob?: Blob;
  processedSize?: number;
  error?: string;
}

interface ConversionSettings {
  width: number;
  height: number;
  quality: number;
  lossless: boolean;
}

export default function Home() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [settings, setSettings] = useState<ConversionSettings>({
    width: 200,
    height: 200,
    quality: 80,
    lossless: false,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg')
    );
    
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, []);

  const addFiles = useCallback((newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      originalSize: file.size,
      status: 'pending',
    }));
    
    setFiles(prev => [...prev, ...fileItems]);
  }, []);

  const processImages = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    let completed = 0;
    
    const processingOptions: ProcessingOptions = {
      width: settings.width,
      height: settings.height,
      quality: settings.quality,
      lossless: settings.lossless,
    };
    
    for (let i = 0; i < pendingFiles.length; i++) {
      const fileItem = pendingFiles[i];
      
      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'processing' } : f
      ));
      
      try {
        const processedBlob = await processImage(fileItem.file, processingOptions);
        
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'completed',
            processedBlob,
            processedSize: processedBlob.size
          } : f
        ));
        
        completed++;
        setProgress((completed / pendingFiles.length) * 100);
      } catch (error) {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'error',
            error: error instanceof Error ? error.message : 'Processing failed'
          } : f
        ));
        completed++;
        setProgress((completed / pendingFiles.length) * 100);
      }
    }
    
    setIsProcessing(false);
  };

  const downloadZip = async () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.processedBlob);
    
    if (completedFiles.length === 0) return;
    
    const zip = new JSZip();
    
    completedFiles.forEach(fileItem => {
      const originalName = fileItem.file.name.replace(/\.[^/.]+$/, '');
      const fileName = `${originalName}_${settings.width}x${settings.height}.webp`;
      zip.file(fileName, fileItem.processedBlob!);
    });
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-images.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const undoLastBatch = () => {
    setFiles([]);
    setProgress(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const completedCount = files.filter(f => f.status === 'completed').length;
  const hasCompletedFiles = completedCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            JPG → WebP Converter
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Convert and resize JPG images to WebP format locally in your browser
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Settings</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Width (px)</label>
                    <input
                      type="number"
                      min="16"
                      max="4096"
                      value={settings.width}
                      onChange={(e) => setSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Height (px)</label>
                    <input
                      type="number"
                      min="16"
                      max="4096"
                      value={settings.height}
                      onChange={(e) => setSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Quality: {settings.quality}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.quality}
                    onChange={(e) => setSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                    disabled={settings.lossless}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="lossless"
                    checked={settings.lossless}
                    onChange={(e) => setSettings(prev => ({ ...prev, lossless: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="lossless" className="text-sm">Lossless compression</label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg mb-2">Drop JPG files here or click to select</p>
              <p className="text-sm text-gray-500 mb-4">Supports multiple file selection</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,.jpg"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Select Files
              </button>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Processing...</span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* File List */}
            {files.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Files ({files.length})</h3>
                  <div className="flex gap-2">
                    {!isProcessing && files.some(f => f.status === 'pending') && (
                      <button
                        onClick={processImages}
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                      >
                        Convert All
                      </button>
                    )}
                    {hasCompletedFiles && (
                      <button
                        onClick={downloadZip}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download ZIP
                      </button>
                    )}
                    {files.length > 0 && (
                      <button
                        onClick={undoLastBatch}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center gap-2"
                      >
                        <Undo2 className="w-4 h-4" />
                        Undo
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {files.map((fileItem) => (
                    <div key={fileItem.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{fileItem.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileItem.originalSize)}
                          {fileItem.processedSize && (
                            <span> → {formatFileSize(fileItem.processedSize)}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          fileItem.status === 'pending' ? 'bg-gray-200 text-gray-700' :
                          fileItem.status === 'processing' ? 'bg-yellow-200 text-yellow-700' :
                          fileItem.status === 'completed' ? 'bg-green-200 text-green-700' :
                          'bg-red-200 text-red-700'
                        }`}>
                          {fileItem.status === 'pending' ? 'Pending' :
                           fileItem.status === 'processing' ? 'Processing...' :
                           fileItem.status === 'completed' ? 'Done' :
                           'Error'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
