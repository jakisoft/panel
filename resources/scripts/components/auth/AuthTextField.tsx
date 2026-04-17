import React from 'react';
import { useField } from 'formik';
import tw from 'twin.macro';

interface Props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name'> {
    name: string;
    label: string;
    icon?: React.ReactNode;
    rightAdornment?: React.ReactNode;
}

export default ({ name, label, icon, rightAdornment, ...props }: Props) => {
    const [field, meta] = useField(name);
    const hasError = meta.touched && !!meta.error;

    return (
        <div css={tw`space-y-2`}>
            <label htmlFor={name} css={tw`text-xs font-bold uppercase tracking-widest text-neutral-400 px-1`}>
                {label}
            </label>
            <div css={tw`relative`}>
                {icon && <div css={tw`absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-400`}>{icon}</div>}
                <input
                    id={name}
                    {...field}
                    {...props}
                    css={[
                        tw`block w-full py-4 rounded-2xl border outline-none transition-all text-sm`,
                        icon ? tw`pl-12` : tw`pl-4`,
                        rightAdornment ? tw`pr-12` : tw`pr-4`,
                        tw`bg-elysium-color3 border-elysium-color4 text-neutral-100 placeholder:text-neutral-500`,
                        hasError && tw`border-red-500 ring-2 ring-red-500 ring-opacity-40`,
                    ]}
                />
                {rightAdornment && <div css={tw`absolute inset-y-0 right-0 pr-4 flex items-center`}>{rightAdornment}</div>}
            </div>
            {hasError && <p css={tw`text-xs text-red-400 px-1`}>{meta.error}</p>}
        </div>
    );
};
