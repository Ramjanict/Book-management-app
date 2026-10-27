import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LuMenu, LuX } from "react-icons/lu";
import { useAppDispatch, useAppSelector } from "../app/store";
import { api, useLogoutMutation, useMeQuery } from "../features/api";
import { clearAuth, setUser } from "../features/authSlice";
import { cx, label } from "../lib/format";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cx(
    "rounded-md px-3 py-2 text-sm font-medium transition",
    isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
  );

export function Shell() {
  const user = useAppSelector((state) => state.auth.user);
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const refreshToken = useAppSelector((state) => state.auth.refreshToken);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const { data } = useMeQuery(undefined, { skip: !accessToken });
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (data) dispatch(setUser(data));
  }, [data, dispatch]);

  useEffect(() => {
    setOpen(false);
    setMenu(false);
  }, [location.pathname]);

  const links = [
    { to: "/", label: "Catalog", show: true },
    { to: "/favorites", label: "Saved", show: Boolean(user) },
    { to: "/borrows", label: "Loans", show: Boolean(user && user.role !== "AUTHOR") },
    { to: "/studio", label: "Studio", show: user?.role === "AUTHOR" || user?.role === "ADMIN" },
    { to: "/admin", label: "Admin", show: user?.role === "ADMIN" },
  ];

  async function signOut() {
    try {
      if (refreshToken) await logout({ refreshToken }).unwrap();
    } finally {
      dispatch(clearAuth());
      dispatch(api.util.resetApiState());
      navigate("/");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 bg-ink text-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <button className="rounded-md p-2 text-white lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Menu">
            {open ? <LuX /> : <LuMenu />}
          </button>
          <Link to="/" className="mr-2 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-pine font-serif text-lg">R</span>
            <span className="leading-tight">
              <span className="block font-serif text-lg">Ramjan</span>
              <span className="-mt-1 block text-[10px] uppercase tracking-[0.18em] text-white/50">Library</span>
            </span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {links.filter((item) => item.show).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white/10"
                  onClick={() => setMenu((value) => !value)}
                >
                  <span className="max-w-32 truncate">{user.name}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wider">
                    {label(user.role)}
                  </span>
                </button>
                {menu ? (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-line bg-card py-1 text-ink shadow-card">
                    <Link to="/profile" className="block px-3 py-2 text-sm hover:bg-paper">
                      Profile
                    </Link>
                    <button className="block w-full px-3 py-2 text-left text-sm hover:bg-paper" onClick={signOut}>
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm text-white/80 hover:text-white">
                  Sign in
                </Link>
                <Link to="/register" className="rounded-lg bg-pine px-3 py-2 text-sm font-semibold text-white hover:bg-pine-dark">
                  Join
                </Link>
              </>
            )}
          </div>
        </div>
        {open ? (
          <nav className="space-y-1 border-t border-white/10 px-4 py-3 lg:hidden">
            {links.filter((item) => item.show).map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        ) : null}
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-mute sm:px-6">
          <span>Ramjan Library</span>
          <span>Readers, authors, and admins</span>
        </div>
      </footer>
    </div>
  );
}
