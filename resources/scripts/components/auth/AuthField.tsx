import React, { useState } from 'react';
import { Field as FormikField, FieldProps } from 'formik';
import { Eye, EyeOff, LucideIcon, AlertCircle } from 'lucide-react';

interface Props {
    name: string;
    label?: string;
    type?: 'text' | 'email' | 'password' | 'number';
    icon?: LucideIcon;
    placeholder?: string;
    description?: string;
    disabled?: boolean;
    autoComplete?: string;
    autoFocus?: boolean;
}

export default ({
    name,
    label,
    type = 'text',
    icon: Icon,
    placeholder,
    description,
    disabled = false,
    autoComplete,
    autoFocus,
}: Props) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <FormikField name={name}>
            {({ field, form: { errors, touched } }: FieldProps) => {
                const hasError = !!(touched[field.name] && errors[field.name]);
                const errorMessage = errors[field.name] as string | undefined;

                return (
                    <div className={'w-full space-y-1.5 text-left'}>
                        {label && (
                            <label
                                htmlFor={name}
                                className={'block text-xs font-semibold text-neutral-300 tracking-wide select-none'}
                            >
                                {label}
                            </label>
                        )}

                        <div
                            className={`group relative flex items-center w-full h-12 rounded-xl bg-neutral-950/70 border transition-all duration-200 ${
                                hasError
                                    ? 'border-red-500/80 ring-2 ring-red-500/20 bg-red-950/10'
                                    : 'border-neutral-800 hover:border-neutral-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:bg-neutral-950/90'
                            } ${disabled ? 'opacity-60 cursor-not-allowed bg-neutral-900/50' : ''}`}
                        >
                            {/* Left Lucide Icon */}
                            {Icon && (
                                <div className={'w-11 h-12 flex items-center justify-center text-neutral-500 group-focus-within:text-primary-400 group-hover:text-neutral-400 transition-colors shrink-0 pointer-events-none'}>
                                    <Icon size={18} />
                                </div>
                            )}

                            {/* Main Input */}
                            <input
                                id={name}
                                {...field}
                                type={effectiveType}
                                placeholder={placeholder}
                                disabled={disabled}
                                autoComplete={autoComplete}
                                autoFocus={autoFocus}
                                className={`w-full h-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 font-normal outline-none border-none focus:ring-0 ${
                                    Icon ? 'pl-0' : 'pl-3.5'
                                } ${isPassword ? 'pr-11' : 'pr-3.5'}`}
                            />

                            {/* Right Password View / Hide Toggle Button */}
                            {isPassword && (
                                <button
                                    type={'button'}
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className={'absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/80 active:scale-95 transition-all focus:outline-none'}
                                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            )}
                        </div>

                        {/* Error or Description */}
                        {hasError ? (
                            <p className={'text-xs font-medium text-red-400 flex items-center gap-1.5 pt-0.5 animate-fadeIn'}>
                                <AlertCircle size={13} className={'shrink-0'} />
                                <span>{errorMessage?.charAt(0).toUpperCase() + errorMessage?.slice(1)}</span>
                            </p>
                        ) : description ? (
                            <p className={'text-[11px] sm:text-xs text-neutral-400/90 pt-0.5 leading-normal'}>{description}</p>
                        ) : null}
                    </div>
                );
            }}
        </FormikField>
    );
};
