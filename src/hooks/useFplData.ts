import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFPLStore } from '../stores/fplStore';

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY_PREFIX = '@sanfpl:cache:';

export const useFplData = (endpoint: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async (force = false) => {
    const cacheKey = `${CACHE_KEY_PREFIX}${endpoint}`;
    
    try {
      // Check cache first
      if (!force) {
        const cached = await AsyncStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          
          if (age < CACHE_EXPIRY) {
            setLastUpdated(new Date(timestamp));
            return data;
          }
        }
      }

      setIsLoading(true);
      setError(null);

      // Fetch fresh data
      const response = await fetch(`https://fantasy.premierleague.com/api${endpoint}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await response.json();
      
      // Update cache
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
      setLastUpdated(new Date());
      return data;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    const cacheKey = `${CACHE_KEY_PREFIX}${endpoint}`;
    await AsyncStorage.removeItem(cacheKey);
  };

  return {
    fetchData,
    clearCache,
    isLoading,
    error,
    lastUpdated,
  };
};