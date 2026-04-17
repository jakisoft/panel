import React, { useEffect, useRef, useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import login from "@/api/auth/login";
import LoginFormContainer from "@/components/auth/LoginFormContainer";
import { useStoreState } from "easy-peasy";
import { Formik, FormikHelpers } from "formik";
import { object, string } from "yup";
import Field from "@/components/elements/Field";
import tw from "twin.macro";
import { Button } from "@/components/elements/button/index";
import Reaptcha from "reaptcha";
import useFlash from "@/plugins/useFlash";
import { User, Lock, Eye, EyeOff } from "lucide-react";

interface Values {
  username: string;
  password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
  const ref = useRef<Reaptcha>(null);
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { clearFlashes, clearAndAddHttpError } = useFlash();
  const { enabled: recaptchaEnabled, siteKey } = useStoreState(
    (state) => state.settings.data!.recaptcha
  );

  useEffect(() => {
    clearFlashes();
  }, []);

  const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
    clearFlashes();
    if (recaptchaEnabled && !token) {
      ref.current!.execute().catch((error) => {
        setSubmitting(false);
        clearAndAddHttpError({ error });
      });
      return;
    }

    login({ ...values, recaptchaData: token })
      .then((response) => {
        if (response.complete) {
          window.location.href = response.intended || "/";
          return;
        }
        history.replace("/auth/login/checkpoint", { token: response.confirmationToken });
      })
      .catch((error) => {
        setToken("");
        if (ref.current) ref.current.reset();
        setSubmitting(false);
        clearAndAddHttpError({ error });
      });
  };

  return (
    <div css={tw`absolute top-0 bg-[#191919] font-mono`}>
      <div css={tw`w-screen h-screen flex items-center justify-center`}>
        <Formik
          onSubmit={onSubmit}
          initialValues={{ username: "", password: "" }}
          validationSchema={object().shape({
            username: string().required("A username or email must be provided."),
            password: string().required("Please enter your account password."),
          })}
        >
          {({ isSubmitting, submitForm }) => (
            <LoginFormContainer title={"Login to Continue"} css={tw`w-full flex`}>
              <div css={tw`relative`}>
                <User size={18} css={tw`absolute left-3 top-11 text-neutral-500`} />
                <Field
                  type={"text"}
                  label={"Username or Email"}
                  name={"username"}
                  disabled={isSubmitting}
                  css={tw`pl-10 bg-neutral-900 border-neutral-800 text-white rounded-lg focus:border-blue-500`}
                />
              </div>
              <div css={tw`mt-6 relative`}>
                <Lock size={18} css={tw`absolute left-3 top-11 text-neutral-500`} />
                <Field
                  type={showPassword ? "text" : "password"}
                  label={"Password"}
                  name={"password"}
                  disabled={isSubmitting}
                  css={tw`pl-10 bg-neutral-900 border-neutral-800 text-white rounded-lg focus:border-blue-500`}
                />
                <div 
                  css={tw`absolute right-3 top-11 cursor-pointer text-neutral-500 hover:text-white`}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>
              {recaptchaEnabled && (
                <Reaptcha
                  ref={ref}
                  size={"invisible"}
                  sitekey={siteKey || "_invalid_key"}
                  onVerify={(response) => { setToken(response); submitForm(); }}
                />
              )}
              <div css={tw`mt-8`}>
                <Button css={tw`w-full py-3 bg-white text-black font-bold hover:bg-neutral-200 transition-all`} type={"submit"} disabled={isSubmitting}>
                  Sign In
                </Button>
                <div css={tw`flex flex-col gap-2 mt-4`}>
                    <Link to="/auth/register" css={tw`text-center text-sm text-neutral-400 hover:text-white`}>
                        Don't have an account? <span css={tw`text-white underline`}>Register</span>
                    </Link>
                    <Link to={`/auth/password`} css={tw`text-center text-xs text-red-400 hover:text-red-300`}>
                        Forgot Password?
                    </Link>
                </div>
              </div>
            </LoginFormContainer>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default LoginContainer;
