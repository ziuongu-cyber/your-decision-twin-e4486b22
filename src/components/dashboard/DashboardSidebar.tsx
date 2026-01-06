import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PenLine,
  MessageCircle,
  BarChart3,
  History,
  Sparkles,
  Settings,
  FileText,
  ChevronDown,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DecisionTemplate, getAllTemplates } from "@/lib/templates";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Log Decision", url: "/log-decision", icon: PenLine },
  { title: "Ask Twin", url: "/ask-twin", icon: MessageCircle },
  { title: "Insights", url: "/insights", icon: BarChart3 },
  { title: "History", url: "/history", icon: History },
  { title: "Settings", url: "/settings", icon: Settings },
];

const DashboardSidebar = () => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<DecisionTemplate[]>([]);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  useEffect(() => {
    const loadTemplates = async () => {
      const all = await getAllTemplates();
      setTemplates(all);
    };
    loadTemplates();
  }, []);

  const handleTemplateClick = (template: DecisionTemplate) => {
    navigate("/log-decision", { state: { template } });
  };

  return (
    <Sidebar 
      collapsible="icon" 
      className="border-r border-border/50"
      aria-label="Main navigation"
    >
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary-foreground" aria-hidden="true" />
          </div>
          {!isCollapsed && (
            <span className="font-semibold text-foreground">Digital Twin</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu role="menu" aria-label="Main navigation menu">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title} role="none">
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 hover:bg-sidebar-accent"
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                      role="menuitem"
                      aria-label={item.title}
                    >
                      <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Templates Section */}
        {!isCollapsed && templates.length > 0 && (
          <SidebarGroup>
            <Collapsible open={templatesOpen} onOpenChange={setTemplatesOpen}>
              <CollapsibleTrigger 
                asChild
                aria-expanded={templatesOpen}
                aria-controls="templates-menu"
              >
                <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1.5 flex items-center justify-between group">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4" aria-hidden="true" />
                    Your Templates
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 transition-transform ${templatesOpen ? 'rotate-180' : ''}`} 
                    aria-hidden="true"
                  />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu id="templates-menu" role="menu" aria-label="Templates">
                    {templates.slice(0, 8).map((template) => (
                      <SidebarMenuItem key={template.id} role="none">
                        <SidebarMenuButton
                          onClick={() => handleTemplateClick(template)}
                          className="flex items-center gap-2 text-sm"
                          role="menuitem"
                          aria-label={`Use template: ${template.name}`}
                        >
                          <span aria-hidden="true">{template.icon}</span>
                          <span className="truncate">{template.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
