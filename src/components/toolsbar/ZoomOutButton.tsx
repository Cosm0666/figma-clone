
import IconButton from "./IconButton";
import { AiOutlineZoomOut } from "react-icons/ai";

export default function ZoomOutButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled: boolean;
}) {
    return (
        <IconButton onClick={onClick} disabled={disabled}>
            <AiOutlineZoomOut size={20} color="#888888"/>
        </IconButton>
    );
}
