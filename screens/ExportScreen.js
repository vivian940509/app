import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMovies } from '../context/MoviesContext';
import { exportAsJSON, exportAsCSV, exportAsText } from '../utils/exportUtils';

export default function ExportScreen() {
  const { movies, currentUser } = useMovies();
  const [exporting, setExporting] = React.useState(false);

  const handleExport = async (format) => {
    if (movies.length === 0) {
      Alert.alert('提示', '沒有電影可以導出');
      return;
    }

    setExporting(true);
    try {
      if (format === 'json') {
        await exportAsJSON(movies, currentUser);
      } else if (format === 'csv') {
        await exportAsCSV(movies, currentUser);
      } else if (format === 'text') {
        await exportAsText(movies, currentUser);
      }
    } catch (error) {
      console.error(`${format.toUpperCase()} 導出錯誤:`, error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📥 數據導出</Text>
        <Text style={styles.subtitle}>將你的電影清單導出為不同格式</Text>
      </View>

      {/* 統計信息 */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>總電影數</Text>
          <Text style={styles.statValue}>{movies.length}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>已看完</Text>
          <Text style={styles.statValue}>{movies.filter(m => m.isWatched).length}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>待追</Text>
          <Text style={styles.statValue}>{movies.filter(m => !m.isWatched).length}</Text>
        </View>
      </View>

      {/* 導出格式選項 */}
      <Text style={styles.sectionTitle}>選擇導出格式</Text>

      <TouchableOpacity
        style={styles.exportCard}
        onPress={() => handleExport('json')}
        disabled={exporting}
      >
        <View style={styles.formatIcon}>
          <Text style={styles.iconText}>{ }</Text>
        </View>
        <View style={styles.formatInfo}>
          <Text style={styles.formatTitle}>JSON 格式</Text>
          <Text style={styles.formatDesc}>機器可讀的格式，包含完整數據結構</Text>
          <Text style={styles.formatUse}>✓ 適合數據分析或導入其他應用</Text>
        </View>
        <Text style={styles.arrowIcon}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.exportCard}
        onPress={() => handleExport('csv')}
        disabled={exporting}
      >
        <View style={styles.formatIcon}>
          <Text style={styles.iconText}>📊</Text>
        </View>
        <View style={styles.formatInfo}>
          <Text style={styles.formatTitle}>CSV 格式</Text>
          <Text style={styles.formatDesc}>與 Excel/Google Sheets 兼容</Text>
          <Text style={styles.formatUse}>✓ 適合用電子表格軟件編輯</Text>
        </View>
        <Text style={styles.arrowIcon}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.exportCard}
        onPress={() => handleExport('text')}
        disabled={exporting}
      >
        <View style={styles.formatIcon}>
          <Text style={styles.iconText}>📝</Text>
        </View>
        <View style={styles.formatInfo}>
          <Text style={styles.formatTitle}>純文本格式</Text>
          <Text style={styles.formatDesc}>易於閱讀的人類可讀格式</Text>
          <Text style={styles.formatUse}>✓ 適合分享或備份打印</Text>
        </View>
        <Text style={styles.arrowIcon}>→</Text>
      </TouchableOpacity>

      {/* 信息框 */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 提示</Text>
        <Text style={styles.infoText}>
          導出後，文件將保存到你的設備，你可以通過郵件、消息或其他應用分享。
        </Text>
      </View>

      {/* 加載指示 */}
      {exporting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#e50914" />
          <Text style={styles.loadingText}>正在導出...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginHorizontal: 20,
    marginVertical: 15,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e50914',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  exportCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  formatIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  formatInfo: {
    flex: 1,
  },
  formatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  formatDesc: {
    color: '#888',
    fontSize: 12,
    marginBottom: 5,
  },
  formatUse: {
    color: '#e50914',
    fontSize: 11,
    fontWeight: '500',
  },
  arrowIcon: {
    color: '#666',
    fontSize: 18,
    marginLeft: 10,
  },
  infoBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#e50914',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  infoText: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    fontSize: 14,
  },
});
