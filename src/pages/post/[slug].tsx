import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { RichText as RichTextComponent, RichTextBlock } from 'prismic-reactjs';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { formatDate } from '../../utility/formatDate';
import { formatDateTime } from '../../utility/formatDateTime';
import { TextWithIcon } from '../../components/TextWithIcon';
import { ExitPreviewButton } from '../../components/ExitPreviewButton';
import { useUtterances } from '../../hooks/useUtterances';

interface Post {
  id: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: RichTextBlock[];
    }[];
  };
}

interface PostWithTitle {
  uid: string;
  data: {
    title: string;
  };
}

interface PostProps {
  post: Post;
  previous?: PostWithTitle;
  next?: PostWithTitle;
  preview: boolean;
}

export default function Post({
  post,
  previous,
  next,
  preview,
}: PostProps): JSX.Element {
  const router = useRouter();
  useUtterances(post?.id);

  if (router.isFallback) {
    return <div className={commonStyles.container}>Carregando...</div>;
  }

  const readingTime = Math.ceil(
    post.data.content.reduce((acc, section) => {
      return (
        acc +
        RichText.asText(section.body).split(' ').length +
        section.heading.split(' ').length
      );
    }, 0) / 200
  );

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling.</title>
      </Head>
      <img
        className={styles.banner}
        src={post.data.banner.url}
        alt={post.data.title}
      />
      <main className={`${commonStyles.container} ${styles.postContainer}`}>
        <h1>{post.data.title}</h1>

        <div>
          <TextWithIcon
            icon="/images/calendar.svg"
            text={formatDate(new Date(post.first_publication_date))}
          />
          <TextWithIcon icon="/images/user.svg" text={post.data.author} />
          <TextWithIcon icon="/images/clock.svg" text={`${readingTime} min`} />
        </div>

        {!!post.last_publication_date && (
          <time>
            * editado em {formatDateTime(new Date(post.last_publication_date))}
          </time>
        )}

        {post.data.content.map(section => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            <RichTextComponent render={section.body} />
          </section>
        ))}

        <footer className={styles.footerContainer}>
          <div>
            {!!previous && (
              <Link href={`/post/${previous.uid}`}>
                <a className={styles.previous}>
                  <span>{previous.data.title}</span>
                  <strong>Post anterior</strong>
                </a>
              </Link>
            )}
          </div>
          <div>
            {!!next && (
              <Link href={`/post/${next.uid}`}>
                <a className={styles.next}>
                  <span>{next.data.title}</span>
                  <strong>Próximo post</strong>
                </a>
              </Link>
            )}
          </div>
        </footer>
        <div id={post.id} />

        <ExitPreviewButton enabled={preview} />
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      fetch: 'posts.title',
      pageSize: 1,
    }
  );

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const slug = params.slug as string;

  const post = await prismic.getByUID('posts', slug, previewData);

  const {
    results: [next = null],
  } = await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
    fetch: 'posts.title',
    pageSize: 1,
    after: `${post.id}`,
    orderings: '[document.first_publication_date desc]',
    ...previewData,
  });

  const {
    results: [previous = null],
  } = await prismic.query(Prismic.predicates.at('document.type', 'posts'), {
    fetch: 'posts.title',
    pageSize: 1,
    after: `${post.id}`,
    orderings: '[document.first_publication_date]',
    ...previewData,
  });

  return {
    props: {
      post,
      previous,
      next,
      preview,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};
