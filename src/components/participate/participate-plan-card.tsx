import BigButton from "@/components/big-button";
import type { ParticipatePlanCard } from "@/lib/participate/types";
import type { ParticipationIntent } from "@/schemas/participationSchemas";

type ParticipatePlanCardProps = {
  plan: ParticipatePlanCard;
  applyIntent?: ParticipationIntent;
  variant: "base" | "selectable";
  planSelectionDisabled?: boolean;
  disabledReason?: string;
};

const buildIntentQuery = (intent: ParticipationIntent): string => {
  if (intent === "new") return "";
  return `&intent=${intent}`;
};

const ParticipatePlanCardView = ({
  plan,
  applyIntent = "new",
  variant,
  planSelectionDisabled = false,
  disabledReason,
}: ParticipatePlanCardProps) => {
  const intentQuery = buildIntentQuery(applyIntent);

  if (variant === "base") {
    return (
      <article className="base-text-size lg:border-t-2 lg:border-(--black-color)">
        <h3 className="lg:pt-[15px]">{plan.plan_label.toUpperCase()}</h3>
        <p>{plan.plan_price.toUpperCase()}</p>
        <ul className="list-none pt-[15px] flex-col flex gap-[20px] max-w-[90%] lg:max-w-full">
          {plan.features.map((feature) => (
            <li key={feature.label}>- {feature.label}</li>
          ))}
        </ul>
      </article>
    );
  }

  return (
    <article className="main-boder-top lg:h-[480px]">
      <h3 className="pt-[15px] text-[19px] leading-[26px] lg:text-[23px] lg:leading-[29px]">
        {plan.plan_label.toUpperCase()}
      </h3>
      <p className="text-[19px] leading-[26px]">{plan.plan_price.toUpperCase()}</p>
      <ul className="list-none pt-[40px] flex-col flex gap-[20px] max-w-[90%] lg:max-w-full lg:h-[310px] overflow-y-auto">
        {plan.features.map((feature) => (
          <li className="base-text-size" key={feature.label}>
            - {feature.label}
          </li>
        ))}
      </ul>
      <div className="pt-[40px] flex flex-col items-center gap-[15px]">
        {planSelectionDisabled ? (
          disabledReason ? (
            <p
              className="base-text-size text-center max-w-[90%] text-(--black-color)/80"
              role="status"
            >
              {disabledReason}
            </p>
          ) : null
        ) : (
          <BigButton
            as="link"
            label="select plan"
            href={`/participate/apply?planId=${plan.id}${intentQuery}`}
            mode="big"
          />
        )}
      </div>
    </article>
  );
};

export default ParticipatePlanCardView;
