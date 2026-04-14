import React, { JSX } from 'react';
import { AppPlaceholder } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

const PartialDesignDynamicPlaceholder = (props: ComponentProps): JSX.Element => (
  <AppPlaceholder page={props.page} componentMap={props.componentMap} name={props.rendering?.params?.sig || ''} rendering={props.rendering} />
);

export default PartialDesignDynamicPlaceholder;
