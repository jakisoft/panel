import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
import Reaptcha, { ReaptchaProps } from 'reaptcha';

const ReCaptchaPortal = forwardRef<Reaptcha, ReaptchaProps>((props, ref) => {
    if (typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <div className={'recaptcha-portal-container'}>
            <Reaptcha {...props} ref={ref} />
        </div>,
        document.body
    );
});

export default ReCaptchaPortal;
