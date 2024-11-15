import { Link, useParams } from "react-router-dom";
import BookList from "../pages/BookList";
import React, { useContext } from "react";
import { Context } from "../store/Store";

const BookDetails = () => {
  const { data, addtoCart } = useContext(Context);
  const { id } = useParams();
  const singleBook = data.filter((book) => {
    return book.id === Number(id);
  });

  return (
    <>
      <div className="px-6 lg:px-12 xl:px-24 2xl:px-48 py-6 ">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
          <div className="w-full lg:w-1/2">
            <div className="w-full  h-96 bg-white">
              {singleBook.map((book, index) => (
                <img
                  key={index}
                  src={book.formats["image/jpeg"]}
                  className="w-full h-full object-scale-down mix-blend-multiply"
                  alt=""
                />
              ))}
            </div>
          </div>

          <div className="lg:w-1/2  self-center ">
            {singleBook.map((book, index) => {
              return (
                <div key={index} className="flex flex-col  gap-4">
                  <h1 className="text-2xl sm:text-3xl font-medium">
                    {book.title}
                  </h1>

                  <div className="">
                    <h2 className="text-xl sm:text-3xl font-medium  ">
                      About author
                    </h2>

                    {book.authors.map((author, index) => {
                      return (
                        <div key={index} className="">
                          <p className=" font-medium">Name : {author.name}</p>
                          <p className="">Birth year : {author.birth_year}</p>
                          <p className="">Death year : {author.death_year}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-3xl font-medium  ">Genre</h2>

                    {book.subjects.map((genre, index) => {
                      return <p key={index}>{genre}</p>;
                    })}
                  </div>

                  <div className="w-full flex  items-center gap-4 ">
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
                      className=" w-max px-4 py-2  text-primaryColor ring-1 ring-primaryColor  rounded-full hover:bg-primaryColor hover:text-white  transition-all my-2 "
                    >
                      Buy now
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <BookList title={"Recommended books"} />
    </>
  );
};

export default BookDetails;
