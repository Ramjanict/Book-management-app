import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/Store";
import CartItem from "../components/cart/CartItem";

const Cart = () => {
  const [loading, setLoading] = useState(false);
  const { cartItems } = useContext(Context);

  return (
    <div className="px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 py-5 ">
      <div className="text-center text-lg ">
        {cartItems.length === 0 && !loading && (
          <p className="bg-slate-200 rounded-lg  py-5">Empty Book</p>
        )}
      </div>
      {/**view card */}
      <div className="flex flex-col lg:flex-row  gap-8">
        <CartItem loading={loading} cartItems={cartItems} />

        {cartItems.length > 0 && (
          <div className="w-full lg:w-1/3  ">
            {loading ? (
              <div className="h-36 bg-slate-200 border border-slate-300 rounded animate-pulse"></div>
            ) : (
              <div className="flex flex-col gap-4 ">
                <div>
                  <h1 className="text-4xl font-bold">Cart Totals</h1>
                </div>
                <div>
                  <p>If you have a promo code, Enter it here</p>
                  <div className="flex">
                    <input
                      className="w-full outline-none bg-slate-200 p-3"
                      type="text "
                      placeholder="promo code"
                    />
                    <button className="bg-primaryColor text-white p-3">
                      Submit
                    </button>
                  </div>
                </div>
                <button className="w-full lg:w-max bg-primaryColor text-white text-xl font-bold px-4 py-2 rounded-lg ">
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
