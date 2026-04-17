import React from "react";
import FlashMessageRender from "@/components/FlashMessageRender";
import SpinnerOverlay from "@/components/elements/SpinnerOverlay";
import tw from "twin.macro";

type Props = Readonly<
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > & {
    title?: string;
    borderColor?: string;
    showFlashes?: string | boolean;
    showLoadingOverlay?: boolean;
  }
>;

const ContentBox = ({
  title,
  borderColor,
  showFlashes,
  showLoadingOverlay,
  children,
  ...props
}: Props) => (
  <div {...props}>
    {showFlashes && (
      <FlashMessageRender
        byKey={typeof showFlashes === "string" ? showFlashes : undefined}
        css={tw`mb-4`}
      />
    )}
    <div
      css={[
        tw`bg-elysium-color2 px-6 py-6 rounded-2xl shadow-lg relative`,
        !!borderColor && tw`border-t-4`,
      ]}
    >
      {title && <h2 css={tw`text-neutral-100 mb-8 text-2xl`}>{title}</h2>}
      <SpinnerOverlay visible={showLoadingOverlay || false} />
      {children}
    </div>
  </div>
);

export default ContentBox;
