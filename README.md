# 🍸 Bar Temperature

Bar Temperature 是一個簡潔的調酒展示網站，使用 HTML、Bootstrap 與原生 JavaScript 打造，支援分類篩選、搜尋與每週主打推薦。適合用於個人作品集、酒吧介紹頁或調酒教學平台。

## 🔧 專案結構

```
.
├── index.html             # 主頁面
├── js/
│   └── app.js             # 網站邏輯控制腳本
├── css/
│   └── style.css          # 自訂樣式（需自行建立）
├── data.json              # 所有調酒資訊資料
├── weekly_tags.json       # 本週水果標籤資料
├── img/
│   └── default-drink.jpg  # 無圖片時的預設圖
├── generate_data.ps1      # PowerShell 腳本，用來生成資料 (data.json)
```

## 🚀 使用方式

1. **準備資料**
   - 使用 `generate_data.ps1` 腳本，自動將圖片與 EXIF 註解轉換成 `data.json`。
   - 建議每張圖片使用 JPEG 並加入 `Name`, `Category`, `Description` 等 EXIF 資訊。

2. **啟動網站**
   - 直接開啟 `index.html` 即可瀏覽，無需伺服器。
   - 若有本地 JSON 檔案載入限制，建議透過本地伺服器（如 Python 的 `http.server`）啟動。

3. **分類與搜尋**
   - 點擊分類按鈕可篩選菜單，預設會載入「本周水果」分類。
   - 可使用搜尋框即時搜尋調酒名稱。

## 🖼 圖片轉換與資料生成

你可以透過 `generate_data.ps1` 腳本，從圖片自動建立 `data.json`，每張圖片需含有以下 EXIF 資訊欄位：

- `Name`：調酒名稱
- `Category`：分類（使用逗號分隔，例如：`signature,classic`）
- `Description`：簡短說明文字

### 🔧 步驟如下：

1. **將調酒圖片放入同一資料夾**（建議使用 JPG 格式）。
2. **為每張圖片加入 EXIF 註解資訊**，可使用：
   - [ExifTool](https://exiftool.org/)
   - Windows 圖片內容→詳細資料（編輯標題、說明、自訂欄位）
3. **執行 PowerShell 腳本**：
   - 開啟 PowerShell
   - 切換至腳本所在資料夾，並執行：

     ```powershell
     .\generate_data.ps1
     ```

4. 腳本會產生 `data.json` 檔案，並包含每張圖片的 `Name`, `Category`, `Description`、縮圖與原始圖路徑欄位（需事先定義好圖片命名邏輯）。

## 📂 資料格式範例

### `data.json`
```json
[
  {
    "name": "Mango Mojito",
    "category": ["classic", "signature"],
    "description": "熱帶風味的清爽調酒",
    "thumbnail": "img/mango-thumb.jpg",
    "file": "img/mango-full.jpg"
  }
]
```

### `weekly_tags.json`
```json
{
  "tags": ["mango", "lychee", "passionfruit"]
}
```

## 🛠 技術與相依套件

- Bootstrap 5（CDN）
- EXIF.js：解析圖片描述資訊
- 原生 JavaScript（不依賴框架）

## 📜 授權
MIT License
