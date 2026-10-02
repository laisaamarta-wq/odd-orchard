#!/bin/bash
# ODD ORCHARD — local preview launcher.  Run:  bash ~/Sites/odd-orchard/start.sh
cd "$(dirname "$0")" || exit 1
echo ""
echo "  ODD ORCHARD — every flavor has a keeper"
echo ""

# 1) Higgsfield assets → ./raw  (only the first time)
B=https://d8j0ntlcm91z4.cloudfront.net/user_3C15E03naKYn0k12cqxNShlIybX/hf_20261002_
mkdir -p raw
while read n id; do
  [ -s "raw/$n.png" ] || { echo "  ↓ $n"; curl -sSfL -o "raw/$n.png" "$B$id.png"; }
done <<LIST
bottle-kiwi 074054_34f4eaa7-25f7-46ce-b9fb-28179612de60
bottle-orange 074229_063911d2-88a2-4e46-82b3-761218f3fac5
bottle-cherry 074229_67052091-4bda-4dc1-aef1-ce6cbe3f0d22
bottle-pitaya 074229_1a26169c-1368-4ca1-88f8-a389a843991e
char-kiwi 074054_5758b9a5-5cd4-478e-a3e9-b3a1f29e4755
char-orange 074055_d91eb818-3d63-4301-8638-f232b29b2816
char-cherry 074054_c3e58313-2f0d-4084-aaef-c4cf15bafe9b
char-pitaya 074054_57580a16-ea7b-4b1e-a1c9-66d7fc353201
fruit-kiwi 074055_ba65caaa-c578-47e0-835d-8474eff41cde
fruit-orange 074055_aa04858f-aa42-49f6-9e6a-2022587f7fea
fruit-cherry 074054_17648896-8b0b-4c4b-a4d8-c95b381778a4
fruit-pitaya 074054_454c17c8-b57b-4f0c-82cd-deae0b088ee1
LIST

# 2) Node / npm
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.bun/bin:$HOME/.volta/bin:$PATH"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"
if ! command -v npm >/dev/null 2>&1; then
  echo "  Node.js is not installed. Install the LTS from https://nodejs.org and run this again."
  exit 1
fi
[ -d node_modules ] || { echo "  installing dependencies…"; npm install --no-audit --no-fund; }

# 3) wait for the processed web assets (Claude converts raw PNG → WebP)
if [ ! -f public/assets/.ready ]; then
  echo "  waiting for the processed assets…"
  for i in $(seq 1 300); do [ -f public/assets/.ready ] && break; sleep 2; done
fi

# 4) dev server
echo ""
echo "  LOCAL PREVIEW → http://localhost:5173"
echo ""
npm run dev -- --port 5173 --open 2>&1 | tee .dev.log
