# AI Local Gateway

REST API Gateway สำหรับเชื่อมต่อกับ LM Studio เพื่อตรวจสอบและแก้ไขไวยากรณ์ภาษาไทย

## 🚀 Features

- ✅ REST API Endpoint สำหรับแก้ไขไวยากรณ์ภาษาไทย
- ✅ รองรับการปรับโทนภาษา (formal, casual, neutral, polite)
- ✅ Structured JSON Output จาก LM Studio
- ✅ Error Handling พร้อมข้อความภาษาไทย

## 📋 Requirements

- Node.js 18 หรือสูงกว่า
- LM Studio (running on localhost:1234)

## 🛠️ Installation

### 1. Clone หรือ Download โปรเจค

```bash
cd e:\AI_CLI_Model\ai-local-gateway
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment (Optional)

แก้ไขไฟล์ `.env`:

```env
PORT=8080
LM_STUDIO_BASE_URL=http://localhost:1234
LM_STUDIO_MODEL=local-model
LM_STUDIO_TIMEOUT=60000
```

### 4. รัน Application

```bash
npm start
```

หรือ Development mode (auto-reload):

```bash
npm run dev
```

## 📡 API Endpoints

### POST /grammar-fix

แก้ไขไวยากรณ์และปรับโทนภาษา

**Request:**

```json
{
  "text": "ผมไปตลาดเมื่อวานนี้แล้วก็ซื่อของเยอะมาก",
  "tone": "formal"
}
```

**Response:**

```json
{
  "corrected_text": "ผมไปตลาดเมื่อวานนี้และซื้อสินค้าจำนวนมาก",
  "tone": "formal"
}
```

**Tone Options:**

- `formal` - ภาษาทางการ
- `casual` - ภาษาลำลอง
- `neutral` - กลางๆ (default)
- `polite` - สุภาพ

### GET /health

Health check endpoint

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-12-18T06:00:00.000Z"
}
```

### GET /

API Info

**Response:**

```json
{
    "name": "AI Local Gateway",
    "version": "1.0.0",
    "description": "Thai Grammar Correction API powered by LM Studio",
    "endpoints": {...}
}
```

## 🧪 Testing with cURL

```bash
curl -X POST http://localhost:8080/grammar-fix \
  -H "Content-Type: application/json" \
  -d "{\"text\": \"ผมไปตลาดเมื่อวานนี้แล้วก็ซื้อของเยอะมาก\", \"tone\": \"formal\"}"
```

## 🧪 Testing with PowerShell

```powershell
$body = @{
    text = "ผมไปตลาดเมื่อวานนี้แล้วก็ซื้อของเยอะมาก"
    tone = "formal"
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:8080/grammar-fix" -Method Post -Body $body -ContentType "application/json; charset=utf-8"
```

## 📁 Project Structure

```
ai-local-gateway/
├── package.json
├── .env
├── server.js
├── README.md
├── routes/
│   └── grammarFix.js
└── services/
    └── lmStudioService.js
```

## ⚠️ Important Notes

1. **LM Studio ต้องเปิดอยู่** ก่อนเรียกใช้ API
2. LM Studio ต้องโหลด Model ที่รองรับภาษาไทย
3. Default port คือ `8080` สามารถเปลี่ยนได้ใน `.env`

## 📝 License

MIT License
