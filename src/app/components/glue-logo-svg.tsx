import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

export default function GlueLogoSVG({
  className,
  isVisible,
}: {
  className?: string;
  isVisible?: boolean;
}) {
  return (
    <motion.svg
      className={twMerge("", className)}
      viewBox="0 0 344 347"
      fill="none"
    >
      <motion.path
        id="g-leter"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={
          isVisible ? { scale: 1, opacity: 1 } : { scale: 0.2, opacity: 0 }
        }
        transition={{ delay: 0.1 }}
        d="M19.1 3.09999C11.8 6.79999 6.3 13.1 2.9 21.7C1 26.5 0.600002 30 0.200002 42.6C-0.299998 59.4 1 66.7 5.6 74.5C14.9 90.5 37.4 94.9 50.8 83.5L55 79.9L55.6 83.9C56.3 88 56.3 88 60.6 88H65V64.5V41H48.5H32V46.5V52H43H54V54.7C54 58.8 51.5 67.3 49.5 70.4C48.5 71.9 45.7 74.2 43.3 75.7C39.5 77.9 38.1 78.2 32 77.8C24.3 77.4 21.1 75.7 17.2 70C13.4 64.4 12.5 59.4 12.6 44.5C12.7 29.3 13.7 24.7 18.6 18.3C27.8 6.19999 47.9 9.79999 51.5 24.2C52.2 26.9 52.5 27 58.1 27H64V24C64 16.7 56.2 6.39999 47.5 2.39999C43.5 0.499993 40.8 -7.44286e-06 33.9 -7.44286e-06C26.3 -7.44286e-06 24.6 0.399993 19.1 3.09999Z"
        fill="currentColor"
      />
      <motion.path
        id="l-letter"
        initial={{ scale: 0.2, opacity: 0 }}
        animate={
          isVisible ? { scale: 1, opacity: 1 } : { scale: 0.2, opacity: 0 }
        }
        transition={{ delay: 0.2 }}
        d="M283 44.5V88H313.5H344V82.5V77H319.5H295V39V1H289H283V44.5Z"
        fill="currentColor"
      />

      <motion.path
        initial={{ scale: 0.2, opacity: 0 }}
        animate={
          isVisible ? { scale: 1, opacity: 1 } : { scale: 0.2, opacity: 0 }
        }
        transition={{ delay: 0.3 }}
        id="u-letter"
        d="M4 291.5C4 322.1 4.1 324.2 6.1 329.6C8.7 336.6 14.9 343 21.2 345.4C24.8 346.8 28 347.1 35.6 346.8C47.8 346.4 53.6 344 58.4 337.3C64.7 328.4 64.9 326.8 65 291.2V259H59.1H53.1L52.8 291.2C52.5 320.4 52.3 323.9 50.6 327.3C47.4 333.7 43.8 335.5 34.3 335.5C24.7 335.5 21.8 334 18.3 327C16.1 322.7 16 321.8 16 290.8V259H10H4V291.5Z"
        fill="currentColor"
      />
      <motion.path
        initial={{ scale: 0.2, opacity: 0 }}
        animate={
          isVisible ? { scale: 1, opacity: 1 } : { scale: 0.2, opacity: 0 }
        }
        transition={{ delay: 0.4 }}
        id="e-letter"
        d="M283 302.5V346H313.5H344V340.5V335H319.5H295V321V307H314H333V301V295H314H295V282.5V270H319.5H344V264.5V259H313.5H283V302.5Z"
        fill="currentColor"
      />
      <motion.path
        initial={{ scale: 0.2, opacity: 0 }}
        animate={
          isVisible ? { scale: 1, opacity: 1 } : { scale: 0.2, opacity: 0 }
        }
        transition={{ delay: 0.5, duration: 0.5 }}
        id="upper-line"
        d="M75 44.5C75 45.8 86.7 46 174 46C261.3 46 273 45.8 273 44.5C273 43.2 261.3 43 174 43C86.7 43 75 43.2 75 44.5Z"
        fill="currentColor"
      />
      <motion.path
        initial={{ scale: 0.2, opacity: 0 }}
        animate={
          isVisible ? { scale: 1, opacity: 1 } : { scale: 0.2, opacity: 0 }
        }
        transition={{ delay: 0.5, duration: 0.5 }}
        id="mid-line"
        d="M33.5 98.1C33.1 98.7 33 99.3 33.1 99.4C33.5 99.7 118.1 145.3 154.1 164.6L170.8 173.5L104.1 209.5C67.5 229.2 36.5 245.9 35.3 246.5C34 247 33 247.9 33 248.3C33 250.8 37.4 249.2 51.1 241.7C67.5 232.8 89.7 220.8 141.8 192.7L174.1 175.3L214.8 197.2C237.2 209.3 268.5 226.2 284.3 234.7C307.2 247.1 313.4 250 314.3 249C315 248.2 315.1 247.6 314.5 247.4C314 247.2 299.6 239.4 282.5 230.2C265.5 221 234.8 204.5 214.4 193.5L177.3 173.5L185.4 169.2C189.9 166.8 200.9 160.9 210 156C236.5 141.9 314.5 99.9 314.9 99.4C315.2 99.2 314.9 98.5 314.3 97.9C313.6 97.2 297.1 105.6 261.9 124.6C233.6 139.8 202.3 156.6 192.3 162L174.1 171.8L157.8 163C148.8 158.2 117.6 141.4 88.3 125.6C59.1 109.9 34.9 97 34.6 97C34.3 97 33.8 97.5 33.5 98.1Z"
        fill="currentColor"
      />
      <motion.path
        initial={{ scale: 0.2, opacity: 0 }}
        animate={
          isVisible ? { scale: 1, opacity: 1 } : { scale: 0.2, opacity: 0 }
        }
        transition={{ delay: 0.6, duration: 0.5 }}
        id="down-line"
        d="M75 302.5C75 303.8 86.7 304 174 304C261.3 304 273 303.8 273 302.5C273 301.2 261.3 301 174 301C86.7 301 75 301.2 75 302.5Z"
        fill="currentColor"
      />
    </motion.svg>
  );
}
