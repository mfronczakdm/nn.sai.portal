import { JSX } from 'react';
import { JsonLdValue, toJsonLdString } from 'src/lib/structured-data/jsonld';

type StructuredDataProps = {
  id: string;
  data: JsonLdValue;
};

export default function StructuredData({ id, data }: StructuredDataProps): JSX.Element {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: toJsonLdString(data) }}
    />
  );
}

