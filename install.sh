#!/usr/bin/env bash
# Downloads the latest committer binary from GitHub Releases and installs it.
set -euo pipefail

REPO="juji/committer-tui"
INSTALL_DIR="${COMMITTER_INSTALL_DIR:-$HOME/.local/bin}"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

os="$(uname -s)"
arch="$(uname -m)"

exe=""
case "$os" in
  Darwin) platform="darwin" ;;
  Linux) platform="linux" ;;
  MINGW*|MSYS*|CYGWIN*)
    platform="windows"
    exe=".exe"
    ;;
  *) echo "error: unsupported OS: $os" >&2; exit 1 ;;
esac

case "$arch" in
  arm64|aarch64) platform_arch="arm64" ;;
  x86_64|amd64) platform_arch="x64" ;;
  *) echo "error: unsupported architecture: $arch" >&2; exit 1 ;;
esac

asset="committer-${platform}-${platform_arch}${exe}"
url="https://github.com/${REPO}/releases/latest/download/${asset}"

mkdir -p "$INSTALL_DIR"
dest="$INSTALL_DIR/committer${exe}"

version="$(curl -fsIL -o /dev/null -w '%{url_effective}' "https://github.com/${REPO}/releases/latest" | sed 's#.*/tag/##')"

echo "Downloading $asset ($version)..."
curl -fL "$url" -o "$dest"

echo "Verifying checksum..."
sha_url="https://github.com/${REPO}/releases/latest/download/${asset}.sha256"
sha_file="$(mktemp)"
trap 'rm -f "$sha_file"' EXIT
curl -fsL "$sha_url" -o "$sha_file"
expected_sha="$(awk '{print $1}' "$sha_file")"
actual_sha="$(shasum -a 256 "$dest" | awk '{print $1}')"
if [ "$actual_sha" != "$expected_sha" ]; then
  echo -e "${RED}✗ Checksum mismatch for $dest${NC}" >&2
  echo "  expected: $expected_sha" >&2
  echo "  actual:   $actual_sha" >&2
  rm -f "$dest"
  exit 1
fi
echo -e "${GREEN}✓ Checksum verified${NC}"

chmod +x "$dest"

echo "Installed $version to $dest"

# Verify the installed binary reports the version we just downloaded.
# Retries with a short wait since first execution of a freshly-written
# binary can race the OS's own executable validation and fail transiently.
expected="${version#v}"
ok=""
for attempt in 1 2 3; do
  echo "Checking installed binary (attempt $attempt)..."
  actual="$("$dest" --version 2>/dev/null || true)"
  if [ "$actual" = "$expected" ]; then
    ok=1
    break
  fi
  sleep 2
done
if [ -n "$ok" ]; then
  echo -e "${GREEN}✓ Verified $dest is version $expected${NC}"
else
  echo -e "${RED}✗ Could not verify $dest reports version $expected (got: '${actual:-}')${NC}" >&2
fi

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *) echo "warning: $INSTALL_DIR is not on your PATH. Add it with:" && echo "  export PATH=\"$INSTALL_DIR:\$PATH\"" ;;
esac
