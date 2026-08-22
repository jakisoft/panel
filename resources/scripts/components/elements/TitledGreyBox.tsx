import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div css={tw`rounded-2xl shadow-xl bg-neutral-900 border border-neutral-800 overflow-hidden`} className={className}>
        <div css={tw`bg-neutral-950/80 rounded-t-2xl p-4 border-b border-neutral-800`}>
            {typeof title === 'string' ? (
                <p css={tw`text-sm font-bold uppercase tracking-wider text-neutral-300`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2 text-cyan-400`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div css={tw`p-4 sm:p-5`}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
