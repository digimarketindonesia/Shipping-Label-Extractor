
import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { ResultsTable } from './components/ResultsTable';
import { Spinner } from './components/Spinner';
import { extractDataFromImages } from './services/geminiService';
import type { LabelData } from './types';

function App() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<LabelData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setExtractedData([]);
    setError(null);
  };

  const handleExtractData = useCallback(async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one image file.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedData([]);

    try {
      const data = await extractDataFromImages(selectedFiles);
      setExtractedData(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedFiles]);

  const clearSelection = () => {
    setSelectedFiles([]);
    setExtractedData([]);
    setError(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
            Shipping Label Extractor
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Instantly convert shipping labels into an Excel-ready format with AI.
          </p>
        </header>

        <main className="bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-200">
          <section>
            <h2 className="text-xl font-bold text-gray-700 mb-4">1. Upload Your Labels</h2>
            <FileUpload onFilesSelected={handleFilesSelected} isLoading={isLoading} />
          </section>

          {selectedFiles.length > 0 && (
            <section className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700">Selected Files:</h3>
              <ul className="mt-2 list-disc list-inside text-gray-600 space-y-1">
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-4">
                 <button
                    onClick={handleExtractData}
                    disabled={isLoading}
                    className="px-6 py-3 font-semibold text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                  >
                    {isLoading ? 'Processing...' : `Extract Data from ${selectedFiles.length} File(s)`}
                  </button>
                  <button
                    onClick={clearSelection}
                    disabled={isLoading}
                    className="px-6 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-200"
                  >
                    Clear Selection
                  </button>
              </div>
            </section>
          )}

          {error && (
            <div className="mt-6 p-4 text-red-800 bg-red-100 border border-red-300 rounded-lg" role="alert">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          <div className="mt-8">
            {isLoading && <Spinner />}
            <ResultsTable data={extractedData} />
          </div>
        </main>
        
        <footer className="text-center mt-8 text-gray-500 text-sm">
          <p>Powered by Gemini API</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
