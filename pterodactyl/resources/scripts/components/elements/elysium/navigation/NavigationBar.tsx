import tw from "twin.macro";
import styled from "styled-components/macro";

const NavigationBar = styled.div`
${tw`flex-col items-center justify-center mx-3 mb-4`};
& > a,
& > button,
& > .navigation-link {
  ${tw`w-full py-2 px-3 my-1 items-center no-underline text-neutral-300 cursor-pointer transition-all duration-150`};

  &:active,
  &:hover {
    ${tw`text-neutral-100 rounded-lg bg-elysium-color3`};
  }

  &:active,
  &:hover,
  &.active {
    ${tw`bg-elysium-color3 text-neutral-100 rounded-lg`};
  }
}
`;

export default NavigationBar