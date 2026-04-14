import type React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { LinkFieldValue } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from '@/lib/component-props';
import { GqlFieldString } from '@/types/gql.props';
import { StructuredData } from '@/components/structured-data/StructuredData';
import { generateBreadcrumbListSchema } from '@/lib/structured-data/schema';

/**
 * Model used for Sitecore Component integration
 */
type BreadcrumbsProps = ComponentProps & BreadcrumbsData;

type BreadcrumbsData = {
  fields: {
    data: {
      datasource: {
        ancestors: BreadcrumbsPage[];
        name: string;
      };
    };
  };
};

type BreadcrumbsPage = {
  name: string;
  title: GqlFieldString;
  navigationTitle: GqlFieldString;
  url?: LinkFieldValue;
};

export const Default: React.FC<BreadcrumbsProps> = (props) => {
  const { fields } = props;
  const { ancestors, name } = fields?.data?.datasource ?? {};

  const truncate = (str: string): string => {
    return str?.length > 25
      ? str
          .replace(/(.{24})..+/, '$1')
          .trim()
          .concat('...')
      : str;
  };

  if (fields) {
    if (ancestors) {
      // Generate BreadcrumbList schema
      const breadcrumbItems = [
        ...ancestors.map((ancestor: BreadcrumbsPage, index: number) => ({
          name:
            ancestor.navigationTitle?.jsonValue.value || ancestor.title?.jsonValue.value || '',
          url: ancestor.url?.href || '',
          position: index + 1,
        })),
        {
          name: truncate(name),
          url: typeof window !== 'undefined' ? window.location.href : '',
          position: ancestors.length + 1,
        },
      ];

      const breadcrumbSchema = generateBreadcrumbListSchema({ items: breadcrumbItems });

      return (
        <>
          {breadcrumbSchema && <StructuredData id="breadcrumb-schema" data={breadcrumbSchema} />}
          {/* Breadcrumb component already includes <nav> with aria-label */}
          <Breadcrumb>
          <BreadcrumbList>
            {ancestors?.map((ancestor: BreadcrumbsPage, index) => {
              const title =
                ancestor.navigationTitle?.jsonValue.value || ancestor.title?.jsonValue.value;

              return (
                <>
                  <BreadcrumbItem key={index}>
                    <BreadcrumbLink href={ancestor.url?.href || ''}>{title}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              );
            })}
            <BreadcrumbItem>
              <BreadcrumbPage>{truncate(name)}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        </>
      );
    }

    //if no ancestors
    const homeBreadcrumbSchema = generateBreadcrumbListSchema({
      items: [
        {
          name: 'Home',
          url: typeof window !== 'undefined' ? window.location.origin : '/',
          position: 1,
        },
      ],
    });

    return (
      <>
        {homeBreadcrumbSchema && <StructuredData id="breadcrumb-schema" data={homeBreadcrumbSchema} />}
        {/* Breadcrumb component already includes <nav> with aria-label */}
        <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      </>
    );
  }

  return <NoDataFallback componentName="Breadcrumbs" />;
};
