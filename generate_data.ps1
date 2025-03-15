# Force PowerShell to use UTF-8 encoding
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Define directories
$imgDir = "menuImg/fullsize"
$thumbDir = "menuImg/thumbnails"
$jsonFile = "data.json"
$errorLog = "error.log"

# Clear the error log before execution
Set-Content -Path $errorLog -Value "" -Encoding UTF8 -NoNewline

# Ensure directories exist
if (-Not (Test-Path $imgDir)) {
    Add-Content -Path $errorLog -Value "[ERROR] The folder '$imgDir' does not exist." -Encoding UTF8 -NoNewline
    exit
}
if (-Not (Test-Path $thumbDir)) {
    Add-Content -Path $errorLog -Value "[ERROR] The folder '$thumbDir' does not exist." -Encoding UTF8 -NoNewline
    exit
}

# Get all JPG files in the fullsize directory
$images = Get-ChildItem -Path $imgDir -Filter "*.jpg"

# If no images found, log a warning
if ($images.Count -eq 0) {
    Add-Content -Path $errorLog -Value "[WARNING] No images found in '$imgDir'." -Encoding UTF8 -NoNewline
    exit
}

$jsonArray = @()

foreach ($image in $images) {
    try {
        $filename = $image.BaseName
        $fullsizePath = "$imgDir/$($image.Name)"
        $thumbPath = "$thumbDir/$($image.Name)"

        # Extract metadata from the image file
        $shell = New-Object -ComObject Shell.Application
        $folder = $shell.Namespace((Get-Item $fullsizePath).DirectoryName)
        $file = $folder.ParseName((Get-Item $fullsizePath).Name)

        # Read tags (used for category) and comments (used for description)
        $category = @()
        $description = "No description"

        $tags = $folder.GetDetailsOf($file, 18)  # "標籤 (Tags)" field
        if ($tags -ne $null -and $tags -ne "") {
            $category = $tags -split "; "  # Support multiple categories
        }

        $comment = $folder.GetDetailsOf($file, 24)  # "註解 (Comments)" field
        if ($comment -ne $null -and $comment -ne "") {
            $description = $comment
        }

        # Ensure the thumbnail exists
        if (-Not (Test-Path $thumbPath)) {
            throw "[ERROR] Missing thumbnail for '$($image.Name)'"
        }

        # Construct JSON object
        $jsonArray += @{
            file = $fullsizePath
            thumbnail = $thumbPath
            category = $category
            name = $filename  # Keep filename as name
            description = $description
        }
    }
    catch {
        # Log any errors encountered during metadata extraction
        Add-Content -Path $errorLog -Value "[ERROR] $_" -Encoding UTF8 -NoNewline
    }
}

# Convert to JSON and save (Ensure UTF-8 encoding)
$jsonOutput = $jsonArray | ConvertTo-Json -Depth 2 -Compress
[System.IO.File]::WriteAllText($jsonFile, $jsonOutput, [System.Text.Encoding]::UTF8)

# Log success message
Add-Content -Path $errorLog -Value "[SUCCESS] data.json has been generated!" -Encoding UTF8 -NoNewline
