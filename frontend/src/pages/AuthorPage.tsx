import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { BookGrid } from "../components/BookCard";
import { Empty, PageHeader, PageLoader } from "../components/ui";
import { usePublicAuthorQuery } from "../features/api";
import { apiError } from "../lib/format";

export function AuthorPage() {
  const { id = "" } = useParams();
  const author = usePublicAuthorQuery(id, { skip: !id });

  useEffect(() => {
    if (author.data) document.title = `${author.data.penName || author.data.user?.name || "Author"} · Ramjan`;
  }, [author.data]);

  if (author.isLoading) return <PageLoader />;
  if (author.isError || !author.data) return <Empty title="Author not found" text={apiError(author.error)} />;

  const profile = author.data;
  const name = profile.penName || profile.user?.name || "Author";
  const links = profile.socialLinks ? Object.entries(profile.socialLinks) : [];

  return (
    <div>
      <PageHeader kicker="Author" title={name} text={profile.bio || "Published work from this author."} />
      <div className="mb-8 flex flex-wrap gap-4 text-sm">
        {profile.website ? (
          <a className="font-semibold text-pine" href={profile.website} target="_blank" rel="noreferrer">
            Website
          </a>
        ) : null}
        {links.map(([key, value]) => (
          <a key={key} className="font-semibold text-pine" href={value} target="_blank" rel="noreferrer">
            {key}
          </a>
        ))}
      </div>
      {profile.books && profile.books.length > 0 ? (
        <BookGrid books={profile.books} />
      ) : (
        <Empty title="No published books yet" />
      )}
    </div>
  );
}
