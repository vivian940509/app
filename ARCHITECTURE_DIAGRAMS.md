# 電影管理平台架構圖 (視覺化版本)

## 1. 整體系統架構圖

```mermaid
graph TB
    subgraph "用戶界面層"
        A[React Native App]
        B[React Navigation]
    end
    
    subgraph "展示層 Screens"
        C[LoginScreen]
        D[SearchScreen]
        E[ToWatchScreen]
        F[WatchedScreen]
        G[DetailScreen]
        H[ProfileScreen]
        I[RecommendationScreen]
        J[ExportScreen]
    end
    
    subgraph "組件層 Components"
        K[MovieListItem]
        L[StarRating]
        M[LocalMoviePoster]
        N[StatisticsCharts]
    end
    
    subgraph "狀態管理層"
        O[MoviesContext]
        P[Context Provider]
    end
    
    subgraph "服務層 Services"
        Q[tmdbService]
        R[shareUtils]
        S[exportUtils]
        T[storage]
    end
    
    subgraph "數據層"
        U[(AsyncStorage)]
        V[TMDB API]
    end
    
    A --> B
    B --> C & D & E & F & G & H & I & J
    C & D & E & F & G & H & I & J --> K & L & M & N
    D & E & F & G & H & I & J --> O
    O --> P
    P --> Q & R & S & T
    Q --> V
    T --> U
    
    style A fill:#e1f5ff
    style O fill:#fff4e1
    style Q fill:#f0f0f0
    style U fill:#e8f5e9
    style V fill:#e8f5e9
```

## 2. 功能模塊架構圖

```mermaid
graph LR
    A[電影管理平台] --> B[用戶管理模塊]
    A --> C[電影管理模塊]
    A --> D[數據分析模塊]
    A --> E[推薦系統模塊]
    A --> F[分享導出模塊]
    
    B --> B1[登錄/註冊]
    B --> B2[個人資料]
    
    C --> C1[電影搜尋]
    C --> C2[待追清單]
    C --> C3[已看清單]
    C --> C4[電影詳情]
    C --> C5[評分/評論]
    
    D --> D1[PieChart<br/>觀看比例]
    D --> D2[BarChart<br/>評分分布]
    D --> D3[LineChart<br/>月度趨勢]
    
    E --> E1[熱門推薦]
    E --> E2[相似推薦]
    E --> E3[智能算法]
    
    F --> F1[社交分享]
    F --> F2[JSON導出]
    F --> F3[CSV導出]
    F --> F4[TXT導出]
    
    style A fill:#4a90e2,color:#fff
    style B fill:#f5a623
    style C fill:#7ed321
    style D fill:#bd10e0
    style E fill:#50e3c2
    style F fill:#ff6b6b
```

## 3. 數據流向圖

```mermaid
sequenceDiagram
    participant User as 用戶
    participant UI as UI組件
    participant Context as MoviesContext
    participant Service as Service層
    participant API as TMDB API
    participant Storage as AsyncStorage
    
    User->>UI: 搜尋電影
    UI->>Context: 調用 searchMovies()
    Context->>Service: tmdbService.searchMovies()
    Service->>API: HTTP Request
    API-->>Service: 電影數據
    Service-->>Context: 格式化數據
    Context->>Storage: 保存到本地
    Context-->>UI: 更新 State
    UI-->>User: 顯示搜尋結果
    
    User->>UI: 添加到待追
    UI->>Context: addMovie()
    Context->>Storage: saveMovies()
    Storage-->>Context: 保存成功
    Context-->>UI: 更新列表
    UI-->>User: 顯示成功提示
```

## 4. 推薦系統流程圖

