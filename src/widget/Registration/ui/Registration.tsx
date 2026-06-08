import { useState, FormEvent, ChangeEvent, ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/app/store/hooks";
import { setAuth } from "@/app/store/slices/authSlice";
import { useRegisterMutation } from "@/app/store/api/authApi";
import { Input, Button } from "@/shared";
import { registrationSchema, RegistrationFormData } from "../lib";
import style from "./Registration.module.css";

/**
 * Registration — форма регистрации
 */
const Registration = (): ReactElement => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
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
        refreshToken: result.refreshToken,
        user: result.user,
      }));
      navigate("/");
    } catch (err: any) {
      if (err?.data?.errors) {
        const formatted: Record<string, string> = {};
        err.data.errors.forEach((e: any) => {
          formatted[e.path[0]] = e.message;
        });
        setErrors(formatted);
      } else {
        setErrors({ global: err?.data?.message || "REG_ERROR" });
      }
    }
  };

  return (
    <div className={style.authWrapper}>
      <div className={style.authCard}>
        <div className={style.authHeader}>
          <h1 className={style.authTitle}>
            <span className={style.prompt}>{`>`}</span>
            <span>{`register`}</span>
          </h1>
          <p className={style.authSubtitle}>{`// join_the_community`}</p>
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
              disabled={isLoading}
              autoComplete="email"
              fullWidth
            />
          </div>

          <div className={style.fieldGroup}>
            <label className={style.label} htmlFor="username">{`> USERNAME`}</label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              error={errors.username ? `! ${errors.username}` : undefined}
              placeholder={"> choose_username"}
              disabled={isLoading}
              autoComplete="username"
              fullWidth
            />
          </div>

          <div className={style.fieldGroup}>
            <label className={style.label} htmlFor="password">{`> PASSWORD`}</label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password ? `! ${errors.password}` : undefined}
              placeholder={"> min_8_chars"}
              disabled={isLoading}
              autoComplete="new-password"
              fullWidth
              helperText={"[letter+number]"}
            />
          </div>

          <div className={style.fieldGroup}>
            <label className={style.label} htmlFor="confirmPassword">{`> CONFIRM`}</label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword ? `! ${errors.confirmPassword}` : undefined}
              placeholder={"> repeat_password"}
              disabled={isLoading}
              autoComplete="new-password"
              fullWidth
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            className={style.submitBtn}
          >
            {isLoading ? `[creating...]` : `[register]`}
          </Button>

          <p className={style.authFooter}>
            {`// has_account?`}{" "}
            <Link to="/autorization" className={style.linkLogin}>
              {`[login]`}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Registration;