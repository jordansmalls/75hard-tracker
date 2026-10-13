import { HomeActions } from "@/components/home-actions";
import { siteConfig } from "@/lib/site";

const preview = Array.from({ length: 30 }, (_, index) => index < 17);

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-between gap-10 px-6 pt-[calc(env(safe-area-inset-top)+3rem)] pb-[calc(env(safe-area-inset-bottom)+2rem)]">
      <div className="flex flex-col gap-8">
        <ol aria-hidden className="grid animate-rise grid-cols-10 gap-2">
          {preview.map((done, index) => (
            <li
              key={index}
              className={
                done
                  ? "grid aspect-square place-items-center rounded-full bg-primary"
                  : "aspect-square rounded-full shadow-[inset_0_0_0_2px_var(--track)]"
              }
            >
              {done && (
                <svg viewBox="0 0 24 24" className="size-[58%] text-white" fill="none">
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor"
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </li>
          ))}
        </ol>
        <div className="flex animate-rise flex-col gap-3" style={{ "--i": 1 } as React.CSSProperties}>
          <h1 className="text-5xl leading-[1.05] font-extrabold tracking-tight">{siteConfig.name}</h1>
          <p className="text-xl font-medium text-muted-foreground">{siteConfig.description}</p>
        </div>
      </div>
      <div className="animate-rise" style={{ "--i": 2 } as React.CSSProperties}>
        <HomeActions />
      </div>
    </main>
  );
}