```mermaid
flowchart TD
    Start([開始推薦]) --> Mode{選擇推薦模式}
    
    Mode -->|熱門推薦| Hot[獲取 TMDB 熱門電影]
    Mode -->|相似推薦| Similar[篩選用戶高分電影]
    
    Hot --> Filter1[過濾已有電影<br/>已看+待追]
    Filter1 --> Format1[格式化數據]
    Format1 --> Return1[返回前20部]
    
    Similar --> Check{有≥3星電影?}
    Check -->|否| Empty[返回空列表]
    Check -->|是| Calculate[計算相似度分數]
    
    Calculate --> Score1[年代相近<br/>±3年]
    Calculate --> Score2[評分相近<br/>±1.5分]
    Calculate --> Score3[人氣度相近]
    
    Score1 & Score2 & Score3 --> Combine[綜合評分]
    Combine --> Sort[排序]
    Sort --> Filter2{結果<10部?}
    
    Filter2 -->|是| Add[補充已看高分電影]
    Filter2 -->|否| Return2[返回前20部]
    Add --> Return2
    
    Return1 & Return2 & Empty --> End([結束])
    
    style Start fill:#4a90e2,color:#fff
    style Mode fill:#f5a623
    style Hot fill:#7ed321
    style Similar fill:#7ed321
    style End fill:#4a90e2,color:#fff
```

## 5. 導航結構圖

```mermaid
graph TD
    App[App.js] --> Auth{用戶登錄?}
    
    Auth -->|否| Login[LoginScreen<br/>登錄頁]
    Auth -->|是| Tabs[Bottom Tab Navigator]
    
    Tabs --> Tab1[🔍 SearchScreen<br/>搜尋]
    Tabs --> Tab2[📋 ToWatchScreen<br/>待追]
    Tabs --> Tab3[✅ WatchedScreen<br/>已看]
    Tabs --> Tab4[⭐ RecommendationScreen<br/>推薦]
    Tabs --> Tab5[📤 ExportScreen<br/>導出]
    Tabs --> Tab6[👤 ProfileScreen<br/>個人]
    
    Tab1 & Tab2 & Tab3 & Tab4 --> Detail[DetailScreen<br/>電影詳情<br/>Modal]
    
    Login --> Register[註冊]
    
    style App fill:#4a90e2,color:#fff
    style Tabs fill:#f5a623
    style Detail fill:#bd10e0,color:#fff
```

## 6. 組件層級結構圖

```mermaid
graph TD
    App[App.js] --> Provider[MoviesProvider]
    Provider --> Nav[NavigationContainer]
    
    Nav --> Stack[Stack Navigator]
    Stack --> AuthStack[Auth Stack]
    Stack --> MainStack[Main Stack]
    
    AuthStack --> Login[LoginScreen]
    
    MainStack --> Tabs[Tab Navigator]
    Tabs --> Search[SearchScreen]
    Tabs --> ToWatch[ToWatchScreen]
    Tabs --> Watched[WatchedScreen]
    Tabs --> Recommend[RecommendationScreen]
    Tabs --> Export[ExportScreen]
    Tabs --> Profile[ProfileScreen]
    
    MainStack --> Detail[DetailScreen]
    
    Search --> C1[MovieListItem]
    ToWatch --> C1
    Watched --> C1
    Recommend --> C1
    
    Detail --> C2[StarRating]
    Detail --> C3[LocalMoviePoster]
    
    Profile --> C4[StatisticsCharts]
    C4 --> C5[PieChart]
    C4 --> C6[BarChart]
    C4 --> C7[LineChart]
    
    C1 --> C3
    C1 --> C2
    
    style App fill:#4a90e2,color:#fff
    style Provider fill:#fff4e1
    style Tabs fill:#f5a623
    style C1 fill:#7ed321
    style C2 fill:#7ed321
    style C3 fill:#7ed321
    style C4 fill:#bd10e0,color:#fff
```

## 7. Context 狀態管理圖

```mermaid
stateDiagram-v2
    [*] --> Initial: App啟動
    Initial --> Loading: loadMovies()
    Loading --> Loaded: 數據載入成功
    Loading --> Error: 載入失敗
    Error --> Initial: 重試
    
    Loaded --> Adding: addMovie()
    Adding --> Loaded: 添加成功
    
    Loaded --> Updating: updateMovie()
    Updating --> Loaded: 更新成功
    
    Loaded --> Deleting: deleteMovie()
    Deleting --> Loaded: 刪除成功
    
    Loaded --> Saving: saveMovies()
    Saving --> Loaded: 保存成功
    
    state Loaded {
        [*] --> Movies
        Movies --> Watched: isWatched=true
        Movies --> ToWatch: isWatched=false
    }
```

