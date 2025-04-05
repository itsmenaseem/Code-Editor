import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const languages = [
  { name: 'C++', value: 'cpp', color: 'bg-blue-500' },
  { name: 'Java', value: 'java', color: 'bg-yellow-600' },
  { name: 'Python', value: 'python', color: 'bg-green-500' },
];

export default function Home() {
  const [selected, setSelected] = useState('cpp');
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/editor?lang=${selected}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-6">Select a Language</h1>
      <div className="flex gap-6 mb-8">
        {languages.map((lang) => (
          <button
            key={lang.value}
            onClick={() => setSelected(lang.value)}
            className={`px-6 py-3 rounded-xl text-black text-lg font-semibold   shadow-md cursor-pointer ${
              selected === lang.value
                ? `${lang.color} scale-105`
                : 'bg-gray-700 hover:scale-105'
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
      <button
        onClick={handleStart}
        className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-300 cursor-pointer"
      >
        Start Coding
      </button>
    </div>
  );
}
