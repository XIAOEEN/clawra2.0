#!/bin/bash
# generate-portrait.sh
# 根据用户信息生成个性化参考图片
#
# Usage: ./generate-portrait.sh [options]
#
# Options:
#   --birth-year    出生年份 (e.g., 2000)
#   --birth-month   出生月份 (1-12)
#   --birth-day     出生日期 (1-31)
#   --sex           性别 (male/female)
#   --mbti          MBTI类型 (e.g., INTJ, ENFP)
#   --name          用户名称 (可选)
#   --age           生成年龄 (默认22)
#
# Example:
#   ./generate-portrait.sh --birth-year 2000 --birth-month 5 --birth-day 15 --sex female --mbti INFP

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# 检查环境变量
if [ -z "${VVEAI_API_KEY:-}" ]; then
    log_error "VVEAI_API_KEY environment variable not set"
    echo "Please set your API key: export VVEAI_API_KEY=your_key"
    exit 1
fi

# 检查 Node.js 和 ts-node
if ! command -v node &> /dev/null; then
    log_error "Node.js is required but not installed"
    exit 1
fi

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 检查依赖是否安装
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    log_step "Installing dependencies..."
    cd "$PROJECT_ROOT"
    npm install
fi

# 运行生成脚本
log_step "Generating portrait..."
cd "$PROJECT_ROOT"
npx ts-node src/index.ts "$@"

log_info "Done!"
</content>
