# 數據庫設置指南

您的系統上已經運行著本地 PostgreSQL 18。以下是完整的設置步驟：

## 方案 A：使用本地 PostgreSQL（推薦）

### 1. 創建數據庫和用戶

```bash
# 使用您的 postgres 超級用戶密碼登錄
/Library/PostgreSQL/18/bin/psql -U postgres -h localhost

# 在 psql 提示符下執行：
CREATE USER marketing WITH PASSWORD 'marketing';
CREATE DATABASE marketing OWNER marketing;
GRANT ALL PRIVILEGES ON DATABASE marketing TO marketing;
\q
```

### 2. 更新 .env 文件

編輯 `backend/.env`，將 DATABASE_URL 改為：
```env
DATABASE_URL=postgresql+asyncpg://marketing:marketing@localhost:5432/marketing
```

### 3. 運行數據庫遷移

```bash
cd backend
source .venv/bin/activate  # 或在 Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
```

### 4. 測試 LLM 配置

```bash
python test_llm_config.py
```

---

## 方案 B：停止本地 PostgreSQL 並使用 Docker

### 1. 停止本地 PostgreSQL

```bash
# 停止 PostgreSQL 服務
sudo /Library/PostgreSQL/18/bin/pg_ctl stop -D /Library/PostgreSQL/18/data

# 或者，禁用開機自啟動
sudo launchctl unload /Library/LaunchDaemons/com.edb.launchd.postgresql-18.plist
```

### 2. 啟動 Docker PostgreSQL

```bash
docker compose up -d postgres redis
```

### 3. 使用默認 DATABASE_URL

```env
DATABASE_URL=postgresql+asyncpg://marketing:marketing@localhost:5432/marketing
```

### 4. 運行數據庫遷移

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
```

---

## 驗證設置

```bash
# 測試數據庫連接
cd backend
python -c "
import asyncio
from app.config import get_settings
from sqlalchemy.ext.asyncio import create_async_engine

async def test():
    settings = get_settings()
    engine = create_async_engine(settings.database_url)
    async with engine.connect() as conn:
        result = await conn.execute('SELECT version()')
        print('✅ Database connection successful!')
        print(f'PostgreSQL version: {result.scalar()}')
    await engine.dispose()

asyncio.run(test())
"
```

---

## 當前狀態

- ✅ Redis 正在運行 (Docker)
- ❌ PostgreSQL Docker 容器無法啟動（端口 5432 被佔用）
- ✅ 本地 PostgreSQL 18 正在運行

**建議：** 使用方案 A（本地 PostgreSQL），因為它已經在運行了。
