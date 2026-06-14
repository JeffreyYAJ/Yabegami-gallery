#!/usr/bin/env bash
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"

fetch_font() {
  local outdir="$1"; local url="$2"
  mkdir -p "$outdir"
  local css="$outdir/fonts.css"
  echo ">> $outdir"
  curl -s --retry 5 --retry-all-errors --max-time 40 -A "$UA" "$url" -o "$css"
  local urls
  urls=$(grep -oE 'https://fonts.gstatic.com/[^)]+\.woff2' "$css" | sort -u)
  local total ok
  total=$(echo "$urls" | grep -c . || true)
  ok=0
  while IFS= read -r u; do
    [ -z "$u" ] && continue
    local base
    base=$(basename "$u")
    if [ ! -s "$outdir/$base" ]; then
      curl -s --retry 6 --retry-all-errors --max-time 40 -A "$UA" "$u" -o "$outdir/$base"
    fi
    if [ -s "$outdir/$base" ]; then
      sed -i "s|$u|$base|g" "$css"
      ok=$((ok+1))
    else
      echo "   ECHEC: $base"
    fi
  done <<< "$urls"
  echo "   $ok/$total fichiers woff2 OK"
}

fetch_font "Human clock/gfonts" "https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&display=swap"
fetch_font "Sakura Autumn/gfonts" "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@300;400&family=Zen+Kaku+Gothic+New:wght@300&display=swap"
echo "TERMINE"
