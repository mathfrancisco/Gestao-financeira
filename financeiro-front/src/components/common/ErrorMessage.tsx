// src/components/common/ErrorMessage.tsx

import { motion, AnimatePresence } from 'framer-motion';
import {
    AlertCircle,
    AlertTriangle,
    Info,
    X,
    RefreshCw,
    CheckCircle,
} from 'lucide-react';

interface ErrorMessageProps {
    title?: string;
    message: string;
    type?: 'error' | 'warning' | 'info' | 'success';
    onClose?: () => void;
    onRetry?: () => void;
    retryText?: string;
    closable?: boolean;
    className?: string;
}

const typeConfig = {
    error: {
        icon: AlertCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500',
        titleColor: 'text-red-800',
        textColor: 'text-red-700',
        buttonColor:
            'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-500',
        titleColor: 'text-yellow-800',
        textColor: 'text-yellow-700',
        buttonColor:
            'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-800',
        textColor: 'text-blue-700',
        buttonColor:
            'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-500',
        titleColor: 'text-green-800',
        textColor: 'text-green-700',
        buttonColor:
            'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    },
};

export const ErrorMessage = ({
                                 title,
                                 message,
                                 type = 'error',
                                 onClose,
                                 onRetry,
                                 retryText = 'Tentar novamente',
                                 closable = true,
                                 className = '',
                             }: ErrorMessageProps) => {
    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`rounded-lg border ${config.bgColor} ${config.borderColor} p-4 ${className}`}
            >
                <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <Icon className={`h-5 w-5 ${config.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {title && (
                            <h3 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                                {title}
                            </h3>
                        )}
                        <p className={`text-sm ${config.textColor}`}>{message}</p>

                        {/* Actions */}
                        {onRetry && (
                            <div className="mt-3">
                                <button
                                    onClick={onRetry}
                                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.buttonColor}`}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    {retryText}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Close Button */}
                    {closable && onClose && (
                        <div className="flex-shrink-0">
                            <button
                                onClick={onClose}
                                className={`p-1 rounded-md ${config.iconColor} hover:bg-white hover:bg-opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${config.buttonColor.split(' ')[2]}`}
                                aria-label="Fechar"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

// Variantes específicas para facilitar uso
export const ErrorAlert = (props: Omit<ErrorMessageProps, 'type'>) => (
    <ErrorMessage {...props} type="error" />
);

export const WarningAlert = (props: Omit<ErrorMessageProps, 'type'>) => (
    <ErrorMessage {...props} type="warning" />
);

export const InfoAlert = (props: Omit<ErrorMessageProps, 'type'>) => (
    <ErrorMessage {...props} type="info" />
);

export const SuccessAlert = (props: Omit<ErrorMessageProps, 'type'>) => (
    <ErrorMessage {...props} type="success" />
);