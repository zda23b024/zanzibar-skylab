# Optional authoring tool. Runtime/deployment needs only the committed WAV.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Speech
$projectRoot = Split-Path $PSScriptRoot -Parent
$manifest = Get-Content (Join-Path $projectRoot 'src/components/demo/narrationScript.json') -Raw | ConvertFrom-Json
$rate = 22050
$pcm = New-Object byte[] (175 * $rate * 2)
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
try {
  $synth.SelectVoice('Microsoft Hazel Desktop')
  $synth.Rate = 1
  $tooLong = $false
  foreach ($scene in $manifest) {
    $memory = New-Object System.IO.MemoryStream
    try {
      $format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo($rate, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
      $synth.SetOutputToAudioStream($memory, $format)
      $synth.Speak($scene.text)
      $bytes = $memory.ToArray()
      $slot = ($scene.end - $scene.start) * $rate * 2
      if ($bytes.Length -gt $slot) { Write-Output "OVERFLOW $($scene.title): $([math]::Round($bytes.Length / ($rate * 2), 2)) seconds"; $tooLong = $true; continue }
      [Array]::Copy($bytes, 0, $pcm, ($scene.start * $rate * 2), $bytes.Length)
      Write-Output "$($scene.title): $([math]::Round($bytes.Length / ($rate * 2), 2)) seconds"
    } finally { $memory.Dispose() }
  }
} finally { $synth.Dispose() }
if ($tooLong) { throw 'Shorten overflowing scenes before generating the timing draft.' }
$output = Join-Path $projectRoot 'public/audio/competition-narration.en.wav'
$writer = New-Object System.IO.BinaryWriter([System.IO.File]::Create($output))
try {
  $writer.Write([Text.Encoding]::ASCII.GetBytes('RIFF')); $writer.Write([int](36 + $pcm.Length))
  $writer.Write([Text.Encoding]::ASCII.GetBytes('WAVEfmt ')); $writer.Write([int]16)
  $writer.Write([int16]1); $writer.Write([int16]1); $writer.Write([int]$rate)
  $writer.Write([int]($rate * 2)); $writer.Write([int16]2); $writer.Write([int16]16)
  $writer.Write([Text.Encoding]::ASCII.GetBytes('data')); $writer.Write([int]$pcm.Length); $writer.Write($pcm)
} finally { $writer.Dispose() }
