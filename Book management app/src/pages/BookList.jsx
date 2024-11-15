import {
  MdOutlineKeyboardArrowDown,
  MdOutlineKeyboardArrowUp,
} from "react-icons/md";
import ListCardLoading from "../components/loading/ListCardLoading";
import React, { useContext, useState } from "react";
import Pagination from "../components/pagination/Pagination";
import CardLoding from "../components/loading/CardLoding";
import { IoGridSharp } from "react-icons/io5";
import Dropdown from "../components/dropDown/Dropdown";
import { FaThList } from "react-icons/fa";
import { Context } from "../store/Store";
import ListCard from "../components/carrd/ListCard";
import Card from "../components/carrd/Card";
const BookList = ({ title }) => {
  const { data } = useContext(Context);
  const [card, setCard] = useState(true);
  const [sort, setSort] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [postPerPage, setPostPerPage] = useState(6);
  const lastPostIndex = currentPage * postPerPage;
  const firstPostIndex = lastPostIndex - postPerPage;
  const LoadingList = Array(6).fill(null);

  const handleSorting = (e) => {
    const { value, name } = e.target;
    setSort((pre) => {
      return { ...pre, [name]: value };
    });
  };

  const filterData = (book, sort) => {
    let data = book;
    if (sort.sort) {
      data = data.filter((item) => {
        return item.subjects.some((genre) => genre === sort.sort);
      });
    }
    return data;
  };
  const filter = filterData(data, sort);
  const totalPost = filter.length;
  const bookData = filter.slice(firstPostIndex, lastPostIndex);

  return (
    <div className="px-6 lg:px-12 xl:px-24 2xl:px-48 pt-5 pb-10 bg-[#F2F2F2]">
      <div className=" flex items-center justify-between bg-white p-4 rounded-md">
        <div className="relative">
          <button
            onClick={() => {
              setIsDropdownOpen((pre) => !pre);
            }}
            className="w-full px-4 py-2 rounded-md ring-1 ring-gray-100 flex items-center justify-between
             border-4 border-transparent active:border-gray-50 text-xl font-medium tracking-wide"
          >
            Select genre
            {isDropdownOpen ? (
              <span className="text-2xl pt-1">
                <MdOutlineKeyboardArrowUp />
              </span>
            ) : (
              <span className="text-2xl pt-1">
                <MdOutlineKeyboardArrowDown />
              </span>
            )}
          </button>
          {isDropdownOpen && (
            <Dropdown
              handleSorting={handleSorting}
              setIsDropdownOpen={setIsDropdownOpen}
              setSort={setSort}
            />
          )}
        </div>
        <div className=" hidden sm:block">
          <h2 className="text-xl md:text-2xl font-medium">{title}</h2>
        </div>
        <div className="flex items-center gap-2 text-xl cursor-pointer">
          <span
            onClick={() => setCard(true)}
            className={`text-lg cursor-pointer ${
              card ? "opacity-100" : "opacity-10"
            }`}
          >
            <IoGridSharp />
          </span>

          <FaThList
            onClick={() => setCard(false)}
            className={`text-lg cursor-pointer  ${
              card ? "opacity-10" : "opacity-100"
            }`}
          />
        </div>
      </div>

      <h2 className="text-center pt-4">{sort ? sort.sort : "All"}</h2>

      <div className="w-full flex justify-center flex-wrap gap-8 md:gap-16 py-8">
        {card
          ? bookData.length > 0
            ? bookData.map((book, index) => {
                return (
                  <Card
                    key={index}
                    title={book.title}
                    image={book.formats["image/jpeg"]}
                    author={book.authors}
                    genre={book.subjects}
                    book={book}
                    id={book.id}
                  />
                );
              })
            : LoadingList.map((loading, index) => {
                return <CardLoding key={index} />;
              })
          : bookData.length > 0
          ? bookData.map((book, index) => {
              return (
                <ListCard
                  key={index}
                  title={book.title}
                  image={book.formats["image/jpeg"]}
                  author={book.authors}
                  genre={book.subjects}
                  book={book}
                  id={book.id}
                />
              );
            })
          : LoadingList.map((loading, index) => {
              return <ListCardLoading key={index} />;
            })}
      </div>

      {bookData.length > 0 && (
        <Pagination
          totalPost={totalPost}
          postPerPage={postPerPage}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default BookList;
