# Free Metro ports (8081, 8083) left by old Expo sessions on Windows.
$ports = 8081, 8083, 19000, 19001
foreach ($port in $ports) {
  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object {
      $procId = $_.OwningProcess
      Write-Host "Stopping PID $procId (port $port)"
      Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "Done. Start Expo with: npm run start:clear"
