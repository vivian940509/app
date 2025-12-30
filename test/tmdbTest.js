// 測試 TMDB API 連接
import tmdbService from '../services/tmdbService.js';

const testTMDBConnection = async () => {
  try {
    console.log('=== 開始測試 TMDB API 連接 ===');
    
    // 1. 驗證 API Key
    console.log('1. 驗證 API Key...');
    const isValidKey = await tmdbService.validateApiKey();
    console.log('API Key 有效:', isValidKey);
    
    if (!isValidKey) {
      console.error('❌ API Key 無效');
      return;
    }
    
    // 2. 測試搜尋電影
    console.log('2. 測試搜尋電影...');
    const movieResults = await tmdbService.searchMovies('Avengers');
    console.log('電影搜尋結果:', movieResults.results.length, '部電影');
    console.log('第一部電影:', movieResults.results[0]?.title);
    
    // 3. 測試搜尋電視劇
    console.log('3. 測試搜尋電視劇...');
    const tvResults = await tmdbService.searchTVShows('Friends');
    console.log('電視劇搜尋結果:', tvResults.results.length, '部電視劇');
    console.log('第一部電視劇:', tvResults.results[0]?.name);
    
    console.log('✅ TMDB API 連接測試完成');
    
  } catch (error) {
    console.error('❌ TMDB API 測試失敗:', error.message);
    console.error('錯誤詳情:', error);
  }
};

export { testTMDBConnection };