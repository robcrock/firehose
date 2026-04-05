"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { FilterState, ReviewCategory } from "./types";
import { DEFAULT_FILTER_STATE } from "./types";

type FilterAction =
  | { type: "SET_TIME_RANGE"; payload: FilterState["timeRange"] }
  | { type: "TOGGLE_APP"; payload: string }
  | { type: "SET_APPS"; payload: string[] }
  | { type: "SET_OS"; payload: FilterState["os"] }
  | { type: "TOGGLE_CATEGORY"; payload: ReviewCategory }
  | { type: "SET_CATEGORIES"; payload: ReviewCategory[] }
  | { type: "SET_RATING_BUCKET"; payload: FilterState["ratingBucket"] }
  | { type: "SET_KEYWORD"; payload: string | null }
  | { type: "RESET" };

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case "SET_TIME_RANGE":
      return { ...state, timeRange: action.payload };

    case "TOGGLE_APP": {
      const apps = state.apps.includes(action.payload)
        ? state.apps.filter((a) => a !== action.payload)
        : [...state.apps, action.payload];
      return { ...state, apps };
    }

    case "SET_APPS":
      return { ...state, apps: action.payload };

    case "SET_OS":
      return { ...state, os: action.payload };

    case "TOGGLE_CATEGORY": {
      const categories = state.categories.includes(action.payload)
        ? state.categories.filter((c) => c !== action.payload)
        : [...state.categories, action.payload];
      return { ...state, categories };
    }

    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };

    case "SET_RATING_BUCKET":
      return { ...state, ratingBucket: action.payload };

    case "SET_KEYWORD":
      return { ...state, activeKeyword: action.payload };

    case "RESET":
      return DEFAULT_FILTER_STATE;

    default:
      return state;
  }
}

type FilterContextValue = {
  filter: FilterState;
  // Time range actions
  setTimeRange: (range: FilterState["timeRange"]) => void;
  // App actions
  toggleApp: (app: string) => void;
  setApps: (apps: string[]) => void;
  // OS actions
  setOS: (os: FilterState["os"]) => void;
  // Category actions
  toggleCategory: (category: ReviewCategory) => void;
  setCategories: (categories: ReviewCategory[]) => void;
  // Rating bucket actions
  setRatingBucket: (bucket: FilterState["ratingBucket"]) => void;
  // Keyword actions
  setKeyword: (keyword: string | null) => void;
  // Reset
  reset: () => void;
  // Helpers
  hasActiveFilters: boolean;
  filterSummary: string;
};

const FilterContext = createContext<FilterContextValue | null>(null);

type FilterProviderProps = {
  children: ReactNode;
  initialState?: Partial<FilterState>;
};

export function FilterProvider({ children, initialState }: FilterProviderProps) {
  const [filter, dispatch] = useReducer(filterReducer, {
    ...DEFAULT_FILTER_STATE,
    ...initialState,
  });

  const setTimeRange = useCallback((range: FilterState["timeRange"]) => {
    dispatch({ type: "SET_TIME_RANGE", payload: range });
  }, []);

  const toggleApp = useCallback((app: string) => {
    dispatch({ type: "TOGGLE_APP", payload: app });
  }, []);

  const setApps = useCallback((apps: string[]) => {
    dispatch({ type: "SET_APPS", payload: apps });
  }, []);

  const setOS = useCallback((os: FilterState["os"]) => {
    dispatch({ type: "SET_OS", payload: os });
  }, []);

  const toggleCategory = useCallback((category: ReviewCategory) => {
    dispatch({ type: "TOGGLE_CATEGORY", payload: category });
  }, []);

  const setCategories = useCallback((categories: ReviewCategory[]) => {
    dispatch({ type: "SET_CATEGORIES", payload: categories });
  }, []);

  const setRatingBucket = useCallback((bucket: FilterState["ratingBucket"]) => {
    dispatch({ type: "SET_RATING_BUCKET", payload: bucket });
  }, []);

  const setKeyword = useCallback((keyword: string | null) => {
    dispatch({ type: "SET_KEYWORD", payload: keyword });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filter.timeRange !== DEFAULT_FILTER_STATE.timeRange ||
      filter.apps.length > 0 ||
      filter.os !== DEFAULT_FILTER_STATE.os ||
      filter.categories.length > 0 ||
      filter.ratingBucket !== DEFAULT_FILTER_STATE.ratingBucket ||
      filter.activeKeyword !== null
    );
  }, [filter]);

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    
    // Apps
    if (filter.apps.length === 1) {
      parts.push(filter.apps[0]);
    } else if (filter.apps.length > 1) {
      parts.push(`${filter.apps.length} apps`);
    }
    
    // OS
    if (filter.os !== "all") {
      parts.push(filter.os.toUpperCase());
    }
    
    // Categories
    if (filter.categories.length === 1) {
      const labels: Record<ReviewCategory, string> = {
        bug: "Bugs",
        feature_request: "Features",
        clinical_concern: "Clinical",
        positive: "Positive",
        other: "Other",
      };
      parts.push(labels[filter.categories[0]]);
    } else if (filter.categories.length > 1) {
      parts.push(`${filter.categories.length} categories`);
    }
    
    // Rating bucket
    if (filter.ratingBucket !== "all") {
      parts.push(`${filter.ratingBucket} stars`);
    }
    
    // Keyword
    if (filter.activeKeyword) {
      parts.push(`"${filter.activeKeyword}"`);
    }
    
    return parts.join(" · ");
  }, [filter]);

  const value = useMemo(
    () => ({
      filter,
      setTimeRange,
      toggleApp,
      setApps,
      setOS,
      toggleCategory,
      setCategories,
      setRatingBucket,
      setKeyword,
      reset,
      hasActiveFilters,
      filterSummary,
    }),
    [
      filter,
      setTimeRange,
      toggleApp,
      setApps,
      setOS,
      toggleCategory,
      setCategories,
      setRatingBucket,
      setKeyword,
      reset,
      hasActiveFilters,
      filterSummary,
    ]
  );

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter(): FilterContextValue {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error("useFilter must be used within a FilterProvider");
  }
  return context;
}
