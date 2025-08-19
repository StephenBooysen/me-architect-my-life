import { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../contexts/UnifiedDatabaseContext';

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const db = useDatabase();

  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = [];
      const searchTerm = query.toLowerCase().trim();

      // Search Goals
      const goals = await db.getGoals();
      if (goals) {
        goals.forEach(goal => {
          if (
            goal.title?.toLowerCase().includes(searchTerm) ||
            goal.description?.toLowerCase().includes(searchTerm) ||
            goal.success_criteria?.toLowerCase().includes(searchTerm)
          ) {
            results.push({
              id: goal.id,
              type: 'goal',
              title: goal.title,
              description: goal.description,
              content: goal.description || goal.success_criteria,
              subtype: goal.type, // annual, monthly, weekly
              matchField: getMatchField(goal, searchTerm)
            });
          }
        });
      }

      // Search Wisdom
      const wisdom = await db.getWisdom();
      if (wisdom) {
        wisdom.forEach(item => {
          if (
            item.content?.toLowerCase().includes(searchTerm) ||
            item.author?.toLowerCase().includes(searchTerm) ||
            item.source?.toLowerCase().includes(searchTerm) ||
            item.personal_notes?.toLowerCase().includes(searchTerm) ||
            item.tags?.toLowerCase().includes(searchTerm)
          ) {
            results.push({
              id: item.id,
              type: 'wisdom',
              title: item.author ? `${item.author}: ${item.content.substring(0, 50)}...` : item.content.substring(0, 50) + '...',
              description: item.content,
              content: item.content,
              author: item.author,
              source: item.source,
              matchField: getMatchField(item, searchTerm)
            });
          }
        });
      }

      // Search Morning Notes
      const morningNotes = await db.getAllMorningNotes?.() || [];
      morningNotes.forEach(note => {
        if (
          note.priorities?.toLowerCase().includes(searchTerm) ||
          note.gratitude?.toLowerCase().includes(searchTerm) ||
          note.challenges?.toLowerCase().includes(searchTerm) ||
          note.intention?.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            id: note.id,
            type: 'reflection',
            subtype: 'morning',
            title: `Morning Notes - ${note.date}`,
            description: note.priorities || note.intention,
            content: note.priorities || note.gratitude || note.challenges || note.intention,
            date: note.date,
            matchField: getMatchField(note, searchTerm)
          });
        }
      });

      // Search Evening Reflections
      const eveningReflections = await db.getAllEveningReflections?.() || [];
      eveningReflections.forEach(reflection => {
        if (
          reflection.what_went_well?.toLowerCase().includes(searchTerm) ||
          reflection.what_could_improve?.toLowerCase().includes(searchTerm) ||
          reflection.lessons_learned?.toLowerCase().includes(searchTerm) ||
          reflection.tomorrow_priority?.toLowerCase().includes(searchTerm) ||
          reflection.gratitude?.toLowerCase().includes(searchTerm) ||
          reflection.accomplishments?.toLowerCase().includes(searchTerm)
        ) {
          results.push({
            id: reflection.id,
            type: 'reflection',
            subtype: 'evening',
            title: `Evening Reflection - ${reflection.date}`,
            description: reflection.what_went_well || reflection.accomplishments,
            content: reflection.what_went_well || reflection.lessons_learned || reflection.accomplishments,
            date: reflection.date,
            matchField: getMatchField(reflection, searchTerm)
          });
        }
      });

      // Sort results by relevance (exact matches first, then partial matches)
      results.sort((a, b) => {
        const aExact = a.title.toLowerCase().includes(searchTerm) ? 1 : 0;
        const bExact = b.title.toLowerCase().includes(searchTerm) ? 1 : 0;
        return bExact - aExact;
      });

      setSearchResults(results.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [db]);

  // Helper function to determine which field matched
  function getMatchField(item, searchTerm) {
    if (item.title?.toLowerCase().includes(searchTerm)) return 'title';
    if (item.content?.toLowerCase().includes(searchTerm)) return 'content';
    if (item.description?.toLowerCase().includes(searchTerm)) return 'description';
    if (item.author?.toLowerCase().includes(searchTerm)) return 'author';
    if (item.priorities?.toLowerCase().includes(searchTerm)) return 'priorities';
    if (item.gratitude?.toLowerCase().includes(searchTerm)) return 'gratitude';
    if (item.what_went_well?.toLowerCase().includes(searchTerm)) return 'reflection';
    return 'content';
  }

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    performSearch
  };
}