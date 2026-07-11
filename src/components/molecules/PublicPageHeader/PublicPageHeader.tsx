import Image from "next/image";
import { cn } from "@/lib/utils";

type PublicPageHeaderProps = {
  eyebrow?: string;
  title: string;
  className?: string;
  titleClassName?: string;
  titleContainerClassName?: string;
  eyebrowClassName?: string;
  underlineClassName?: string;
};

export function PublicPageHeader({
  eyebrow,
  title,
  className,
  titleClassName,
  titleContainerClassName,
  eyebrowClassName,
  underlineClassName,
}: PublicPageHeaderProps) {
  return (
    <section
      className={cn(
        "site-container flex flex-col items-center justify-start px-4 py-6 text-center",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex w-full flex-col items-center",
          titleContainerClassName,
        )}
      >
        {eyebrow ? (
          <p
            className={cn(
              "mb-0 self-center font-serif text-xl font-normal italic text-black",
              eyebrowClassName,
            )}
          >
            {eyebrow}
          </p>
        ) : null}

        <h1
          className={cn(
            "font-display text-3xl font-bold leading-none text-black",
            titleClassName,
          )}
        >
          {title}
        </h1>
      </div>

      <Image
        src="/images/strip-title-underline.png"
        alt=""
        width={438}
        height={5}
        aria-hidden
        className={cn("mt-[10px] h-[5px] w-full max-w-[438px]", underlineClassName)}
      />
    </section>
  );
}
