@echo off
set PATH=C:\Ruby32-x64\bin;%PATH%
cd /d "%~dp0"
bundle exec jekyll serve --port 4000 --host 127.0.0.1
