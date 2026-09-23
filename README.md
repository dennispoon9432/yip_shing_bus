# 九巴業成街實時到站時間 (KMB Yip Shing Street ETA)

專為香港葵涌**業成街巴士站**設計的極簡雙向實時到站查詢應用。

- 🌲 **左欄（藍色）**：往荃灣方向（站柱 KW123 · 32, 35A, 38, 40P, 42C, 936 等）
- 🏢 **右欄（紅色）**：往九龍方向（站柱 KW410 · 31B, 35A, 36B, 38, 40P, 42C 等）
- ⏱️ **最快到站排在最頂**，每 20 秒自動更新
- 🔴 **剩餘分鐘數紅色高亮**
- 🌟 **單選鎖定班次**：點選任何一班車即全格黃色高亮，並在頂部放大顯示預計抵達時間

---

## 🚀 部署至 GitHub Pages (免費公開發布)

本項目已設定好全自動部署流程（GitHub Actions），只需 2 步即可完成發布：

### 步驟 1：推送到 GitHub
建立一個新的 GitHub 倉庫（Repo），例如命名為 `kmb-yip-shing-eta`，然後把代碼推送上去：
```bash
git init
git add .
git commit -m "feat: init KMB Yip Shing Street ETA app"
git branch -M main
git remote add origin https://github.com/<你的GitHub使用者名稱>/<你的倉庫名稱>.git
git push -u origin main
```

### 步驟 2：開啟 GitHub Pages
1. 進入你的 GitHub 倉庫頁面，點擊上方 **Settings**（設定）。
2. 在左側選單點擊 **Pages**。
3. 在 **Build and deployment** 下方的 **Source**，將其切換為 **GitHub Actions**。
4. 稍等約 1 分鐘，GitHub Actions 自動完成編譯構建後，頁面頂部便會顯示你的公開專用網址：
   `https://<你的GitHub使用者名稱>.github.io/<你的倉庫名稱>/`
5. 用手機開啟網址，點擊「加入主畫面 (Add to Home Screen)」，即可像 App 一樣隨時查閱！

---

## 💻 本地運行與開發 (Local Development)

```bash
# 1. 安裝套件
npm install

# 2. 啟動本機開發伺服器
npm run dev

# 3. 編譯靜態文件
npm run build
```

## 📡 數據來源
本應用所有即時班次預測均直連**香港特區政府開放數據平台 (DATA.GOV.HK)** 及 **九龍巴士 (KMB)** 官方開放數據 API，無需任何私密金鑰或後端伺服器，可在任何靜態託管平台永久穩定運行。
