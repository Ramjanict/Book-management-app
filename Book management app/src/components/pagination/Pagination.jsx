import React from "react";
import { FaLongArrowAltLeft, FaLongArrowAltRight } from "react-icons/fa";

const Pagination = ({
  totalPost,
  postPerPage,
  currentPage,
  setCurrentPage,
}) => {
  let pages = [];
  for (let i = 1; i <= Math.ceil(totalPost / postPerPage); i++) {
    pages.push(i);
  }

  return (
    <div className="w-full max-w-sm mx-auto p-4 bg-white rounded-md shadow mt-10">
      <div className=" flex items-center justify-between">
        <div
          className={`flex items-center gap-1 ${
            currentPage > 1
              ? "cursor-pointer bg-gray-100 px-2 py-0.5 rounded font-medium"
              : ""
          } `}
        >
          <FaLongArrowAltLeft />
          <span
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage((pre) => pre - 1);
              }
            }}
          >
            Previous
          </span>
        </div>

        {pages.map((page, index) => {
          return (
            <button
              className={
                page == currentPage
                  ? "bg-primaryColor w-6 h-6  text-white flex items-center justify-center rounded"
                  : ""
              }
              onClick={() => {
                setCurrentPage(page);
              }}
              key={index}
            >
              {page}
            </button>
          );
        })}

        <div
          className={`flex items-center gap-1 ${
            pages.length > currentPage
              ? "cursor-pointer bg-gray-100 px-2 py-0.5 rounded font-medium"
              : ""
          } `}
        >
          <span
            onClick={() => {
              if (pages.length > currentPage) {
                setCurrentPage((pre) => pre + 1);
              }
            }}
          >
            Next
          </span>
          <FaLongArrowAltRight />
        </div>
      </div>
    </div>
  );
};

export default Pagination;
