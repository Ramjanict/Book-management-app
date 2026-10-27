import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "./components/Guard";
import { Shell } from "./components/Shell";
import { AdminBooks } from "./pages/AdminBooks";
import { AdminBorrows } from "./pages/AdminBorrows";
import { AdminCategories } from "./pages/AdminCategories";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminUsers } from "./pages/AdminUsers";
import { AuthorPage } from "./pages/AuthorPage";
import { BookDetails } from "./pages/BookDetails";
import { BookForm } from "./pages/BookForm";
import { Borrows } from "./pages/Borrows";
import { CategoryPage } from "./pages/CategoryPage";
import { Favorites } from "./pages/Favorites";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Forbidden } from "./pages/Forbidden";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Profile } from "./pages/Profile";
import { Register } from "./pages/Register";
import { ResetPassword } from "./pages/ResetPassword";
import { Studio } from "./pages/Studio";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <Home /> },
      { path: "books/:id", element: <BookDetails /> },
      { path: "categories/:slug", element: <CategoryPage /> },
      { path: "authors/:id", element: <AuthorPage /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
      { path: "forbidden", element: <Forbidden /> },
      { path: "wishlists", element: <Navigate to="/favorites" replace /> },
      { path: "cart", element: <Navigate to="/borrows" replace /> },
      {
        element: <RequireAuth />,
        children: [
          { path: "favorites", element: <Favorites /> },
          { path: "profile", element: <Profile /> },
        ],
      },
      {
        element: <RequireAuth roles={["USER", "ADMIN"]} />,
        children: [{ path: "borrows", element: <Borrows /> }],
      },
      {
        element: <RequireAuth roles={["AUTHOR", "ADMIN"]} />,
        children: [
          { path: "studio", element: <Studio /> },
          { path: "studio/books/new", element: <BookForm /> },
          { path: "studio/books/:id/edit", element: <BookForm /> },
        ],
      },
      {
        element: <RequireAuth roles={["ADMIN"]} />,
        children: [
          { path: "admin", element: <AdminDashboard /> },
          { path: "admin/books", element: <AdminBooks /> },
          { path: "admin/categories", element: <AdminCategories /> },
          { path: "admin/users", element: <AdminUsers /> },
          { path: "admin/borrows", element: <AdminBorrows /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
