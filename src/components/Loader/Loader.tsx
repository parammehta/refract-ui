import { Text } from '../Text';
import { useRefractConfig } from '../RefractProvider';
import { VisuallyHidden } from '../VisuallyHidden';
import { useReducedMotion } from 'framer-motion';
import { useHasMounted } from '../../hooks/useHasMounted';
import { type ComponentPropsWithoutRef } from 'react';
import { createPortal } from 'react-dom';
import { classes, cssProps } from '../../utils/style';
import styles from './Loader.module.css';

export interface LoaderProps extends ComponentPropsWithoutRef<'div'> {
  size?: number;
  text?: string;
}

export const Loader = ({
  className,
  style,
  size = 32,
  text = 'Loading...',
  ...rest
}: LoaderProps) => {
  const reduceMotion = useReducedMotion();
  const hasMounted = useHasMounted();
  const { portalContainer } = useRefractConfig();

  const renderScreenReaderTextPortal = () => {
    if (!hasMounted) return null;

    const container = portalContainer();
    if (!container) return null;

    return createPortal(
      <VisuallyHidden className="loader-announcement" aria-live="assertive">
        {text}
      </VisuallyHidden>,
      container
    );
  };

  if (reduceMotion) {
    return (
      <Text className={classes(styles.text, className)} weight="medium" {...rest}>
        {text}
        {renderScreenReaderTextPortal()}
      </Text>
    );
  }

  const gapSize = Math.round((size / 3) * 0.2);
  const spanSize = Math.round(size / 3 - gapSize * 2 - 1);

  return (
    <div
      className={classes(styles.loader, className)}
      style={cssProps({ size, spanSize, gapSize }, style)}
      {...rest}
    >
      <div className={styles.content}>
        <div className={styles.span} />
        <div className={styles.span} />
        <div className={styles.span} />
      </div>
      {renderScreenReaderTextPortal()}
    </div>
  );
};
