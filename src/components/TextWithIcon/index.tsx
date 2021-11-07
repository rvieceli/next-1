import styles from './text_with_icon.module.scss';

interface TextWithIconProps {
  icon: string;
  text: string;
}

export function TextWithIcon({ icon, text }: TextWithIconProps): JSX.Element {
  return (
    <div className={styles.container}>
      <img src={icon} alt={text} />
      <span>{text}</span>
    </div>
  );
}
