import React from "react";

interface HomeAreaButtonProps {
  label: string;
}

const HomeAreaButton: React.FC<HomeAreaButtonProps> = ({ label }) => {
  return (
    <span className="inline-block group-hover:scale-110 group-hover:border-b-2 group-hover:border-white transition-all duration-100 origin-center">
      {label}
    </span>
  );
};

export default HomeAreaButton;
