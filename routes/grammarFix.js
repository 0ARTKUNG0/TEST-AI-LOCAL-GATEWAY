const express = require('express');
const router = express.Router();
const lmStudioService = require('../services/lmStudioService');

/**
 * POST /grammar-fix
 * แก้ไขไวยากรณ์ภาษาไทย
 * 
 * Request Body:
 * {
 *   "text": "ข้อความที่ต้องการแก้ไข"
 * }
 * 
 * Response:
 * {
 *   "corrected_text": "ข้อความที่แก้ไขแล้ว",
 *   "changes": [
 *     { "from": "คำผิด", "to": "คำถูก" }
 *   ]
 * }
 */
router.post('/', async (req, res) => {
    try {
        const { text } = req.body;

        // Validate request
        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({
                error: 'validation_error',
                message: 'กรุณาระบุข้อความที่ต้องการตรวจสอบ (text)',
                field: 'text'
            });
        }

        console.log(`\n📝 Grammar Fix Request:`);
        console.log(`   Text: "${text}"`);

        // Call LM Studio service
        const result = await lmStudioService.fixGrammar(text);

        console.log(`✅ Success:`, result);

        // Return result
        res.json(result);

    } catch (error) {
        console.error('❌ Error processing request:', error.message);

        // Check if it's a connection error
        if (error.message.includes('ไม่สามารถเชื่อมต่อ') || error.code === 'ECONNREFUSED') {
            return res.status(503).json({
                error: 'connection_error',
                message: 'ไม่สามารถเชื่อมต่อกับ LM Studio ได้ กรุณาตรวจสอบว่า LM Studio กำลังทำงานอยู่',
                details: error.message
            });
        }

        // Check if it's a JSON parsing error
        if (error instanceof SyntaxError) {
            return res.status(502).json({
                error: 'parse_error',
                message: 'ไม่สามารถแปลงผลลัพธ์จาก LM Studio ได้',
                details: error.message
            });
        }

        // Generic error
        res.status(500).json({
            error: 'internal_error',
            message: 'เกิดข้อผิดพลาดในการประมวลผล',
            details: error.message
        });
    }
});

module.exports = router;
