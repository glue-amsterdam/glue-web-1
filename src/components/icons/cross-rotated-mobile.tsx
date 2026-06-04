type Props = {
    mode?: 'small' | 'large'
}

export default function CrossRotatedMobile({ mode }: Props) {
    const size = mode === 'large' ? '24' : '12'
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.999993 9.99993L10.1924 0.807543" stroke="black" />
            <path d="M10.1924 10L0.999994 0.807612" stroke="black" />
        </svg>

    )
}