"use client";

import Link from 'next/link';

type BigButtonBase = {
    label: string;
    mode: "navbar" | "big" | "footer";
    fontSize?: "small" | "base";
    disabled?: boolean;
    target?: "_blank" | "_self" | "_parent" | "_top";
};

type BigButtonProps =
    | (BigButtonBase & { as: "link"; href: string })
    | (BigButtonBase & { as: "submit" })
    | (BigButtonBase & { as: "button"; onClick?: () => void });

function BigButton(props: BigButtonProps) {
    const { label, mode, fontSize = "base", disabled = false, target = "_self" } = props;

    const fontSizeClass = fontSize === "small" ? "text-[10px] leading-[10px]"
        : fontSize === "base" ? "text-[15px] lg:text-[19px] leading-[21px] lg:leading-[19px]"
            : "";

    const modeClass = mode === "navbar" ? "pt-2 lg:pt-[10px] pb-[5px] lg:pb-[7px] px-[17px] lg:px-[20px]"
        : mode === "footer" ? "py-[8px] px-[13px] lg:border-[1px]"
            : mode === "big" ? "pt-2 pb-[5px] lg:py-[20px] px-[17px] lg:px-[35px]"
                : "";

    const buttonClassName = `cursor-pointer rounded-[40px] bg-[var(--white-color)] ${fontSizeClass} border lg:border-2 border-[var(--black-color)] text-[var(--black-color)]
            hover:bg-[var(--primary-color)] hover:text-[var(--white-color)] hover:border-[var(--primary-color)] transition-all duration-100
            disabled:opacity-50 disabled:pointer-events-none
            ${modeClass}`;

    if (props.as === "link") {
        return (
            <Link href={props.href} target={target}>
                <button
                    type="button"
                    disabled={disabled}
                    className={buttonClassName}

                >
                    {label}
                </button>
            </Link>
        );
    }

    if (props.as === "submit") {
        return (
            <button
                type="submit"
                disabled={disabled}
                className={buttonClassName}
            >
                {label}
            </button>
        );
    }

    return (
        <button
            type="button"
            disabled={disabled}
            onClick={props.onClick}
            className={buttonClassName}
        >
            {label}
        </button>
    );
}

export default BigButton
