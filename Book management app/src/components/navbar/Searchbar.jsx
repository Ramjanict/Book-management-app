import React, { useContext } from "react";
import { FaSearch } from "react-icons/fa";
import { Context } from "../../store/Store";

const Searchbar = ({ setSearch }) => {
  const handleSearch = (e) => {
    const { value } = e.target;
    setSearch(value);
  };

  return (
    <div className="w-full h-10 flex items-center shadow">
      <input
        onChange={handleSearch}
        className="w-full h-full bg-white text-black px-2 outline-none rounded-l-lg  "
        type="search"
        placeholder=" Enter book title ..."
      />
      <button
        className="bg-primaryColor h-full px-6 text-white hover:text-black 
      transition-all rounded-r-lg"
      >
        <FaSearch />
      </button>
    </div>
  );
};

export default Searchbar;
