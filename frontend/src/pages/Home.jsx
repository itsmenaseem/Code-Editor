import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const languages = [
  { name: 'C++', value: 'cpp', color: 'bg-blue-600' },
  { name: 'Java', value: 'java', color: 'bg-yellow-600' },
  { name: 'Python', value: 'python', color: 'bg-green-600' },
];

export default function Home() {
  const [selected, setSelected] = useState('cpp');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    const id = uuidv4();
    navigate(`/editor?lang=${selected}&roomId=${id}`);
  };

  const handleJoinRoom = () => {
    if (roomId.trim()) {
      navigate(`/editor?lang=${selected}&roomId=${roomId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white text-center mb-6">🔥 Start Coding Together</h1>

        <div className="mb-6">
          <h2 className="text-white text-lg font-medium mb-2">Choose a language:</h2>
          <div className="grid grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.value}
                onClick={() => setSelected(lang.value)}
                className={`py-2 rounded-lg text-white font-semibold transition transform hover:scale-105 focus:outline-none ${
                  selected === lang.value ? `${lang.color} shadow-lg` : 'bg-gray-700'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <button
            onClick={handleCreateRoom}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition"
          >
            🚀 Create Room
          </button>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleJoinRoom}
              className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg text-white font-semibold transition"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
