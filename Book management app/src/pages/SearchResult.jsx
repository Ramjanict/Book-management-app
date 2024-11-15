import React, { useContext } from "react";
import { Context } from "../store/Store";
import { Link } from "react-router-dom";

const SearchResult = ({ searchBook, setSearch }) => {
  return (
    <div className="w-full h-full overflow-y-scroll ">
      <h2 className="bg-gray-200 text-primaryColor px-2 text-lg">
        Search result : <span className="text-black">{searchBook?.length}</span>
      </h2>
      <div className="w-full flex flex-col gap-4  text-black py-4">
        {searchBook?.length > 0 ? (
          searchBook.map((book, i) => {
            return (
              <Link
                onClick={() => {
                  setSearch("");
                }}
                to={"/book-details/" + book.id}
                key={i}
                className="w-full flex items-center gap-4 hover:bg-slate-100 p-4 group"
              >
                <div className="w-12 h-12 ">
                  <img
                    className="w-full h-full p-1 object-scale-down group-hover:bg-white"
                    src={book.formats["image/jpeg"]}
                    alt="photo"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-medium line-clamp-1">
                    {book.title}
                  </h2>
                  {book.authors.map((author, index) => {
                    return (
                      <h2 className="line-clamp-1" key={index}>
                        {author.name}
                      </h2>
                    );
                  })}
                </div>
              </Link>
            );
          })
        ) : (
          <h2 className=" text-primaryColor text-2xl text-center">
            Not found any book
          </h2>
        )}
      </div>
    </div>
  );
};

export default SearchResult;
