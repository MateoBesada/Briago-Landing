import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Producto } from "@/types/Producto";
import clsx from "clsx";

type Props = {
    variants: Producto[];
    selectedVariant: Producto;
    onSelect: (variant: Producto) => void;
    productName: string; // To strip from variant names if needed
};

export default function VariantCarousel({ variants, selectedVariant, onSelect, productName }: Props) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Check scroll possibilities
    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding tolerance
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("resize", checkScroll);
        return () => window.removeEventListener("resize", checkScroll);
    }, [variants]);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 200; // Adjust scroll step
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
            setTimeout(checkScroll, 300); // Check after scroll animation
        }
    };

    // Helper for clean text
    const getVariantLabel = (variant: Producto) => {
        if (variant.capacidad) return variant.capacidad;
        // If color is present but we are showing a swatch, we might want a tooltip or just rely on the visual.
        // For specific MTN case, we just want the visual color circle if possible.
        if (variant.colorHex) return ""; // Empty label if we have hex (swatch only)

        if (variant.color) return variant.color;
        if (variant.ColorAerosol) return variant.ColorAerosol;
        if (variant.grano) return variant.grano;
        if (variant.especificaciones?.Grano) return variant.especificaciones.Grano;

        // Fallback: Remove product name if present
        const cleanName = variant.nombre.replace(productName, '').trim();
        return cleanName || 'Estándar';
    };

    return (
        <div className="relative group w-full">
            {/* Scroll Buttons */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll("left")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -ml-3 z-10 bg-white shadow-md border rounded-full p-1 text-gray-700 hover:text-black hover:scale-110 transition flex items-center justify-center w-8 h-8"
                >
                    <ChevronLeft size={18} />
                </button>
            )}

            {canScrollRight && (
                <button
                    onClick={() => scroll("right")}
                    className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 z-10 bg-white shadow-md border rounded-full p-1 text-gray-700 hover:text-black hover:scale-110 transition flex items-center justify-center w-8 h-8"
                >
                    <ChevronRight size={18} />
                </button>
            )}

            {/* Carousel Container */}
            <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1 items-center"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {variants.map((v) => {
                    const isSelected = v.id === selectedVariant.id;
                    const hasColor = !!v.colorHex;

                    return (
                        <button
                            key={v.id}
                            onClick={() => onSelect(v)}
                            title={v.nombre} // Tooltip for accessibility and clarity
                            className={clsx(
                                "transition-all flex-shrink-0 relative",
                                hasColor
                                    ? "w-10 h-10 rounded-full shadow-sm" // Color Swatch Style
                                    : "px-4 py-2 rounded-lg text-sm font-bold border-2", // Text Button Style

                                // Selection states
                                hasColor && isSelected && "ring-2 ring-black ring-offset-2 scale-110",
                                !hasColor && isSelected && "border-black bg-black text-white",
                                !hasColor && !isSelected && "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                            )}
                            style={hasColor ? { backgroundColor: v.colorHex } : undefined}
                        >
                            {/* If it's a color swatch, maybe show a checkmark if selected? Or just the ring is enough. */}
                            {!hasColor && getVariantLabel(v)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
