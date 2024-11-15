import React from "react";
import { createBrowserRouter } from "react-router-dom";
import BookDetails from "../pages/BookDetails";

import Home from "../pages/Home";
import Cart from "../pages/Cart";
import App from "../App";
import WishLists from "../pages/WishLists";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/", element: <Home /> },
      { path: "book-details/:id", element: <BookDetails /> },
      { path: "cart", element: <Cart /> },
      { path: "wishlists", element: <WishLists /> },
    ],
  },
]);

export default router;
