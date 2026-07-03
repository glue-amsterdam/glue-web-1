type Props = {
  title: string;
  descriptionHtml: string;
  as?: "h1" | "h2";
};

const PostsSectionIntro = ({
  title,
  descriptionHtml,
  as: Heading = "h2",
}: Props) => (
  <>
    <Heading className="title-text mini-padding">
      {title.toUpperCase()}
    </Heading>
    <div
      className="title-padding lg:max-w-(--paragraph-max-width) body-text post-content"
      dangerouslySetInnerHTML={{ __html: descriptionHtml }}
    />
  </>
);

export default PostsSectionIntro;
