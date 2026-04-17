import tw from "twin.macro";
import styled from "styled-components/macro";

const Navigation = styled.aside`
  ${tw`sticky top-0 h-screen border-r border-white/10 shadow-2xl overflow-y-auto overflow-x-hidden z-30`};
  flex-shrink: 0;
  background: linear-gradient(165deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.95));
  backdrop-filter: blur(10px);

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
