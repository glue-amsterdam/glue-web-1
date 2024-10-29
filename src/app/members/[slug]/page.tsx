import CenteredLoader from "@/app/components/centered-loader";
import LogoMain from "@/app/components/logo-main";
import { ImageCarousel } from "@/app/components/members/member-carousel";
import MemberInfo from "@/app/components/members/member-info";
import { NAVBAR_HEIGHT } from "@/constants";
import { fetchMember } from "@/utils/api";
import { Suspense } from "react";

export default async function MemberPage({
  params,
}: {
  params: { slug: string };
}) {
  const member = await fetchMember(params.slug);

  return (
    <main className="relative h-screen">
      <section
        className={`pt-[${NAVBAR_HEIGHT}rem] grid grid-cols-1 md:grid-cols-2 h-full grid-rows-2 md:grid-rows-1`}
      >
        <article className="overflow-hidden">
          <LogoMain mode="member" />
          <Suspense fallback={<CenteredLoader />}>
            <ImageCarousel images={member.images} />
          </Suspense>
        </article>
        <article className="h-full overflow-y-scroll text-uiblack">
          <Suspense fallback={<CenteredLoader />}>
            <MemberInfo member={member} />
          </Suspense>
        </article>
      </section>
    </main>
  );
}
