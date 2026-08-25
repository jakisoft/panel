import React, { useState } from 'react';
import { Field as FormikField, FieldProps } from 'formik';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

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
                    <div className={'w-full space-y-1.5'}>
                        {label && (
                            <label
                                htmlFor={name}
                                className={'block text-xs sm:text-sm font-semibold text-neutral-300'}
                            >
                                {label}
                            </label>
                        )}

                        <div
                            className={`group relative flex items-center rounded-xl bg-neutral-900/90 border transition-all duration-200 ${
                                hasError
                                    ? 'border-red-500/80 ring-2 ring-red-500/20'
                                    : 'border-neutral-750 hover:border-neutral-650 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/25'
                            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {/* Left Lucide Icon */}
                            {Icon && (
                                <div className={'pl-3.5 pr-1 flex items-center justify-center text-neutral-400 group-focus-within:text-primary-400 transition-colors pointer-events-none'}>
                                    <Icon size={18} />
                                </div>
                            )}

                            {/* Main HTML Input */}
                            <input
                                id={name}
                                {...field}
                                type={effectiveType}
                                placeholder={placeholder}
                                disabled={disabled}
                                autoComplete={autoComplete}
                                autoFocus={autoFocus}
                                className={`w-full py-2.5 sm:py-3 bg-transparent text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 outline-none border-none ${
                                    Icon ? 'pl-2' : 'pl-3.5'
                                } ${isPassword ? 'pr-11' : 'pr-3.5'}`}
                            />

                            {/* Right Password View / Hide Toggle Button */}
                            {isPassword && (
                                <button
                                    type={'button'}
                                    tabIndex={-1}
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className={'absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors focus:outline-none'}
                                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            )}
                        </div>

                        {/* Error or Help Text */}
                        {hasError ? (
                            <p className={'text-xs font-medium text-red-400 pt-0.5 animate-fadeIn'}>
                                {errorMessage?.charAt(0).toUpperCase() + errorMessage?.slice(1)}
                            </p>
                        ) : description ? (
                            <p className={'text-[11px] text-neutral-500 pt-0.5'}>{description}</p>
                        ) : null}
                    </div>
                );
            }}
        </FormikField>
    );
};
