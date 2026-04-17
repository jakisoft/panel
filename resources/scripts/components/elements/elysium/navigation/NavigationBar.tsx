import tw from "twin.macro";
import styled from "styled-components/macro";

const NavigationBar = styled.div`
  ${tw`flex flex-col px-2 pb-4`};

  & > a,
  & > button,
  & > .navigation-link {
    ${tw`w-full min-h-[40px] flex items-center px-3 py-2 my-1 no-underline text-neutral-300 cursor-pointer transition-all duration-150 rounded-lg`};

    &:hover,
    &:focus-visible,
    &.active {
      ${tw`bg-elysium-color3 text-neutral-100`};
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
