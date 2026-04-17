import tw from "twin.macro";
import styled from "styled-components/macro";

const CategoryContainer = styled.div`
  ${tw`w-full ml-4 mt-5 mb-1 uppercase font-semibold`};

  & > a {
    @media (max-width: 639px) {
      ${tw`hidden`};
  }
`;

export default CategoryContainer