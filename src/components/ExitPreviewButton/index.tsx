import Link from 'next/link';

import styles from './exit_preview_button.module.scss';

interface ExitPreviewButtonProps {
  enabled: boolean;
}

const ExitPreviewButton = ({
  enabled,
}: ExitPreviewButtonProps): JSX.Element => {
  if (!enabled) {
    return null;
  }

  return (
    <aside className={styles.exitButton}>
      <Link href="/api/exit-preview">
        <a>Sair do modo Preview</a>
      </Link>
    </aside>
  );
};

export { ExitPreviewButton };
