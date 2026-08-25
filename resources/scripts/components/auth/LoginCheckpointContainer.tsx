import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import loginCheckpoint from '@/api/auth/loginCheckpoint';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import useFlash from '@/plugins/useFlash';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';
import Reaptcha from 'reaptcha';
import ReCaptchaPortal from '@/components/auth/ReCaptchaPortal';
import { ShieldCheck, Key, ArrowLeft, ArrowRight, Smartphone } from 'lucide-react';

interface Values {
    code: string;
    recoveryCode: string;
}

const LoginCheckpointContainer = ({ history, location }: RouteComponentProps<Record<string, string | undefined>, any, { token?: string }>) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');
    const [isMissingDevice, setIsMissingDevice] = useState(false);

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => {
        clearFlashes();
    }, []);

    if (!location.state?.token) {
        history.replace('/auth/login');
        return null;
    }

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
            return;
        }

        loginCheckpoint(location.state?.token || '', values.code, values.recoveryCode, token)
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }
                setSubmitting(false);
            })
            .catch((error) => {
                console.error(error);
                setToken('');
                if (ref.current) ref.current.reset();
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{
                code: '',
                recoveryCode: '',
            }}
            validationSchema={object().shape({
                code: string().when('recoveryCode', {
                    is: (val: string) => !val || val.length === 0,
                    then: string().required('Kode autentikasi 2FA wajib diisi.'),
                }),
                recoveryCode: string().when('code', {
                    is: (val: string) => !val || val.length === 0,
                    then: string().required('Kode pemulihan cadangan wajib diisi.'),
                }),
            })}
        >
            {({ isSubmitting, setFieldValue, submitForm }) => (
                <LoginFormContainer
                    title={'Autentikasi 2-Faktor'}
                    subtitle={'Langkah verifikasi keamanan tambahan diperlukan'}
                >
                    <AuthField
                        name={isMissingDevice ? 'recoveryCode' : 'code'}
                        label={isMissingDevice ? 'Kode Pemulihan Cadangan' : 'Kode Autentikasi 2FA'}
                        icon={isMissingDevice ? Key : ShieldCheck}
                        placeholder={isMissingDevice ? 'Masukkan kode cadangan...' : 'Contoh: 123456'}
                        description={
                            isMissingDevice
                                ? 'Masukkan salah satu kode cadangan/pemulihan yang Anda simpan saat mengaktifkan 2FA.'
                                : 'Masukkan 6-digit kode verifikasi yang ditampilkan di aplikasi authenticator Anda.'
                        }
                        autoComplete={'one-time-code'}
                        disabled={isSubmitting}
                        autoFocus
                    />

                    <div className={'pt-2'}>
                        <AuthButton
                            type={'submit'}
                            disabled={isSubmitting}
                            isLoading={isSubmitting}
                            icon={<ArrowRight size={17} />}
                        >
                            Lanjutkan Verifikasi
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

                    <div className={'pt-2 text-center'}>
                        <button
                            type={'button'}
                            onClick={() => {
                                setFieldValue('code', '');
                                setFieldValue('recoveryCode', '');
                                setIsMissingDevice((s) => !s);
                            }}
                            className={'inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none'}
                        >
                            {isMissingDevice ? <Smartphone size={13} /> : <Key size={13} />}
                            <span>{!isMissingDevice ? 'Kehilangan perangkat 2FA? Gunakan kode cadangan' : 'Gunakan aplikasi authenticator'}</span>
                        </button>
                    </div>

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

export default LoginCheckpointContainer;
