import React, { memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import tw from "twin.macro";
import isEqual from "react-fast-compare";

interface Props {
  icon?: IconProp | React.ReactNode;
  title: string | React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
  <div css={tw`rounded-2xl shadow-lg bg-elysium-color2`} className={className}>
    <div css={tw`bg-elysium-color2 rounded-2xl p-3`}>
      {typeof title === "string" ? (
        <p css={tw`text-xl font-semibold uppercase flex items-center`}>
          {icon && (
            <span css={tw`mr-2 text-neutral-300 inline-flex items-center`}>
              {React.isValidElement(icon) ? icon : <FontAwesomeIcon icon={icon as IconProp} />}
            </span>
          )}
          {title}
        </p>
      ) : (
        title
      )}
    </div>
    <div css={tw`p-3`}>{children}</div>
  </div>
);

export default memo(TitledGreyBox, isEqual);
