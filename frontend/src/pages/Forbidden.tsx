import { Link } from "react-router-dom";
import { Empty } from "../components/ui";

export function Forbidden() {
  return (
    <Empty
      title="That room is locked"
      text="Your role does not include this part of the library."
      action={
        <Link to="/" className="text-sm font-semibold text-pine">
          Back to the catalog
        </Link>
      }
    />
  );
}
