import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAppDispatch } from "@/app/store/hooks";
import { setAuth } from "@/app/store/slices/authSlice";
import { useLoginMutation } from "@/app/store/api/authApi";
import { Button, Input, useToast } from "@/shared";
import { useRateLimitCountdown } from "@/shared/hooks";
import { handleRateLimitError } from "@/shared/lib/api/handleRateLimitError";
import { getRateLimitMessage } from "@/shared/lib/api/parseRateLimitError";
import { authSchema, AuthFormData } from "../lib";
import style from "./Autorization.module.css";

type ValidationErrorItem = {
  path: (string | number)[];
  message: string;
};

type LoginApiError = {
  data?: {
    errors?: ValidationErrorItem[];
    message?: string;
    retryAfterSeconds?: number;
  };
};

const getLoginErrorData = (err: unknown): LoginApiError["data"] | undefined => {
  if (typeof err === "object" && err !== null && "data" in err) {
    return (err as LoginApiError).data;
  }
  return undefined;
};

/**
 * Autorization — форма входа
 */
const Autorization = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [login, { isLoading }] = useLoginMutation();
  const { showToast } = useToast();
  const { secondsLeft, isBlocked, startCountdown } = useRateLimitCountdown();
  const [formData, setFormData] = useState<AuthFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const clientResult = authSchema.safeParse(formData);
    if (!clientResult.success) {
      const formattedErrors: Record<string, string> = {};
      clientResult.error.issues.forEach((err) => {
        formattedErrors[err.path[0] as string] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

    try {
      const result = await login(formData).unwrap();
      dispatch(setAuth({
        accessToken: result.accessToken,
        user: result.user,
      }));
      navigate("/");
    } catch (err: unknown) {
      if (handleRateLimitError(err, { startCountdown, showToast })) {
        const data = getLoginErrorData(err);
        setErrors({
          global: getRateLimitMessage(data?.retryAfterSeconds ?? 60),
        });
        return;
      }

      const data = getLoginErrorData(err);

      if (data?.errors) {
        const formatted: Record<string, string> = {};
        data.errors.forEach((e) => {
          formatted[String(e.path[0])] = e.message;
        });
        setErrors(formatted);
      } else {
        setErrors({ global: data?.message || "AUTH_ERROR" });
      }
    }
  };

  return (
    <div className={style.authWrapper}>
      {/* <AuthBackground /> */}
      
      <div className={style.authCard}>
        <div className={style.authHeader}>
          <h1 className={style.authTitle}>
            <span className={style.prompt}>{`>`}</span>
            <span>{`login`}</span>
          </h1>
          <p className={style.authSubtitle}>{`// proceed_to_dashboard`}</p>
        </div>

        <form className={style.authForm} onSubmit={handleSubmit} noValidate>
          {errors.global && (
            <div className={style.errorGlobal}>{`! ${errors.global}`}</div>
          )}

          <div className={style.fieldGroup}>
            <label className={style.label} htmlFor="email">{`> EMAIL`}</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email ? `! ${errors.email}` : undefined}
              placeholder={"> you@example.com"}
              disabled={isLoading || isBlocked}
              autoComplete="email"
              fullWidth
            />
          </div>

          <div className={style.fieldGroup}>
            <div className={style.labelRow}>
              <label className={style.label} htmlFor="password">{`> PASSWORD`}</label>
              <Button 
                variant="ghost" 
                size="sm" 
                type="button" 
                onClick={() => navigate("/password/reset")}
                className={style.linkForgot}
              >
                {`[reset?]`}
              </Button>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password ? `! ${errors.password}` : undefined}
              placeholder={"> enter_password"}
              disabled={isLoading || isBlocked}
              autoComplete="current-password"
              fullWidth
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            size="md" 
            fullWidth
            loading={isLoading}
            disabled={isLoading || isBlocked}
            className={style.submitBtn}
          >
            {isBlocked
              ? `[retry in ${secondsLeft}s]`
              : isLoading
                ? `[authenticating...]`
                : `[login]`}
          </Button>

          <p className={style.authFooter}>
            {`// new_user?`}{" "}
            <Link to="/registration" className={style.linkRegister}>
              {`[register]`}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Autorization;