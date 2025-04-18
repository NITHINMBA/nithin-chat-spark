
import React from 'react';
import Chat from '../components/Chat';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#202123] flex flex-col items-center px-4 pt-12 pb-6">
      {/* User uploaded photo */}
      <img
        src="/lovable-uploads/2c504600-4018-48a0-bc87-b43a4aa7acd8.png"
        alt="User uploaded"
        className="w-28 h-28 rounded-full shadow-lg object-cover mb-4"
        draggable={false}
      />

      {/* Headline */}
      <h1 className="mb-8 text-center font-semibold text-2xl md:text-3xl max-w-lg text-gray-900 dark:text-gray-50 font-serif select-none drop-shadow-sm">
        Let's try the test version of ChatGPT from Nithin
      </h1>

      {/* Chat component */}
      <div className="flex-1 w-full max-w-4xl">
        <Chat />
      </div>
    </div>
  );
};

export default Index;

