# Force PowerShell to use UTF-8 (fixes encoding issues)
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Define directories and files
$imgDir = "menuImg\fullsize"
$thumbDir = "menuImg/thumbnails"
$jsonFile = "data.json"
$errorLog = "error.log"

# Clear the error log (Using UTF8 instead of utf8NoBOM)
Set-Content -Path $errorLog -Value "" -Encoding UTF8 -NoNewline

# ✅ Check if the "menuImg" directory exists
if (-Not (Test-Path $imgDir)) {
    Add-Content -Path $errorLog -Value "[ERROR] The folder '$imgDir' does not exist." -Encoding UTF8 -NoNewline
    exit
}
if (-Not (Test-Path $thumbDir)) {
    Add-Content -Path $errorLog -Value "[ERROR] The folder '$thumbDir' does not exist." -Encoding UTF8 -NoNewline
    exit
}

# Get all JPG files from "menuImg" folder
$images = Get-ChildItem -Path $imgDir -Filter "*.jpg"

# ✅ If no JPG files are found, log a warning
if ($images.Count -eq 0) {
    Add-Content -Path $errorLog -Value "[WARNING] No images found in '$imgDir'." -Encoding UTF8 -NoNewline
    exit
}

$jsonArray = @()

foreach ($image in $images) {
    try {
        $filename = $image.BaseName -replace "_", "-"
        $parts = $filename -split "-"

        # ✅ Check filename format (date-category-name.jpg)
        if ($parts.Length -lt 3) {
            throw "[ERROR] Invalid filename format: '$filename'"
        }

        $date = $parts[0]
        $category = $parts[1].ToLower()
        $name = ($parts[2..($parts.Length - 1)] -join " ")

        # check thumb imges is exist
        $thumbPath = "$thumbDir/$($image.Name)"
        if (-Not (Test-Path $thumbPath)) {
            throw "[ERROR] Missing thumbnail for '$($image.Name)'"
        }

        # Create JSON object
        $jsonArray += @{
            file = "$imgDir/$($image.Name)"
            thumbnail = "$thumbPath"
            category = $category
            name = $name
            description = "No description"
        }
    } catch {
        # ✅ Log filename parsing errors
        Add-Content -Path $errorLog -Value "[ERROR] $_" -Encoding UTF8 -NoNewline
    }
}

# Convert to JSON and save (Using UTF8 instead of utf8NoBOM)
$jsonOutput = $jsonArray | ConvertTo-Json -Depth 2 -Compress
[System.IO.File]::WriteAllText($jsonFile, $jsonOutput, [System.Text.Encoding]::UTF8)

# ✅ Log success message instead of displaying directly
Add-Content -Path $errorLog -Value "[SUCCESS] data.json has been generated!" -Encoding UTF8 -NoNewline
