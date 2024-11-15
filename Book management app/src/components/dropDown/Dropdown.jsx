import React, { memo, useContext, useEffect, useState } from "react";
import { Context } from "../../store/Store";

const Dropdown = ({ handleSorting, setIsDropdownOpen, setSort }) => {
  const { data } = useContext(Context);
  const [genre, setGenre] = useState();
  const LoadingList = Array(20).fill(null);

  const categoryWiseBook = () => {
    const category = data.reduce((total, value) => {
      const subject = value.subjects;
      const allSubjects = [...total, ...subject].toSorted();
      return [...new Set(allSubjects)];
    }, []);

    setGenre(category);
  };

  useEffect(() => {
    categoryWiseBook();
  }, []);
  return (
    <div
      className="w-[330px] sm:w-[450px] h-[450px] absolute left-0 top-16 overflow-hidden 
     bg-white shadow rounded-md z-50"
    >
      <div className="w-full h-full overflow-y-scroll py-1">
        <button
          onClick={() => {
            setSort("");
            setIsDropdownOpen(false);
          }}
          className="w-full text-left line-clamp-1 hover:bg-[#F3F4F6] px-4 py-2 "
        >
          All
        </button>
        {genre?.length > 0
          ? genre.map((genre, i) => {
              return (
                <button
                  onClick={(e) => {
                    handleSorting(e);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left line-clamp-1 hover:bg-[#F3F4F6] px-4 py-2"
                  name="sort"
                  value={genre}
                  key={i}
                >
                  {genre}
                </button>
              );
            })
          : LoadingList.map((item, i) => {
              return (
                <button
                  key={i}
                  className="w-full p-2 bg-slate-300 animate-pulse rounded"
                ></button>
              );
            })}
      </div>
    </div>
  );
};

export default memo(Dropdown);
