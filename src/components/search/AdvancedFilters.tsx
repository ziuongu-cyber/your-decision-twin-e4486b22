import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterState {
  dateRange: "all" | "week" | "month" | "3months" | "year";
  confidenceRange: [number, number];
  outcomeStatus: "all" | "with-outcome" | "without-outcome";
  sortBy: "newest" | "oldest" | "confidence-high" | "confidence-low";
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  className?: string;
}

const AdvancedFilters = ({ filters, onChange, className }: AdvancedFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.dateRange !== "all" ||
    filters.confidenceRange[0] !== 0 ||
    filters.confidenceRange[1] !== 100 ||
    filters.outcomeStatus !== "all" ||
    filters.sortBy !== "newest";

  const handleReset = () => {
    onChange({
      dateRange: "all",
      confidenceRange: [0, 100],
      outcomeStatus: "all",
      sortBy: "newest",
    });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn(className)}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Advanced Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
            <ChevronDown
              className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")}
            />
          </Button>
        </CollapsibleTrigger>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <CollapsibleContent className="pt-4">
        <div className="glass-card rounded-xl p-4 space-y-6">
          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Select
              value={filters.dateRange}
              onValueChange={(value) =>
                onChange({ ...filters, dateRange: value as FilterState["dateRange"] })
              }
            >
              <SelectTrigger className="bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="week">Past Week</SelectItem>
                <SelectItem value="month">Past Month</SelectItem>
                <SelectItem value="3months">Past 3 Months</SelectItem>
                <SelectItem value="year">Past Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Confidence Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Confidence Range</Label>
              <span className="text-sm text-muted-foreground">
                {filters.confidenceRange[0]}% - {filters.confidenceRange[1]}%
              </span>
            </div>
            <Slider
              value={filters.confidenceRange}
              onValueChange={(value) =>
                onChange({ ...filters, confidenceRange: value as [number, number] })
              }
              max={100}
              step={5}
              className="py-2"
            />
          </div>

          {/* Outcome Status */}
          <div className="space-y-2">
            <Label>Outcome Status</Label>
            <Select
              value={filters.outcomeStatus}
              onValueChange={(value) =>
                onChange({
                  ...filters,
                  outcomeStatus: value as FilterState["outcomeStatus"],
                })
              }
            >
              <SelectTrigger className="bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Decisions</SelectItem>
                <SelectItem value="with-outcome">With Outcome</SelectItem>
                <SelectItem value="without-outcome">Without Outcome</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) =>
                onChange({ ...filters, sortBy: value as FilterState["sortBy"] })
              }
            >
              <SelectTrigger className="bg-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="confidence-high">Confidence (High to Low)</SelectItem>
                <SelectItem value="confidence-low">Confidence (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AdvancedFilters;
