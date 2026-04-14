import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { NoDataFallback } from '@/utils/NoDataFallback';
import { ComponentProps } from '@/lib/component-props';
import { GqlFieldString } from '@/types/gql.props';
import { LinkFieldValue } from '@sitecore-content-sdk/nextjs';
import { generateBreadcrumbListSchema } from '@/lib/structured-data/schema';
import { getBaseUrl } from '@/lib/utils';
import { StructuredData } from '@/components/structured-data/StructuredData';

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

  // Generate BreadcrumbList schema
  const breadcrumbItems = [
    ...(ancestors?.map((ancestor) => ({
      name: (ancestor.navigationTitle?.jsonValue.value || ancestor.title?.jsonValue.value) as string,
      url: ancestor.url?.href ? `${getBaseUrl()}${ancestor.url.href}` : undefined,
    })) || []),
    { name, url: undefined }, // Current page
  ];

  const breadcrumbSchema = generateBreadcrumbListSchema(breadcrumbItems);

  if (fields) {
    if (ancestors) {
      return (
        <>
          {/* BreadcrumbList structured data */}
          <StructuredData id="breadcrumb-schema" data={breadcrumbSchema} />
          
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
    const homeBreadcrumbSchema = generateBreadcrumbListSchema([{ name: 'Home', url: getBaseUrl() }]);
    return (
      <>
        <StructuredData id="breadcrumb-schema-home" data={homeBreadcrumbSchema} />
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
