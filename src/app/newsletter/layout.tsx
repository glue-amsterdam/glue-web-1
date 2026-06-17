import { newsletterMetadata } from "@/lib/metadata"


type Props = {
    children: React.ReactNode
}

export const metadata = newsletterMetadata

function Layout({ children }: Props) {
    return (
        <>{children}</>
    )
}

export default Layout