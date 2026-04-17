import tw from "twin.macro";
import styled from "styled-components/macro";

const LogoContainer = styled.div`
  ${tw`w-full flex justify-center sm:justify-start items-center my-2 px-3 py-1 gap-2`};

  & > img {
    ${tw`w-8 h-8 rounded-md object-contain flex-shrink-0`};
  }

  & > a {
    ${tw`text-neutral-100 items-center text-lg font-semibold leading-tight truncate`};

    @media (max-width: 639px) {
      ${tw`hidden`};
    }
  }
`;

export default LogoContainer;
