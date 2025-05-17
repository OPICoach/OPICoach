import { useRef, useEffect, useState } from "react";

function useResizeHeight(initialHeight, minTopHeight, minBottomHeight) {
  const [topHeight, setTopHeight] = useState(initialHeight);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    document.body.style.cursor = "row-resize";
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    let newTopHeight = e.clientY - containerRect.top;

    const maxTopHeight = containerRect.height - minBottomHeight;
    if (newTopHeight < minTopHeight) newTopHeight = minTopHeight;
    if (newTopHeight > maxTopHeight) newTopHeight = maxTopHeight;
    setTopHeight(newTopHeight);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    document.body.style.cursor = "";
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return { topHeight, setTopHeight, containerRef, handleMouseDown };
}

export default useResizeHeight;
