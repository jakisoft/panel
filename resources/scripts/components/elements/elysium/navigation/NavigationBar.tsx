import tw from "twin.macro";
import styled from "styled-components/macro";

const NavigationBar = styled.div`
  ${tw`flex flex-col px-2 pb-4`};

  & > a,
  & > button,
  & > .navigation-link {
    ${tw`w-full min-h-[40px] flex items-center px-3 py-2 my-1 no-underline text-neutral-300 cursor-pointer transition-all duration-150 rounded-lg border border-transparent`};

    &:hover,
    &:focus-visible {
      ${tw`text-white border-white/10`};
      background: linear-gradient(120deg, rgba(99, 102, 241, 0.22), rgba(217, 70, 239, 0.18));
      box-shadow: 0 8px 25px rgba(79, 70, 229, 0.22);
    }

    &.active {
      ${tw`text-white border-white/15`};
      background: linear-gradient(120deg, rgba(79, 70, 229, 0.38), rgba(147, 51, 234, 0.28));
      box-shadow: 0 10px 30px rgba(79, 70, 229, 0.28);
    }
  }

  @media (max-width: 639px) {
    & > a,
    & > button,
    & > .navigation-link {
      ${tw`justify-center px-0`};
    }
  }
`;

export default NavigationBar;
