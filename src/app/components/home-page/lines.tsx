function Lines() {
  return (
    <div className="absolute inset-0 w-[90%] m-auto h-[90%]">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        vectorEffect="none-scaling-stroke"
        className="absolute overflow-visible"
      >
        <polygon
          points="0 0, 100 0, 0 100, 100 100"
          className="stroke-white"
          strokeWidth="0.4"
          fill="none"
        ></polygon>
      </svg>
    </div>
  );
}

export default Lines;
