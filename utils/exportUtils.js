import { Share, Alert } from 'react-native';

// 導出為 JSON 格式（直接顯示）
export const exportAsJSON = async (movies, currentUser) => {
  try {
    const data = {
      user: currentUser,
      exportDate: new Date().toISOString(),
      totalMovies: movies.length,
      watchedCount: movies.filter(m => m.isWatched).length,
      toWatchCount: movies.filter(m => !m.isWatched).length,
      movies: movies.map(m => ({
        id: m.id,
        title: m.title,
        releaseDate: m.release_date,
        overview: m.overview,
        posterUrl: m.posterUrl,
        isWatched: m.isWatched,
        userRating: m.userRating,
        userReview: m.userReview,
        dateAdded: m.dateAdded,
        watchedDate: m.watchedDate,
        tmdbRating: m.vote_average,
        tmdbVotes: m.vote_count,
      })),
    };

    const jsonString = JSON.stringify(data, null, 2);
    const fileName = `MovieTracker_${currentUser}_${new Date().getTime()}.json`;

    // 分享 JSON 內容
    await Share.share({
      message: `電影清單導出 (JSON):\n\n${jsonString.substring(0, 500)}...`,
      title: `導出 ${currentUser} 的電影清單 (JSON)`,
    });

    Alert.alert('成功', '已導出 JSON 數據！');
  } catch (error) {
    if (error.message !== 'User did not share') {
      console.error('JSON 導出失敗:', error);
      Alert.alert('失敗', '無法導出 JSON 文件');
    }
  }
};

// 導出為 CSV 格式
export const exportAsCSV = async (movies, currentUser) => {
  try {
    // CSV 標題行
    const headers = [
      '電影標題',
      '發行日期',
      '已看完',
      '用戶評分',
      'TMDB評分',
      '用戶評論',
      '添加日期',
      '觀看日期',
    ].join(',');

    // CSV 數據行
    const rows = movies.map(m => {
      return [
        `"${m.title}"`,
        m.release_date,
        m.isWatched ? '是' : '否',
        m.userRating,
        m.vote_average?.toFixed(1),
        `"${(m.userReview || '').replace(/"/g, '""')}"`,
        m.dateAdded,
        m.watchedDate || '',
      ].join(',');
    });

    const csvString = [headers, ...rows].join('\n');
    const preview = csvString.split('\n').slice(0, 6).join('\n');

    // 分享 CSV 內容預覽
    await Share.share({
      message: `電影清單導出 (CSV):\n\n${preview}\n\n... 共 ${movies.length} 部電影`,
      title: `導出 ${currentUser} 的電影清單 (CSV)`,
    });

    Alert.alert('成功', '已導出 CSV 數據！');
  } catch (error) {
    if (error.message !== 'User did not share') {
      console.error('CSV 導出失敗:', error);
      Alert.alert('失敗', '無法導出 CSV 文件');
    }
  }
};

// 導出為純文本格式
export const exportAsText = async (movies, currentUser) => {
  try {
    let textContent = `========================================\n`;
    textContent += `Movie Tracker 導出報告\n`;
    textContent += `用戶: ${currentUser}\n`;
    textContent += `導出日期: ${new Date().toLocaleString('zh-TW')}\n`;
    textContent += `========================================\n\n`;

    textContent += `📊 統計信息\n`;
    textContent += `總電影數: ${movies.length}\n`;
    textContent += `已看完: ${movies.filter(m => m.isWatched).length}\n`;
    textContent += `待追清單: ${movies.filter(m => !m.isWatched).length}\n\n`;

    const avgRating = movies.filter(m => m.isWatched && m.userRating > 0).length > 0
      ? (movies
          .filter(m => m.isWatched && m.userRating > 0)
          .reduce((sum, m) => sum + m.userRating, 0) /
          movies.filter(m => m.isWatched && m.userRating > 0).length)
          .toFixed(1)
      : 'N/A';
    
    textContent += `平均評分: ${avgRating}/5 ⭐\n\n`;

    // 已看完的電影
    const watchedMovies = movies.filter(m => m.isWatched);
    if (watchedMovies.length > 0) {
      textContent += `========================================\n`;
      textContent += `✅ 已看完的電影 (${watchedMovies.length} 部)\n`;
      textContent += `========================================\n\n`;

      watchedMovies.slice(0, 10).forEach((m, index) => {
        textContent += `${index + 1}. ${m.title}\n`;
        textContent += `   發行日期: ${m.release_date}\n`;
        textContent += `   用戶評分: ${m.userRating || '-'}/5 ⭐\n`;
        textContent += `   TMDB評分: ${m.vote_average?.toFixed(1) || '-'}/10\n`;
        if (m.userReview) {
          textContent += `   評論: ${m.userReview}\n`;
        }
        textContent += `\n`;
      });

      if (watchedMovies.length > 10) {
        textContent += `... 還有 ${watchedMovies.length - 10} 部已看完的電影\n\n`;
      }
    }

    // 待追清單
    const toWatchMovies = movies.filter(m => !m.isWatched);
    if (toWatchMovies.length > 0) {
      textContent += `========================================\n`;
      textContent += `📋 待追清單 (${toWatchMovies.length} 部)\n`;
      textContent += `========================================\n\n`;

      toWatchMovies.slice(0, 10).forEach((m, index) => {
        textContent += `${index + 1}. ${m.title} (${m.release_date})\n`;
        textContent += `   TMDB評分: ${m.vote_average?.toFixed(1) || '-'}/10\n`;
      });

      if (toWatchMovies.length > 10) {
        textContent += `... 還有 ${toWatchMovies.length - 10} 部待追的電影\n`;
      }
    }

    textContent += `\n========================================\n`;
    textContent += `導出完成\n`;
    textContent += `========================================\n`;

    const preview = textContent.substring(0, 800);

    // 分享文本內容
    await Share.share({
      message: preview + '\n\n... (完整報告)',
      title: `導出 ${currentUser} 的電影清單 (TXT)`,
    });

    Alert.alert('成功', '已導出 TXT 數據！');
  } catch (error) {
    if (error.message !== 'User did not share') {
      console.error('TXT 導出失敗:', error);
      Alert.alert('失敗', '無法導出 TXT 文件');
    }
  }
};
