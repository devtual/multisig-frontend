import { twMerge } from "tailwind-merge"

type Variants = "screen" | "fullscreen" | "content"

type LoaderProps = {
  className?: string;
  variant?: Variants;
}

export default function Loader({className, variant = "screen"}: LoaderProps) {
  const variants = {
    screen: "h-screen w-full bg-gray-900",
    fullscreen: "fixed inset-0 bg-gray-900/70 z-50",
    content: "absolute inset-0 bg-gray-900/30",
  };

  return (
    <div className={twMerge("flex justify-center items-center p-4",
    variants[variant]
    , className)}>
      <svg
        className="animate-spin h-8 w-8 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        ></path>
      </svg>
    </div>
  );
}
