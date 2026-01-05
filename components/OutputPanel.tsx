
import React from 'react';
import { DownloadIcon, CopyIcon, CheckIcon, AlertTriangleIcon } from './icons/Icons';
import { useDocxDownloader } from '../hooks/useDocxDownloader';

// A new renderer that formats plain text and highlights LaTeX formulas.
const PlainTextWithLatexRenderer: React.FC<{ content: string }> = ({ content }) => {
    // Helper to parse a single line for LaTeX, wrapping it in a styled code tag.
    const renderLineWithLatex = (line: string, lineIndex: number) => {
        const parts = line.split('$$');
        if (parts.length <= 1) {
            return line; // No LaTeX found, return the line as is.
        }
        
        return parts.map((part, partIndex) => {
            if (partIndex % 2 === 1) { // This is the content inside $$
                return (
                    <code 
                        key={`${lineIndex}-${partIndex}`} 
                        className="bg-gray-100 dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 font-mono rounded-md px-1.5 py-1 mx-0.5"
                    >
                        {part}
                    </code>
                );
            }
            return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;
        });
    };

    return (
        <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none font-serif">
            {content.split('\n').map((line, index) => {
                if (line.trim() === '') {
                    // Use a div for spacing to represent empty lines, which is more consistent than <br>.
                    return <div key={index} className="h-4"></div>; 
                }
                return <p key={index} className="mb-2">{renderLineWithLatex(line, index)}</p>;
            })}
        </div>
    );
};


interface OutputPanelProps {
    content: string;
    isLoading: boolean;
    error: string;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ content, isLoading, error }) => {
    const { downloadAsDocx } = useDocxDownloader();
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-600"></div>
                    <h3 className="text-xl font-semibold mt-6">AI đang sáng tạo...</h3>
                    <p className="mt-2">Vui lòng chờ trong giây lát. Quá trình này có thể mất một chút thời gian.</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-full text-center text-red-600 dark:text-red-400">
                     <AlertTriangleIcon className="w-16 h-16" />
                    <h3 className="text-xl font-semibold mt-6">Đã xảy ra lỗi</h3>
                    <p className="mt-2 bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</p>
                </div>
            );
        }

        if (content) {
            return (
                <>
                    <div className="flex-grow overflow-y-auto pr-2">
                        <PlainTextWithLatexRenderer content={content} />
                    </div>
                    <div className="flex-shrink-0 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <button 
                            onClick={handleCopy} 
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-transparent bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:opacity-50 disabled:pointer-events-none dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        >
                            {copied ? <CheckIcon className="w-4 h-4 text-green-500" /> : <CopyIcon className="w-4 h-4" />}
                            {copied ? 'Đã sao chép' : 'Sao chép'}
                        </button>
                        <button 
                            onClick={() => downloadAsDocx(content, "de-thi-tuong-tu.docx")} 
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-transparent bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            <DownloadIcon className="w-4 h-4" />
                            Tải xuống Word
                        </button>
                    </div>
                </>
            );
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <div className="bg-primary-100 dark:bg-primary-900/50 rounded-full p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold mt-6">Kết quả sẽ hiển thị ở đây</h3>
                <p className="mt-2">Cung cấp đề thi gốc và để AI tạo ra một phiên bản mới cho bạn.</p>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg min-h-[600px] flex flex-col">
            {renderContent()}
        </div>
    );
};