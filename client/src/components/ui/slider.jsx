import React from "react";

export const Slider = React.forwardRef(({ className = "", value = [0], onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const handleChange = (e) => {
        const newValue = parseFloat(e.target.value);
        if (onValueChange) {
            onValueChange([newValue]);
        }
    };

    return (
        <div className={`relative flex w-full touch-none select-none items-center ${className}`} ref={ref} {...props}>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value[0] || min}
                onChange={handleChange}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
            />
        </div>
    );
});

Slider.displayName = "Slider";
