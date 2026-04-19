#!/bin/bash
# fix-svg.sh — Ensure all SVGs under public/assets/ have explicit width and height attributes.
# If missing, derives them from the viewBox attribute (viewBox="minX minY width height").
# PixiJS requires width/height to determine intrinsic texture size.

set -euo pipefail

SVG_DIR="public/assets"
if [ ! -d "$SVG_DIR" ]; then
  echo "fix-svg: no $SVG_DIR directory — skipping"
  exit 0
fi

total=0
fixed=0

while IFS= read -r svg; do
  total=$((total + 1))

  # Read the opening <svg ...> tag (may span multiple lines, grab first 5 lines)
  head_content=$(head -5 "$svg")

  # Check if width attribute already exists on the <svg> tag
  if echo "$head_content" | grep -qP '<svg[^>]*\bwidth\s*='; then
    continue
  fi

  # Extract viewBox value
  viewbox=$(echo "$head_content" | grep -oP 'viewBox\s*=\s*"[^"]*"' | head -1 | grep -oP '"[^"]*"' | tr -d '"')
  if [ -z "$viewbox" ]; then
    echo "fix-svg: WARNING — $svg has no width and no viewBox, cannot fix"
    continue
  fi

  # Parse viewBox: "minX minY width height"
  vb_w=$(echo "$viewbox" | awk '{print $3}')
  vb_h=$(echo "$viewbox" | awk '{print $4}')

  if [ -z "$vb_w" ] || [ -z "$vb_h" ]; then
    echo "fix-svg: WARNING — $svg has malformed viewBox=\"$viewbox\", skipping"
    continue
  fi

  # Inject width and height after <svg (before the first closing >)
  sed -i "s/<svg /<svg width=\"${vb_w}\" height=\"${vb_h}\" /" "$svg"
  fixed=$((fixed + 1))
  echo "fix-svg: fixed $svg → width=\"${vb_w}\" height=\"${vb_h}\""

done < <(find "$SVG_DIR" -name '*.svg' -type f)

echo "fix-svg: checked $total files, fixed $fixed"