## 8. TMDB API 集成流程圖

```mermaid
sequenceDiagram
    participant User
    participant Screen as SearchScreen
    participant Service as tmdbService
    participant API as TMDB API
    participant Context as MoviesContext
    
    User->>Screen: 輸入搜尋關鍵字
    Screen->>Service: searchMovies(query)
    Service->>API: GET /search/movie
    
    alt 成功
        API-->>Service: 200 OK + 電影列表
        Service->>Service: formatMovieData()
        Service-->>Screen: 格式化數據
        Screen-->>User: 顯示搜尋結果
        
        User->>Screen: 點擊電影
        Screen->>Context: addMovie(movie)
        Context->>Context: saveMovies()
        Context-->>Screen: 更新狀態
        Screen-->>User: 添加成功提示
    else 失敗
        API-->>Service: 4xx/5xx 錯誤
        Service-->>Screen: 錯誤信息
        Screen-->>User: 顯示錯誤提示
    end
```

## 9. 分享與導出功能流程圖

```mermaid
flowchart LR
    A[DetailScreen] --> B{選擇操作}
    
    B -->|分享| C[shareUtils]
    B -->|導出| D[ExportScreen]
    
    C --> C1[shareMovie<br/>單部電影]
    C --> C2[shareMovieList<br/>電影列表]
    C --> C3[shareWatchStatistics<br/>觀看統計]
    
    C1 & C2 & C3 --> E[React Native Share API]
    E --> F[系統分享面板]
    F --> G[選擇分享平台]
    G --> H[Facebook]
    G --> I[藍牙]
    G --> J[其他]
    
    D --> D1[exportAsJSON]
    D --> D2[exportAsCSV]
    D --> D3[exportAsText]
    
    D1 & D2 & D3 --> K[格式化數據]
    K --> L[Share.share]
    L --> M[預覽/保存]
    
    style A fill:#4a90e2,color:#fff
    style C fill:#f5a623
    style D fill:#7ed321
    style E fill:#bd10e0,color:#fff
```

## 10. 統計圖表數據處理流程

```mermaid
flowchart TD
    Start[ProfileScreen] --> Get[獲取 movies 數據]
    Get --> Process[StatisticsCharts]
    
    Process --> Pie[PieChart 處理]
    Process --> Bar[BarChart 處理]
    Process --> Line[LineChart 處理]
    
    Pie --> P1[計算已看數量]
    Pie --> P2[計算待追數量]
    P1 & P2 --> P3[生成比例數據]
    P3 --> PieRender[渲染圓餅圖]
    
    Bar --> B1[按評分分組<br/>1-5星]
    B1 --> B2[計算各星級數量]
    B2 --> BarRender[渲染柱狀圖]
    
    Line --> L1[按月份分組]
    L1 --> L2[計算每月觀看數]
    L2 --> L3[取最近6個月]
    L3 --> LineRender[渲染折線圖]
    
    PieRender & BarRender & LineRender --> Display[顯示圖表]
    
    style Start fill:#4a90e2,color:#fff
    style Process fill:#f5a623
    style Display fill:#7ed321
```

---

## 圖表說明

### 使用方式
這些圖表使用 **Mermaid** 語法繪製，可以在以下環境中查看：

1. **GitHub** - 直接在 GitHub 上查看此 MD 文件
2. **VS Code** - 安裝 `Markdown Preview Mermaid Support` 擴展
3. **線上工具** - [Mermaid Live Editor](https://mermaid.live/)

### 圖表類型
- 📊 **流程圖 (Flowchart)** - 展示業務邏輯流程
- 🔄 **序列圖 (Sequence Diagram)** - 展示組件間互動
- 🏗️ **圖表 (Graph)** - 展示架構關係
- 🔀 **狀態圖 (State Diagram)** - 展示狀態變化

---

**創建日期：** 2025年12月31日  
**版本：** 1.0.0
