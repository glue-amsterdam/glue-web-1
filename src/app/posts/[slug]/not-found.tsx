import BigButton from "@/components/big-button";
import BottomBlock from "@/components/bottom-block";
import HeadlineWCross from "@/components/headline-w-cross";
import MainContainer from "@/components/main-container";

export default function PostNotFound() {
  return (
    <main id="post-not-found-page" className="first-padding">
      <MainContainer>
        <section
          id="post-not-found-section"
          className="flex flex-col gap-[15px] lg:gap-[30px]"
        >
          <HeadlineWCross title="Post not found" closeFallbackHref="/posts" preferCloseFallback />
          <p className="base-text-size">
            The post you are looking for does not exist or is no longer published.
          </p>
          <BigButton as="link" label="see all posts" href="/posts" mode="big" />
        </section>
        <BottomBlock />
      </MainContainer>
    </main>
  );
}
