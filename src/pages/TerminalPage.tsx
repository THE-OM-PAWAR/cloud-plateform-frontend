import Terminal from "@/components/Terminal";
import { AuthLayout } from "@/components/AuthLayout";

const TerminalPage = () => {
  return (
    <AuthLayout>
      <div className="h-[calc(100vh-8rem)]">
        <Terminal />
      </div>
    </AuthLayout>
  );
};

export default TerminalPage;