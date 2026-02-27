import { Edit, Plus } from "lucide-react";
import Link from "next/link";

import { AppNavigationLinks } from "@/components/app-navigation-links";
import { AuthButton } from "@/components/auth-button";
import { AuthRefresh } from "@/components/auth-refresh";
import { Button } from "@/components/ui/button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";

export function AppNavigation() {
  return (
    <nav className="bg-white border-b">
      <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
        <div className="flex items-center gap-2 mr-8">
          <Edit className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-medium">PrepManager</span>
        </div>

        <AppNavigationLinks />

        <div className="ml-auto flex items-center gap-4">
          <Button asChild variant="default" size="sm">
            <Link href="/preparations/create">
              <Plus className="h-4 w-4" />
              Vytvořit
            </Link>
          </Button>
          <AuthRefresh />
          {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
        </div>
      </div>
    </nav>
  );
}
