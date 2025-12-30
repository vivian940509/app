import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

// 統計圖表組件
export function StatisticsCharts({ movies }) {
  // 計算統計數據
  const watchedCount = movies.filter(m => m.isWatched).length;
  const toWatchCount = movies.filter(m => !m.isWatched).length;
  
  // 計算評分統計
  const ratingStats = {
    5: movies.filter(m => m.userRating === 5).length,
    4: movies.filter(m => m.userRating === 4).length,
    3: movies.filter(m => m.userRating === 3).length,
    2: movies.filter(m => m.userRating === 2).length,
    1: movies.filter(m => m.userRating === 1).length,
  };

  // 計算按月份統計
  const monthStats = {};
  movies.forEach(m => {
    if (m.watchedDate) {
      const date = new Date(m.watchedDate);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthStats[month] = (monthStats[month] || 0) + 1;
    }
  });

  const sortedMonths = Object.keys(monthStats).sort().slice(-6); // 最近 6 個月
  const monthData = sortedMonths.map(m => monthStats[m] || 0);

  // 待追 vs 已看 圓餅圖數據
  const pieData = [
    {
      name: '待追清單',
      count: toWatchCount,
      color: '#FF6B6B',
      legendFontColor: '#fff',
      legendFontSize: 12,
    },
    {
      name: '已看完',
      count: watchedCount,
      color: '#4ECDC4',
      legendFontColor: '#fff',
      legendFontSize: 12,
    },
  ];

  // 評分分佈柱狀圖
  const ratingData = {
    labels: ['5⭐', '4⭐', '3⭐', '2⭐', '1⭐'],
    datasets: [
      {
        data: [ratingStats[5], ratingStats[4], ratingStats[3], ratingStats[2], ratingStats[1]],
        color: () => '#e50914',
        strokeWidth: 2,
      },
    ],
  };

  // 按月份觀看折線圖
  const lineData = {
    labels: sortedMonths.map(m => m.split('-')[1]),
    datasets: [
      {
        data: monthData.length > 0 ? monthData : [0],
        color: () => '#FF9800',
        strokeWidth: 2,
        fillShadowGradientOpacity: 0.1,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#1a1a1a',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#2a2a2a',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    decimalPlaces: 0,
  };

  return (
    <View style={styles.container}>
      {/* 圖表標題 */}
      <Text style={styles.chartTitle}>📊 觀影統計</Text>

      {/* 待追 vs 已看 圓餅圖 */}
      {(toWatchCount + watchedCount) > 0 && (
        <View style={styles.chartWrapper}>
          <Text style={styles.subTitle}>清單分佈</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="count"
            backgroundColor="transparent"
            paddingLeft="15"
            center={[screenWidth / 2 - 40, 0]}
          />
        </View>
      )}

      {/* 評分分佈柱狀圖 */}
      {watchedCount > 0 && (
        <View style={styles.chartWrapper}>
          <Text style={styles.subTitle}>評分分佈</Text>
          <BarChart
            data={ratingData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
          />
        </View>
      )}

      {/* 按月份觀看折線圖 */}
      {monthData.some(count => count > 0) && (
        <View style={styles.chartWrapper}>
          <Text style={styles.subTitle}>觀看趨勢（最近 6 個月）</Text>
          <LineChart
            data={lineData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
          />
        </View>
      )}

      {/* 統計摘要 */}
      <View style={styles.summaryContainer}>
        <Text style={styles.subTitle}>統計摘要</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{movies.length}</Text>
            <Text style={styles.summaryLabel}>總電影數</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{toWatchCount}</Text>
            <Text style={styles.summaryLabel}>待追清單</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{watchedCount}</Text>
            <Text style={styles.summaryLabel}>已看完</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>
              {watchedCount > 0
                ? (
                    movies
                      .filter(m => m.isWatched && m.userRating > 0)
                      .reduce((sum, m) => sum + m.userRating, 0) /
                      movies.filter(m => m.isWatched && m.userRating > 0).length
                  ).toFixed(1)
                : '-'}
            </Text>
            <Text style={styles.summaryLabel}>平均評分</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  chartWrapper: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
    marginLeft: 5,
  },
  summaryContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#242424',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e50914',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});
