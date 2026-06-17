import type { PressKitLink } from "@/schemas/mainSchema";

type PressKitDownloadSectionProps = {
  pressKitLinks: PressKitLink[];
};

const isHttpUrl = (url: string) =>
  url.startsWith("http://") || url.startsWith("https://");

export const PressKitDownloadSection = ({
  pressKitLinks,
}: PressKitDownloadSectionProps) => {
  const validLinks = pressKitLinks.filter((item) =>
    isHttpUrl(item.link.trim())
  );

  if (validLinks.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-md border border-(--black-color)/15 bg-(--white-color) px-4 py-6 lg:px-6"
      aria-labelledby="press-kit-download-title"
    >
      <h2
        id="press-kit-download-title"
        className="text-base font-semibold text-(--black-color)"
      >
        Press kit
      </h2>
      <p className="mt-2 text-sm text-(--black-color)/80">
        Download official GLUE assets for your participant profile and
        communications.
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {validLinks.map((item) => (
          <li key={item.id}>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex text-sm font-medium text-(--black-color) underline underline-offset-2 hover:text-(--black-color)/70"
              aria-label={
                item.description
                  ? `Download press kit: ${item.description}`
                  : "Download press kit"
              }
            >
              {item.description?.trim() || "Download press kit"}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
};
