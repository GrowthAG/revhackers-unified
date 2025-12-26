
import React from 'react';
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
    variant?: 'default' | 'dark' | 'light';
    container?: boolean;
    className?: string;
    children: React.ReactNode;
}

const Section = ({
    variant = 'default',
    container = true,
    className,
    children,
    ...props
}: SectionProps) => {

    const variantStyles = {
        default: "bg-background text-foreground",
        dark: "bg-black text-white",
        light: "bg-white text-black",
    };

    return (
        <section
            className={cn(
                "py-20 md:py-32 relative",
                variantStyles[variant],
                className
            )}
            {...props}
        >
            {container ? (
                <div className="container-custom relative">
                    {children}
                </div>
            ) : (
                <div className="relative">
                    {children}
                </div>
            )}
        </section>
    );
};

export default Section;
