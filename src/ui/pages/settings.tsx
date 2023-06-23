import { MenuWrappedPage } from "../layouts";
import { SettingsSidebar } from "../shared";

export function SettingsPage() {
  return (
    <MenuWrappedPage
    >
      <div className="flex w-64 flex-col inset-y-0 h-screen">
          <SettingsSidebar />
        </div>
    </MenuWrappedPage>
  );
}
