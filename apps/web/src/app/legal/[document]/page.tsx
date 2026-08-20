import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PublicFooter, PublicHeader } from '../../../components/public-navigation';
import { ruRU } from '../../../i18n/messages/ru-RU';

const legalDocuments = new Set(['terms', 'privacy', 'rules']);

export default async function LegalDocumentPage({
  params,
}: {
  readonly params: Promise<{ readonly document: string }>;
}) {
  const { document } = await params;
  if (!legalDocuments.has(document)) notFound();

  return (
    <>
      <a className="bidly-skip-link" href="#main-content">
        {ruRU.shared.skipLink}
      </a>
      <PublicHeader />
      <main className="bidly-information-page" id="main-content">
        <section className="bidly-information-page__intro">
          <p className="bidly-eyebrow">Bidly</p>
          <h1>{ruRU.legal.title}</h1>
          <p>{ruRU.legal.detail}</p>
          <Link className="bidly-text-link" href="/">
            {ruRU.shared.backToHome}
          </Link>
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
