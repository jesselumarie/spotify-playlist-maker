import Image from "next/image";
import { SearchCategory } from "../pages/select";
import styles from "../styles/PlayableItem.module.css";

type PlaybleItemProps = {
  imageUrl: string | null,
  title?: string,
  subtitle?: string,
  handleButtonClick: () => void,
  selected: boolean,
  category: SearchCategory,
}

const PlayableItem = ({
  imageUrl = null,
  title = '',
  subtitle = '',
  handleButtonClick,
  selected,
}: PlaybleItemProps) => {
  const wrapperClass = `${styles.itemWrapper} ${selected ? styles.selectedItem : ''}`
  return (
    <div
      className={wrapperClass}
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
