"use client";

import BigButton from "@/components/big-button";
import HomePostsGrid from "@/components/home/posts-section/home-posts-grid";
import { usePostsPage } from "@/hooks/usePostsPage";
import type { PostsPageResponse } from "@/lib/posts/posts-types";

type Props = {
  initialData: PostsPageResponse;
};

const PostsClientPage = ({ initialData }: Props) => {
  const {
    items,
    hasMore,
    loading,
    loadingMore,
    error,
    handleLoadMore,
    handleRetry,
  } = usePostsPage(initialData);

  return (
    <>
      {error && (
        <div>
          <p>{error}</p>
          <div>
            <BigButton
              as="button"
              label="Try again"
              mode="big"
              onClick={handleRetry}
            />
          </div>
        </div>
      )}

      {!error && (
        <>
          <HomePostsGrid
            posts={items}
            mode="page"
            loading={loading && items.length === 0}
          />

          {!loading && items.length === 0 && (
            <p className="base-text-size pt-[40px] lg:max-w-(--paragraph-max-width)">
              No posts published yet.
            </p>
          )}

          {hasMore && (
            <div className="flex justify-center pt-[40px] lg:pt-[60px]">
              <BigButton
                as="button"
                label={loadingMore ? "loading..." : "view more"}
                mode="big"
                disabled={loadingMore || loading || !hasMore}
                onClick={handleLoadMore}
              />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default PostsClientPage;
