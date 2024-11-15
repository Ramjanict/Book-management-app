import { FaRegHeart, FaHeart } from "react-icons/fa";
import { Context } from "../../store/Store";
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import ScrollTop from "../ScrollTop";

const Card = ({ title, author, image, genre, book, id }) => {
  const { addtoCart, addtoWish, removeFromWish, wishItems } =
    useContext(Context);
  const isItemInWish = wishItems.find((wishItem) => wishItem.id === book.id);
  return (
    <div className="w-[340px] hover:shadow rounded-lg bg-white hover:scale-105 transition-all p-4">
      <div className="w-full flex flex-col items-center gap-y-4 ">
        <div className="w-full flex items-center justify-between">
          <span className="w-12 h-12 text-xs flex items-center justify-center text-white bg-primaryColor rounded-full">
            {id}
          </span>
          <button
            onClick={() => {
              isItemInWish ? removeFromWish(book) : addtoWish(book);
            }}
            className="text-xl  text-primaryColor"
          >
            {isItemInWish ? (
              <span className="text-red-500">
                <FaHeart />
              </span>
            ) : (
              <FaRegHeart />
            )}
          </button>
        </div>

        <div className="w-full h-48  ">
          <img
            src={image}
            alt=""
            className="w-full h-full  object-scale-down   "
          />
        </div>

        <Link
          onClick={ScrollTop}
          to={"/book-details/" + book.id}
          className=" text-center"
        >
          <h1 className="text-xl capitalize font-bold  line-clamp-1">
            {title}
          </h1>
          {author.map((author, index) => {
            return (
              <h2 className="font-bold" key={index}>
                {author.name}
              </h2>
            );
          })}
          <p className="text-xs line-clamp-1">{genre[0]}</p>
        </Link>

        <div className="w-full flex  items-center justify-between ">
          <button
            onClick={() => {
              addtoCart(book);
            }}
            className="w-max px-4 py-2  text-primaryColor ring-1 ring-primaryColor    rounded-full hover:bg-primaryColor hover:text-white  transition-all my-2 "
          >
            Add to cart
          </button>
          <Link
            onClick={() => {
              addtoCart(book);
            }}
            to="/cart"
            className=" w-max px-4 py-2  text-primaryColor ring-1 ring-primaryColor  rounded-full hover:bg-primaryColor hover:text-white  transition-all my-2 "
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Card;
