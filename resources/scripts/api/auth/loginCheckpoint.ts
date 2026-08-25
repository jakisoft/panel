import http from '@/api/http';
import { LoginResponse } from '@/api/auth/login';

export default (token: string, code: string, recoveryToken?: string, recaptchaData?: string): Promise<LoginResponse> => {
    return new Promise((resolve, reject) => {
        http.post('/auth/login/checkpoint', {
            confirmation_token: token,
            authentication_code: code,
            recovery_token: recoveryToken && recoveryToken.length > 0 ? recoveryToken : undefined,
            'g-recaptcha-response': recaptchaData,
        })
            .then((response) =>
                resolve({
                    complete: response.data.data.complete,
                    intended: response.data.data.intended || undefined,
                })
            )
            .catch(reject);
    });
};
