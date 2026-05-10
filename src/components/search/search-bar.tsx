// =============================================================================
// SL HUB COMPUTER - Enhanced Search Bar Component
// =============================================================================
// Purpose: Advanced autocomplete search bar with voice search and filters
// Features: Debounced search input, autocomplete dropdown with product/category/brand
//           suggestions, keyboard navigation, voice search (Web Speech API),
//           recent searches (localStorage), popular searches, "Did you mean?",
//           clear button, filter toggle, Sinhala & English voice support
// Uses: useStore for navigation, fetches from /api/search?q= and mode=autocomplete
// =============================================================================

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@/store/use-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  X,
  Package,
  FolderOpen,
  Tag,
  Loader2,
  Mic,
  MicOff,
  Clock,
  TrendingUp,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import type { ProductType, CategoryType, BrandType } from "@/types";

// ---------------------------------------------------------------------------
// Search Result Item Types
// ---------------------------------------------------------------------------
interface AutocompleteProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number | null;
  images: string;
  stock: number;
  isOnSale: boolean;
  brand: { name: string } | null;
  category: { name: string } | null;
}

interface SearchSuggestion {
  products: AutocompleteProduct[];
  categories: CategoryType[];
  brands: BrandType[];
  suggestions?: string[];
}

// ---------------------------------------------------------------------------
// Voice Search Hook
// ---------------------------------------------------------------------------
function useVoiceSearch(
  onResult: (transcript: string) => void,
  lang: string = "en-US"
) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI =
      typeof window !== "undefined"
        ? (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
          (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition
        : undefined;

    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (event.results[0].isFinal) {
          onResult(transcript);
          setIsListening(false);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang, onResult]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.lang = lang;
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return { isListening, isSupported, toggleListening, startListening, stopListening };
}

// ---------------------------------------------------------------------------
// Recent Searches Helper (localStorage, max 5)
// ---------------------------------------------------------------------------
function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("slhub-recent-searches");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(query: string): void {
  if (!query.trim()) return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter((s) => s.toLowerCase() !== query.toLowerCase());
    const updated = [query, ...filtered].slice(0, 5);
    localStorage.setItem("slhub-recent-searches", JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

function removeRecentSearch(query: string): void {
  try {
    const existing = getRecentSearches();
    const updated = existing.filter((s) => s !== query);
    localStorage.setItem("slhub-recent-searches", JSON.stringify(updated));
  } catch {
    // Ignore
  }
}

function clearRecentSearches(): void {
  try {
    localStorage.removeItem("slhub-recent-searches");
  } catch {
    // Ignore
  }
}

// ---------------------------------------------------------------------------
// Popular Searches
// ---------------------------------------------------------------------------
const POPULAR_SEARCHES = [
  "GPU",
  "RAM",
  "SSD",
  "Processor",
  "Gaming PC",
  "Monitor",
  "Keyboard",
  "Motherboard",
];

// ---------------------------------------------------------------------------
// Props Interface
// ---------------------------------------------------------------------------
interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
}

// ---------------------------------------------------------------------------
// Search Bar Component
// ---------------------------------------------------------------------------
export function SearchBar({
  className = "",
  placeholder = "Search products, brands, categories...",
  onSearch,
  showFilters,
  onToggleFilters,
}: SearchBarProps) {
  const { navigateToSearch, navigateToCategory, navigateToProduct } =
    useStore();

  // ---- Local State ----
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const [voiceLang, setVoiceLang] = useState<"en-US" | "si-LK">("en-US");

  // ---- Refs ----
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Voice Search ----
  const handleVoiceResult = useCallback(
    (transcript: string) => {
      setQuery(transcript);
      setShowDropdown(false);
      setShowRecent(false);
      // Auto-search after voice input
      if (transcript.trim()) {
        addRecentSearch(transcript.trim());
        if (onSearch) {
          onSearch(transcript.trim());
        } else {
          navigateToSearch(transcript.trim());
        }
      }
    },
    [onSearch, navigateToSearch]
  );

  const { isListening, isSupported: voiceSupported, toggleListening } =
    useVoiceSearch(handleVoiceResult, voiceLang);

  // ---- Load recent searches on mount ----
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // ---- Total suggestion count for keyboard navigation ----
  const totalSuggestions =
    (suggestions?.products.length || 0) +
    (suggestions?.categories.length || 0) +
    (suggestions?.brands.length || 0);

  // ---- Debounced search for suggestions ----
  const fetchSuggestions = useCallback((searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchQuery.trim()) {
      setSuggestions(null);
      setShowDropdown(false);
      setShowRecent(true);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setLoading(true);
      fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&mode=autocomplete&limit=5`
      )
        .then((r) => r.json())
        .then((data) => {
          if (data.success) {
            setSuggestions(data.data);
            setShowDropdown(true);
            setShowRecent(false);
          }
        })
        .catch(() => setSuggestions(null))
        .finally(() => setLoading(false));
    }, 300); // 300ms debounce
  }, []);

  // ---- Handle input change ----
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    fetchSuggestions(value);
  };

  // ---- Handle form submission ----
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      addRecentSearch(query.trim());
      setShowDropdown(false);
      setShowRecent(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigateToSearch(query.trim());
      }
    }
  };

  // ---- Execute a search from suggestion/recent ----
  const executeSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    addRecentSearch(searchQuery);
    setShowDropdown(false);
    setShowRecent(false);
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigateToSearch(searchQuery);
    }
  };

  // ---- Handle keyboard navigation ----
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Count all selectable items including recent/popular when dropdown isn't showing suggestions
    const isSuggestionMode = showDropdown && suggestions && totalSuggestions > 0;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (isSuggestionMode) {
        setSelectedIndex((prev) =>
          prev < totalSuggestions - 1 ? prev + 1 : 0
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (isSuggestionMode) {
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : totalSuggestions - 1
        );
      }
    } else if (e.key === "Enter" && selectedIndex >= 0 && isSuggestionMode) {
      e.preventDefault();
      let currentIdx = 0;

      for (const product of suggestions.products) {
        if (currentIdx === selectedIndex) {
          navigateToProduct(product.id);
          setShowDropdown(false);
          setQuery("");
          return;
        }
        currentIdx++;
      }
      for (const category of suggestions.categories) {
        if (currentIdx === selectedIndex) {
          navigateToCategory(category.id, category.name);
          setShowDropdown(false);
          setQuery("");
          return;
        }
        currentIdx++;
      }
      for (const brand of suggestions.brands) {
        if (currentIdx === selectedIndex) {
          navigateToSearch(brand.name);
          setShowDropdown(false);
          setQuery("");
          return;
        }
        currentIdx++;
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setShowRecent(false);
      inputRef.current?.blur();
    }
  };

  // ---- Close dropdown on outside click ----
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
        setShowRecent(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ---- Clear search ----
  const handleClear = () => {
    setQuery("");
    setSuggestions(null);
    setShowDropdown(false);
    setShowRecent(false);
    inputRef.current?.focus();
  };

  // ---- Handle focus ----
  const handleFocus = () => {
    if (query.trim() && suggestions && totalSuggestions > 0) {
      setShowDropdown(true);
    } else if (!query.trim()) {
      setRecentSearches(getRecentSearches());
      setShowRecent(true);
    }
  };

  // ---- Render product suggestion item ----
  const renderProductItem = (product: AutocompleteProduct, idx: number) => {
    const images: string[] = (() => {
      try { return JSON.parse(product.images || "[]"); } catch { return []; }
    })();
    return (
      <button
        key={product.id}
        onClick={() => {
          navigateToProduct(product.id);
          setShowDropdown(false);
          setQuery("");
        }}
        className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors ${
          selectedIndex === idx ? "bg-blue-50 dark:bg-blue-950/30" : ""
        }`}
      >
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded shrink-0 overflow-hidden">
          {images[0] ? (
            <img
              src={images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{product.name}</p>
          <p className="text-xs text-muted-foreground">
            {product.brand?.name} • Rs. {product.price.toLocaleString()}
            {product.isOnSale && product.originalPrice && (
              <span className="ml-1.5 line-through text-red-400">
                Rs. {product.originalPrice.toLocaleString()}
              </span>
            )}
          </p>
        </div>
        {product.isOnSale && (
          <Badge variant="destructive" className="text-[9px] h-4 px-1">
            Sale
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="outline" className="text-[9px] h-4 px-1 text-red-500">
            Out
          </Badge>
        )}
      </button>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="flex w-full">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder={placeholder}
            className="pr-20 focus-visible:ring-blue-600"
            autoComplete="off"
          />
          {/* Voice indicator */}
          {isListening && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="text-[10px] text-red-500 font-medium">Listening</span>
            </div>
          )}
          {/* Clear Button */}
          {query && !isListening && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Voice Search Button */}
          {voiceSupported && (
            <button
              type="button"
              onClick={() => {
                // Toggle between English and Sinhala on shift+click
                toggleListening();
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setVoiceLang((prev) => (prev === "en-US" ? "si-LK" : "en-US"));
              }}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
                isListening
                  ? "text-red-500 bg-red-50 dark:bg-red-950/30 animate-pulse"
                  : "text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              }`}
              title={
                isListening
                  ? "Stop listening"
                  : `Voice search (${voiceLang === "en-US" ? "English" : "සිංහල"}) — Right-click to switch language`
              }
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        {onToggleFilters && (
          <Button
            type="button"
            variant="outline"
            className={`rounded-none border-x-0 ${showFilters ? "bg-blue-50 dark:bg-blue-950/30 border-blue-300" : ""}`}
            onClick={onToggleFilters}
            title="Toggle search filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>
        )}

        <Button
          type="submit"
          className="rounded-l-none bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </Button>
      </form>

      {/* ---- Waveform animation when listening ---- */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border rounded-lg shadow-xl z-50 p-4">
          <div className="flex items-center justify-center gap-1">
            <div className="flex items-end gap-0.5 h-8">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-red-500 rounded-full animate-pulse"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: `${0.4 + Math.random() * 0.4}s`,
                  }}
                />
              ))}
            </div>
            <span className="ml-3 text-sm text-muted-foreground">
              Listening in {voiceLang === "en-US" ? "English" : "සිංහල"}...
            </span>
          </div>
        </div>
      )}

      {/* ---- Recent & Popular Searches (when no query) ---- */}
      {showRecent && !isListening && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
        >
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 dark:bg-gray-800 sticky top-0 flex items-center justify-between">
                <span>
                  <Clock className="w-3 h-3 inline mr-1" /> Recent Searches
                </span>
                <button
                  onClick={() => {
                    clearRecentSearches();
                    setRecentSearches([]);
                  }}
                  className="text-[10px] text-muted-foreground hover:text-foreground font-normal"
                >
                  Clear all
                </button>
              </div>
              {recentSearches.map((search) => (
                <div
                  key={search}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer group"
                >
                  <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <button
                    onClick={() => executeSearch(search)}
                    className="flex-1 text-sm text-left truncate"
                  >
                    {search}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(search);
                      setRecentSearches(getRecentSearches());
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          <div className={recentSearches.length > 0 ? "border-t" : ""}>
            <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 dark:bg-gray-800 sticky top-0">
              <TrendingUp className="w-3 h-3 inline mr-1" /> Popular Searches
            </div>
            <div className="p-3 flex flex-wrap gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  onClick={() => executeSearch(term)}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-950/30 rounded-full transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Voice search tip */}
          {voiceSupported && (
            <div className="border-t px-3 py-2 text-[10px] text-muted-foreground flex items-center gap-1.5">
              <Mic className="w-3 h-3" />
              <span>Click the mic icon for voice search. Right-click to switch English/සිංහල.</span>
            </div>
          )}
        </div>
      )}

      {/* ---- Autocomplete Dropdown ---- */}
      {showDropdown && suggestions && totalSuggestions > 0 && !isListening && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
        >
          {/* Products Section */}
          {suggestions.products.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 dark:bg-gray-800 sticky top-0">
                <Package className="w-3 h-3 inline mr-1" /> Products
              </div>
              {suggestions.products.map((product, idx) =>
                renderProductItem(product, idx)
              )}
            </div>
          )}

          {/* Categories Section */}
          {suggestions.categories.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 dark:bg-gray-800 sticky top-0 border-t">
                <FolderOpen className="w-3 h-3 inline mr-1" /> Categories
              </div>
              {suggestions.categories.map((category, idx) => {
                const globalIdx = suggestions.products.length + idx;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      navigateToCategory(category.id, category.name);
                      setShowDropdown(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors ${
                      selectedIndex === globalIdx
                        ? "bg-blue-50 dark:bg-blue-950/30"
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center shrink-0">
                      <FolderOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{category.name}</p>
                      {category._count && (
                        <p className="text-xs text-muted-foreground">
                          {category._count.products} products
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Brands Section */}
          {suggestions.brands.length > 0 && (
            <div>
              <div className="px-3 py-2 text-xs font-semibold text-muted-foreground bg-gray-50 dark:bg-gray-800 sticky top-0 border-t">
                <Tag className="w-3 h-3 inline mr-1" /> Brands
              </div>
              {suggestions.brands.map((brand, idx) => {
                const globalIdx =
                  suggestions.products.length +
                  suggestions.categories.length +
                  idx;
                return (
                  <button
                    key={brand.id}
                    onClick={() => {
                      navigateToSearch(brand.name);
                      setShowDropdown(false);
                      setQuery("");
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors ${
                      selectedIndex === globalIdx
                        ? "bg-blue-50 dark:bg-blue-950/30"
                        : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded flex items-center justify-center shrink-0">
                      <Tag className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{brand.name}</p>
                      {brand._count && (
                        <p className="text-xs text-muted-foreground">
                          {brand._count.products} products
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* View All Results */}
          <div className="border-t p-2">
            <button
              onClick={() => {
                addRecentSearch(query);
                navigateToSearch(query);
                setShowDropdown(false);
              }}
              className="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              View all results for &ldquo;{query}&rdquo; →
            </button>
          </div>
        </div>
      )}

      {/* No Results */}
      {showDropdown && suggestions && totalSuggestions === 0 && query.trim() && !isListening && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border rounded-lg shadow-xl z-50 p-6 text-center"
        >
          <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No results found for &ldquo;{query}&rdquo;
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Try searching with different keywords
          </p>
        </div>
      )}

      {/* Voice search not supported fallback */}
      {!voiceSupported && (
        <div className="sr-only" aria-live="polite">
          Voice search is not supported in this browser. Please type your search query.
        </div>
      )}
    </div>
  );
}
