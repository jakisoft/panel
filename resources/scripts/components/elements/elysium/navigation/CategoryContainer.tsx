import tw from "twin.macro";
import styled from "styled-components/macro";

const CategoryContainer = styled.div`
  ${tw`w-full mt-5 mb-1 px-3 uppercase font-semibold text-xs tracking-widest`};

  & > a {
    ${tw`block truncate text-indigo-200/80`};

    @media (max-width: 639px) {
      ${tw`hidden`};
    }
  }
`;

export default CategoryContainer;
