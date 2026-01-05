
import { useCallback } from 'react';

// These globals are expected to be available from the scripts loaded in index.html
declare const window: any;

export const useDocxDownloader = () => {
    const downloadAsDocx = useCallback((markdownContent: string, fileName: string) => {
        // Access the library through the window object to be explicit and prevent ReferenceError
        if (typeof window.docx === 'undefined') {
            console.error('docx.js library not loaded');
            alert('Không thể tạo file Word. Thư viện cần thiết (docx.js) chưa được tải. Vui lòng tải lại trang và thử lại.');
            return;
        }
        if (typeof window.saveAs === 'undefined') {
            console.error('FileSaver.js library not loaded');
            alert('Không thể tải file. Thư viện cần thiết (FileSaver.js) chưa được tải. Vui lòng tải lại trang và thử lại.');
            return;
        }

        const { Document, Packer, Paragraph, TextRun } = window.docx;
        
        const doc = new Document({
            sections: [{
                properties: {},
                children: markdownContent.split('\n').map(line => 
                    new Paragraph({
                        children: [new TextRun(line.trim())],
                    })
                ),
            }],
        });

        Packer.toBlob(doc).then(blob => {
            window.saveAs(blob, fileName);
        }).catch(error => {
            console.error("Error creating DOCX file:", error);
            alert("Đã xảy ra lỗi khi tạo file Word.");
        });
    }, []);

    return { downloadAsDocx };
};