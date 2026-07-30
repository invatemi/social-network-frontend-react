import { useState, FormEvent, ChangeEvent, ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/store/hooks";
import { setAuth } from "@/app/store/slices/authSlice";
import { useRegisterMutation } from "@/app/store/api/authApi";
import { fetchUserProfileWithRetry } from "@/entities/user/api";
import { Input, Button, useToast } from "@/shared";
import { useRateLimitCountdown } from "@/shared/hooks";
import { handleRateLimitError } from "@/shared/lib/api/handleRateLimitError";
import { getRateLimitMessage } from "@/shared/lib/api/parseRateLimitError";
import { registrationSchema, RegistrationFormData } from "../lib";
import logo from "../../../shared/img/6832de8b533af79915e665b090ccb89883ebe89c.png";
import style from "./Registration.module.css";

type ValidationErrorItem = {
  path: (string | number)[];
  message: string;
};

type RegisterApiError = {
  data?: {
    errors?: ValidationErrorItem[];
    message?: string;
    retryAfterSeconds?: number;
  };
};

const getRegisterErrorData = (err: unknown): RegisterApiError["data"] | undefined => {
  if (typeof err === "object" && err !== null && "data" in err) {
    return (err as RegisterApiError).data;
  }
  return undefined;
};

/**
 * Registration — форма регистрации
 */
const Registration = (): ReactElement => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const { showToast } = useToast();
  const { secondsLeft, isBlocked, startCountdown } = useRateLimitCountdown();
  const [formData, setFormData] = useState<RegistrationFormData>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
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

    const clientResult = registrationSchema.safeParse(formData);
    if (!clientResult.success) {
      const formattedErrors: Record<string, string> = {};
      clientResult.error.issues.forEach((err) => {
        formattedErrors[err.path[0] as string] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

    try {
      const result = await register(formData).unwrap();
      dispatch(setAuth({
        accessToken: result.accessToken,
        user: result.user,
      }));
      await fetchUserProfileWithRetry(dispatch);
      navigate("/");
    } catch (err: unknown) {
      if (handleRateLimitError(err, { startCountdown, showToast })) {
        const data = getRegisterErrorData(err);
        setErrors({
          global: getRateLimitMessage(data?.retryAfterSeconds ?? 60),
        });
        return;
      }

      const data = getRegisterErrorData(err);

      if (data?.errors) {
        const formatted: Record<string, string> = {};
        data.errors.forEach((e) => {
          formatted[String(e.path[0])] = e.message;
        });
        setErrors(formatted);
      } else {
        setErrors({ global: data?.message || "REG_ERROR" });
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

          <p className={style.authTitle}>Регистрация</p>

          <div className={style.authFormGroup}>
            <label className={style.authFormGroupLabel} htmlFor="email">Email</label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Email"
              disabled={isLoading || isBlocked}
              autoComplete="email"
              fullWidth
            />
          </div>

          <div className={style.authFormGroup}>
            <label className={style.authFormGroupLabel} htmlFor="username">Username</label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="Username"
              disabled={isLoading || isBlocked}
              autoComplete="username"
              fullWidth
            />
          </div>

          <div className={style.authFormGroup}>
            <label className={style.authFormGroupLabel} htmlFor="password">Password</label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Password"
              disabled={isLoading || isBlocked}
              autoComplete="new-password"
              fullWidth
            />
          </div>

          <div className={style.authFormGroup}>
            <label className={style.authFormGroupLabel} htmlFor="confirmPassword">Confirm password</label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Confirm password"
              disabled={isLoading || isBlocked}
              autoComplete="new-password"
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
              {isBlocked ? `Повторить через ${secondsLeft}с` : "Зарегистрироваться"}
            </Button>
            <Button
              type="button"
              fullWidth
              onClick={() => navigate("/autorization")}
            >
              Назад
            </Button>
          </div>
        </form>

        <div className={style.authVisual}>
          <img src={logo} alt="" className={style.authLogo} />
        </div>
      </div>
    </div>
  );
};

export default Registration;
