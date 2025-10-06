
import React from 'react';

export const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-primary-500 border-t-transparent"></div>
      <p className="text-gray-600 font-medium">Extracting data, please wait...</p>
    </div>
  );
};
