/** NAVBAR + SEARCH RESPONSIVE FIXED **/

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from "react-icons/fa";
import { useMediaQuery } from 'react-responsive';
import { API_BASE_URL } from '../services/config';
import Spinner from './Spinner';

const SearchBar = ({ isMobile, expanded, onCollapse }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const isMobileView = useMediaQuery({ maxWidth: 768 });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': 'Basic ' + btoa('root:example')
        }
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result) => {
    if (result.type === 'user') {
      navigate(`/profile/${result.id}`);
    } else if (result.type === 'article') {
      navigate(`/article/${result.id}`);
    }
    setShowResults(false);
  };

  const handleSearchIconClick = () => {
    setIsExpanded(true);
  };

  const handleCloseSearch = () => {
    setIsExpanded(false);
    setSearchTerm('');
    setShowResults(false);
    onCollapse?.();
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={searchRef}
      className={`relative transition-all duration-300 ease-out flex-1 max-w-[400px] mx-4 z-[100]
        ${expanded ? 'fixed top-[70px] left-0 right-0 w-full bg-[#141428] px-4 pb-2 pt-2 rounded-b-2xl shadow-2xl z-[2000]' : ''}`}
    >
      {isMobileView && !expanded ? (
        <button
          onClick={handleSearchIconClick}
          className="bg-white/10 border border-white/10 rounded-full w-10 h-10 flex items-center justify-center text-white hover:bg-violet-400/20 hover:text-violet-400 hover:scale-110 transition"
        >
          <FaSearch />
        </button>
      ) : (
        <div className="relative flex items-center w-full">
          <FaSearch className="absolute left-4 text-white/70 text-sm" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            className="w-full h-10 pl-10 pr-10 rounded-full bg-white/5 border border-white/10 text-white text-sm backdrop-blur-sm shadow focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          {isMobileView && (
            <button
              onClick={handleCloseSearch}
              className="absolute right-3 text-white/60 hover:text-pink-400 hover:scale-110 transition"
            >
              <FaTimes />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="small" />
            </div>
          )}
        </div>
      )}

      {showResults && results.length > 0 && (
        <div
          className={`absolute ${isMobileView ? 'fixed top-[120px] left-0 right-0 w-full' : 'top-full left-0 right-0'} bg-[#1e1e3c] rounded-xl border border-violet-500/20 shadow-xl z-[2100] max-h-[50vh] overflow-y-auto p-2 space-y-2 animate-fadeIn`}
        >
          {results.map((result, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-3 cursor-pointer hover:bg-violet-500/10 border-b border-white/5"
              onClick={() => handleResultClick(result)}
            >
              <img
                src={result.type === 'user' ? (result.profilePicture || '/default-avatar.png') : (result.image || '/placeholder.jpg')}
                alt={result.type === 'user' ? result.name : result.title}
                className="w-10 h-10 rounded-full object-cover border-2 border-violet-500/30"
              />
              <div>
                <p className="text-white font-medium text-sm">
                  {result.type === 'user' ? result.name : result.title}
                </p>
                <p className="text-xs text-white/60">
                  {result.type === 'user' ? result.email : result.price}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
