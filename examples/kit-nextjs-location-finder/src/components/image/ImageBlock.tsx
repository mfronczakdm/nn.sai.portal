import { Text } from '@sitecore-content-sdk/nextjs';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { ImageProps } from '@/components/image/image.props';
import { cn } from '@/lib/utils';
import { NoDataFallback } from '@/utils/NoDataFallback';

export const Default: React.FC<ImageProps> = (props) => {
  const fields = props.fields ?? props.rendering.fields;
  const { image, caption } = fields ?? {};

  if (fields !== undefined) {
    return (
      <div className={cn('component', props.params.styles)}>
        <ImageWrapper image={image} className="mb-[24px] h-full w-full object-cover" page={props.page} />
        <p>
          <Text field={caption} />
        </p>
      </div>
    );
  }
  return <NoDataFallback componentName="Image" />;
};
