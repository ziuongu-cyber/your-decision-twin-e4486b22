import { Settings as SettingsIcon } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="glass-card rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
              <SettingsIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground">Customize your Digital Twin experience</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-xl p-6">
              <h3 className="font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground text-sm">
                Settings and customization options will be available in a future update.
                This includes notification preferences, data export, theme options, and more.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
