import React, { useMemo, useState } from 'react';
import { useField } from 'formik';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';
import tw from 'twin.macro';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
    name: string;
    icon: LucideIcon;
    label?: string;
    description?: string;
    light?: boolean;
}

export default ({
    name,
    icon: Icon,
    label,
    description,
    type,
    light = true,
    disabled,
    ...props
}: Props) => {
    const [field, meta] = useField<string>(name);
    const [showPassword, setShowPassword] = useState(false);

    const hasError = !!(meta.touched && meta.error);
    const isPassword = type === 'password';

    const inputType = useMemo(() => {
        if (!isPassword) {
            return type;
        }

        return showPassword ? 'text' : 'password';
    }, [isPassword, showPassword, type]);

    return (
        <div>
            {label && (
                <Label htmlFor={name} isLight={light}>
                    {label}
                </Label>
            )}
            <div css={tw`relative`}>
                <span
                    css={tw`absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none bg-neutral-100 rounded-md p-1`}
                >
                    <Icon size={18} />
                </span>
                <Input
                    id={name}
                    {...field}
                    {...props}
                    isLight={light}
                    type={inputType}
                    disabled={disabled}
                    hasError={hasError}
                    css={[tw`pl-12`, isPassword && tw`pr-12`]}
                />
                {isPassword && (
                    <button
                        type={'button'}
                        onClick={() => setShowPassword((state) => !state)}
                        css={tw`absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 focus:outline-none`}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {hasError ? (
                <p className={'input-help error'}>{meta.error!.charAt(0).toUpperCase() + meta.error!.slice(1)}</p>
            ) : description ? (
                <p className={'input-help'}>{description}</p>
            ) : null}
        </div>
    );
};
