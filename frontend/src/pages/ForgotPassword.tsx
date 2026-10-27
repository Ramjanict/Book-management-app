import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Banner, Button, Field, TextInput } from "../components/ui";
import { AuthFrame } from "./Login";
import { useForgotPasswordMutation } from "../features/api";
import { apiError } from "../lib/format";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [send, state] = useForgotPasswordMutation();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const result = await send({ email }).unwrap();
      setMessage(result.message);
    } catch (caught) {
      setError(apiError(caught));
    }
  }

  return (
    <AuthFrame title="Reset your password" text="We will not say whether the email is registered. In local development the reset link is printed in the API log.">
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <Banner>{error}</Banner> : null}
        {message ? <Banner tone="ok">{message}</Banner> : null}
        <Field label="Email">
          <TextInput type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Button type="submit" busy={state.isLoading} className="w-full">
          Send reset link
        </Button>
        <Link to="/login" className="text-sm font-semibold text-pine">Back to sign in</Link>
      </form>
    </AuthFrame>
  );
}
