#!/bin/bash
# Render the whole film frame-exact in parallel chunks, add the soundtrack, write one MP4.
# Usage: ./make-film.sh [jobs=3]
set -euo pipefail
cd "$(dirname "$0")"
JOBS=${1:-3}
DUR=45.5; FPS=60
FR=$(python3 -c "print(round($DUR*$FPS))")
mkdir -p out/chunks
python3 make-audio.py out/audio.wav
pids=()
for ((k=0; k<JOBS; k++)); do
  a=$(( FR * k / JOBS )); b=$(( FR * (k+1) / JOBS ))
  s=$(python3 -c "print($a/$FPS)"); e=$(python3 -c "print($b/$FPS)")
  node render.js video out/chunks/c$k.mp4 $s $e 2> out/chunks/c$k.log &
  pids+=($!)
done
for p in "${pids[@]}"; do wait $p; done
: > out/chunks/list.txt
for ((k=0; k<JOBS; k++)); do echo "file 'c$k.mp4'" >> out/chunks/list.txt; done
ffmpeg -y -loglevel error -f concat -safe 0 -i out/chunks/list.txt -i out/audio.wav \
  -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/incubator-campus-45s-1080p60.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames -show_entries format=duration -of compact out/incubator-campus-45s-1080p60.mp4
