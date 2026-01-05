import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { History as HistoryIcon, Search, Filter, Calendar, Trash2 } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { getAllDecisions, deleteDecision, Decision } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

const History = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [filteredDecisions, setFilteredDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    const loadDecisions = async () => {
      try {
        const allDecisions = await getAllDecisions();
        setDecisions(allDecisions);
        setFilteredDecisions(allDecisions);
      } catch (error) {
        console.error("Failed to load decisions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDecisions();
  }, []);

  useEffect(() => {
    let filtered = decisions;

    if (searchQuery) {
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.choice.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }

    setFilteredDecisions(filtered);
  }, [searchQuery, categoryFilter, decisions]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDecision(id);
      setDecisions((prev) => prev.filter((d) => d.id !== id));
      toast({
        title: "Decision deleted",
        description: "The decision has been removed from your history.",
      });
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const categories = [...new Set(decisions.map((d) => d.category))];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="glass-card rounded-2xl p-6 h-32" />
          <div className="glass-card rounded-2xl p-6 h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
              <HistoryIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Decision History</h1>
              <p className="text-muted-foreground">
                {decisions.length} decision{decisions.length !== 1 ? "s" : ""} logged
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search decisions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48 bg-secondary">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Decision List */}
        {filteredDecisions.length > 0 ? (
          <div className="space-y-4">
            {filteredDecisions.map((decision) => (
              <div
                key={decision.id}
                className="glass-card rounded-xl p-4 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium mb-1">{decision.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {decision.choice}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-secondary">
                        {decision.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(decision.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs gradient-text font-medium">
                        {decision.confidence}% confident
                      </span>
                      {decision.outcomes.length > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                          Has outcome
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(decision.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-12 text-center">
            <HistoryIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || categoryFilter !== "all"
                ? "No matching decisions"
                : "No decisions yet"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || categoryFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Start logging decisions to build your history"}
            </p>
            {!searchQuery && categoryFilter === "all" && (
              <Link to="/log-decision">
                <Button variant="hero">Log Your First Decision</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default History;
