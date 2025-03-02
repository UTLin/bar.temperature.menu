@echo off
setlocal enabledelayedexpansion

REM 設定圖片資料夾
set "IMG_DIR=img"
set "JSON_FILE=data.json"

REM 初始化 JSON 文件
echo [ > %JSON_FILE%

REM 讀取 img 目錄內所有 JPG 檔案
for %%F in (%IMG_DIR%\*.jpg) do (
    set "filename=%%~nF"
    for /f "tokens=1-3 delims=-" %%A in ("!filename!") do (
        set "date=%%A"
        set "category=%%B"
        set "name=%%C"
        REM 將空格替換為 -
        set "name=!name: =-!"
    )

    REM 加入 JSON 物件
    echo   { "file": "!IMG_DIR!/%%~nxF", "category": "!category!", "name": "!name!", "description": "無註解" }, >> %JSON_FILE%
)

REM 移除最後一個逗號
powershell -Command "(Get-Content %JSON_FILE%) -replace ',\s*$', '' | Set-Content %JSON_FILE%"

REM 關閉 JSON 陣列
echo ] >> %JSON_FILE%

echo data.json 已成功生成！
pause
