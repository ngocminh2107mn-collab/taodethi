
import React from 'react';
import { GraduationCapSparkleIcon } from './icons/Icons';

export const Header: React.FC = () => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center">
                        <GraduationCapSparkleIcon className="h-10 w-10 text-primary-600" />
                        <h1 className="ml-3 text-2xl font-bold text-gray-800 dark:text-white">
                            Trợ lý Tạo Đề Thi
                        </h1>
                    </div>
                    <p className="hidden md:block text-gray-500 dark:text-gray-400">
                        Phát triển bởi AI - Dành cho Giáo viên
                    </p>
                </div>
            </div>
        </header>
    );
};
