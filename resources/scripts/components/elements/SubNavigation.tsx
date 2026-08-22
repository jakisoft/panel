import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full bg-neutral-900/80 backdrop-blur border-b border-neutral-800 shadow-sm overflow-x-auto`};

    & > div {
        ${tw`flex items-center text-sm mx-auto px-4 py-1.5 gap-1.5`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`flex items-center gap-2 py-2 px-3.5 text-neutral-400 no-underline whitespace-nowrap rounded-lg font-medium text-xs sm:text-sm transition-all duration-150`};

            &:hover {
                ${tw`text-neutral-100 bg-neutral-800/60`};
            }

            &:active,
            &.active {
                ${tw`text-white bg-neutral-800 font-semibold shadow-sm`};
                box-shadow: inset 0 -2px ${theme`colors.cyan.500`.toString()};
            }
        }
    }
`;

export default SubNavigation;
