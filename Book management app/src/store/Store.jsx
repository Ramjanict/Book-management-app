import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
export const Context = createContext();

const ContextContainer = ({ children }) => {
  const [data, setData] = useState([]);
  const [cartItems, setCartItems] = useState(
    localStorage.getItem("cartItem")
      ? JSON.parse(localStorage.getItem("cartItem"))
      : []
  );
  const [wishItems, setWishItems] = useState(
    localStorage.getItem("wishItem")
      ? JSON.parse(localStorage.getItem("wishItem"))
      : []
  );

  const addtoCart = (book) => {
    const isItemInCart = cartItems.find((cartItem) => cartItem.id === book.id);

    if (isItemInCart) {
      toast("Book already in cart");
      setCartItems(
        cartItems.map((cartItem) =>
          cartItem.id === book.id
            ? { ...cartItem, qunatity: cartItem.qunatity + 1 }
            : cartItem
        )
      );
    } else {
      toast("Add Book Successfully");
      setCartItems([...cartItems, { ...book, qunatity: 1 }]);
    }
  };
  const removeFromCart = (book) => {
    const isItemInCart = cartItems.find((cartItem) => cartItem.id === book.id);
    if (isItemInCart) {
      setCartItems(cartItems.filter((cartItem) => cartItem.id !== book.id));
      toast("Remove Book Successfully");
    }
  };
  const addtoWish = (book) => {
    const isItemInWish = wishItems.find((wishItem) => wishItem.id === book.id);

    if (isItemInWish) {
      setWishItems(
        wishItems.map((wishItem) =>
          wishItem.id === book.id
            ? { ...wishItem, qunatity: wishItem.qunatity + 1 }
            : wishItem
        )
      );
    } else {
      setWishItems([...wishItems, { ...book, qunatity: 1 }]);
    }
  };

  const removeFromWish = (book) => {
    const isItemInWish = wishItems.find((wishItem) => wishItem.id === book.id);
    if (isItemInWish) {
      setWishItems(wishItems.filter((wishItem) => wishItem.id !== book.id));
    }
  };
  const emptyWish = () => {
    setWishItems([]);
    toast("Empty wishlist Successfully");
  };

  //save book items in browser as string
  useEffect(() => {
    localStorage.setItem("cartItem", JSON.stringify(cartItems));
  }, [cartItems]);

  //add wishlisted book in browser as string
  useEffect(() => {
    localStorage.setItem("wishItem", JSON.stringify(wishItems));
  }, [wishItems]);

  //covert JavaScript object
  useEffect(() => {
    const cartItem = localStorage.getItem("cartItem");
    if (cartItem) {
      setCartItems(JSON.parse(cartItem));
    }

    const wishItem = localStorage.getItem("wishItem");
    if (wishItem) {
      setWishItems(JSON.parse(wishItem));
    }
  }, []);

  //Call the main API
  useEffect(() => {
    fetch("https://gutendex.com/books/")
      .then((res) => res.json())
      .then((data) => setData(data.results));
  }, []);
  return (
    <Context.Provider
      value={{
        data,
        cartItems,
        addtoCart,
        removeFromCart,
        wishItems,
        addtoWish,
        removeFromWish,
        emptyWish,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export default ContextContainer;
