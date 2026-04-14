import React, { type JSX } from 'react';
import {
  LinkField,
  Text,
  TextField,
} from '@sitecore-content-sdk/nextjs';
import { NavigationMenuToggle } from './NavigationMenuToggle.client';
import { NavigationList } from './NavigationList.client';
import { ComponentProps } from 'lib/component-props';

export interface Fields {
  Id: string;
  DisplayName: string;
  Title: TextField;
  NavigationTitle: TextField;
  Href: string;
  Querystring: string;
  Children: Array<Fields>;
  Styles: string[];
}

export type NavigationProps = ComponentProps & {
  params?: { [key: string]: string };
  fields: Fields;
  handleClick: (event?: React.MouseEvent<HTMLElement>) => void;
  relativeLevel: number;
};

const getNavigationText = function (props: { fields: Fields }): JSX.Element | string {
  let text: JSX.Element | string;

  if (props.fields.NavigationTitle) {
    text = <Text field={props.fields.NavigationTitle} />;
  } else if (props.fields.Title) {
    text = <Text field={props.fields.Title} />;
  } else {
    text = props.fields.DisplayName;
  }

  return text;
};

const getLinkField = (props: { fields: Fields }): LinkField => ({
  value: {
    href: props.fields.Href,
    title: getLinkTitle(props),
    querystring: props.fields.Querystring,
  },
});

const getLinkTitle = (props: { fields: Fields }): string | undefined => {
  let title: string | undefined;
  if (props.fields.NavigationTitle?.value) {
    title = props.fields.NavigationTitle.value.toString();
  } else if (props.fields.Title?.value) {
    title = props.fields.Title.value.toString();
  } else {
    title = props.fields.DisplayName;
  }

  return title;
};

/**
 * Server component for Navigation.
 * Pass isEditing as prop from parent when rendering in editing context.
 */
export const Default = (props: NavigationProps): JSX.Element => {
  const { page } = props;

  const styles =
    props.params != null
      ? `${props.params.GridParameters ?? ''} ${props.params.Styles ?? ''}`.trimEnd()
      : '';
  const id = props.params != null ? props.params.RenderingIdentifier : null;

  if (!Object.values(props.fields).length) {
    return (
      <div className={`component navigation ${styles}`} id={id ? id : undefined}>
        <div className="component-content">[Navigation]</div>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleToggleMenu = (event?: React.MouseEvent<HTMLElement>, flag?: boolean): void => {
    props.handleClick(event);
  };

  const list = Object.values(props.fields)
    .filter((element) => element)
    .map((element: Fields, key: number) => (
      <NavigationList
        key={`${key}${element.Id}`}
        fields={element}
        handleClick={(event: React.MouseEvent<HTMLElement>) => handleToggleMenu(event, false)}
        relativeLevel={1}
        isEditing={page.mode.isEditing}
        getLinkField={getLinkField}
        getNavigationText={getNavigationText}
      />
    ));

  return (
    <div className={`component navigation ${styles}`} id={id ? id : undefined}>
      <label className="menu-mobile-navigate-wrapper">
        <NavigationMenuToggle isEditing={page.mode.isEditing} onToggle={handleToggleMenu}>
          <div className="menu-humburger" />
          <div className="component-content">
            <nav>
              <ul className="clearfix">{list}</ul>
            </nav>
          </div>
        </NavigationMenuToggle>
      </label>
    </div>
  );
};
