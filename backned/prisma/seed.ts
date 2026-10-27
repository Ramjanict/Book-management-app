import {
  BookStatus,
  BorrowStatus,
  PrismaClient,
  Role,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

const DEMO_PASSWORD = process.env.SEED_PASSWORD?.trim() || 'Library123';

const people = [
  {
    key: 'admin',
    email: (process.env.ADMIN_EMAIL || 'admin@ramjan.library').trim().toLowerCase(),
    name: process.env.ADMIN_NAME?.trim() || 'Library Admin',
    role: Role.ADMIN,
    status: UserStatus.ACTIVE,
    password: process.env.ADMIN_PASSWORD?.trim() || DEMO_PASSWORD,
  },
  {
    key: 'mira',
    email: 'mira.sen@ramjan.library',
    name: 'Mira Sen',
    role: Role.AUTHOR,
    status: UserStatus.ACTIVE,
    password: DEMO_PASSWORD,
  },
  {
    key: 'jonas',
    email: 'jonas.hale@ramjan.library',
    name: 'Jonas Hale',
    role: Role.AUTHOR,
    status: UserStatus.ACTIVE,
    password: DEMO_PASSWORD,
  },
  {
    key: 'ada',
    email: 'ada.cole@ramjan.library',
    name: 'Ada Cole',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    password: DEMO_PASSWORD,
  },
  {
    key: 'leo',
    email: 'leo.park@ramjan.library',
    name: 'Leo Park',
    role: Role.USER,
    status: UserStatus.ACTIVE,
    password: DEMO_PASSWORD,
  },
  {
    key: 'nina',
    email: 'nina.ross@ramjan.library',
    name: 'Nina Ross',
    role: Role.USER,
    status: UserStatus.BLOCKED,
    password: DEMO_PASSWORD,
  },
  {
    key: 'pending',
    email: 'sam.pending@ramjan.library',
    name: 'Sam Pending',
    role: Role.USER,
    status: UserStatus.PENDING,
    password: DEMO_PASSWORD,
  },
] as const;

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function cover(isbn: string) {
  return `https://covers.openlibrary.org/b/isbn/${isbn.replace(/-/g, '')}-L.jpg`;
}

async function main() {
  if (DEMO_PASSWORD.length < 6) {
    throw new Error('SEED_PASSWORD must be at least 6 characters');
  }

  const hashes = new Map<string, string>();
  for (const person of people) {
    if (!hashes.has(person.password)) {
      hashes.set(person.password, await bcrypt.hash(person.password, 10));
    }
  }

  const users = new Map<string, { id: string }>();

  for (const person of people) {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: person.email, mode: 'insensitive' } },
    });
    const password = hashes.get(person.password)!;
    const saved = existing
      ? await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: person.name,
            role: person.role,
            status: person.status,
            password:
              person.key === 'admin' && !process.env.ADMIN_PASSWORD
                ? undefined
                : password,
          },
        })
      : await prisma.user.create({
          data: {
            email: person.email,
            name: person.name,
            role: person.role,
            status: person.status,
            password,
          },
        });
    users.set(person.key, saved);
  }

  const mira = await prisma.authorProfile.upsert({
    where: { userId: users.get('mira')!.id },
    update: {
      penName: 'Mira Sen',
      bio: 'Writes quiet novels about libraries, cities, and the people who keep both.',
      website: 'https://example.com/mira-sen',
      socialLinks: { Journal: 'https://example.com/mira-sen/journal' },
    },
    create: {
      userId: users.get('mira')!.id,
      penName: 'Mira Sen',
      bio: 'Writes quiet novels about libraries, cities, and the people who keep both.',
      website: 'https://example.com/mira-sen',
      socialLinks: { Journal: 'https://example.com/mira-sen/journal' },
    },
  });

  const jonas = await prisma.authorProfile.upsert({
    where: { userId: users.get('jonas')!.id },
    update: {
      penName: 'Jonas Hale',
      bio: 'Essays on science, fieldwork, and the notes left in the margin.',
      website: 'https://example.com/jonas-hale',
      socialLinks: { Notes: 'https://example.com/jonas-hale/notes' },
    },
    create: {
      userId: users.get('jonas')!.id,
      penName: 'Jonas Hale',
      bio: 'Essays on science, fieldwork, and the notes left in the margin.',
      website: 'https://example.com/jonas-hale',
      socialLinks: { Notes: 'https://example.com/jonas-hale/notes' },
    },
  });

  const categoryInput = [
    {
      slug: 'fiction',
      name: 'Fiction',
      description: 'Novels and stories currently on the lending shelf.',
    },
    {
      slug: 'science',
      name: 'Science',
      description: 'Field notes, explainers, and research writing.',
    },
    {
      slug: 'history',
      name: 'History',
      description: 'Accounts of places, archives, and public memory.',
    },
    {
      slug: 'poetry',
      name: 'Poetry',
      description: 'Collections short enough to finish between loans.',
    },
  ];

  const categories = new Map<string, { id: string }>();
  for (const category of categoryInput) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
    });
    categories.set(category.slug, saved);
  }

  const bookInput = [
    {
      slug: 'the-quiet-shelf',
      title: 'The Quiet Shelf',
      isbn: '9780141439518',
      description: 'A novel about a neighborhood library and the borrowers who never quite return on time.',
      language: 'English',
      pageCount: 312,
      publishedYear: 2018,
      price: 18.5,
      stockQuantity: 5,
      status: BookStatus.PUBLISHED,
      authorId: mira.id,
      categoryId: categories.get('fiction')!.id,
    },
    {
      slug: 'lantern-grammar',
      title: 'Lantern Grammar',
      isbn: '9780140449136',
      description: 'Short poems written during late shifts at a reading room.',
      language: 'English',
      pageCount: 96,
      publishedYear: 2021,
      price: 12,
      stockQuantity: 1,
      status: BookStatus.PUBLISHED,
      authorId: mira.id,
      categoryId: categories.get('poetry')!.id,
    },
    {
      slug: 'field-notes-on-orbits',
      title: 'Field Notes on Orbits',
      isbn: '9780553380163',
      description: 'Plain-language notes from a year of watching small bodies cross the night sky.',
      language: 'English',
      pageCount: 240,
      publishedYear: 2016,
      price: 16,
      stockQuantity: 3,
      status: BookStatus.PUBLISHED,
      authorId: jonas.id,
      categoryId: categories.get('science')!.id,
    },
    {
      slug: 'river-catalog',
      title: 'River Catalog',
      isbn: '9780743273565',
      description: 'A submitted manuscript waiting for an admin to publish or send back.',
      language: 'English',
      pageCount: 280,
      publishedYear: 2024,
      price: 0,
      stockQuantity: 4,
      status: BookStatus.PENDING_REVIEW,
      authorId: mira.id,
      categoryId: categories.get('fiction')!.id,
    },
    {
      slug: 'ink-and-index',
      title: 'Ink and Index',
      isbn: '9780307277671',
      description: 'A draft history of card catalogs. Not visible to readers yet.',
      language: 'English',
      pageCount: 180,
      publishedYear: 2025,
      price: 0,
      stockQuantity: 2,
      status: BookStatus.DRAFT,
      authorId: jonas.id,
      categoryId: categories.get('history')!.id,
    },
    {
      slug: 'old-margin',
      title: 'Old Margin',
      isbn: '9780679760801',
      description: 'An archived edition kept for the record, not for lending.',
      language: 'English',
      pageCount: 144,
      publishedYear: 1998,
      price: 9,
      stockQuantity: 0,
      status: BookStatus.ARCHIVED,
      authorId: jonas.id,
      categoryId: categories.get('history')!.id,
    },
  ];

  const books = new Map<string, { id: string }>();
  for (const book of bookInput) {
    const saved = await prisma.book.upsert({
      where: { slug: book.slug },
      update: {
        ...book,
        coverImage: cover(book.isbn),
      },
      create: {
        ...book,
        coverImage: cover(book.isbn),
      },
    });
    books.set(book.slug, saved);
  }

  const userIds = [...users.values()].map((user) => user.id);
  const bookIds = [...books.values()].map((book) => book.id);

  await prisma.review.deleteMany({
    where: { OR: [{ userId: { in: userIds } }, { bookId: { in: bookIds } }] },
  });
  await prisma.favorite.deleteMany({
    where: { OR: [{ userId: { in: userIds } }, { bookId: { in: bookIds } }] },
  });
  await prisma.borrowRecord.deleteMany({
    where: { OR: [{ userId: { in: userIds } }, { bookId: { in: bookIds } }] },
  });
  await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: { in: userIds } } });

  await prisma.review.createMany({
    data: [
      {
        userId: users.get('ada')!.id,
        bookId: books.get('the-quiet-shelf')!.id,
        rating: 5,
        comment: 'The best account of a small library I have read.',
      },
      {
        userId: users.get('leo')!.id,
        bookId: books.get('the-quiet-shelf')!.id,
        rating: 4,
        comment: 'Slow in the middle, exact at the end.',
      },
      {
        userId: users.get('ada')!.id,
        bookId: books.get('field-notes-on-orbits')!.id,
        rating: 5,
        comment: 'Clear enough to lend to someone who does not read science.',
      },
    ],
  });

  await prisma.favorite.createMany({
    data: [
      { userId: users.get('ada')!.id, bookId: books.get('lantern-grammar')!.id },
      { userId: users.get('ada')!.id, bookId: books.get('field-notes-on-orbits')!.id },
      { userId: users.get('leo')!.id, bookId: books.get('the-quiet-shelf')!.id },
    ],
  });

  await prisma.borrowRecord.createMany({
    data: [
      {
        userId: users.get('ada')!.id,
        bookId: books.get('the-quiet-shelf')!.id,
        status: BorrowStatus.REQUESTED,
        dueDate: daysFromNow(14),
      },
      {
        userId: users.get('leo')!.id,
        bookId: books.get('lantern-grammar')!.id,
        status: BorrowStatus.APPROVED,
        dueDate: daysFromNow(10),
      },
      {
        userId: users.get('ada')!.id,
        bookId: books.get('field-notes-on-orbits')!.id,
        status: BorrowStatus.BORROWED,
        borrowDate: daysFromNow(-3),
        dueDate: daysFromNow(11),
        returnRequestedAt: daysFromNow(-1),
      },
      {
        userId: users.get('nina')!.id,
        bookId: books.get('lantern-grammar')!.id,
        status: BorrowStatus.OVERDUE,
        borrowDate: daysFromNow(-20),
        dueDate: daysFromNow(-6),
      },
      {
        userId: users.get('leo')!.id,
        bookId: books.get('the-quiet-shelf')!.id,
        status: BorrowStatus.RETURNED,
        borrowDate: daysFromNow(-40),
        dueDate: daysFromNow(-26),
        returnDate: daysFromNow(-28),
      },
      {
        userId: users.get('pending')!.id,
        bookId: books.get('field-notes-on-orbits')!.id,
        status: BorrowStatus.CANCELLED,
        dueDate: daysFromNow(14),
      },
    ],
  });

  const refreshHash = await bcrypt.hash('seed-refresh-token', 10);
  await prisma.refreshToken.create({
    data: {
      userId: users.get('ada')!.id,
      tokenHash: refreshHash,
      expiresAt: daysFromNow(-1),
      revokedAt: daysFromNow(-2),
    },
  });

  const resetToken = 'seed-reset-token';
  await prisma.passwordResetToken.create({
    data: {
      userId: users.get('leo')!.id,
      tokenHash: createHash('sha256').update(resetToken).digest('hex'),
      expiresAt: daysFromNow(-1),
      usedAt: daysFromNow(-1),
    },
  });

  console.log('Seeded the full library schema.');
  console.log(`Admin: ${people[0].email}`);
  console.log('Authors: mira.sen@ramjan.library, jonas.hale@ramjan.library');
  console.log('Readers: ada.cole@ramjan.library, leo.park@ramjan.library');
  console.log('Blocked: nina.ross@ramjan.library');
  console.log('Pending: sam.pending@ramjan.library');
  console.log(
    process.env.SEED_PASSWORD
      ? 'Demo password: SEED_PASSWORD from the environment.'
      : `Demo password: ${DEMO_PASSWORD}`,
  );
  if (!process.env.ADMIN_PASSWORD) {
    console.log('Admin password was left unchanged if that account already existed.');
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
