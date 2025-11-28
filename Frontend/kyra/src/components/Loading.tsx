import React from "react";

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = () => (
  <div className="flex items-center justify-center h-screen w-screen">
    <img
      src="/loading.gif"
      alt="Loading..."
      width={100}
      height={100}
    />
  </div>
);

export default Loading;