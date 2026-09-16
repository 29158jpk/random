$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$targetUrl = "http://localhost:3000"
$outputFile = "C:\Users\Horizon\.gemini\antigravity-ide\brain\3e42fd0a-3e82-42a0-8f51-f57040fdbced\localhost_fullpage.png"
$tempUserDir = "C:\Users\Horizon\AppData\Local\Temp\chrome_shot_full"

if (Test-Path $tempUserDir) {
    Remove-Item -Path $tempUserDir -Recurse -Force -ErrorAction SilentlyContinue
}

$proc = Start-Process -FilePath $chromePath -ArgumentList @(
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--window-size=1440,2400",
    "--user-data-dir=$tempUserDir",
    "--screenshot=$outputFile",
    $targetUrl
) -PassThru -Wait

Write-Output "ExitCode: $($proc.ExitCode)"
Write-Output "File exists: $(Test-Path $outputFile)"
