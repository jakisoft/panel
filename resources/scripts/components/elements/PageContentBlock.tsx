import React, { useEffect } from "react";
import ContentContainer from "@/components/elements/ContentContainer";
import { CSSTransition } from "react-transition-group";
import tw from "twin.macro";
import FlashMessageRender from "@/components/FlashMessageRender";
import { getElysiumData } from "@/components/elements/elysium/getElysiumData";

export interface PageContentBlockProps {
  title?: string;
  className?: string;
  showFlashKey?: string;
}

const PageContentBlock: React.FC<PageContentBlockProps> = ({
  title,
  showFlashKey,
  className,
  children,
}) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return (
    <CSSTransition timeout={150} classNames={"fade"} appear in>
      <>
        <ContentContainer css={tw`my-4 sm:my-10`} className={className}>
          {showFlashKey && (
            <FlashMessageRender byKey={showFlashKey} css={tw`mb-4`} />
          )}
          {children}
        </ContentContainer>
        <ContentContainer css={tw`mb-4`}>
          <p css={tw`text-center text-neutral-100 text-xs`}>
            <a
              rel={"noopener nofollow noreferrer"}
              href={JSON.parse(getElysiumData("--copyright-link"))}
              target={"_blank"}
              css={tw`no-underline text-neutral-200 hover:text-neutral-100`}
            >
              {JSON.parse(getElysiumData("--copyright-by"))}&reg;
            </a>
            &nbsp;&copy; {JSON.parse(getElysiumData("--copyright-start-year"))}{" "}
            - {new Date().getFullYear()}
          </p>
        </ContentContainer>
      </>
    </CSSTransition>
  );
};

export default PageContentBlock;
