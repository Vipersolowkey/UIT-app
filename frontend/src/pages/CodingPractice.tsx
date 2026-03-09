// src/pages/CodingPractice.tsx
import React from "react";
import LeetCodeMock from "../components/LeetCodeMock";

export default function CodingPractice() {
  return (
    <div className="pb-10">
      <div className="mb-5">
        <div className="text-2xl font-extrabold text-[#00529c]">Luyện Code</div>
        <div className="text-slate-500 font-medium mt-1">
          Giao diện giống LeetCode (mock chấm bài).
        </div>
      </div>

      <LeetCodeMock />
    </div>
  );
}