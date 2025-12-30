import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage Keys
const STORAGE_KEYS = {
  MOVIES: '@movie_tracker_movies',
  USER_PREFERENCES: '@movie_tracker_preferences',
  APP_SETTINGS: '@movie_tracker_settings',
  BACKUP: '@movie_tracker_backup',
};

// 錯誤類型
class StorageError extends Error {
  constructor(message, operation, data = null) {
    super(message);
    this.name = 'StorageError';
    this.operation = operation;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

// 資料驗證
const validateMovieData = (movieData) => {
  if (!movieData || typeof movieData !== 'object') {
    throw new StorageError('Invalid movie data: must be an object', 'validation');
  }
  
  if (!movieData.id) {
    throw new StorageError('Invalid movie data: missing id', 'validation');
  }
  
  if (!movieData.title && !movieData.name) {
    throw new StorageError('Invalid movie data: missing title or name', 'validation');
  }
  
  return true;
};

// 資料清理和格式化
const sanitizeMovieData = (movieData) => {
  const sanitized = {
    id: movieData.id.toString(),
    title: movieData.title || movieData.name || '',
    originalTitle: movieData.originalTitle || movieData.original_title || '',
    overview: movieData.overview || '',
    releaseDate: movieData.releaseDate || movieData.release_date || movieData.firstAirDate || movieData.first_air_date || null,
    posterPath: movieData.posterPath || movieData.poster_path || null,
    backdropPath: movieData.backdropPath || movieData.backdrop_path || null,
    voteAverage: movieData.voteAverage || movieData.vote_average || 0,
    voteCount: movieData.voteCount || movieData.vote_count || 0,
    popularity: movieData.popularity || 0,
    genreIds: movieData.genreIds || movieData.genre_ids || [],
    adult: movieData.adult || false,
    originalLanguage: movieData.originalLanguage || movieData.original_language || 'en',
    type: movieData.type || 'movie',
    
    // 用戶資料
    dateAdded: movieData.dateAdded || new Date().toISOString(),
    isWatched: movieData.isWatched || false,
    userRating: movieData.userRating || null,
    userReview: movieData.userReview || '',
    watchedDate: movieData.watchedDate || null,
    
    // 額外屬性
    tags: movieData.tags || [],
    notes: movieData.notes || '',
    isFavorite: movieData.isFavorite || false,
  };
  
  return sanitized;
};

// =========================
// 基礎 Storage 操作
// =========================

// 獲取資料
export const getStorageData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error reading storage data for key ${key}:`, error);
    throw new StorageError(`Failed to read data`, 'read', { key });
  }
};

// 保存資料
export const saveStorageData = async (key, data) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error saving storage data for key ${key}:`, error);
    throw new StorageError(`Failed to save data`, 'save', { key, dataSize: jsonValue?.length });
  }
};

