import { useState, FormEvent, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/store/hooks";
import { setAuth } from "@/app/store/slices/authSlice";
import { useLoginMutation } from "@/app/store/api/authApi";
import { Button, Input, useToast } from "@/shared";
import { useRateLimitCountdown } from "@/shared/hooks";
import { handleRateLimitError } from "@/shared/lib/api/handleRateLimitError";
import { getRateLimitMessage } from "@/shared/lib/api/parseRateLimitError";
import { authSchema, AuthFormData } from "../lib";
import logo from "../../../shared/img/6832de8b533af79915e665b090ccb89883ebe89c.png";
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
  const { isBlocked, startCountdown } = useRateLimitCountdown();
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
      <div className={style.authCard}>
        <form className={style.authForm} onSubmit={handleSubmit} noValidate>
          {errors.global && (
            <div className={style.errorGlobal}>{errors.global}</div>
          )}

          <p className={style.authTitle}>Вход</p>

          <div className={style.authFormGroup}>
            <label className={style.authFormGroupLabel} htmlFor="email">{`Email`}</label>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              fullWidth
            />
          </div>

          <div className={style.authFormGroup}>
            <label className={style.authFormGroupLabel} htmlFor="password">{`Password`}</label>
            <Input
              type="password"
              name="password"
              placeholder="Password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              fullWidth
            />
          </div>

          <div className={style.authActions}>
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading || isBlocked}
            >
              Войти
            </Button>
            <Button
              type="button"
              fullWidth
              onClick={() => navigate("/registration")}
            >
              Зарегистрироваться
            </Button>
          </div>

      </form>
      <div className={style.authVisual}>
        <img src={logo} alt="" className={style.authLogo} />
      </div>
    </div>
  </div>
)};

export default Autorization;