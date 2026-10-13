import { AuthGuard } from "@/components/auth/auth-guard";
import { EmailVerificationBanner } from "@/components/layout/email-verification-banner";
import { TabBar } from "@/components/layout/tab-bar";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <AuthGuard requirement="user">
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 pt-[env(safe-area-inset-top)] pb-[calc(6rem+env(safe-area-inset-bottom))]">
        <EmailVerificationBanner />
        {children}
      </main>
      <TabBar />
    </AuthGuard>
  );
}
