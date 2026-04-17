import tw from "twin.macro";
import styled from "styled-components/macro";

const NavigationButton = styled.span`
  ${tw`text-left ml-2 text-sm leading-5 truncate`};

  @media (max-width: 639px) {
    ${tw`hidden`};
  }
`;

export default NavigationButton;
