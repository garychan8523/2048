import styles from "./Overlay.module.css";

interface OverlayProps {
    title: string;
    actionLabel: string;
    onAction: () => void;
    onCancel?: () => void;
}

const Overlay = ({ title, actionLabel, onAction, onCancel }: OverlayProps) => {
    return (
        <div className={styles.overlay}>
            <div className={styles.overlayContent}>
                <h1>{title}</h1>
                <div className={styles.buttonGroup}>
                    <button onClick={onAction} className={styles.confirmBtn}>
                        {actionLabel}
                    </button>

                    {onCancel && (
                        <button onClick={onCancel} className={styles.cancelBtn}>
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Overlay;