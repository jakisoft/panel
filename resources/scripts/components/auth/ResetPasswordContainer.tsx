import React, { useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import performPasswordReset from '@/api/auth/performPasswordReset';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, ref as yupRef, string } from 'yup';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';
import Reaptcha from 'reaptcha';
import ReCaptchaPortal from '@/components/auth/ReCaptchaPortal';
import useFlash from '@/plugins/useFlash';
import { Lock, Mail, Key, ArrowLeft } from 'lucide-react';

interface Values {
    password: string;
    passwordConfirmation: string;
}

export default ({ match, location }: RouteComponentProps<{ token: string }>) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');

    const { clearFlashes, addFlash } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    const parsed = new URLSearchParams(location.search);
    if (email.length === 0 && parsed.get('email')) {
        setEmail(parsed.get('email') || '');
    }

    const submit = ({ password, passwordConfirmation }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);
                setSubmitting(false);
                addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error) });
            });
            return;
        }

        performPasswordReset(email, { token: match.params.token, password, passwordConfirmation }, token)
            .then(() => {
                // @ts-expect-error this is valid
                window.location = '/';
            })
            .catch((error) => {
                console.error(error);
                setToken('');
                if (ref.current) ref.current.reset();
                setSubmitting(false);
                addFlash({ type: 'error', title: 'Gagal', message: httpErrorToHuman(error) });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                password: '',
                passwordConfirmation: '',
            }}
            validationSchema={object().shape({
                password: string()
                    .required('Kata sandi baru wajib diisi.')
                    .min(8, 'Kata sandi baru minimal harus 8 karakter.'),
                passwordConfirmation: string()
                    .required('Konfirmasi kata sandi baru tidak cocok.')
                    // @ts-expect-error this is valid
                    .oneOf([yupRef('password'), null], 'Konfirmasi kata sandi tidak cocok.'),
            })}
        >
            {({ isSubmitting, submitForm }) => (
                <LoginFormContainer
                    title={'Atur Ulang Kata Sandi'}
                    subtitle={'Buat kata sandi baru yang kuat untuk mengamankan akun Anda'}
                >
                    {/* Readonly Email Display */}
                    {email && (
                        <div className={'w-full space-y-1.5 text-left'}>
                            <label className={'block text-xs font-semibold text-neutral-300 tracking-wide select-none'}>
                                Alamat Email Akun
                            </label>
                            <div className={'flex items-center w-full h-12 rounded-xl bg-neutral-950/70 border border-neutral-800 px-3.5 text-neutral-400 cursor-not-allowed'}>
                                <div className={'pr-2.5 text-neutral-500'}>
                                    <Mail size={18} />
                                </div>
                                <span className={'text-sm font-mono text-neutral-300 truncate'}>
                                    {email}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className={'pt-0.5'}>
                        <AuthField
                            name={'password'}
                            type={'password'}
                            label={'Kata Sandi Baru'}
                            icon={Lock}
                            placeholder={'Masukkan kata sandi baru...'}
                            description={'Kata sandi harus terdiri dari minimal 8 karakter.'}
                            disabled={isSubmitting}
                            autoFocus
                        />
                    </div>

                    <div className={'pt-0.5'}>
                        <AuthField
                            name={'passwordConfirmation'}
                            type={'password'}
                            label={'Konfirmasi Kata Sandi Baru'}
                            icon={Lock}
                            placeholder={'Ulangi kata sandi baru...'}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={'pt-2'}>
                        <AuthButton
                            type={'submit'}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                            icon={<Key size={17} />}
                        >
                            Simpan Kata Sandi Baru
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
