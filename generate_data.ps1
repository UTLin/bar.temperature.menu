# PowerShell Script to Auto-Generate data.json from Google Drive Desktop
# Also Auto-Create Thumbnails for Faster Loading

# Import .NET Image Processing Library
Add-Type -AssemblyName System.Drawing

# Force PowerShell to use UTF-8 encoding
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Define directories
$googleDriveFolder = "G:\我的雲端硬碟\神秘酒吧"
$imgDir = "menuImg"
$jsonFile = "data.json"
$errorLog = "error.log"

# Timestamp
Add-Content -Path $errorLog -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - 測試時間" -Encoding UTF8
Add-Content -Path $errorLog -Value "Try Access: $googleDriveFolder" -Encoding UTF8
if (Test-Path -LiteralPath $googleDriveFolder) {
    Add-Content -Path $errorLog -Value " [PASS]" -Encoding UTF8 -NoNewline
} else {
    Add-Content -Path $errorLog -Value " [NG]" -Encoding UTF8 -NoNewline
    exit
}

# Clear the error log before execution
Set-Content -Path $errorLog -Value "" -Encoding UTF8 -NoNewline

# Ensure the Google Drive folder exists
if (-Not (Test-Path -LiteralPath $googleDriveFolder)) {
    Add-Content -Path $errorLog -Value "[ERROR] Google Drive folder '$googleDriveFolder' does not exist." -Encoding UTF8 -NoNewline
    exit
}

# Ensure menu images directory exists
if (-Not (Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir | Out-Null
}

$jsonArray = @()

# Get all JPG images from Google Drive Desktop folder
$images = Get-ChildItem -Path $googleDriveFolder -Filter "*.jpg"

if ($images.Count -eq 0) {
    Add-Content -Path $errorLog -Value "[WARNING] No images found in '$googleDriveFolder'." -Encoding UTF8 -NoNewline
    exit
}

# ✅ 設定進度條
$totalImages = $images.Count
$currentImage = 0

Write-Host "🔄 開始轉換圖片，共有 $totalImages 張圖片需要處理..." -ForegroundColor Cyan

foreach ($image in $images) {
    try {
        $currentImage++
        $filename = $image.Name
        $fullsizePath = "$googleDriveFolder\$filename"
        $imgPath = "$imgDir\$filename"

        # 更新進度條
        Write-Progress -Activity "正在轉換圖片..." -Status "處理第 $currentImage / $totalImages 張圖片" -PercentComplete (($currentImage / $totalImages) * 100)

        # Extract metadata from the image file
        $category = @()
        $description = ""

        $shell = New-Object -ComObject Shell.Application
        $folder = $shell.Namespace((Get-Item $fullsizePath).DirectoryName)
        $file = $folder.ParseName((Get-Item $fullsizePath).Name)

        $title = $folder.GetDetailsOf($file, 21)  # Index 21 typically holds the Title metadata
        if (-not [string]::IsNullOrWhiteSpace($title)) {
            $filename = $title
        }

        $tags = $folder.GetDetailsOf($file, 18)  # "標籤 (Tags)" field
        if ($tags -ne $null -and $tags -ne "") {
            $category = $tags -split "; "  # Support multiple categories
        }

        $comment = $folder.GetDetailsOf($file, 24)  # "註解 (Comments)" field
        if ($comment -ne $null -and $comment -ne "") {
            $description = $comment
        }

        # ✅ 強制覆蓋縮圖，並輸出轉換過程
        Write-Host "📷 轉換圖片：$filename" -ForegroundColor Green

        # ✅ 強制覆蓋縮圖
        $img = [System.Drawing.Image]::FromFile($fullsizePath)

        # 設定 JPEG 壓縮品質（0-100，數值越高品質越好）
        $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
        $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
        $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 20) # 30% 品質

        # 以較低品質存成新圖片（即使已存在也會覆蓋）
        $img.Save($imgPath, $encoder, $encoderParams)

        # 釋放記憶體
        $img.Dispose()
        Write-Host "✅ 轉換完成：$filename" -ForegroundColor Cyan

        # Create JSON object
        $jsonArray += @{
            file = $imgPath
            thumbnail = $imgPath
            category = $category
            name = $filename
            description = $description
        }
    }
    catch {
        # Log any errors encountered during metadata extraction
        Write-Host "❌ 轉換失敗：$filename" -ForegroundColor Red
        Add-Content -Path $errorLog -Value "[ERROR] $_" -Encoding UTF8 -NoNewline
    }
}

# ✅ 完成後關閉進度條
Write-Progress -Activity "正在轉換圖片..." -Completed
Write-Host "🎉 所有圖片轉換完成！共處理 $totalImages 張圖片。" -ForegroundColor Green

# Convert JSON array to JSON file
$jsonOutput = $jsonArray | ConvertTo-Json -Depth 2
[System.IO.File]::WriteAllText($jsonFile, $jsonOutput, [System.Text.Encoding]::UTF8)

# Log success message
Add-Content -Path $errorLog -Value "[SUCCESS] data.json has been generated!" -Encoding UTF8 -NoNewline
Write-Host "📁 JSON 檔案已更新：$jsonFile" -ForegroundColor Cyan
