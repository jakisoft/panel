import tw from "twin.macro";
import styled from "styled-components/macro";

const LogoContainer = styled.div`
  ${tw`w-12 flex justify-start items-center my-2 mx-2`};

  & > img {
    ${tw`max-w-full h-auto`};
  }

  & > a {
    ${tw`text-neutral-100 items-center text-3xl font-semibold ml-2`};

    @media (max-width: 639px) {
      ${tw`hidden`};
    }
  }
`;

export default LogoContainer