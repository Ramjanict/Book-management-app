import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Banner, Button, Field, PasswordInput } from "../components/ui";
import { AuthFrame } from "./Login";
import { useResetPasswordMutation } from "../features/api";
import { apiError } from "../lib/format";

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [reset, state] = useResetPasswordMutation();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await reset({ token, newPassword: password }).unwrap();
      navigate("/login", { replace: true });
    } catch (caught) {
      setError(apiError(caught));
    }
  }

  return (
    <AuthFrame title="Choose a new password" text="Use the token from the reset link. After this, sign in again.">
      <form className="space-y-4" onSubmit={onSubmit}>
        {!token ? <Banner>This page needs a reset token. Open the link from the reset message.</Banner> : null}
        {error ? <Banner>{error}</Banner> : null}
        <Field label="New password">
          <PasswordInput autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
        </Field>
        <Button type="submit" busy={state.isLoading} disabled={!token} className="w-full">
          Update password
        </Button>
        <Link to="/login" className="text-sm font-semibold text-pine">Back to sign in</Link>
      </form>
    </AuthFrame>
  );
}
