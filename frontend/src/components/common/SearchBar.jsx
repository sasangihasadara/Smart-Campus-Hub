import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const SearchBar = () => {
  const [input, setInput] = useState('');

  const onSearchHandler = (e) => {
    e.preventDefault();
    if (input) {
      console.log("Searching for:", input);
    }
  };

  return (
    <form 
      onSubmit={onSearchHandler} 
      className="flex items-center w-full max-w-[700px] h-14 md:h-16 bg-white border border-gray-200/60 rounded-xl md:rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-2 md:px-4"
    >
      <div className="flex items-center flex-1 px-2">
        <Search className="w-5 h-5 text-gray-400 mr-4" />
        <input 
          onChange={(e) => setInput(e.target.value)} 
          value={input} 
          type="text" 
          className="w-full h-full outline-none text-gray-700 text-sm md:text-base font-medium placeholder:text-gray-400 font-sans" 
          placeholder="Search for lecture halls, equipment, or labs..."  
        />
      </div>
      <button 
        type="submit" 
        className="bg-blue-600 rounded-lg md:rounded-xl text-white font-bold px-6 md:px-12 h-10 md:h-12 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar
