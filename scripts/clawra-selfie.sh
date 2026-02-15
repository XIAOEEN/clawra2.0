#!/bin/bash
# grok-imagine-send.sh
# Generate an image with Grok Imagine and send it via OpenClaw
#
# Usage: ./grok-imagine-send.sh "<prompt>" "<channel>" ["<caption>"]
#
# Environment variables required:
#   VVEAI_API_KEY - Your vveai API key (required)
#   VVEAI_BASE_URL - API base URL (default: https://api.vveai.com)
#   VVEAI_MODEL - Model name (default: doubao-seedream-4-5-251128)
#
# Example:
#   ./grok-imagine-send.sh "A sunset over mountains" "#art" "Check this out!"

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check required environment variables
if [ -z "${VVEAI_API_KEY:-}" ]; then
    log_error "VVEAI_API_KEY environment variable not set"
    echo "Get your API key from your vveai provider"
    exit 1
fi

# Set default API configuration
VVEAI_BASE_URL="${VVEAI_BASE_URL:-https://api.vveai.com}"
VVEAI_MODEL="${VVEAI_MODEL:-doubao-seedream-4-5-251128}"

# Check for jq
if ! command -v jq &> /dev/null; then
    log_error "jq is required but not installed"
    echo "Install with: brew install jq (macOS) or apt install jq (Linux)"
    exit 1
fi

# Check for openclaw
if ! command -v openclaw &> /dev/null; then
    log_warn "openclaw CLI not found - will attempt direct API call"
    USE_CLI=false
else
    USE_CLI=true
fi

# Parse arguments
PROMPT="${1:-}"
CHANNEL="${2:-}"
CAPTION="${3:-Generated with Grok Imagine}"
ASPECT_RATIO="${4:-1:1}"
OUTPUT_FORMAT="${5:-jpeg}"

if [ -z "$PROMPT" ] || [ -z "$CHANNEL" ]; then
    echo "Usage: $0 <prompt> <channel> [caption] [aspect_ratio] [output_format]"
    echo ""
    echo "Arguments:"
    echo "  prompt        - Image description (required)"
    echo "  channel       - Target channel (required) e.g., #general, @user"
    echo "  caption       - Message caption (default: 'Generated with Grok Imagine')"
    echo "  aspect_ratio  - Image ratio (default: 1:1) Options: 2:1, 16:9, 4:3, 1:1, 3:4, 9:16"
    echo "  output_format - Image format (default: jpeg) Options: jpeg, png, webp"
    echo ""
    echo "Example:"
    echo "  $0 \"A cyberpunk city at night\" \"#art-gallery\" \"AI Art!\""
    exit 1
fi

log_info "Generating image with vveai API..."
log_info "Model: $VVEAI_MODEL"
log_info "Prompt: $PROMPT"
log_info "Aspect ratio: $ASPECT_RATIO"

# Map aspect_ratio to size (width x height)
case "$ASPECT_RATIO" in
    "1:1") SIZE="1024x1024" ;;
    "16:9") SIZE="1024x576" ;;
    "9:16") SIZE="576x1024" ;;
    "4:3") SIZE="1024x768" ;;
    "3:4") SIZE="768x1024" ;;
    *) SIZE="1024x1024" ;;
esac

# Generate image via vveai API
RESPONSE=$(curl -s -X POST "$VVEAI_BASE_URL/v1/images/generations" \
    -H "Authorization: Bearer $VVEAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"model\": \"$VVEAI_MODEL\",
        \"prompt\": $(echo "$PROMPT" | jq -Rs .),
        \"n\": 1,
        \"size\": \"$SIZE\"
    }")

# Check for errors in response
if echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
    ERROR_MSG=$(echo "$RESPONSE" | jq -r '.error // .detail // "Unknown error"')
    log_error "Image generation failed: $ERROR_MSG"
    exit 1
fi

# Extract image URL (try both OpenAI format and fal.ai format)
IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data[0].url // .images[0].url // empty')

if [ -z "$IMAGE_URL" ]; then
    log_error "Failed to extract image URL from response"
    echo "Response: $RESPONSE"
    exit 1
fi

log_info "Image generated successfully!"
log_info "URL: $IMAGE_URL"

# Get revised prompt if available
REVISED_PROMPT=$(echo "$RESPONSE" | jq -r '.data[0].revised_prompt // .revised_prompt // empty')
if [ -n "$REVISED_PROMPT" ]; then
    log_info "Revised prompt: $REVISED_PROMPT"
fi

# Send via OpenClaw
log_info "Sending to channel: $CHANNEL"

if [ "$USE_CLI" = true ]; then
    # Use OpenClaw CLI
    openclaw message send \
        --action send \
        --channel "$CHANNEL" \
        --message "$CAPTION" \
        --media "$IMAGE_URL"
else
    # Direct API call to local gateway
    GATEWAY_URL="${OPENCLAW_GATEWAY_URL:-http://localhost:18789}"
    GATEWAY_TOKEN="${OPENCLAW_GATEWAY_TOKEN:-}"

    HEADERS="-H \"Content-Type: application/json\""
    if [ -n "$GATEWAY_TOKEN" ]; then
        HEADERS="$HEADERS -H \"Authorization: Bearer $GATEWAY_TOKEN\""
    fi

    curl -s -X POST "$GATEWAY_URL/message" \
        -H "Content-Type: application/json" \
        ${GATEWAY_TOKEN:+-H "Authorization: Bearer $GATEWAY_TOKEN"} \
        -d "{
            \"action\": \"send\",
            \"channel\": \"$CHANNEL\",
            \"message\": \"$CAPTION\",
            \"media\": \"$IMAGE_URL\"
        }"
fi

log_info "Done! Image sent to $CHANNEL"

# Output JSON for programmatic use
echo ""
echo "--- Result ---"
jq -n \
    --arg url "$IMAGE_URL" \
    --arg channel "$CHANNEL" \
    --arg prompt "$PROMPT" \
    '{
        success: true,
        image_url: $url,
        channel: $channel,
        prompt: $prompt
    }'
