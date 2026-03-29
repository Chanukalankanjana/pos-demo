export type MenuCategory = "starters" | "mains" | "desserts" | "drinks" | "other"

export interface MenuItem {
  id: string
  name: string
  price: number
  category: MenuCategory
  image: string
  description: string
}

export const defaultMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Margherita Pizza",
    price: 1250,
    category: "mains",
    image: "/margherita-pizza.png",
    description: "Wood‑fired style pizza topped with rich tomato sauce, creamy mozzarella, and fresh basil leaves.",
  },
  {
    id: "2",
    name: "Caesar Salad",
    price: 850,
    category: "starters",
    image: "/caesar-salad.png",
    description: "Crisp lettuce tossed in creamy Caesar dressing with parmesan shavings and crunchy garlic croutons.",
  },
  {
    id: "3",
    name: "Grilled Salmon",
    price: 2850,
    category: "mains",
    image: "/grilled-salmon.png",
    description: "Tender salmon fillet grilled with herbs, served with seasonal vegetables and a squeeze of lemon.",
  },
  {
    id: "4",
    name: "Tiramisu",
    price: 750,
    category: "desserts",
    image: "/tiramisu.png",
    description: "Layers of coffee‑soaked ladyfingers and mascarpone cream, finished with a dusting of cocoa.",
  },
  {
    id: "5",
    name: "Carbonara",
    price: 1650,
    category: "mains",
    image: "/carbonara.png",
    description: "Silky pasta in a creamy egg and parmesan sauce with crispy smoked bacon.",
  },
  {
    id: "6",
    name: "Bruschetta",
    price: 650,
    category: "starters",
    image: "/bruschetta.png",
    description: "Toasted bread loaded with marinated tomatoes, garlic, basil, and extra‑virgin olive oil.",
  },
  {
    id: "7",
    name: "Cheesecake",
    price: 950,
    category: "desserts",
    image: "/cheesecake.png",
    description: "Baked vanilla cheesecake on a buttery biscuit base, served with a light berry drizzle.",
  },
  {
    id: "8",
    name: "Lemonade",
    price: 450,
    category: "drinks",
    image: "/lemonade.png",
    description: "Freshly squeezed lemons shaken with just the right amount of sweetness and ice.",
  },
  {
    id: "9",
    name: "Chicken Curry",
    price: 1850,
    category: "mains",
    image: "/chicken-curry.png",
    description: "Slow‑cooked chicken curry with Sri Lankan spices, coconut milk, and fragrant herbs.",
  },
  {
    id: "10",
    name: "Fish & Chips",
    price: 1950,
    category: "mains",
    image: "/fish-chips.png",
    description: "Golden battered fish served with crispy fries, tartar sauce, and lemon.",
  },
  {
    id: "11",
    name: "Mango Lassi",
    price: 350,
    category: "drinks",
    image: "/mango-lassi.png",
    description: "Thick and creamy yogurt drink blended with ripe mango and a hint of cardamom.",
  },
  {
    id: "12",
    name: "Chocolate Cake",
    price: 850,
    category: "desserts",
    image: "/chocolate-cake.png",
    description: "Moist chocolate sponge layered with rich fudge frosting for true chocoholics.",
  },
]

const STORAGE_KEY = "pos_menu_items"

export const loadMenuItems = (): MenuItem[] => {
  if (typeof window === "undefined") return defaultMenuItems
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultMenuItems
    const parsed = JSON.parse(stored) as Partial<MenuItem>[]
    if (!Array.isArray(parsed) || parsed.length === 0) return defaultMenuItems
    // Ensure older data without description still works and backfill from defaults
    return parsed.map((item, index) => {
      const fallback = defaultMenuItems.find(
        (d) => d.id === item.id || (item.name && d.name === item.name),
      )

      const description =
        item.description && item.description.trim().length > 0
          ? item.description
          : fallback?.description ?? ""

      return {
        id: item.id ?? fallback?.id ?? String(index + 1),
        name: item.name ?? fallback?.name ?? "",
        price: item.price ?? fallback?.price ?? 0,
        category: item.category ?? fallback?.category ?? "other",
        image: item.image ?? fallback?.image ?? "/placeholder.svg",
        description,
      }
    })
  } catch {
    return defaultMenuItems
  }
}

export const saveMenuItems = (items: MenuItem[]) => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore write errors
  }
}

