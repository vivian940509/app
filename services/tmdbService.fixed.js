// 修復版的 TMDB 服務 - 使用字符串連接而非 URL 構造器
const TMDB_API_KEY = '9cfc2140294f2324fd8cd7b92648396c';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// 圖片尺寸選項
export const IMAGE_SIZES = {
  POSTER_SMALL: 'w185',
  POSTER_MEDIUM: 'w342',
  POSTER_LARGE: 'w500',
  BACKDROP_SMALL: 'w300',
  BACKDROP_MEDIUM: 'w780',
  BACKDROP_LARGE: 'w1280',
  ORIGINAL: 'original',
};

class TMDBServiceFixed {
  constructor() {
    this.apiKey = TMDB_API_KEY;
    this.baseUrl = TMDB_BASE_URL;
  }

  // 使用字符串拼接構建 URL
  buildUrl(endpoint, params = {}) {
    // 確保 endpoint 以 / 開頭
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }
    
    let url = this.baseUrl + endpoint + '?api_key=' + this.apiKey + '&language=zh-TW';
    
    // 添加其他參數
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        url += '&' + encodeURIComponent(key) + '=' + encodeURIComponent(value.toString());
      }
    }
    
    return url;
  }

  // 構建圖片 URL
  buildImageUrl(path, size = IMAGE_SIZES.POSTER_MEDIUM) {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  }

  // 通用 API 請求方法
  async makeRequest(endpoint, params = {}) {
    try {
      const url = this.buildUrl(endpoint, params);
      console.log('TMDB API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      console.log('TMDB Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('TMDB Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('TMDB Success - Results:', data.results?.length || 0);
      return data;
    } catch (error) {
      console.error('TMDB API Error:', error);
      throw error;
    }
  }

  // 搜尋電影
  async searchMovies(query, page = 1) {
    if (!query || query.trim() === '') {
      throw new Error('搜尋關鍵字不能為空');
    }

    const params = {
      query: query.trim(),
      page,
      include_adult: false,
    };

    const data = await this.makeRequest('/search/movie', params);
    
    // 格式化結果
    const results = data.results.map(movie => this.formatMovieData(movie));
    
    return {
      results,
      page: data.page,
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  }

  // 格式化電影資料
  formatMovieData(movie) {
    return {
      id: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path,
      voteAverage: movie.vote_average,
      voteCount: movie.vote_count,
      popularity: movie.popularity,
      genreIds: movie.genre_ids,
      adult: movie.adult,
      originalLanguage: movie.original_language,
      video: movie.video,
      // 格式化的欄位
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
      posterUrl: this.buildImageUrl(movie.poster_path, IMAGE_SIZES.POSTER_MEDIUM),
      backdropUrl: this.buildImageUrl(movie.backdrop_path, IMAGE_SIZES.BACKDROP_MEDIUM),
      type: 'movie',
    };
  }
}

// 建立實例
const tmdbServiceFixed = new TMDBServiceFixed();

export default tmdbServiceFixed;