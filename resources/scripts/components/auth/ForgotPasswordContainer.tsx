import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Reaptcha from 'reaptcha';
import tw from 'twin.macro';
import { ArrowRight, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { useStoreState } from 'easy-peasy';
import requestPasswordResetEmail from '@/api/auth/requestPasswordResetEmail';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import AuthTextField from '@/components/auth/AuthTextField';
import { getElysiumData } from '@/components/elements/elysium/getElysiumData';
import useFlash from '@/plugins/useFlash';

interface Values {
    email: string;
}

export default () => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');

    const { clearFlashes, addFlash } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    const handleSubmission = ({ email }: Values, { setSubmitting, resetForm }: FormikHelpers<Values>) => {
        clearFlashes();

        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                setSubmitting(false);
                addFlash({
                    type: 'error',
                    title: 'Error',
                    message: httpErrorToHuman(error),
                });
            });

            return;
        }

        requestPasswordResetEmail(email, token)
            .then((response) => {
                resetForm();
                addFlash({ type: 'success', title: 'Success', message: response });
                toast.success('Reset email sent', {
                    description: 'Cek inbox kamu untuk langkah reset password.',
                });
            })
            .catch((error) => {
                addFlash({
                    type: 'error',
                    title: 'Error',
                    message: httpErrorToHuman(error),
                });
                toast.error('Gagal mengirim email reset password.');
            })
            .then(() => {
                setToken('');
                if (ref.current) ref.current.reset();

                setSubmitting(false);
            });
    };

    return (
        <Formik
            onSubmit={handleSubmission}
            initialValues={{ email: '' }}
            validationSchema={object().shape({
                email: string().email('A valid email address must be provided to continue.').required('A valid email address must be provided to continue.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer
                    title={'Request Password Reset'}
                    subtitle={'Masukkan email akun untuk menerima link reset password.'}
                    footer={
                        <div css={tw`text-center`}>
                            <Link css={tw`text-sm font-semibold text-neutral-300 hover:underline`} to={'/auth/login'}>
                                Return to Login
                            </Link>
                        </div>
                    }
                >
                    <AuthTextField
                        label={'Account Email'}
                        name={'email'}
                        type={'email'}
                        placeholder={'name@domain.com'}
                        disabled={isSubmitting}
                        icon={<Mail size={18} />}
                    />

                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={(response) => {
                                setToken(response);
                                submitForm();
                            }}
                            onExpire={() => {
                                setSubmitting(false);
                                setToken('');
                            }}
                        />
                    )}

                    <button
                        type={'submit'}
                        disabled={isSubmitting}
                        css={tw`w-full flex items-center justify-center py-4 rounded-2xl text-sm font-bold text-white shadow-lg disabled:opacity-60`}
                        style={{ backgroundColor: getElysiumData('--color-4').trim() || '#2563eb' }}
                    >
                        {isSubmitting ? (
                            <div css={tw`w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin`} />
                        ) : (
                            <>
                                <span>Send Reset Link</span>
                                <ArrowRight size={16} css={tw`ml-2`} />
                            </>
                        )}
                    </button>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
