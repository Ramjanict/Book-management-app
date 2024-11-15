import React, { useContext, useEffect, useState } from "react";
import SearchResult from "../../pages/SearchResult";
import { FaBookOpen } from "react-icons/fa6";
import { Context } from "../../store/Store";
import MobileSearch from "./MobileSearch";
import { Link } from "react-router-dom";
import Searchbar from "./Searchbar";
import Navicons from "./Navicons";

const Navbar = () => {
  const { data } = useContext(Context);
  const [search, setSearch] = useState("");
  const [stricky, setStricky] = useState(false);
  const [isOpenSearch, setIsOpenSearch] = useState(false);

  //Search by book title
  const searchBook = data.filter((book) => {
    return book.title.toLowerCase().includes(search.toLowerCase());
  });

  //stricky menu
  useEffect(() => {
    const handleScroll = () => {
      setStricky(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });
  return (
    <div className={`${stricky && "fixed top-0 z-20 "} w-full`}>
      <div className="px-6 lg:px-12 xl:px-24 2xl:px-48 py-4 shadow bg-black text-white relative">
        {/* Desktop view */}
        <div className=" w-full h-full  flex items-center justify-between  gap-8">
          <div className="flex items-center gap-8">
            <Link to="/" className=" flex items-center gap-4">
              <button className=" text-4xl text-primaryColor">
                <FaBookOpen />
              </button>
              <h2 className=" uppercase text-2xl tracking-wider">Ramjan</h2>
            </Link>
          </div>
          <div className="hidden w-96 md:w-[500px] md:flex items-center gap-8 relative">
            <Searchbar setSearch={setSearch} />
            {search && (
              <div className="w-full h-[calc(100vh-60px)] overflow-hidden absolute top-10  bg-white shadow rounded-lg z-50">
                <SearchResult searchBook={searchBook} setSearch={setSearch} />
              </div>
            )}
          </div>
          <div className=" flex items-center  gap-8">
            <Navicons setIsOpenSearch={setIsOpenSearch} />
          </div>
        </div>
        {/* Mobile view */}
        {isOpenSearch && (
          <div className=" md:hidden w-full py-2 shadow z-20  relative">
            <MobileSearch setSearch={setSearch} />
            {search && (
              <div className="w-full h-[calc(100vh-60px)] overflow-hidden absolute top-14 bg-white shadow rounded-lg z-50">
                <SearchResult searchBook={searchBook} setSearch={setSearch} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
