import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import requestPasswordResetEmail from '@/api/auth/requestPasswordResetEmail';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Reaptcha from 'reaptcha';
import ReCaptchaPortal from '@/components/auth/ReCaptchaPortal';
import useFlash from '@/plugins/useFlash';
import { Mail, ArrowLeft, Send } from 'lucide-react';

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
                console.error(error);
                setSubmitting(false);
                addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error) });
            });
            return;
        }

        requestPasswordResetEmail(email, token)
            .then((response) => {
                resetForm();
                addFlash({ type: 'success', title: 'Berhasil', message: response });
            })
            .catch((error) => {
                console.error(error);
                addFlash({ type: 'error', title: 'Gagal', message: httpErrorToHuman(error) });
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
                email: string()
                    .email('Format alamat email tidak valid.')
                    .required('Alamat email akun wajib diisi untuk melanjutkan.'),
            })}
        >
            {({ isSubmitting, submitForm }) => (
                <LoginFormContainer
                    title={'Lupa Kata Sandi'}
                    subtitle={'Masukkan email terdaftar untuk menerima instruksi pemulihan akun'}
                >
                    <AuthField
                        name={'email'}
                        type={'email'}
                        label={'Alamat Email Akun'}
                        icon={Mail}
                        placeholder={'contoh@domain.com'}
                        description={'Tautan reset kata sandi akan dikirimkan ke alamat email terdaftar ini.'}
                        disabled={isSubmitting}
                        autoFocus
                    />

                    <div className={'pt-2'}>
                        <AuthButton
                            type={'submit'}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                            icon={<Send size={17} />}
                        >
                            Kirim Tautan Pemulihan
                        </AuthButton>
                    </div>

                    {recaptchaEnabled && (
                        <ReCaptchaPortal
                            ref={ref}
                            size={'invisible'}
                            badge={'bottomright'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={(response) => {
                                setToken(response);
                                submitForm();
                            }}
                            onExpire={() => {
                                setToken('');
                            }}
                        />
                    )}

                    <div className={'pt-2 text-center border-t border-neutral-800/70 mt-2'}>
                        <Link
                            to={'/auth/login'}
                            className={'inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-primary-400 no-underline transition-colors'}
                        >
                            <ArrowLeft size={14} />
                            <span>Kembali ke Halaman Login</span>
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
