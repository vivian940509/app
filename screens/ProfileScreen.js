import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useMovies } from '../context/MoviesContext'; // 改用 Context
import { StatisticsCharts } from '../components/StatisticsCharts';
import { shareMovieList, shareWatchStatistics } from '../utils/shareUtils';

export default function ProfileScreen({ navigation }) {
  // 從 Context 直接拿 currentUser (現在登入的人) 和 movies (他的清單)
  const { currentUser, movies, logout } = useMovies();

  const watchedCount = movies.filter(m => m.isWatched).length;
  const toWatchCount = movies.filter(m => !m.isWatched).length;

  const handleLogout = async () => {
    // 呼叫 Context 的登出功能 (清空記憶體)
    await logout();
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{currentUser ? currentUser[0].toUpperCase() : '?'}</Text>
        </View>
        <Text style={styles.name}>Hi, {currentUser || '訪客'}</Text>
        <Text style={styles.bio}>今天想看點什麼？</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{toWatchCount}</Text>
          <Text style={styles.statLabel}>待追清單</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{watchedCount}</Text>
          <Text style={styles.statLabel}>已看完</Text>
        </View>
      </View>

      {/* 統計圖表 */}
      <StatisticsCharts movies={movies} />

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem} onPress={() => shareMovieList(movies, currentUser)}>
          <Text style={styles.menuText}>📤 分享我的清單</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => shareWatchStatistics(movies, currentUser)}>
          <Text style={styles.menuText}>📊 分享觀影統計</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => alert('開發中...')}>
          <Text style={styles.menuText}>⚙️ 系統設定</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => alert('版本 v1.0.0')}>
          <Text style={styles.menuText}>ℹ️ 關於 App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <Text style={[styles.menuText, styles.logoutText]}>🚪 登出帳號</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e50914',
  },
  avatarText: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  bio: {
    color: '#888',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 5,
  },
  divider: {
    width: 1,
    backgroundColor: '#444',
  },
  menu: {
    marginTop: 10,
  },
  menuItem: {
    backgroundColor: '#1f1f1f',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
  logoutButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e50914',
    backgroundColor: 'transparent',
  },
  logoutText: {
    color: '#e50914',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});