import styles from "./Game.module.css";

interface TileProps {
    value?: number;
}

const Tile = ({ value }: TileProps) => {
    const tileClass = value ? styles[`cell${value}`] : "";

    return (
        <div className={`${styles.gridCell} ${tileClass}`}>
            {value || ""}
        </div>
    );
};

export default Tile;