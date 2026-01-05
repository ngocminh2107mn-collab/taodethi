
import React, { useState, useCallback, useRef } from 'react';
import { parseFile } from '../services/fileParserService';
import type { InputContent } from '../types';
import { InputMode } from '../types';
import { FileUpIcon, TextIcon, WandSparklesIcon, LoaderIcon } from './icons/Icons';

interface InputPanelProps {
    onGenerate: (input: InputContent) => void;
    isLoading: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({ onGenerate, isLoading }) => {
    const [mode, setMode] = useState<InputMode>(InputMode.Upload);
    const [textInput, setTextInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback(async (selectedFile: File | null) => {
        if (!selectedFile) return;

        setFileError('');
        if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            setFileError('Kích thước file không được vượt quá 10MB.');
            return;
        }
        setFile(selectedFile);
    }, []);

    const handleSubmit = async () => {
        setFileError('');
        if (isLoading) return;

        if (mode === InputMode.Text) {
            if (!textInput.trim()) {
                setFileError('Vui lòng nhập nội dung đề thi.');
                return;
            }
            onGenerate({ type: 'text', content: textInput });
        } else if (mode === InputMode.Upload && file) {
            try {
                const parsedContent = await parseFile(file);
                onGenerate(parsedContent);
            } catch (error) {
                console.error(error);
                setFileError(error instanceof Error ? error.message : 'Không thể xử lý file này.');
            }
        } else {
            setFileError('Vui lòng chọn file hoặc nhập nội dung.');
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isOver: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(isOver);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e, false);
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles && droppedFiles.length > 0) {
            handleFileChange(droppedFiles[0]);
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6 transform transition-all hover:scale-[1.01] duration-300">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                    onClick={() => setMode(InputMode.Upload)}
                    className={`w-1/2 py-2.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${mode === InputMode.Upload ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                    <FileUpIcon className="w-5 h-5" /> Tải Lên File
                </button>
                <button
                    onClick={() => setMode(InputMode.Text)}
                    className={`w-1/2 py-2.5 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${mode === InputMode.Text ? 'bg-white dark:bg-gray-900 text-primary-600 shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >
                    <TextIcon className="w-5 h-5" /> Dán Văn Bản
                </button>
            </div>

            {mode === InputMode.Upload ? (
                <div 
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-primary-400'}`}
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)}
                        className="hidden"
                        accept=".pdf,.png,.jpg,.jpeg,.docx"
                    />
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <FileUpIcon className="w-12 h-12 mb-4 text-gray-400 dark:text-gray-500" />
                        <p className="font-semibold">Kéo & thả file vào đây, hoặc <span className="text-primary-600">bấm để chọn</span></p>
                        <p className="text-xs mt-1">Hỗ trợ PDF, DOCX, PNG, JPG (tối đa 10MB)</p>
                        {file && <p className="text-sm mt-4 font-medium text-green-600 bg-green-100 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full">{file.name}</p>}
                    </div>
                </div>
            ) : (
                <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    rows={10}
                    className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
                    placeholder="Dán nội dung đề thi vào đây, bao gồm cả công thức LaTeX..."
                />
            )}
            
            {fileError && <p className="text-sm text-red-600 dark:text-red-400">{fileError}</p>}
            
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
                {isLoading ? (
                    <>
                        <LoaderIcon className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                    </>
                ) : (
                    <>
                        <WandSparklesIcon className="w-5 h-5" />
                        Tạo Đề Tương Tự
                    </>
                )}
            </button>
        </div>
    );
};
