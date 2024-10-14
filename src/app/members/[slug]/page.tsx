import CenteredLoader from "@/app/components/centered-loader";
import { ImageCarousel } from "@/app/components/members/member-carousel";
import MemberInfo from "@/app/components/members/member-info";
import { fetchMember } from "@/utils/api";
import { Suspense } from "react";

export default async function MemberPage({
  params,
}: {
  params: { slug: string };
}) {
  const member = await fetchMember(params.slug);

  return (
    <div className="flex flex-col md:flex-row h-[85vh]">
      <div className="w-full md:w-1/2 h-full">
        <Suspense fallback={<CenteredLoader />}>
          <ImageCarousel images={member.images} />
        </Suspense>
      </div>
      <div className="w-full md:w-1/2 h-full overflow-y-auto text-uiblack">
        <Suspense fallback={<CenteredLoader />}>
          <MemberInfo member={member} />
        </Suspense>
      </div>
    </div>
  );
}
