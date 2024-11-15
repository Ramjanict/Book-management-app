import React, { useContext } from "react";
import { GrCart } from "react-icons/gr";
import { FaRegHeart } from "react-icons/fa";
import { Context } from "../../store/Store";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";

const Navicons = ({ setIsOpenSearch }) => {
  const { cartItems, wishItems } = useContext(Context);

  return (
    <div className="flex items-center gap-5 sm:gap-8">
      <div
        onClick={() => {
          setIsOpenSearch((prev) => !prev);
        }}
        className="md:hidden cursor-pointer"
      >
        <span className="text-2xl">
          <FaSearch />
        </span>
      </div>
      <Link to="/wishlists" className=" cursor-pointer relative">
        <span className="text-2xl">
          <FaRegHeart />
        </span>
        <div className=" absolute -top-4 -right-4 w-6 h-6 bg-primaryColor  text-white	 flex items-center justify-center rounded-full text-sm  ">
          {wishItems.length}
        </div>
      </Link>
      <Link to="/cart" className=" cursor-pointer relative">
        <span className="text-2xl">
          <GrCart />
        </span>
        <div className=" absolute -top-4 -right-4 w-6 h-6 bg-primaryColor  text-white	 flex items-center justify-center rounded-full text-sm  ">
          {cartItems.length}
        </div>
      </Link>
    </div>
  );
};

export default Navicons;
