import tw from "twin.macro";
import styled from "styled-components/macro";

const Navigation = styled.div`
  ${tw`absolute bg-elysium-color2 rounded-r-none sm:rounded-r-3xl shadow-md overflow-y-auto ease-linear duration-200 sticky top-0 h-screen`};
  flex-shrink: 0;

  & > div {
    ${tw`flex items-center justify-center`};
  }

  @media (max-width: 639px) {
    ${tw`w-16`};
  }

  @media (min-width: 640px) and (max-width: 1023px) {
    ${tw`w-52`};
  }

  @media (min-width: 1024px) {
    ${tw`w-72`};
  }
`;

export default Navigation;