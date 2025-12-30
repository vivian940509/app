import { Share, Alert } from 'react-native';

// 分享單個電影
export const shareMovie = async (movie) => {
  try {
    const message = `🎬 我正在看《${movie.title}》\n⭐ 評分: ${movie.vote_average}/10\n📅 發行日期: ${movie.release_date}\n\n${movie.overview}\n\n#電影 #Movie Tracker`;

    await Share.share({
      message,
      title: `分享電影 - ${movie.title}`,
    });
  } catch (error) {
    if (error.code !== 'CANCEL' && error.message !== 'User did not share') {
      Alert.alert('分享失敗', '無法分享電影');
    }
  }
};

// 分享電影清單
export const shareMovieList = async (movies, currentUser) => {
  try {
    const watchedMovies = movies.filter(m => m.isWatched);
    const toWatchMovies = movies.filter(m => !m.isWatched);
    
    let message = `🎥 ${currentUser} 的電影清單\n\n`;
    message += `📊 統計信息:\n`;
    message += `- 總電影數: ${movies.length}\n`;
    message += `- 已看完: ${watchedMovies.length}\n`;
    message += `- 待追清單: ${toWatchMovies.length}\n\n`;

    if (watchedMovies.length > 0) {
      message += `✅ 已看完的電影:\n`;
      watchedMovies.slice(0, 5).forEach(m => {
        message += `• ${m.title} (${m.userRating}⭐)\n`;
      });
      if (watchedMovies.length > 5) {
        message += `... 還有 ${watchedMovies.length - 5} 部\n`;
      }
      message += '\n';
    }

    if (toWatchMovies.length > 0) {
      message += `🎯 待追清單:\n`;
      toWatchMovies.slice(0, 5).forEach(m => {
        message += `• ${m.title}\n`;
      });
      if (toWatchMovies.length > 5) {
        message += `... 還有 ${toWatchMovies.length - 5} 部\n`;
      }
    }

    message += '\n快來看看我的電影品味吧！#Movie Tracker';

    await Share.share({
      message,
      title: `分享 ${currentUser} 的電影清單`,
    });
  } catch (error) {
    if (error.code !== 'CANCEL' && error.message !== 'User did not share') {
      Alert.alert('分享失敗', '無法分享清單');
    }
  }
};

// 分享觀看統計
export const shareWatchStatistics = async (movies, currentUser) => {
  try {
    const watchedCount = movies.filter(m => m.isWatched).length;
    const toWatchCount = movies.filter(m => !m.isWatched).length;
    
    const avgRating = watchedCount > 0
      ? (movies
          .filter(m => m.isWatched && m.userRating > 0)
          .reduce((sum, m) => sum + m.userRating, 0) /
          movies.filter(m => m.isWatched && m.userRating > 0).length)
          .toFixed(1)
      : 'N/A';

    const message = `🎬 ${currentUser} 的觀影統計\n\n` +
      `📊 統計數據:\n` +
      `• 已看完: ${watchedCount} 部\n` +
      `• 待追: ${toWatchCount} 部\n` +
      `• 平均評分: ${avgRating}/5 ⭐\n` +
      `• 總計: ${movies.length} 部\n\n` +
      `我正在使用 Movie Tracker 追蹤我的電影觀看！\n#電影 #統計 #Movie Tracker`;

    await Share.share({
      message,
      title: `分享 ${currentUser} 的統計`,
    });
  } catch (error) {
    if (error.code !== 'CANCEL' && error.message !== 'User did not share') {
      Alert.alert('分享失敗', '無法分享統計');
    }
  }
};
