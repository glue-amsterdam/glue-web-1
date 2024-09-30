import Link from "next/link";
import { AiFillInstagram, AiFillLinkedin } from "react-icons/ai";

function SocialSection() {
  return (
    <aside>
      <ul className="flex gap-2 text-4xl">
        <li>
          <Link href={"/"} target="_blank">
            <AiFillInstagram />
          </Link>
        </li>
        <li>
          <Link href={"/"} target="_blank">
            <AiFillLinkedin />
          </Link>
        </li>
      </ul>
    </aside>
  );
}

export default SocialSection;
