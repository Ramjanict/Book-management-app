import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Banner, Button, Empty, PageHeader, PageLoader, Panel } from "../components/ui";
import { useCancelBorrowMutation, useMyBorrowsQuery, useRequestReturnMutation } from "../features/api";
import { apiError, day, label, statusTone } from "../lib/format";
import type { BorrowRecord } from "../types";

export function Borrows() {
  const records = useMyBorrowsQuery();
  const [cancel] = useCancelBorrowMutation();
  const [requestReturn] = useRequestReturnMutation();
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function run(action: Promise<unknown>) {
    setError("");
    setNote("");
    try {
      const result = (await action) as { message?: string };
      if (result.message) setNote(result.message);
    } catch (caught) {
      setError(apiError(caught));
    }
  }

  return (
    <div>
      <PageHeader kicker="Loans" title="Your borrowing record" text="Cancel a request before the copy goes out. Once it is borrowed, ask for a return and an admin confirms it." />
      {error ? <div className="mb-4"><Banner>{error}</Banner></div> : null}
      {note ? <div className="mb-4"><Banner tone="ok">{note}</Banner></div> : null}
      {records.isLoading ? <PageLoader /> : null}
      {records.isError ? <Banner>{apiError(records.error)}</Banner> : null}
      {records.data && records.data.length === 0 ? (
        <Empty title="No loans yet" action={<Link to="/" className="text-sm font-semibold text-pine">Find a book</Link>} />
      ) : null}
      <div className="space-y-3">
        {records.data?.map((record) => (
          <LoanRow
            key={record.id}
            record={record}
            onCancel={() => run(cancel(record.id).unwrap())}
            onReturn={() => run(requestReturn(record.id).unwrap())}
          />
        ))}
      </div>
    </div>
  );
}

function LoanRow({
  record,
  onCancel,
  onReturn,
}: {
  record: BorrowRecord;
  onCancel: () => void;
  onReturn: () => void;
}) {
  const canCancel = record.status === "REQUESTED" || record.status === "APPROVED";
  const canReturn = record.status === "BORROWED" || record.status === "OVERDUE";

  return (
    <Panel className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Link to={`/books/${record.book?.id}`} className="font-serif text-xl hover:text-pine">
          {record.book?.title || "Untitled"}
        </Link>
        <p className="mt-1 text-sm text-mute">
          Due {day(record.dueDate)}
          {record.borrowDate ? ` · Out since ${day(record.borrowDate)}` : ""}
          {record.returnDate ? ` · Returned ${day(record.returnDate)}` : ""}
        </p>
        {record.returnRequestedAt ? <p className="mt-1 text-sm text-pine">Return requested {day(record.returnRequestedAt)}</p> : null}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge className={statusTone(record.status)}>{label(record.status)}</Badge>
        {canCancel ? <Button tone="ghost" onClick={onCancel}>Cancel</Button> : null}
        {canReturn && !record.returnRequestedAt ? <Button onClick={onReturn}>Request return</Button> : null}
      </div>
    </Panel>
  );
}
