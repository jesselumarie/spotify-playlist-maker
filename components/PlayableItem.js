import Image from "next/image";

const PlayableItem = ({
  imageUrl = null,
  title = "Title",
  subtitle = "Subtitle",
  handleButtonClick,
  selected,
}) => {
  return (
    <div
      style={{
        display: "flex",
        border: "solid black",
        borderRadius: 4,
        justifyContent: "space-between",
        width: "400px",
        height: "100px",
        marginTop: "20px",
        border: selected ? "0.k5rem orange dashed" : ""
      }}
    >
      {imageUrl ? (
        <Image
          height={94}
          width={94}
          src={imageUrl}
          layout="fixed"
          alt={`Album art for ${title}`}
        />
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "94px",
            height: "94px",
            backgroundColor: "blue"
          }}
        >
          <span>🎶</span>
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "10px",
          width:"236px"
        }}
      >
        <b>{title}</b>
        <em>{subtitle}</em>
      </div>
      <button style={{height: "20px", width: "70px"}} onClick={handleButtonClick}>{selected ? "Remove" : "Add"}</button>
    </div>
  );
};

export { PlayableItem };
