import React from 'react';
import Spinner from '@/components/elements/Spinner';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    icon?: React.ReactNode;
}

export default ({ children, isLoading, disabled, icon, type = 'submit', className = '', ...props }: Props) => {
    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            className={`w-full h-12 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-primary-600 via-primary-500 to-cyan-600 hover:from-primary-500 hover:to-cyan-500 shadow-lg shadow-primary-600/25 hover:shadow-primary-500/40 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden select-none focus:outline-none focus:ring-2 focus:ring-primary-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100 ${className}`}
            {...props}
        >
            {isLoading ? (
                <div className={'flex items-center justify-center gap-2'}>
                    <Spinner size={'small'} />
                    <span className={'text-xs font-semibold'}>Memproses...</span>
                </div>
            ) : (
                <div className={'flex items-center justify-center gap-2'}>
                    {icon}
                    <span>{children}</span>
                </div>
            )}
        </button>
    );
};
