import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Goal, BookOpen, FileText, Clock, User, Search as SearchIcon, Filter } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';

function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, searchResults, isSearching, performSearch } = useSearch();
  const [selectedType, setSelectedType] = useState('all');
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    // Initialize search from navigation state
    if (location.state?.query) {
      setSearchQuery(location.state.query);
    }
    if (location.state?.results) {
      setFilteredResults(location.state.results);
    }
  }, [location.state, setSearchQuery]);

  useEffect(() => {
    // Filter results based on selected type
    if (selectedType === 'all') {
      setFilteredResults(searchResults);
    } else {
      setFilteredResults(searchResults.filter(result => result.type === selectedType));
    }
  }, [searchResults, selectedType]);

  const handleResultClick = (result) => {
    // Navigate to the appropriate page based on result type
    switch (result.type) {
      case 'goal':
        navigate('/goals', { state: { highlightGoal: result.id } });
        break;
      case 'wisdom':
        navigate('/wisdom', { state: { highlightWisdom: result.id } });
        break;
      case 'reflection':
        navigate('/reflection', { state: { selectedDate: result.date, type: result.subtype } });
        break;
      default:
        break;
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const getIcon = (type, subtype) => {
    switch (type) {
      case 'goal':
        return <Goal className="w-5 h-5 text-primary" />;
      case 'wisdom':
        return <BookOpen className="w-5 h-5 text-amber-600" />;
      case 'reflection':
        return subtype === 'morning' ? 
          <Clock className="w-5 h-5 text-blue-600" /> : 
          <FileText className="w-5 h-5 text-purple-600" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = (type, subtype) => {
    switch (type) {
      case 'goal':
        return `${subtype?.charAt(0).toUpperCase() + subtype?.slice(1)} Goal`;
      case 'wisdom':
        return 'Wisdom';
      case 'reflection':
        return subtype === 'morning' ? 'Morning Notes' : 'Evening Reflection';
      default:
        return type;
    }
  };

  const highlightMatch = (text, query) => {
    if (!text || !query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900">{part}</mark>
      ) : (
        part
      )
    );
  };

  const getTypeCounts = () => {
    const counts = searchResults.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {});
    return counts;
  };

  const typeCounts = getTypeCounts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
        <p className="text-gray-600">Find content across your goals, reflections, and wisdom</p>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across goals, reflections, and wisdom..."
                className="form-input pl-10"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {/* Filters */}
      {searchResults.length > 0 && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by type:</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`btn btn-sm ${selectedType === 'all' ? 'btn-primary' : ''}`}
            >
              All ({searchResults.length})
            </button>
            {Object.entries(typeCounts).map(([type, count]) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`btn btn-sm ${selectedType === type ? 'btn-primary' : ''}`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}s ({count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {isSearching && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Searching...</p>
          </div>
        )}

        {!isSearching && filteredResults.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-500">
              No results found for "{searchQuery}". Try different keywords or check your spelling.
            </p>
          </div>
        )}

        {!isSearching && !searchQuery && (
          <div className="text-center py-8">
            <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-500">
              Enter a search term to find content across your goals, reflections, and wisdom.
            </p>
          </div>
        )}

        {filteredResults.map((result) => (
          <div
            key={`${result.type}-${result.id}`}
            onClick={() => handleResultClick(result)}
            className="card hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="card-body">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(result.type, result.subtype)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 font-medium">
                      {getTypeLabel(result.type, result.subtype)}
                    </span>
                    {result.date && (
                      <span className="text-sm text-gray-400">
                        {result.date}
                      </span>
                    )}
                    {result.matchField && (
                      <span className="text-xs text-primary bg-primary-light px-2 py-0.5">
                        Found in {result.matchField}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {highlightMatch(result.title, searchQuery)}
                  </h3>
                  {result.description && (
                    <p className="text-gray-600 mb-2 line-clamp-3">
                      {highlightMatch(result.description, searchQuery)}
                    </p>
                  )}
                  {result.author && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {highlightMatch(result.author, searchQuery)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Search;