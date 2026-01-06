
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { InputContent } from '../types';

const PROMPT_TEMPLATE = `Bạn là một trợ lý AI chuyên gia dành cho giáo viên Việt Nam. Nhiệm vụ của bạn là tạo ra một bộ câu hỏi thi mới có format, độ khó và chủ đề tương tự với đề thi gốc được cung cấp. Hãy đảm bảo các câu hỏi mới phải khác biệt, không chỉ là diễn đạt lại câu chữ từ đề gốc.

Dưới đây là nội dung đề thi gốc:
---
{CONTEXT}
---

Hãy tạo ra một bộ câu hỏi tương tự dựa trên nội dung trên.

YÊU CẦU CỰC KỲ QUAN TRỌNG:
1.  **Ngôn ngữ phải là Tiếng Việt có đầy đủ dấu.** Ví dụ: viết "Câu 10. Nếu đường thẳng d tiếp xúc với đường tròn" thay vì "Cau 10. Neu duong thang d tiep xuc voi duong tron".
2.  **Đầu ra phải là văn bản thuần túy (plain text).** Mọi công thức toán học phải được đặt trong dấu \`$$\`, ví dụ: \`$$x^2-2x+1=0$$\`.
3.  **Không sử dụng bất kỳ định dạng Markdown nào khác** như tiêu đề (\`#\`), in đậm (\`**\`), hay danh sách (\`*\`, \`-\`).`;


export const generateSimilarQuestions = async (input: InputContent): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let model;
    let requestPayload;

    if (input.type === 'text') {
        model = 'gemini-3-flash-preview';
        const prompt = PROMPT_TEMPLATE.replace('{CONTEXT}', input.content);
        requestPayload = {
            model,
            contents: prompt,
        };
    } else if (input.type === 'image') {
        model = 'gemini 2.5 Pro';
        const prompt = PROMPT_TEMPLATE.replace('{CONTEXT}', "Nội dung được cung cấp trong hình ảnh đính kèm.");
        requestPayload = {
            model,
            contents: {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: input.content.mimeType,
                            data: input.content.data
                        }
                    }
                ]
            }
        };
    } else {
        throw new Error('Invalid input type');
    }

    try {
        const response: GenerateContentResponse = await ai.models.generateContent(requestPayload);
        const text = response.text;
        if (text) {
            return text;
        } else {
            throw new Error("Không nhận được nội dung từ AI. Phản hồi có thể đã bị chặn hoặc trống.");
        }
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Lỗi khi giao tiếp với Gemini API. Vui lòng thử lại sau.");
    }
};
