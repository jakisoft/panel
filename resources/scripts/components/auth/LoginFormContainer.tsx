import React, { forwardRef, useMemo } from 'react';
import { Form } from 'formik';
import tw from 'twin.macro';
import styled from 'styled-components/macro';
import { Toaster } from 'sonner';
import { getElysiumData } from '@/components/elements/elysium/getElysiumData';
import FlashMessageRender from '@/components/FlashMessageRender';

type Props = React.DetailedHTMLProps<
    React.FormHTMLAttributes<HTMLFormElement>,
    HTMLFormElement
> & {
    title: string;
    subtitle?: string;
    footer?: React.ReactNode;
};

const Shell = styled.div`
    ${tw`fixed inset-0 flex items-center justify-center p-4 text-neutral-100 overflow-y-auto`};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, subtitle, footer, children, ...props }, ref) => {
    const accent = useMemo(() => getElysiumData('--color-4').trim() || '#3b82f6', []);

    return (
        <Shell css={tw`bg-elysium-color1`}>
            <Toaster position={'top-center'} richColors />

            <div css={tw`absolute inset-0 overflow-hidden pointer-events-none`}>
                <div
                    css={tw`absolute -top-24 -left-16 w-[26rem] h-[26rem] rounded-full blur-[110px] opacity-40`}
                    style={{ backgroundColor: accent }}
                />
                <div
                    css={tw`absolute -bottom-24 -right-16 w-[30rem] h-[30rem] rounded-full blur-[120px] opacity-30`}
                    style={{ backgroundColor: accent }}
                />
            </div>

            <div css={tw`relative w-full max-w-md`}>
                <FlashMessageRender css={tw`mb-3`} />
                <div
                    css={tw`bg-elysium-color2 backdrop-blur-2xl border border-neutral-700 shadow-2xl rounded-[2.2rem] p-8 md:p-10`}
                >
                    <div css={tw`mb-7`}>
                        <h1 css={tw`text-2xl font-bold`}>{title}</h1>
                        {subtitle && <p css={tw`mt-2 text-sm text-neutral-400`}>{subtitle}</p>}
                    </div>

                    <Form css={tw`space-y-6`} {...props} ref={ref}>
                        {children}
                    </Form>

                    {footer && <div css={tw`mt-8`}>{footer}</div>}
                </div>

                <p css={tw`text-center text-neutral-400 text-xs mt-5`}>
                    &copy; {JSON.parse(getElysiumData('--copyright-start-year'))} - {new Date().getFullYear()} {''}
                    <a
                        rel={'noopener nofollow noreferrer'}
                        href={JSON.parse(getElysiumData('--copyright-link'))}
                        target={'_blank'}
                        css={tw`no-underline text-neutral-300 hover:text-neutral-100`}
                    >
                        {JSON.parse(getElysiumData('--copyright-by'))}
                    </a>
                </p>
            </div>
        </Shell>
    );
});
