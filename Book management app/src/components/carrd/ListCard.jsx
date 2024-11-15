import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { Context } from "../../store/Store";
import ScrollTop from "../ScrollTop";
const ListCard = ({ title, author, image, genre, book, id }) => {
  const { addtoCart, addtoWish, removeFromWish, wishItems } =
    useContext(Context);
  const isItemInWish = wishItems.find((wishItem) => wishItem.id === book.id);
  return (
    <div className="w-full flex items-center gap-8 p-2 rounded-md bg-white hover:shadow ">
      <div className="w-40 h-48 ">
        <img
          src={image}
          alt=""
          className="w-full h-full mix-blend-multiply object-scale-down   "
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center justify-between">
          <Link
            to={"/book-details/" + book.id}
            onClick={ScrollTop}
            className="text-xl sm:text-2xl font-bold line-clamp-1"
          >
            {title}
          </Link>
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
        {author.map((author, index) => {
          return (
            <h2 className="font-bold" key={index}>
              {author.name}
            </h2>
          );
        })}

        <p className="text line-clamp-1">{genre[0]}</p>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              addtoCart(book);
            }}
            className="w-max px-4 py-2  text-primaryColor ring-1 ring-primaryColor    rounded-full hover:bg-primaryColor hover:text-white  transition-all my-2 "
          >
            Add to cart
          </button>
          <Link
            to="/cart"
            onClick={() => {
              addtoCart(book);
            }}
            className="w-max px-4 py-2  text-primaryColor ring-1 ring-primaryColor rounded-full hover:bg-primaryColor hover:text-white  transition-all my-2 "
          >
            Buy now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListCard;
