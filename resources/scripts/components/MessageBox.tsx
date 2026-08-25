import * as React from 'react';
import tw, { TwStyle } from 'twin.macro';
import styled from 'styled-components/macro';

export type FlashMessageType = 'success' | 'info' | 'warning' | 'error';

interface Props {
    title?: string;
    children: string;
    type?: FlashMessageType;
}

const styling = (type?: FlashMessageType): TwStyle | string => {
    switch (type) {
        case 'error':
            return tw`bg-red-500/10 border-red-500/30 text-red-200`;
        case 'info':
            return tw`bg-primary-500/10 border-primary-500/30 text-primary-200`;
        case 'success':
            return tw`bg-green-500/10 border-green-500/30 text-green-200`;
        case 'warning':
            return tw`bg-yellow-500/10 border-yellow-500/30 text-yellow-200`;
        default:
            return '';
    }
};

const getBackground = (type?: FlashMessageType): TwStyle | string => {
    switch (type) {
        case 'error':
            return tw`bg-red-500 text-white`;
        case 'info':
            return tw`bg-primary-500 text-white`;
        case 'success':
            return tw`bg-green-500 text-white`;
        case 'warning':
            return tw`bg-yellow-500 text-black`;
        default:
            return '';
    }
};

const Container = styled.div<{ $type?: FlashMessageType }>`
    ${tw`p-3 border items-center leading-normal rounded-xl flex w-full text-xs sm:text-sm backdrop-blur-sm`};
    ${(props) => styling(props.$type)};
`;
Container.displayName = 'MessageBox.Container';

const MessageBox = ({ title, children, type }: Props) => (
    <Container css={tw`inline-flex`} $type={type} role={'alert'}>
        {title && (
            <span
                className={'title'}
                css={[
                    tw`flex rounded-md uppercase px-2 py-0.5 text-[10px] font-bold mr-2.5 leading-tight shrink-0 tracking-wider`,
                    getBackground(type),
                ]}
            >
                {title}
            </span>
        )}
        <span css={tw`mr-2 text-left flex-auto leading-relaxed`}>{children}</span>
    </Container>
);
MessageBox.displayName = 'MessageBox';

export default MessageBox;
