export function CanvasElement({ element, isSelected }) {
  const { id, type, x, y, width, height, fill, stroke, strokeWidth, isPreview } = element

  const style = {
    position: "absolute",
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    backgroundColor: fill,
    border: `${strokeWidth}px solid ${stroke}`,
    opacity: isPreview ? 0.6 : 1,
    pointerEvents: isPreview ? "none" : "auto",
  }

  const selectionStyle = {
    position: "absolute",
    left: `${x - 1}px`,
    top: `${y - 1}px`,
    width: `${width + 2}px`,
    height: `${height + 2}px`,
    border: "1px solid #4f46e5",
    pointerEvents: "none",
    boxShadow: "0 0 0 1px white",
    zIndex: 1,
  }

  return (
    <>
      <div style={style} />
      {isSelected && !isPreview && <div style={selectionStyle} />}
    </>
  )
}

