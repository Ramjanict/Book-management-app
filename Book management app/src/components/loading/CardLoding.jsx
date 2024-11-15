import React from "react";
const CardLoding = () => {
  return (
    <div className="w-[330px] shadow rounded-lg bg-white  p-4">
      <div className="w-full flex flex-col items-center gap-y-4 ">
        <div className="w-full flex items-center justify-between">
          <span className="p-4 flex items-center justify-center bg-slate-200 rounded-full  animate-pulse"></span>
          <button className="p-4 bg-slate-200 rounded-full animate-pulse"></button>
        </div>
        <div className="w-full h-48  bg-slate-200 rounded-md animate-pulse"></div>
        <div className="w-full flex flex-col gap-1">
          <h1 className="w-full p-4 bg-slate-200 rounded-full animate-pulse "></h1>
          <p className="w-full p-4 bg-slate-200 rounded-full  animate-pulse "></p>
          <p className="w-full p-4 bg-slate-200 rounded-full  animate-pulse "></p>
        </div>
        <div className="w-full flex  items-center justify-between gap-2 ">
          <button className=" p-4 w-full  bg-slate-200 rounded-full "></button>
          <button className=" p-4  w-full  bg-slate-200 rounded-full    "></button>
        </div>
      </div>
    </div>
  );
};

export default CardLoding;
