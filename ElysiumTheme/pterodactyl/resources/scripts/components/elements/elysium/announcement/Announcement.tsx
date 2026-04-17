import React, { useState } from 'react';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import { getElysiumData } from '@/components/elements/elysium/getElysiumData';
import AnnouncementContainer from '@/components/elements/elysium/announcement/AnnouncementContainer';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faTimes } from "@fortawesome/free-solid-svg-icons";

const AnnouncementType = getElysiumData('--announcement-type');
const AnnouncementClosable = getElysiumData('--announcement-closable');
const AnnouncementMessage = JSON.parse(getElysiumData('--announcement-message'));

const COLORS: Record<string, string> = {
    information: getElysiumData('--announcement-color-information'),
    update: getElysiumData('--announcement-color-update'),
    warning: getElysiumData('--announcement-color-warning'),
    error: getElysiumData('--announcement-color-error'),
};

const Announcement = () => {
    const [announcementClosed, setAnnouncementClosed] = useState(false);

    const handleCloseAnnouncement = () => {
        setAnnouncementClosed(true);
    };

    let announcementComponent = null;

    if (!announcementClosed && ['information', 'update', 'warning', 'error'].includes(AnnouncementType)) {
        announcementComponent = (
            <AnnouncementContainer css={`background-color: ${COLORS[AnnouncementType] || 'inherit'}; overflow-wrap: anywhere;`}>
                <div css={tw`mr-2 font-bold`}>
                    <FontAwesomeIcon icon={faInfoCircle} css={tw`mr-1`} />
                    {AnnouncementType.charAt(0).toUpperCase() + AnnouncementType.slice(1)}
                    <a css={tw`font-normal ml-1`}>{AnnouncementMessage}</a>
                </div>
                {AnnouncementClosable === 'enable' && (
                    <button onClick={handleCloseAnnouncement} css={tw`ml-auto `}>
                        <FontAwesomeIcon icon={faTimes} css={tw`text-white`} />
                    </button>
                )}
            </AnnouncementContainer>
        );
    }

    return announcementComponent;
};

export default Announcement;
