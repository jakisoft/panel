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
    ${breakpoint('sm')`
        ${tw`w-4/5 mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`p-10`}
    `};

    ${breakpoint('lg')`
        ${tw`w-3/5`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full`}
        max-width: 700px;
    `};
`;

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data?.name || 'JKSoft Cloud');
    const logo = useStoreState((state: ApplicationStore) => state.settings.data?.logo || '/assets/svgs/pterodactyl.svg');

    return (
        <Container>
            {title && <h2 css={tw`text-3xl text-center text-neutral-100 font-medium py-4`}>{title}</h2>}
            <FlashMessageRender css={tw`mb-2 px-1`} />
            <Form {...props} ref={ref}>
                <div css={tw`md:flex w-full bg-neutral-900 border border-neutral-700 shadow-2xl rounded-xl p-6 md:pl-0 mx-1`}>
                    <div css={tw`flex-none select-none mb-6 md:mb-0 self-center px-6`}>
                        <img src={logo} alt={name} css={tw`block w-40 md:w-56 mx-auto object-contain max-h-24`} />
                        <p css={tw`text-center text-sm text-neutral-400 font-header font-medium mt-3`}>{name}</p>
                    </div>
                    <div css={tw`flex-1 md:border-l md:border-neutral-700 md:pl-6`}>{props.children}</div>
                </div>
            </Form>
            <p css={tw`text-center text-neutral-500 text-xs mt-4`}>
                &copy; 2015 - {new Date().getFullYear()}&nbsp;
                <span css={tw`text-neutral-400 font-medium`}>{name}</span>
            </p>
        </Container>
    );
});
