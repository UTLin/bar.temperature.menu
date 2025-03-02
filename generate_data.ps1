# Force PowerShell to use UTF-8 (fixes encoding issues)
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Define directories and files
$imgDir = "menuImg"
$jsonFile = "data.json"
$errorLog = "error.log"

# Clear the error log (Using UTF8 instead of utf8NoBOM)
Set-Content -Path $errorLog -Value "" -Encoding UTF8 -NoNewline

# ✅ Check if the "menuImg" directory exists
if (-Not (Test-Path $imgDir)) {
    $msg = "[ERROR] The directory '$imgDir' does not exist. Please check the folder name."
    Add-Content -Path $errorLog -Value $msg -Encoding UTF8 -NoNewline
    Start-Process notepad.exe $errorLog
    exit
}

# Get all JPG files from "menuImg" folder
$images = Get-ChildItem -Path $imgDir -Filter "*.jpg"

# ✅ If no JPG files are found, log a warning
if ($images.Count -eq 0) {
    $msg = "[WARNING] No JPG files found in the 'menuImg' directory."
    Add-Content -Path $errorLog -Value $msg -Encoding UTF8 -NoNewline
    Start-Process notepad.exe $errorLog
    exit
}

$jsonArray = @()

foreach ($image in $images) {
    try {
        $filename = $image.BaseName
        $parts = $filename -split "-"

        # ✅ Check filename format (date-category-name.jpg)
        if ($parts.Length -lt 3) {
            $msg = "[ERROR] Invalid filename format: '$filename' (Expected format: date-category-name.jpg)"
            Add-Content -Path $errorLog -Value $msg -Encoding UTF8 -NoNewline
            continue
        }

        $date = $parts[0]
        $category = $parts[1]
        $name = ($parts[2..($parts.Length - 1)] -join " ")  # Merge remaining parts as the name

        # Create JSON object
        $jsonArray += @{
            file = "$imgDir/$($image.Name)"
            category = $category
            name = $name
            description = "No description"
        }
    } catch {
        # ✅ Log filename parsing errors
        $msg = "[ERROR] Failed to parse file '$($image.Name)': " + $_.Exception.Message
        Add-Content -Path $errorLog -Value $msg -Encoding UTF8 -NoNewline
    }
}

# Convert to JSON and save (Using UTF8 instead of utf8NoBOM)
$jsonOutput = $jsonArray | ConvertTo-Json -Depth 2 -Compress
[System.IO.File]::WriteAllText($jsonFile, $jsonOutput, [System.Text.Encoding]::UTF8)

# ✅ Log success message instead of displaying directly
$msg = "[SUCCESS] data.json has been successfully generated!"
Add-Content -Path $errorLog -Value $msg -Encoding UTF8 -NoNewline

# ✅ Open error.log to check results
Start-Process notepad.exe $errorLog
