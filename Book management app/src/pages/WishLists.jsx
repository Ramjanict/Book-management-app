import React, { useContext, useEffect, useState } from "react";
import { Context } from "../store/Store";
import Wish from "../components/wishLists/Wish";
import { AiFillDelete } from "react-icons/ai";
const WishLists = () => {
  const [loading, setLoading] = useState(false);
  const { wishItems, emptyWish } = useContext(Context);

  return (
    <div className="px-4 md:px-6 lg:px-12 xl:px-24 2xl:px-48 py-5 ">
      <div className="text-center text-lg ">
        {wishItems.length === 0 && !loading && (
          <p className="bg-slate-200 rounded-lg  py-5">Empty Wishlist</p>
        )}
      </div>
      {/* wish list */}
      <div className="flex flex-col sm:flex-row  items-center gap-8">
        <Wish loading={loading} wishItems={wishItems} />
        {wishItems.length > 0 && (
          <div className="w-max flex">
            <button
              onClick={emptyWish}
              className="text-3xl text-primaryColor hover:text-red-600"
            >
              <AiFillDelete />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishLists;
