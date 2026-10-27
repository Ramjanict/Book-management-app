import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { BookGrid } from "../components/BookCard";
import { Banner, Button, Empty, PageHeader, Pager, SelectInput, Skeleton, TextInput } from "../components/ui";
import { useBooksQuery, useCategoriesQuery } from "../features/api";
import { apiError, label } from "../lib/format";
import type { BookQuery } from "../types";

const sorts: { value: NonNullable<BookQuery["sort"]>; label: string }[] = [
  { value: "latest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title_asc", label: "Title" },
  { value: "price_asc", label: "Price, low" },
  { value: "price_desc", label: "Price, high" },
];

export function Home() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const categoryId = params.get("category") ?? "";
  const sort = (params.get("sort") as BookQuery["sort"]) || "latest";
  const page = Number(params.get("page") || 1);
  const [draft, setDraft] = useState(q);
  const books = useBooksQuery({ search: q || undefined, categoryId: categoryId || undefined, sort, page, limit: 12 });
  const categories = useCategoriesQuery();

  useEffect(() => setDraft(q), [q]);
  useEffect(() => {
    document.title = "Catalog · Ramjan";
  }, []);

  function update(patch: Record<string, string | null>, keepPage = false) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (!value) next.delete(key);
      else next.set(key, value);
    }
    if (!keepPage) next.delete("page");
    setParams(next);
  }

  return (
    <div>
      <PageHeader
        kicker="Catalog"
        title="The shelf, in order."
        text="Published books from the library. Save a title, then request a loan when a copy is in stock."
      />

      <form
        className="mb-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: draft.trim() || null });
        }}
      >
        <TextInput
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Search by title, author, or ISBN"
          aria-label="Search books"
        />
        <SelectInput
          className="sm:w-44"
          value={sort}
          aria-label="Sort"
          onChange={(event) => update({ sort: event.target.value })}
        >
          {sorts.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </SelectInput>
        <Button type="submit" className="sm:w-28">
          Search
        </Button>
      </form>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        <button
          className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${!categoryId ? "bg-ink text-paper" : "bg-card text-mute ring-1 ring-line"}`}
          onClick={() => update({ category: null })}
        >
          All
        </button>
        {categories.data?.map((category) => (
          <button
            key={category.id}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
              categoryId === category.id ? "bg-ink text-paper" : "bg-card text-mute ring-1 ring-line"
            }`}
            onClick={() => update({ category: category.id })}
          >
            {category.name}
            {category._count ? ` · ${category._count.books}` : ""}
          </button>
        ))}
      </div>

      {books.isError ? <Banner>{apiError(books.error)}</Banner> : null}

      {books.isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] rounded-2xl" />
          ))}
        </div>
      ) : books.data && books.data.data.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-mute">
            {books.data.meta.total} published {books.data.meta.total === 1 ? "title" : "titles"}
            {q ? ` for “${q}”` : ""}
          </p>
          <div className={books.isFetching ? "opacity-60" : undefined}>
            <BookGrid books={books.data.data} />
          </div>
          <Pager page={books.data.meta.page} total={books.data.meta.totalPages} onPage={(next) => update({ page: String(next) }, true)} />
        </>
      ) : (
        <Empty
          title={q ? "No titles match that search" : "The catalog is empty"}
          text="Authors submit drafts. An admin publishes them, and they show up here."
          action={
            <Link to="/register" className="text-sm font-semibold text-pine">
              Create an account
            </Link>
          }
        />
      )}
      {categories.isError ? <p className="mt-4 text-sm text-mute">{label("categories")} could not be loaded.</p> : null}
    </div>
  );
}
