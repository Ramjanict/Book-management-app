import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store";
import { Banner, Button, Field, PasswordInput, TextArea, TextInput } from "../components/ui";
import { AuthFrame } from "./Login";
import { useLoginMutation, useRegisterMutation } from "../features/api";
import { setCredentials } from "../features/authSlice";
import { apiError, homeFor, withProtocol } from "../lib/format";

export function Register() {
  const existing = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [role, setRole] = useState<"USER" | "AUTHOR">("USER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [penName, setPenName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [registerUser, registerState] = useRegisterMutation();
  const [login] = useLoginMutation();

  if (existing) return <Navigate to={homeFor(existing.role)} replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await registerUser({
        name,
        email,
        password,
        role,
        penName: role === "AUTHOR" ? penName || undefined : undefined,
        bio: role === "AUTHOR" ? bio || undefined : undefined,
        website: role === "AUTHOR" ? withProtocol(website) : undefined,
      }).unwrap();
      const session = await login({ email, password }).unwrap();
      dispatch(setCredentials(session));
      navigate(homeFor(session.user.role), { replace: true });
    } catch (caught) {
      setError(apiError(caught));
    }
  }

  return (
    <AuthFrame title="Join the library" text="Read as a member, or open an author studio and submit books for approval.">
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <Banner>{error}</Banner> : null}
        <div className="grid grid-cols-2 rounded-lg bg-paper p-1 text-sm font-semibold">
          {(["USER", "AUTHOR"] as const).map((value) => (
            <button
              key={value}
              type="button"
              className={`rounded-md px-3 py-2 ${role === value ? "bg-card text-ink shadow-card" : "text-mute"}`}
              onClick={() => setRole(value)}
            >
              {value === "USER" ? "Reader" : "Author"}
            </button>
          ))}
        </div>
        <Field label="Name">
          <TextInput required minLength={2} value={name} onChange={(event) => setName(event.target.value)} />
        </Field>
        <Field label="Email">
          <TextInput type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </Field>
        <Field label="Password" hint="At least 6 characters.">
          <PasswordInput autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} />
        </Field>
        {role === "AUTHOR" ? (
          <>
            <Field label="Pen name">
              <TextInput value={penName} onChange={(event) => setPenName(event.target.value)} placeholder="Defaults to your name" />
            </Field>
            <Field label="Bio">
              <TextArea value={bio} onChange={(event) => setBio(event.target.value)} />
            </Field>
            <Field label="Website">
              <TextInput value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" />
            </Field>
          </>
        ) : null}
        <Button type="submit" busy={registerState.isLoading} className="w-full">
          Create account
        </Button>
        <p className="text-sm text-mute">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-pine">Sign in</Link>
        </p>
      </form>
    </AuthFrame>
  );
}
