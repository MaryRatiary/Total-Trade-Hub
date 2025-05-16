import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from "react-icons/fa";
import { useMediaQuery } from 'react-responsive';
import { API_BASE_URL } from '../services/config';
import './SearchBar.css';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
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
    <div className={`search-container ${isExpanded ? 'expanded' : ''}`} ref={searchRef}>
      {isMobile && !isExpanded ? (
        <FaSearch className="search-icon-mobile" onClick={handleSearchIconClick} />
      ) : (
        <div className="search-input-wrapper">
          <div className="search-icon-wrapper">
            <FaSearch className="search-icon" />
          </div>
          <input
            type="text"
            placeholder="Rechercher des contenus, publications, personnes..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
          />
          {isMobile && (
            <FaTimes className="close-icon" onClick={handleCloseSearch} />
          )}
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            </div>
          )}
        </div>
      )}

      {showResults && results.length > 0 && (
        <div className="results-container">
          {results.map((result, index) => (
            <div
              key={index}
              className="result-item"
              onClick={() => handleResultClick(result)}
            >
              {result.type === 'user' ? (
                <>
                  <img
                    src={result.profilePicture || '/default-avatar.png'}
                    alt={result.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-white">{result.name}</p>
                    <p className="text-sm text-gray-400">{result.email}</p>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={result.image || '/placeholder.jpg'}
                    alt={result.title}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div>
                    <p className="font-medium text-white">{result.title}</p>
                    <p className="text-sm text-gray-400">{result.price}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
