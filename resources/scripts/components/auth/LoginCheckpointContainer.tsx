import React, { useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import loginCheckpoint from '@/api/auth/loginCheckpoint';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { ActionCreator } from 'easy-peasy';
import { StaticContext } from 'react-router';
import { useFormikContext, withFormik } from 'formik';
import useFlash from '@/plugins/useFlash';
import { FlashStore } from '@/state/flashes';
import AuthField from '@/components/auth/AuthField';
import AuthButton from '@/components/auth/AuthButton';
import { ShieldCheck, Key, ArrowLeft, ArrowRight } from 'lucide-react';

interface Values {
    code: string;
    recoveryCode: '';
}

type OwnProps = RouteComponentProps<Record<string, string | undefined>, StaticContext, { token?: string }>;

type Props = OwnProps & {
    clearAndAddHttpError: ActionCreator<FlashStore['clearAndAddHttpError']['payload']>;
};

const LoginCheckpointContainer = () => {
    const { isSubmitting, setFieldValue } = useFormikContext<Values>();
    const [isMissingDevice, setIsMissingDevice] = useState(false);

    return (
        <LoginFormContainer
            title={'Autentikasi 2FA'}
            subtitle={'Verifikasi identitas tambahan diperlukan'}
        >
            <AuthField
                name={isMissingDevice ? 'recoveryCode' : 'code'}
                label={isMissingDevice ? 'Kode Pemulihan (Recovery Code)' : 'Kode Autentikasi 2FA'}
                icon={isMissingDevice ? Key : ShieldCheck}
                placeholder={isMissingDevice ? 'Masukkan kode pemulihan...' : 'Contoh: 123456'}
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

            <div className={'pt-1 text-center'}>
                <button
                    type={'button'}
                    onClick={() => {
                        setFieldValue('code', '');
                        setFieldValue('recoveryCode', '');
                        setIsMissingDevice((s) => !s);
                    }}
                    className={'text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none'}
                >
                    {!isMissingDevice ? 'Kehilangan Perangkat 2FA? Gunakan Kode Cadangan' : 'Gunakan Aplikasi Authenticator'}
                </button>
            </div>

            <div className={'pt-1 text-center'}>
                <Link
                    to={'/auth/login'}
                    className={'inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 hover:text-primary-400 no-underline transition-colors'}
                >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Halaman Login</span>
                </Link>
            </div>
        </LoginFormContainer>
    );
};

const EnhancedForm = withFormik<Props, Values>({
    handleSubmit: ({ code, recoveryCode }, { setSubmitting, props: { clearAndAddHttpError, location } }) => {
        loginCheckpoint(location.state?.token || '', code, recoveryCode)
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
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    },

    mapPropsToValues: () => ({
        code: '',
        recoveryCode: '',
    }),
})(LoginCheckpointContainer);

export default ({ history, location, ...props }: OwnProps) => {
    const { clearAndAddHttpError } = useFlash();

    if (!location.state?.token) {
        history.replace('/auth/login');
        return null;
    }

    return (
        <EnhancedForm clearAndAddHttpError={clearAndAddHttpError} history={history} location={location} {...props} />
    );
};
