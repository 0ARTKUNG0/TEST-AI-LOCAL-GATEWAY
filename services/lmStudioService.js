const axios = require('axios');
const process = require('process');
const dotenv = require('dotenv');
dotenv.config();

// System prompt for Thai grammar correction
const SYSTEM_PROMPT = `คุณคือ AI ผู้เชี่ยวชาญด้านการพิสูจน์อักษรภาษาไทย หน้าที่ของคุณคือ:
1. แก้ไขคำผิดไวยากรณ์และตัวสะกดในข้อความ (corrected_text) โดยไม่เปลี่ยนโทนเสียง
2. สร้างรายการการเปลี่ยนแปลง (changes) ที่ "ครบถ้วนสมบูรณ์"

กฎเหล็กสำหรับฟิลด์ 'changes':
- ต้องระบุ **ทุกคำ** ที่มีการเปลี่ยนแปลง แม้ว่าจะเป็นการแก้เพียงวรรณยุกต์หรือสระตัวเดียว (เช่น "วันนี" -> "วันนี้")
- ห้ามตัดทิ้ง ห้ามมองข้าม ห้ามรวมรายการ
- ถ้าคำผิดคำเดิมปรากฏ 2 ครั้ง ต้องมีรายการใน changes 2 รายการ
- ระบุเฉพาะคำที่ผิด (from) และคำที่ถูก (to) แบบ Minimal Change (ห้ามยกมาทั้งวลี)

ตัวอย่าง:
ผิด: "วันนีผมกำลงหิวและกำลงจะไป"
ถูก: "วันนี้ผมกำลังหิวและกำลังจะไป"
changes: [
  { "from": "วันนี", "to": "วันนี้" },
  { "from": "กำลง", "to": "กำลัง" },
  { "from": "กำลง", "to": "กำลัง" }
]`;

/**
 * LM Studio Service - Handles communication with LM Studio API
 */
class LMStudioService {
    constructor() {
        this.baseUrl = process.env.LM_STUDIO_BASE_URL;
        this.model = process.env.LM_STUDIO_MODEL;
        this.timeout = parseInt(process.env.LM_STUDIO_TIMEOUT) || 600000;
    }

    /**
     * Fix grammar of Thai text
     * @param {string} text - Text to correct
     * @returns {Promise<{corrected_text: string, changes: Array}>}
     */
    async fixGrammar(text) {
        const userMessage = `${text}`;

        const requestBody = {
            model: this.model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage }
            ],
            response_format: {
                type: 'json_schema',
                json_schema: {
                    name: 'grammar_fix_response',
                    strict: true,
                    schema: {
                        type: 'object',
                        properties: {
                            corrected_text: {
                                type: 'string',
                                description: 'ข้อความที่ถูกแก้ไขให้ถูกต้องตามหลักไวยากรณ์'
                            },
                            changes: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        from: {
                                            type: 'string',
                                            description: 'คำต้นฉบับ'
                                        },
                                        to: {
                                            type: 'string',
                                            description: 'คำที่แก้ไขแล้ว'
                                        }
                                    },
                                    required: ['from', 'to'],
                                    additionalProperties: false
                                },
                                description: 'รายการของการเปลี่ยนแปลงคำทุกคำที่เปลี่ยนแปลงส่งกลับมาให้ครบ'
                            }
                        },
                        required: ['corrected_text', 'changes'],
                        additionalProperties: false
                    }
                }
            },
            temperature: 0.1,
            max_tokens: 10000000,
        };

        console.log('📤 Sending request to LM Studio...');
        // console.log('   Text:', text.substring(0, 50) + (text.length > 50 ? '...' : ''));

        try {
            const response = await axios.post(
                `${this.baseUrl}/v1/chat/completions`,
                requestBody,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: this.timeout
                }
            );

            const content = response.data.choices[0]?.message?.content;
            
            if (!content) {
                throw new Error('No response content from LM Studio');
            }

            console.log('📥 Raw response:', content);

            // Parse JSON response
            const result = JSON.parse(content);
            
            console.log('✅ Parsed result:', result);
            
            return {
                corrected_text: result.corrected_text,
                changes: result.changes || []
            };

        } catch (error) {
            console.error('❌ LM Studio Error:', error.message);
            
            if (error.code === 'ECONNREFUSED') {
                throw new Error('ไม่สามารถเชื่อมต่อกับ LM Studio ได้ กรุณาตรวจสอบว่า LM Studio กำลังทำงานอยู่');
            }
            
            if (error.response) {
                throw new Error(`LM Studio error: ${error.response.status} - ${error.response.statusText}`);
            }
            
            throw error;
        }
    }
}

module.exports = new LMStudioService();
