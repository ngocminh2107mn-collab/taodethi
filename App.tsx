
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { generateSimilarQuestions } from './services/geminiService';
import type { InputContent } from './types';

const App: React.FC = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generatedContent, setGeneratedContent] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleGenerate = useCallback(async (input: InputContent) => {
        setIsLoading(true);
        setError('');
        setGeneratedContent('');

        try {
            const result = await generateSimilarQuestions(input);
            setGeneratedContent(result);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';
            setError(`Lỗi: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <Header />
            <main className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <InputPanel onGenerate={handleGenerate} isLoading={isLoading} />
                        <OutputPanel content={generatedContent} isLoading={isLoading} error={error} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;
