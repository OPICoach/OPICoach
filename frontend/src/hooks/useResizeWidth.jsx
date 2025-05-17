import { useRef, useEffect, useState } from "react";

function useResizeWidth(initialWidth, minWidth, maxWidth) {
  const [width, setWidth] = useState(initialWidth);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const handleMouseDown = (e) => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    let newWidth = e.clientX - containerRect.left;

    if (newWidth < minWidth) newWidth = minWidth;
    if (newWidth > maxWidth) newWidth = maxWidth;
    setWidth(newWidth);
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

  return { width, setWidth, containerRef, handleMouseDown };
}

export default useResizeWidth;
