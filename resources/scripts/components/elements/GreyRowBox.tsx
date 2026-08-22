import styled from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded-xl no-underline text-neutral-200 items-center bg-neutral-800/80 border border-neutral-700/60 p-4 transition-all duration-150 overflow-hidden`};

    ${(props) => props.$hoverable !== false && tw`hover:border-neutral-600 hover:bg-neutral-800`};

    & .icon {
        ${tw`rounded-xl w-12 h-12 flex items-center justify-center bg-neutral-700/80 p-3 flex-shrink-0`};
    }
`;
