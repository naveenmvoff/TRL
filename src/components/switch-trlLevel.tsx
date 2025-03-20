import { IoChevronBackCircle, IoChevronForwardCircle } from 'react-icons/io5';
import { useState } from 'react';

interface SwitchTrlProps {
    trlIds: string[];
    onIndexChange?: (index: number, productId: string) => void;
}

export default function SwitchTrlLevel({ trlIds, onIndexChange }: SwitchTrlProps) {
    const [currentIndex, setCurrentIndex] = useState(() => {
        const savedIndex = localStorage.getItem('currentTrlIndex');
        return savedIndex ? parseInt(savedIndex, 10) : 0;
    });

    // Ensure trlIds exists and has items
    if (!trlIds || trlIds.length === 0) {
        return null; // Or return some placeholder UI
    }

    const handlePrevious = () => {
        if (!trlIds) return; // Guard clause
        const newIndex = currentIndex > 0 ? currentIndex - 1 : trlIds.length - 1;
        setCurrentIndex(newIndex);
        localStorage.setItem('currentTrlIndex', newIndex.toString());
        console.log('Current TRL ID:', trlIds[newIndex]);
        onIndexChange?.(newIndex, trlIds[newIndex]);
    };

    const handleNext = () => {
        if (!trlIds) return; // Guard clause
        const newIndex = currentIndex < trlIds.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(newIndex);
        localStorage.setItem('currentTrlIndex', newIndex.toString());
        console.log('Current TRL ID:', trlIds[newIndex]);
        onIndexChange?.(newIndex, trlIds[newIndex]);
    };

    return (
        <div className="flex space-x-3">
            <IoChevronBackCircle 
            className='text-gray-600 hover:text-gray-700 hover:cursor-pointer transition-colors'
            size={35} 
            onClick={handlePrevious} />
            <IoChevronForwardCircle
            className='text-gray-600 hover:text-gray-700 hover:cursor-pointer transition-colors'
            size={35} onClick={handleNext} />
        </div>
    );
}