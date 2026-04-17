import tw from "twin.macro";
import styled from "styled-components/macro";

const LogoContainer = styled.div`
  ${tw`w-full flex justify-center sm:justify-start items-center my-3 px-3 py-2 gap-2 rounded-xl`};
  background: linear-gradient(120deg, rgba(99, 102, 241, 0.2), rgba(14, 165, 233, 0.15));

  & > img {
    ${tw`w-8 h-8 rounded-md object-contain flex-shrink-0`};
  }

  & > a {
    ${tw`text-white items-center text-lg font-semibold leading-tight truncate`};

    @media (max-width: 639px) {
      ${tw`hidden`};
    }
  }
`;

export default LogoContainer;
