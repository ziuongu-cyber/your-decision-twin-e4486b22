import { useState, useEffect, useMemo } from "react";
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
import DashboardSkeleton from "@/components/common/DashboardSkeleton";
import DecisionDetailModal from "@/components/dashboard/DecisionDetailModal";
import OutcomeModal from "@/components/dashboard/OutcomeModal";
import AdvancedFilters, { FilterState } from "@/components/search/AdvancedFilters";
import { useDebounce } from "@/hooks/useDebounce";
import { getAllDecisions, deleteDecision, Decision } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { subDays, subMonths, subYears, isAfter } from "date-fns";

const ITEMS_PER_PAGE = 10;

const History = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [outcomeDecision, setOutcomeDecision] = useState<Decision | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: "all",
    confidenceRange: [0, 100],
    outcomeStatus: "all",
    sortBy: "newest",
  });
  
  const { toast } = useToast();
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    const loadDecisions = async () => {
      try {
        const allDecisions = await getAllDecisions();
        setDecisions(allDecisions);
      } catch (error) {
        console.error("Failed to load decisions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDecisions();
  }, []);

  // Filter and sort decisions
  const filteredDecisions = useMemo(() => {
    let filtered = decisions;

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.choice.toLowerCase().includes(query) ||
          d.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      let cutoff: Date;
      switch (filters.dateRange) {
        case "week":
          cutoff = subDays(now, 7);
          break;
        case "month":
          cutoff = subMonths(now, 1);
          break;
        case "3months":
          cutoff = subMonths(now, 3);
          break;
        case "year":
          cutoff = subYears(now, 1);
          break;
        default:
          cutoff = new Date(0);
      }
      filtered = filtered.filter((d) => isAfter(new Date(d.createdAt), cutoff));
    }

    // Confidence range filter
    filtered = filtered.filter(
      (d) =>
        d.confidence >= filters.confidenceRange[0] &&
        d.confidence <= filters.confidenceRange[1]
    );

    // Outcome status filter
    if (filters.outcomeStatus === "with-outcome") {
      filtered = filtered.filter((d) => d.outcomes.length > 0);
    } else if (filters.outcomeStatus === "without-outcome") {
      filtered = filtered.filter((d) => d.outcomes.length === 0);
    }

    // Sort
    switch (filters.sortBy) {
      case "oldest":
        filtered = [...filtered].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "confidence-high":
        filtered = [...filtered].sort((a, b) => b.confidence - a.confidence);
        break;
      case "confidence-low":
        filtered = [...filtered].sort((a, b) => a.confidence - b.confidence);
        break;
      default:
        // newest first (already sorted by default)
        break;
    }

    return filtered;
  }, [decisions, debouncedSearch, categoryFilter, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredDecisions.length / ITEMS_PER_PAGE);
  const paginatedDecisions = filteredDecisions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, categoryFilter, filters]);

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

  const handleOutcomeSuccess = async () => {
    const allDecisions = await getAllDecisions();
    setDecisions(allDecisions);
  };

  const categories = [...new Set(decisions.map((d) => d.category))];

  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton variant="history" />
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
          <div className="space-y-4">
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

            <AdvancedFilters filters={filters} onChange={setFilters} />
          </div>
        </div>

        {/* Decision List */}
        {paginatedDecisions.length > 0 ? (
          <div className="space-y-4">
            {paginatedDecisions.map((decision) => (
              <div
                key={decision.id}
                className="glass-card rounded-xl p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedDecision(decision)}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(decision.id);
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
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

      {/* Modals */}
      <DecisionDetailModal
        decision={selectedDecision}
        open={!!selectedDecision}
        onOpenChange={(open) => !open && setSelectedDecision(null)}
        onAddOutcome={(decision) => {
          setSelectedDecision(null);
          setOutcomeDecision(decision);
        }}
      />

      <OutcomeModal
        decision={outcomeDecision}
        open={!!outcomeDecision}
        onOpenChange={(open) => !open && setOutcomeDecision(null)}
        onSuccess={handleOutcomeSuccess}
      />
    </DashboardLayout>
  );
};

export default History;
