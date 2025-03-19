import { IoChevronBackCircle, IoChevronForwardCircle } from 'react-icons/io5';
import { useState } from 'react';

interface SwitchTrlProps {
    products: any[]; // Replace 'any' with your actual product type
}

export default function SwitchTrl({ products }: SwitchTrlProps) {
    console.log("products: aaaa", products)
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : products.length - 1));
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev < products.length - 1 ? prev + 1 : 0));
    };

    return (
        <div>
            <div className="flex flex-row space-x-3">
                <IoChevronBackCircle
                    className="text-gray-600 hover:text-gray-700 transition-colors cursor-pointer"
                    size={35}
                    onClick={handlePrevious}
                />
                <IoChevronForwardCircle
                    className="text-gray-600 hover:text-gray-700 transition-colors cursor-pointer"
                    size={35}
                    onClick={handleNext}
                />
            </div>
            {/* {products?.length > 0 && (
                <div key={currentIndex}>
                   

                </div>
            )} */}
        </div>
    );
}