import BigButton from "@/components/big-button";
import type { ParticipatePlanCard } from "@/lib/participate/types";
import type { ParticipationIntent } from "@/schemas/participationSchemas";
import { EMAIL_PARAM } from "@/lib/auth/post-auth-redirect";
import MinusIcon from "@/components/icons/minus-icon";

type ParticipatePlanCardProps = {
  plan: ParticipatePlanCard;
  applyIntent?: ParticipationIntent;
  variant: "base" | "selectable";
  planSelectionDisabled?: boolean;
  disabledReason?: string;
  email?: string | null;
};

const buildApplyHref = (
  planId: string,
  intent: ParticipationIntent,
  email?: string | null,
): string => {
  const params = new URLSearchParams();
  params.set("planId", planId);

  if (intent !== "new") {
    params.set("intent", intent);
  }

  if (email) {
    params.set(EMAIL_PARAM, email);
  }

  return `/participate/apply?${params.toString()}`;
};

const ParticipatePlanCardView = ({
  plan,
  applyIntent = "new",
  variant,
  planSelectionDisabled = false,
  disabledReason,
  email,
}: ParticipatePlanCardProps) => {
  const applyHref = buildApplyHref(plan.id, applyIntent, email);

  if (variant === "base") {
    return (
      <article className=" lg:border-t-2 lg:border-(--black-color)">
        <h3 className="lg:pt-[15px] small-title-text">{plan.plan_label.toUpperCase()}</h3>
        <p className="small-title-text">{plan.plan_price.toUpperCase()}</p>
        <ul className="list-none pt-[15px] flex-col flex gap-[20px] max-w-[90%] lg:max-w-full body-text">
          {plan.features.map((feature) => (
            <li key={feature.label}>{feature.label}</li>
          ))}
        </ul>
      </article>
    );
  }

  return (
    <article className="main-boder-top flex flex-col h-full">
      <h3 className="pt-[15px] small-title-text">
        {plan.plan_label.toUpperCase()}
      </h3>
      <p className="small-title-text">{plan.plan_price.toUpperCase()}</p>
      <ul className="list-none pt-[40px] flex-col flex gap-[20px] max-w-[90%] lg:max-w-full">
        {plan.features.map((feature) => (
          <li
            className="body-text flex items-start"
            key={feature.label}
          >
            <span
              aria-hidden="true"
              className="flex h-[21px] w-5 shrink-0 items-center lg:h-[25px]"
            >
              <MinusIcon />
            </span>
            <span className="body-text">{feature.label}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-[40px] flex flex-col items-center gap-[15px]">
        {planSelectionDisabled ? (
          disabledReason ? (
            <p
              className="body-text text-center max-w-[90%] text-(--black-color)/80"
              role="status"
            >
              {disabledReason}
            </p>
          ) : null
        ) : (
          <BigButton
            as="link"
            label="select plan"
            href={applyHref}
            mode="big"
          />
        )}
      </div>
    </article>
  );
};

export default ParticipatePlanCardView;
