@echo off
setlocal
set "DIR=%~dp0"
set "MAVEN_CMD=%DIR%..\tools\maven\apache-maven-3.9.9\bin\mvn.cmd"

if exist "%MAVEN_CMD%" (
    call "%MAVEN_CMD%" %*
) else (
    mvn %*
)