// 刪除資料
export const removeStorageData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing storage data for key ${key}:`, error);
    throw new StorageError(`Failed to remove data`, 'remove', { key });
  }
};

// 清空所有資料
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all storage data:', error);
    throw new StorageError('Failed to clear all data', 'clear');
  }
};

// 獲取 Storage 使用狀況
export const getStorageInfo = async () => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const appKeys = allKeys.filter(key => key.startsWith('@movie_tracker_'));
    
    const info = {
      totalKeys: allKeys.length,
      appKeys: appKeys.length,
      keys: appKeys,
      timestamp: new Date().toISOString(),
    };
    
    return info;
  } catch (error) {
    console.error('Error getting storage info:', error);
    throw new StorageError('Failed to get storage info', 'info');
  }
};

// =========================
// 電影資料 CRUD 操作
// =========================

// 獲取所有電影資料
export const getMoviesData = async () => {
  try {
    const movies = await getStorageData(STORAGE_KEYS.MOVIES);
    return movies || [];
  } catch (error) {
    console.error('Error getting movies data:', error);
    return [];
  }
};

// 保存電影資料
export const saveMoviesData = async (moviesData) => {
  try {
    if (!Array.isArray(moviesData)) {
      throw new StorageError('Movies data must be an array', 'validation');
    }
    
    // 驗證並清理每個電影資料
    const sanitizedMovies = moviesData.map(movie => {
      validateMovieData(movie);
      return sanitizeMovieData(movie);
    });
    
    await saveStorageData(STORAGE_KEYS.MOVIES, sanitizedMovies);
    return true;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to save movies data', 'save', { count: moviesData?.length });
  }
};

// 新增電影
export const addMovie = async (movieData) => {
  try {
    validateMovieData(movieData);
    
    const existingMovies = await getMoviesData();
    const existingIndex = existingMovies.findIndex(movie => movie.id === movieData.id.toString());
    
    if (existingIndex >= 0) {
      throw new StorageError('Movie already exists', 'duplicate', { id: movieData.id });
    }
    
    const sanitizedMovie = sanitizeMovieData(movieData);
    const updatedMovies = [...existingMovies, sanitizedMovie];
    
    await saveMoviesData(updatedMovies);
    return sanitizedMovie;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to add movie', 'add', { id: movieData?.id });
  }
};

// 更新電影
export const updateMovie = async (movieId, updates) => {
  try {
    console.log('=== storage.js: updateMovie ===');
    console.log('Movie ID:', movieId);
    console.log('Updates:', updates);
    
    const existingMovies = await getMoviesData();
    console.log('現有電影數量:', existingMovies.length);
    console.log('現有電影 IDs:', existingMovies.map(m => m.id));
    
    const movieIndex = existingMovies.findIndex(movie => movie.id.toString() === movieId.toString());
    console.log('找到的電影索引:', movieIndex);
    
    if (movieIndex === -1) {
      console.error('找不到電影，ID:', movieId);
      throw new StorageError('Movie not found', 'notFound', { id: movieId });
    }
    
    console.log('原始電影資料:', existingMovies[movieIndex]);
    
    const updatedMovie = {
      ...existingMovies[movieIndex],
      ...updates,
      id: movieId.toString(), // 確保 ID 不會被更改
      lastModified: new Date().toISOString(),
    };
    
    console.log('更新後的電影資料:', updatedMovie);
    
    validateMovieData(updatedMovie);
    const sanitizedMovie = sanitizeMovieData(updatedMovie);
    
    console.log('清理後的電影資料:', sanitizedMovie);
    
    existingMovies[movieIndex] = sanitizedMovie;
    await saveMoviesData(existingMovies);
    
    console.log('電影更新成功');
    return sanitizedMovie;
  } catch (error) {
    console.error('updateMovie 錯誤:', error);
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to update movie', 'update', { id: movieId });
  }
};

// 新增或更新電影
export const addOrUpdateMovie = async (movieData) => {
  try {
    validateMovieData(movieData);
    
    const existingMovies = await getMoviesData();
    const existingIndex = existingMovies.findIndex(movie => movie.id.toString() === movieData.id.toString());
    
    if (existingIndex >= 0) {
      // 更新現有電影
      const updatedMovie = {
        ...existingMovies[existingIndex],
        ...sanitizeMovieData(movieData),
        lastModified: new Date().toISOString(),
      };
      existingMovies[existingIndex] = updatedMovie;
      await saveMoviesData(existingMovies);
      return updatedMovie;
    } else {
      // 新增電影
      return await addMovie(movieData);
    }
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to add or update movie', 'addOrUpdate', { id: movieData?.id });
  }
};

// 刪除電影
export const removeMovie = async (movieId) => {
  try {
    const existingMovies = await getMoviesData();
    const movieIndex = existingMovies.findIndex(movie => movie.id.toString() === movieId.toString());
    
    if (movieIndex === -1) {
      throw new StorageError('Movie not found', 'notFound', { id: movieId });
    }
    
    const removedMovie = existingMovies[movieIndex];
    const filteredMovies = existingMovies.filter(movie => movie.id.toString() !== movieId.toString());
    
    await saveMoviesData(filteredMovies);
    return removedMovie;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to remove movie', 'remove', { id: movieId });
  }
};

// 獲取單一電影
export const getMovie = async (movieId) => {
  try {
    const movies = await getMoviesData();
    const movie = movies.find(movie => movie.id === movieId.toString());
    
    if (!movie) {
      throw new StorageError('Movie not found', 'notFound', { id: movieId });
    }
    
    return movie;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to get movie', 'get', { id: movieId });
  }
};

// 標記電影為已觀看
export const markAsWatched = async (movieId, watchedDate = null) => {
  try {
    const updates = {
      isWatched: true,
      watchedDate: watchedDate || new Date().toISOString(),
    };
    
    return await updateMovie(movieId, updates);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to mark as watched', 'markWatched', { id: movieId });
  }
};

// 更新評分和心得
export const updateMovieReview = async (movieId, rating, review) => {
  try {
    console.log('=== storage.js: updateMovieReview ===');
    console.log('參數:', { movieId, rating, review });
    
    const updates = {
      userRating: rating,
      userReview: review || '',
    };
    
    console.log('準備更新的資料:', updates);
    const result = await updateMovie(movieId, updates);
    console.log('updateMovie 結果:', result);
    
    return result;
  } catch (error) {
    console.error('updateMovieReview 錯誤:', error);
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to update review', 'updateReview', { id: movieId });
  }
};

// =========================
// 查詢和篩選操作
// =========================

// 根據狀態獲取電影
export const getMoviesByStatus = async (isWatched) => {
  try {
    const movies = await getMoviesData();
    return movies.filter(movie => movie.isWatched === isWatched);
  } catch (error) {
    throw new StorageError('Failed to get movies by status', 'query', { isWatched });
  }
};

// 搜尋電影
export const searchMovies = async (query) => {
  try {
    const movies = await getMoviesData();
    const searchTerm = query.toLowerCase();
    
    return movies.filter(movie => 
      movie.title.toLowerCase().includes(searchTerm) ||
      movie.originalTitle.toLowerCase().includes(searchTerm) ||
      movie.overview.toLowerCase().includes(searchTerm) ||
      movie.userReview.toLowerCase().includes(searchTerm) ||
      movie.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  } catch (error) {
    throw new StorageError('Failed to search movies', 'search', { query });
  }
};

// 根據評分獲取電影
export const getMoviesByRating = async (minRating = 1, maxRating = 5) => {
  try {
    const movies = await getMoviesData();
    return movies.filter(movie => 
      movie.userRating && 
      movie.userRating >= minRating && 
      movie.userRating <= maxRating
    );
  } catch (error) {
    throw new StorageError('Failed to get movies by rating', 'query', { minRating, maxRating });
  }
};

// =========================
// 備份和還原
// =========================

// 建立備份
export const createBackup = async () => {
  try {
    const movies = await getMoviesData();
    const preferences = await getStorageData(STORAGE_KEYS.USER_PREFERENCES) || {};
    const settings = await getStorageData(STORAGE_KEYS.APP_SETTINGS) || {};
    
    const backup = {
      movies,
      preferences,
      settings,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
    
    await saveStorageData(STORAGE_KEYS.BACKUP, backup);
    return backup;
  } catch (error) {
    throw new StorageError('Failed to create backup', 'backup');
  }
};

// 還原備份
export const restoreBackup = async (backupData) => {
  try {
    if (!backupData || !backupData.movies) {
      throw new StorageError('Invalid backup data', 'validation');
    }
    
    await saveMoviesData(backupData.movies);
    
    if (backupData.preferences) {
      await saveStorageData(STORAGE_KEYS.USER_PREFERENCES, backupData.preferences);
    }
    
    if (backupData.settings) {
      await saveStorageData(STORAGE_KEYS.APP_SETTINGS, backupData.settings);
    }
    
    return true;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to restore backup', 'restore');
  }
};

// 導出錯誤類型
export { StorageError };