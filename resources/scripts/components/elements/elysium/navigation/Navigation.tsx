import tw from "twin.macro";
import styled from "styled-components/macro";

const Navigation = styled.aside`
  ${tw`sticky top-0 h-screen bg-elysium-color2 border-r border-black/20 shadow-md overflow-y-auto overflow-x-hidden z-30`};
  flex-shrink: 0;

  @media (max-width: 639px) {
    ${tw`w-16`};
  }

  @media (min-width: 640px) and (max-width: 1023px) {
    ${tw`w-64`};
  }

  @media (min-width: 1024px) {
    ${tw`w-72`};
  }
`;

export default Navigation;
