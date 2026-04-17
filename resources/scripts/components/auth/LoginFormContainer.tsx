import React, { forwardRef } from "react";
import { Form } from "formik";
import styled from "styled-components/macro";
import { breakpoint } from "@/theme";
import FlashMessageRender from "@/components/FlashMessageRender";
import tw from "twin.macro";
import { getElysiumData } from "@/components/elements/elysium/getElysiumData";

type Props = React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
> & {
  title?: string;
};

const Container = styled.div`
  ${breakpoint("sm")`
        ${tw`mx-auto`}
    `};

  ${breakpoint("md")`
        ${tw`p-10`}
    `};

  ${breakpoint("xl")`
        ${tw`w-auto`}
    `};
`;

export default forwardRef<HTMLFormElement, Props>(
  ({ title, ...props }, ref) => (
    <div css={tw`flex justify-center flex-col`}>
      <Container>
        <FlashMessageRender css={tw`mb-2 px-1`} />
        <div
          css={tw`flex flex-col md:flex-row items-center bg-elysium-color2 rounded-2xl shadow-lg md:py-16 md:px-12 py-12 px-6 md:mb-8 mb-4 ease-in-out duration-300`}
        >
          <img
            css={tw`w-48 md:mr-8`}
            src={JSON.parse(getElysiumData("--logo"))}
            alt="brand logo"
          />
          <div css={tw`flex flex-col`}>
            {title && (
              <h2 css={tw`text-base text-neutral-100 font-medium py-4`}>
                {title}
              </h2>
            )}
            <div css={tw`block w-80`}>
              <Form css={tw`flex flex-col`} {...props} ref={ref}>
                {props.children}
              </Form>
            </div>
          </div>
        </div>
        <p css={tw`text-center text-neutral-100 text-xs mt-4`}>
          &copy; {JSON.parse(getElysiumData("--copyright-start-year"))} -{" "}
          {new Date().getFullYear()}&nbsp;
          <a
            rel={"noopener nofollow noreferrer"}
            href={JSON.parse(getElysiumData("--copyright-link"))}
            target={"_blank"}
            css={tw`no-underline text-neutral-200 hover:text-neutral-100`}
          >
            {JSON.parse(getElysiumData("--copyright-by"))}
          </a>
        </p>
      </Container>
    </div>
  )
);
