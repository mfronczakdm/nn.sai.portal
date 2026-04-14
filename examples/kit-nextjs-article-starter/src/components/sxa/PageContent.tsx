import React, { JSX } from 'react';
import {
  RichText as ContentSdkRichText,
  RichTextField,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Content: RichTextField;
}

type PageContentProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: PageContentProps): JSX.Element => {
  const { page, params, fields } = props;

  const sxaStyles = params?.Styles ?? '';
  const id = params?.RenderingIdentifier ?? null;

  if (!(fields && fields.Content) && !page?.layout.sitecore.route?.fields?.Content) {
    return (
      <div className={`component page-content ${sxaStyles}`} id={id ? id : undefined}>
        <div className="component-content">
          <div className="field-content">[Page Content]</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`component page-content ${sxaStyles}`} id={id ? id : undefined}>
      <div className="component-content">
        <ContentSdkRichText
          field={
            (fields && fields.Content
              ? fields.Content
              : page?.layout.sitecore.route?.fields?.Content) as RichTextField
          }
          className="field-content"
        />
      </div>
    </div>
  );
};
