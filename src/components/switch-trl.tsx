import { IoChevronBackCircle, IoChevronForwardCircle } from "react-icons/io5";
import { useState } from "react";

interface SwitchTrlProps {
  productIds: string[];
  onIndexChange?: (index: number, productId: string) => void;
}

export default function SwitchTrl({
  productIds,
  onIndexChange,
}: SwitchTrlProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = localStorage.getItem("currentProductIndex");
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });

  // Ensure productIds exists and has items
  if (!productIds || productIds.length === 0) {
    return null; // Or return some placeholder UI
  }

  const handlePrevious = () => {
    if (!productIds) return; // Guard clause
    const newIndex =
      currentIndex > 0 ? currentIndex - 1 : productIds.length - 1;
    setCurrentIndex(newIndex);
    localStorage.setItem("currentProductIndex", newIndex.toString());
    console.log("Current Product ID:", productIds[newIndex]);
    onIndexChange?.(newIndex, productIds[newIndex]);
  };

  const handleNext = () => {
    if (!productIds) return; // Guard clause
    const newIndex =
      currentIndex < productIds.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
    localStorage.setItem("currentProductIndex", newIndex.toString());
    console.log("Current Product ID:", productIds[newIndex]);
    onIndexChange?.(newIndex, productIds[newIndex]);
  };

  return (
    <div className="flex space-x-3">
      <IoChevronBackCircle
        className="text-gray-600 hover:text-gray-700 hover:cursor-pointer transition-colors"
        size={35}
        onClick={handlePrevious}
      />
      <IoChevronForwardCircle
        className="text-gray-600 hover:text-gray-700 hover:cursor-pointer transition-colors"
        size={35}
        onClick={handleNext}
      />
    </div>
  );
}
