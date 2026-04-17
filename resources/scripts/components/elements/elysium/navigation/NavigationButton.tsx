import tw from "twin.macro";
import styled from "styled-components/macro";

const NavigationButton = styled.button`
  ${tw`text-left ml-2`};

  @media (max-width: 639px) {
    ${tw`hidden`};
  }
`;

export default NavigationButton