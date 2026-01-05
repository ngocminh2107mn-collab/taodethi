
import type { InputContent } from '../types';

// These globals are expected to be available from the scripts loaded in index.html
declare const window: any;

// Set up the PDF.js worker.
if (window.pdfjsLib) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.3.136/build/pdf.worker.min.js`;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                // reader.result is "data:mime/type;base64,..."
                // We need to strip the prefix
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to read file as base64 string.'));
            }
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

const parsePdf = async (file: File): Promise<string> => {
    if (!window.pdfjsLib) {
        throw new Error('Thư viện xử lý PDF (pdf.js) chưa được tải. Vui lòng kiểm tra kết nối mạng và tải lại trang.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return fullText;
};

const parseDocx = async (file: File): Promise<string> => {
    if (!window.mammoth) {
        throw new Error('Thư viện xử lý DOCX (mammoth.js) chưa được tải. Vui lòng kiểm tra kết nối mạng và tải lại trang.');
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value;
};

export const parseFile = async (file: File): Promise<InputContent> => {
    const fileType = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (fileType.startsWith('image/')) {
        const base64Data = await fileToBase64(file);
        return {
            type: 'image',
            content: {
                mimeType: file.type,
                data: base64Data,
            },
        };
    } else if (extension === 'pdf' || fileType === 'application/pdf') {
        const text = await parsePdf(file);
        return { type: 'text', content: text };
    } else if (extension === 'docx' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const text = await parseDocx(file);
        return { type: 'text', content: text };
    } else {
        throw new Error('Loại file không được hỗ trợ. Vui lòng chọn PDF, DOCX, hoặc file ảnh.');
    }
};