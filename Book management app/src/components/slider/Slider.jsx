import { Link } from "react-router-dom";
import React, { useState } from "react";
const slides = [
  {
    id: 1,
    title: "Story Book Collections",
    description: "Sale! Up to 60% off!",
    img: "https://images.pexels.com/photos/6550114/pexels-photo-6550114.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    bg: "bg-gradient-to-r from-yellow-50 to-pink-50",
  },
  {
    id: 2,
    title: "Comedy Book Collections",
    description: "Sale! Up to 40% off!",
    img: "https://images.pexels.com/photos/19840059/pexels-photo-19840059/free-photo-of-young-woman-standing-between-the-bookshelves-in-a-library.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    bg: "bg-gradient-to-r from-pink-50 to-blue-50",
  },
  {
    id: 3,
    title: "Science Book Collections",
    description: "Sale! Up to 50% off!",
    img: "https://images.pexels.com/photos/904616/pexels-photo-904616.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    bg: "bg-gradient-to-r from-blue-50 to-yellow-50",
  },
];

// For slides loop function
// useEffect(() => {
//   const interval = setInterval(() => {
//     setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
//   }, 3000);

//   return () => clearInterval(interval);
// }, []);

const Slider = () => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="h-[calc(100vh-80px)] overflow-hidden relative">
      <div
        className="w-max h-full  flex transition-all  ease-in-out duration-1000 "
        style={{ transform: `translateX(-${current * 100}vw)` }}
      >
        {slides.map((slide, index) => {
          return (
            <div
              key={index}
              className={`${slide.bg} w-screen h-full flex flex-col xl:flex-row gap-16`}
            >
              <div className="h-1/2 xl:h-full xl:w-1/2 flex flex-col items-center justify-center text-center gap-8 2xl:gap-12 ">
                <h2 className="text-xl lg:text-2xl xl:text-3xl 2xl:text-5xl">
                  {slide.description}
                </h2>
                <h1 className="text-5xl lg:text-6xl  2xl:text-8xl font-semibold max-w-80">
                  {slide.title}
                </h1>

                <Link to="/cart">
                  <button className="bg-black text-white rounded-md px-4 py-3 uppercase">
                    buy now
                  </button>
                </Link>
              </div>
              <div className="h-1/2 xl:h-full xl:w-1/2 relative ">
                <img
                  src={slide.img}
                  className=" h-full w-full  object-center object-cover  "
                  alt="slider"
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className=" absolute left-1/2  bottom-8 m-auto flex gap-4">
        {slides.map((slide, index) => {
          return (
            <div
              key={index}
              className={`w-3 h-3 ring-1 ring-gray-600 cursor-pointer rounded-full flex items-center justify-center ${
                current === index ? "scale-150" : ""
              } `}
              onClick={() => setCurrent(index)}
            >
              {current === index && (
                <div className="w-[6px] h-[6px] bg-gray-600 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Slider;
