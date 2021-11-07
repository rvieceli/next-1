import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';

import Prismic from '@prismicio/client';
import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { TextWithIcon } from '../components/TextWithIcon';
import { formatDate } from '../utility/formatDate';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const formatPosts = (results: Post[]): Post[] =>
  results.map(post => ({
    ...post,
    first_publication_date: formatDate(new Date(post.first_publication_date)),
  }));

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [nextPage, setNextPage] = useState(postsPagination.next_page);
  const [posts, setPosts] = useState(formatPosts(postsPagination.results));

  const handlePagination = async (): Promise<void> => {
    const response = await fetch(nextPage);
    const data: PostPagination = await response.json();

    setNextPage(data.next_page);
    setPosts([...posts, ...formatPosts(data.results)]);
  };

  return (
    <>
      <Head>
        <title>Home | spacetraveling.</title>{' '}
      </Head>
      <main className={commonStyles.container}>
        <div className={styles.post}>
          {posts.map(post => (
            <Link key={post.uid} href={`/post/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <footer>
                  <TextWithIcon
                    icon="/images/calendar.svg"
                    text={post.first_publication_date}
                  />
                  <TextWithIcon
                    icon="/images/user.svg"
                    text={post.data.author}
                  />
                </footer>
              </a>
            </Link>
          ))}
        </div>
        {!!nextPage && (
          <div className={styles.more}>
            <input
              type="button"
              onClick={handlePagination}
              className={styles.link}
              value="Carregar mais posts"
            />
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsPagination = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 10,
    }
  );

  return {
    props: {
      postsPagination,
    },
    revalidate: 30,
  };
};
