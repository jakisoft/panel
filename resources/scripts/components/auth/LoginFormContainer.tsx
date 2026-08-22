import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${tw`w-full px-4 mx-auto`}

    ${breakpoint('sm')`
        ${tw`w-4/5`}
    `};

    ${breakpoint('md')`
        ${tw`w-3/5 p-10`}
    `};

    ${breakpoint('lg')`
        ${tw`w-full`}
        max-width: 720px;
    `};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'JKSoft Cloud');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo);

    return (
        <Container>
            {title && <h2 css={tw`text-3xl text-center text-neutral-100 font-medium py-4 tracking-tight`}>{title}</h2>}
            <FlashMessageRender css={tw`mb-3 px-1`} />
            <Form {...props} ref={ref}>
                <div css={tw`md:flex w-full bg-neutral-900 border border-neutral-700/80 shadow-2xl rounded-2xl p-6 md:p-8 md:pl-0 mx-auto items-center`}>
                    <div css={tw`flex-none select-none mb-6 md:mb-0 self-center px-6 md:px-10 text-center`}>
                        {logo && logo !== '/assets/svgs/pterodactyl.svg' ? (
                            <img src={logo} alt={name} css={tw`block w-36 md:w-44 mx-auto object-contain max-h-24`} />
                        ) : (
                            <img src={'/assets/svgs/pterodactyl.svg'} alt={name} css={tw`block w-28 md:w-36 mx-auto`} />
                        )}
                        <p css={tw`text-center text-sm font-semibold text-neutral-300 font-header mt-3`}>{name}</p>
                    </div>
                    <div css={tw`flex-1 md:border-l md:border-neutral-800 md:pl-8`}>{props.children}</div>
                </div>
            </Form>
            <p css={tw`text-center text-neutral-500 text-xs mt-5`}>
                &copy; 2015 - {new Date().getFullYear()}&nbsp;
                <span css={tw`text-neutral-400 font-semibold`}>{name}</span>. All rights reserved.
            </p>
        </Container>
    );
});
