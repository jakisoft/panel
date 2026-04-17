import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import useEventListener from "@/plugins/useEventListener";
import SearchModal from "@/components/dashboard/search/SearchModal";
import tw from "twin.macro";
import styled from "styled-components";

const SearchContainer = styled.button`
  ${tw`flex w-full py-2 px-3 my-1 items-center no-underline text-neutral-300 cursor-pointer transition-all duration-150`};

  &:active,
  &:hover {
    ${tw`text-neutral-100 rounded-lg bg-elysium-color3`};
  }

  &:active,
  &:hover,
  &.active {
    ${tw`bg-elysium-color3 text-neutral-100 rounded-lg`};
  }
`;

const Button = styled.button`
  ${tw`text-left`};

  @media (max-width: 639px) {
    ${tw`hidden`};
  }
`;

export default () => {
  const [visible, setVisible] = useState(false);

  useEventListener("keydown", (e) => {
    if (
      ["input", "textarea"].indexOf(
        ((e.target || {}).tagName || "input").toLowerCase()
      ) < 0
    ) {
      if (!visible && e.metaKey && e.key.toLowerCase() === "/") {
        setVisible(true);
      }
    }
  });

  return (
    <>
      {visible && (
        <SearchModal
          appear
          visible={visible}
          onDismissed={() => setVisible(false)}
        />
      )}
      <SearchContainer onClick={() => setVisible(true)}>
        <FontAwesomeIcon icon={faSearch} css={tw`mr-2`} />
        <Button>Search...</Button>
      </SearchContainer>
    </>
  );
};
