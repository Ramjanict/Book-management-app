import React, { useContext } from "react";
import { MdDelete } from "react-icons/md";
import { Context } from "../../store/Store";

const Wish = ({ loading, wishItems }) => {
  const { removeFromWish } = useContext(Context);
  const loadingWish = new Array(wishItems.length).fill(null);
  return (
    <div className="w-full  flex flex-col gap-4  ">
      {loading
        ? loadingWish.map((el, index) => {
            return (
              <div
                key={index}
                className="w-full h-32 bg-slate-200 rounded my-2 border border-slate-300 animate-pulse"
              ></div>
            );
          })
        : wishItems.map((book, index) => {
            return (
              <div
                className="w-full h-40 flex items-center gap-4 bg-white shadow"
                key={index}
              >
                <div className="w-32 h-40 bg-slate-200 flex justify-center items-center p-2">
                  <img
                    className="w-ful h-full  object-scale-down mix-blend-multiply"
                    src={book.formats["image/jpeg"]}
                  />
                </div>

                <div className="flex flex-col justify-center gap-4">
                  <div>
                    <h2 className="text-lg lg:text-xl  line-clamp-1 md:line-clamp-none font-bold ">
                      {book.title}
                    </h2>
                    {book.authors.map((author, index) => {
                      return (
                        <h2
                          key={index}
                          className=" font-medium line-clamp-1 md:line-clamp-none"
                        >
                          {author.name}
                        </h2>
                      );
                    })}
                    <p className="line-clamp-1 md:line-clamp-none text-slate-500">
                      {book.subjects[0]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="ring-1 ring-primaryColor  text-primaryColor hover:bg-primaryColor hover:text-white rounded px-3 py-.5">
                      -
                    </button>
                    <span>15</span>
                    <button className="ring-1 ring-primaryColor  text-primaryColor hover:bg-primaryColor hover:text-white rounded px-3 py-.5 ">
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => {
                    removeFromWish(book);
                  }}
                  className="ml-auto self-start text-xl text-primaryColor hover:bg-primaryColor  hover:text-white p-2 rounded-full "
                >
                  <MdDelete />
                </button>
              </div>
            );
          })}
    </div>
  );
};

export default Wish;
