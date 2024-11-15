import React from "react";
const ListCardLoading = () => {
  return (
    <div className="w-full flex items-center gap-8 p-2 rounded-md bg-white  ">
      <div className="w-40 h-48 bg-slate-200 rounded-md animate-pulse"></div>
      <div className="w-full flex flex-col gap-2">
        <div className="w-full flex items-center justify-between gap-2">
          <h1 className="w-full  p-4 bg-slate-200 rounded-full animate-pulse"></h1>
          <button className="w-full p-4  bg-slate-200 rounded-full animate-pulse"></button>
        </div>
        <p className="p-4 bg-slate-200 rounded-full animate-pulse"></p>
        <p className="p-4 bg-slate-200 rounded-full animate-pulse"></p>
        <div className="flex items-center gap-4">
          <button className="w-full p-4 bg-slate-200 rounded-full animate-pulse"></button>
          <button className="w-full p-4 bg-slate-200 rounded-full animate-pulse"></button>
        </div>
      </div>
    </div>
  );
};

export default ListCardLoading;
