import { useState, useCallback, useMemo } from 'react';
import { Bookmark } from '../types';

const BOOKMARKS_KEY = 'behold-bookmarks';

export const useBookmarks = (): [
  Bookmark[],
  (bookmark: Bookmark) => void,
  (bookmark: Bookmark) => void,
  (bookmark: Pick<Bookmark, 'book' | 'chapter' | 'verse'>) => boolean
] => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const item = window.localStorage.getItem(BOOKMARKS_KEY);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading bookmarks from localStorage', error);
      return [];
    }
  });

  const saveBookmarks = (newBookmarks: Bookmark[]) => {
    try {
      setBookmarks(newBookmarks);
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('Error writing bookmarks to localStorage', error);
    }
  };

  const isBookmarked = useCallback((bookmarkToCheck: Pick<Bookmark, 'book' | 'chapter' | 'verse'>): boolean => {
      return bookmarks.some(
        b => b.book === bookmarkToCheck.book &&
             b.chapter === bookmarkToCheck.chapter &&
             b.verse === bookmarkToCheck.verse
      );
  }, [bookmarks]);

  const addBookmark = useCallback((newBookmark: Bookmark) => {
    setBookmarks(prev => {
      if (isBookmarked(newBookmark)) {
        return prev;
      }
      const newBookmarks = [...prev, newBookmark].sort((a,b) => {
        if (a.book !== b.book) return a.book.localeCompare(b.book);
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        return a.verse - b.verse;
      });
      saveBookmarks(newBookmarks);
      return newBookmarks;
    });
  }, [isBookmarked]);

  const removeBookmark = useCallback((bookmarkToRemove: Pick<Bookmark, 'book' | 'chapter' | 'verse'>) => {
    const newBookmarks = bookmarks.filter(
      b => !(b.book === bookmarkToRemove.book &&
             b.chapter === bookmarkToRemove.chapter &&
             b.verse === bookmarkToRemove.verse)
    );
    saveBookmarks(newBookmarks);
  }, [bookmarks]);

  return [bookmarks, addBookmark, removeBookmark, isBookmarked];
};
