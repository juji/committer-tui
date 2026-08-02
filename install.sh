#!/usr/bin/env bash
# Downloads the latest committer binary from GitHub Releases and installs it.
set -euo pipefail

REPO="juji/committer-tui"
INSTALL_DIR="${COMMITTER_INSTALL_DIR:-$HOME/.local/bin}"

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
chmod +x "$dest"

echo "Installed $version to $dest"

# On macOS, first execution of a freshly-written binary can race the kernel's
# code-signature validation and get killed even though the signature is
# valid. Retry a few times with a short wait so that race doesn't surprise
# the user later, and confirm the binary actually reports the version we
# just installed.
expected="${version#v}"
ok=""
for attempt in 1 2 3; do
  actual="$("$dest" --version 2>/dev/null || true)"
  if [ "$actual" = "$expected" ]; then
    ok=1
    break
  fi
  sleep 2
done
if [ -z "$ok" ]; then
  echo "warning: could not verify $dest reports version $expected (got: '${actual:-}')" >&2
fi

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *) echo "warning: $INSTALL_DIR is not on your PATH. Add it with:" && echo "  export PATH=\"$INSTALL_DIR:\$PATH\"" ;;
esac
