import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
    fullScreen?: boolean;
    variant?: 'spinner' | 'skeleton' | 'dots' | 'pulse';
}

export const Loading = ({
                            size = 'md',
                            text,
                            fullScreen = false,
                            variant = 'spinner',
                        }: LoadingProps) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
    };

    const renderVariant = () => {
        switch (variant) {
            case 'spinner':
                return (
                    <Loader2
                        className={`${sizeClasses[size]} animate-spin text-blue-600`}
                    />
                );

            case 'skeleton':
                return (
                    <div className="space-y-3 w-full max-w-md">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="h-4 bg-gray-200 rounded animate-pulse"
                                style={{ width: `${100 - i * 10}%` }}
                            />
                        ))}
                    </div>
                );

            case 'dots':
                return (
                    <div className="flex gap-2">
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={`${
                                    size === 'sm' ? 'h-2 w-2' : size === 'lg' ? 'h-4 w-4' : 'h-3 w-3'
                                } bg-blue-600 rounded-full`}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                );

            case 'pulse':
                return (
                    <motion.div
                        className={`${sizeClasses[size]} bg-blue-600 rounded-full`}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                        }}
                    />
                );

            default:
                return null;
        }
    };

    const content = (
        <div className="flex flex-col items-center justify-center gap-3">
            {renderVariant()}
            {text && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-600"
                >
                    {text}
                </motion.p>
            )}
        </div>
    );

    if (fullScreen) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-95 backdrop-blur-sm z-50"
            >
                {content}
            </motion.div>
        );
    }

    return content;
};