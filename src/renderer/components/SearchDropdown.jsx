import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Goal, BookOpen, FileText, Clock, User, Tag } from 'lucide-react';

function SearchDropdown({ results, isSearching, onSelect, searchQuery }) {
  const navigate = useNavigate();

  const handleSelect = (result) => {
    onSelect();
    
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

  const getIcon = (type, subtype) => {
    switch (type) {
      case 'goal':
        return <Goal className="w-4 h-4 text-primary" />;
      case 'wisdom':
        return <BookOpen className="w-4 h-4 text-amber-600" />;
      case 'reflection':
        return subtype === 'morning' ? 
          <Clock className="w-4 h-4 text-blue-600" /> : 
          <FileText className="w-4 h-4 text-purple-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
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
        <mark key={index} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--text-primary)', padding: '0 2px' }}>{part}</mark>
      ) : (
        part
      )
    );
  };

  if (!results.length && !isSearching) {
    return null;
  }

  return (
    <div className="card" style={{ 
      position: 'absolute', 
      top: '100%', 
      left: 0, 
      right: 0, 
      marginTop: '4px',
      zIndex: 50,
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      {isSearching && (
        <div className="card-body text-center">
          <p className="text-text-secondary">Searching...</p>
        </div>
      )}
      
      {!isSearching && results.length === 0 && searchQuery && (
        <div className="card-body text-center">
          <p className="text-text-secondary">No results found for "{searchQuery}"</p>
        </div>
      )}
      
      {!isSearching && results.map((result, index) => (
        <div key={`${result.type}-${result.id}`}>
          <div
            onClick={() => handleSelect(result)}
            className="card-body hover:bg-gray-50 cursor-pointer"
            style={{ 
              borderBottom: index < results.length - 1 ? '1px solid var(--border)' : 'none',
              padding: '12px 16px'
            }}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0" style={{ marginTop: '2px' }}>
                {getIcon(result.type, result.subtype)}
              </div>
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div className="flex items-center space-x-2" style={{ marginBottom: '4px' }}>
                  <span className="badge">
                    {getTypeLabel(result.type, result.subtype)}
                  </span>
                  {result.date && (
                    <span className="text-text-tertiary" style={{ fontSize: '12px' }}>
                      {result.date}
                    </span>
                  )}
                </div>
                <h4 className="text-text-primary" style={{ 
                  fontSize: '14px', 
                  fontWeight: '500',
                  marginBottom: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {highlightMatch(result.title, searchQuery)}
                </h4>
                {result.description && (
                  <p className="text-text-secondary" style={{ 
                    fontSize: '12px',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {highlightMatch(result.description.substring(0, 100), searchQuery)}
                    {result.description.length > 100 && '...'}
                  </p>
                )}
                {result.author && (
                  <div className="flex items-center space-x-1" style={{ marginTop: '4px' }}>
                    <User style={{ width: '12px', height: '12px' }} className="text-text-tertiary" />
                    <span className="text-text-secondary" style={{ fontSize: '12px' }}>
                      {highlightMatch(result.author, searchQuery)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {!isSearching && results.length > 0 && (
        <div className="card-body" style={{ 
          borderTop: '1px solid var(--border)',
          backgroundColor: 'var(--gray-50)',
          padding: '8px 16px'
        }}>
          <button
            onClick={() => {
              navigate('/search', { state: { query: searchQuery, results } });
              onSelect();
            }}
            className="btn btn-link w-full text-center"
            style={{ fontSize: '14px', fontWeight: '500' }}
          >
            View all {results.length} results
          </button>
        </div>
      )}
    </div>
  );
}

export default SearchDropdown;