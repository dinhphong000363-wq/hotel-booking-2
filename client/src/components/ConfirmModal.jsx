import React from 'react'

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Xác nhận",
    message = "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    variant = "danger", // "danger" | "warning" | "info"
    loading = false,
    highlightText = null, // Text to highlight in message
}) => {
    if (!isOpen) return null;

    const variantStyles = {
        danger: {
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            buttonBg: "bg-red-600 hover:bg-red-700",
            borderColor: "border-red-100",
        },
        warning: {
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
            buttonBg: "bg-yellow-600 hover:bg-yellow-700",
            borderColor: "border-yellow-100",
        },
        info: {
            iconBg: "bg-indigo-100",
            iconColor: "text-indigo-600",
            buttonBg: "bg-indigo-600 hover:bg-indigo-700",
            borderColor: "border-indigo-100",
        },
    };

    const styles = variantStyles[variant] || variantStyles.danger;

    // Trash icon for delete
    const TrashIcon = () => (
        <svg
            className={`w-8 h-8 ${styles.iconColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
        </svg>
    );

    // Warning icon
    const WarningIcon = () => (
        <svg
            className={`w-8 h-8 ${styles.iconColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
        </svg>
    );

    // Info icon
    const InfoIcon = () => (
        <svg
            className={`w-8 h-8 ${styles.iconColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    );

    const getIcon = () => {
        if (variant === "warning") return <WarningIcon />;
        if (variant === "info") return <InfoIcon />;
        return <TrashIcon />;
    };

    // Parse message to highlight text if provided
    const renderMessage = () => {
        if (!highlightText || !message.includes(highlightText)) {
            return message;
        }
        
        const index = message.indexOf(highlightText);
        const before = message.substring(0, index);
        const after = message.substring(index + highlightText.length);
        
        return (
            <>
                {before}
                <span className={`font-semibold ${styles.iconColor}`}>
                    "{highlightText}"
                </span>
                {after}
            </>
        );
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
                onClick={onClose}
            >
                <div 
                    className={`bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scaleIn border ${styles.borderColor}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6">
                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className={`w-16 h-16 ${styles.iconBg} rounded-full flex items-center justify-center`}>
                                {getIcon()}
                            </div>
                        </div>

                        {/* Title and Message */}
                        <div className="text-center mb-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {title}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {renderMessage()}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={`flex-1 px-4 py-2.5 ${styles.buttonBg} text-white rounded-lg transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-4 w-4 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                @keyframes scaleIn {
                    from {
                        transform: scale(0.95);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.2s ease-out;
                }
            `}</style>
        </>
    );
};

export default ConfirmModal;

