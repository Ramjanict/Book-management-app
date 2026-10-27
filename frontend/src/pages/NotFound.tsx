import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";

export function NotFound() {
  return (
    <div>
      <PageHeader title="Page not found" text="That address is not part of the library." />
      <Link to="/" className="text-sm font-semibold text-pine">
        Back to the catalog
      </Link>
    </div>
  );
}
