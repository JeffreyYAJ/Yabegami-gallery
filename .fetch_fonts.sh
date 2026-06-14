#!/usr/bin/env bash
set -euo pipefail
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

# fetch_font <out_dir> <google_css_url>
fetch_font() {
  local outdir="$1"; local url="$2"
  mkdir -p "$outdir"
  local css="$outdir/fonts.css"
  echo ">> $outdir"
  curl -s --max-time 30 -A "$UA" "$url" -o "$css"
  # collect unique woff2 urls
  local urls
  urls=$(grep -oE 'https://fonts.gstatic.com/[^)]+\.woff2' "$css" | sort -u)
  local count=0
  while IFS= read -r u; do
    [ -z "$u" ] && continue
    local base
    base=$(basename "$u")
    if [ ! -f "$outdir/$base" ]; then
      curl -s --max-time 30 -A "$UA" "$u" -o "$outdir/$base"
    fi
    # rewrite this url occurrence(s) to local basename
    # use | as sed delimiter
    sed -i "s|$u|$base|g" "$css"
    count=$((count+1))
  done <<< "$urls"
  echo "   $count fichiers woff2"
}

fetch_font "Hills/css/gfonts" "https://fonts.googleapis.com/css2?family=Cinzel&family=Dancing+Script&family=Roboto+Mono&display=swap"
fetch_font "Orrery solar/gfonts" "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Share+Tech+Mono&display=swap"
fetch_font "Ecosystem_tamagotchi/gfonts" "https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
fetch_font "Human clock/gfonts" "https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap"
fetch_font "Sakura Autumn/gfonts" "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400&family=Zen+Kaku+Gothic+New:wght@300&display=swap"

echo "TERMINE"
