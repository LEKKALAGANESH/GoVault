import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Receipt,
  UtensilsCrossed,
  Car,
  Hotel,
  Ticket,
  ShoppingBag,
  Heart,
  HandCoins,
  MoreHorizontal,
  TrendingUp,
} from "lucide-react";
import type { Trip, Expense, ExpenseCategory } from "@/lib/types";

interface PageProps {
  params: Promise<{ tripId: string }>;
}

export default async function ExpensesPage({ params }: PageProps) {
  const { tripId } = await params;
  const supabase = await createClient();

  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (error || !trip) {
    notFound();
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", tripId)
    .order("date", { ascending: false });

  const typedTrip = trip as Trip;
  const typedExpenses = (expenses as Expense[]) || [];

  // Calculate totals
  const totalSpent = typedExpenses.reduce((sum, exp) => sum + (exp.converted_amount || exp.amount), 0);

  // Group by category
  const byCategory = typedExpenses.reduce((acc, exp) => {
    const cat = exp.category;
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += exp.converted_amount || exp.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  // Group by date
  const byDate = typedExpenses.reduce((acc, exp) => {
    const dateKey = format(new Date(exp.date), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(exp);
    return acc;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/trips/${tripId}`}
          className="inline-flex items-center text-muted-foreground hover:text-navy mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to {typedTrip.name}
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-navy">Expense Tracker</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your trip spending
            </p>
          </div>
          <Link href={`/trips/${tripId}/expenses/new`}>
            <Button className="bg-teal hover:bg-teal-dark text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy">Spending Overview</h2>
          <Link href={`/trips/${tripId}/expenses/summary`}>
            <Button variant="ghost" size="sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              View Full Report
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold text-navy">
              {typedTrip.home_currency === "INR" ? "₹" : "$"}
              {totalSpent.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Transactions</p>
            <p className="text-2xl font-bold text-navy">{typedExpenses.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Top Category</p>
            <p className="text-2xl font-bold text-navy">
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg/Day</p>
            <p className="text-2xl font-bold text-navy">
              {sortedDates.length > 0
                ? `${typedTrip.home_currency === "INR" ? "₹" : "$"}${Math.round(
                    totalSpent / sortedDates.length
                  ).toLocaleString()}`
                : "-"}
            </p>
          </div>
        </div>

        {/* Category Pills */}
        {Object.keys(byCategory).length > 0 && (
          <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
            {Object.entries(byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => (
                <div
                  key={category}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sand rounded-full text-sm"
                >
                  <CategoryIcon category={category as ExpenseCategory} />
                  <span className="text-navy font-medium">
                    {typedTrip.home_currency === "INR" ? "₹" : "$"}
                    {amount.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Expenses by Date */}
      {sortedDates.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dateExpenses = byDate[dateKey];
            const dateTotal = dateExpenses.reduce(
              (sum, exp) => sum + (exp.converted_amount || exp.amount),
              0
            );

            return (
              <div key={dateKey}>
                {/* Date Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-navy">
                    {format(new Date(dateKey), "EEEE, MMMM d")}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    {typedTrip.home_currency === "INR" ? "₹" : "$"}
                    {dateTotal.toLocaleString()}
                  </span>
                </div>

                {/* Expense Cards */}
                <div className="space-y-2">
                  {dateExpenses.map((expense) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      tripId={tripId}
                      currency={typedTrip.home_currency}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState tripId={tripId} />
      )}
    </div>
  );
}

function ExpenseCard({
  expense,
  tripId,
  currency,
}: {
  expense: Expense;
  tripId: string;
  currency: string;
}) {
  return (
    <Link href={`/trips/${tripId}/expenses/${expense.id}`}>
      <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-sand flex items-center justify-center text-navy">
          <CategoryIcon category={expense.category} />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-navy truncate">
            {expense.description || expense.category}
          </p>
          <p className="text-sm text-muted-foreground">
            {expense.category.charAt(0) + expense.category.slice(1).toLowerCase()}
          </p>
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className="font-semibold text-navy">
            {expense.currency !== currency && expense.converted_amount ? (
              <>
                {currency === "INR" ? "₹" : "$"}
                {expense.converted_amount.toLocaleString()}
              </>
            ) : (
              <>
                {expense.currency === "INR" ? "₹" : expense.currency}{" "}
                {expense.amount.toLocaleString()}
              </>
            )}
          </p>
          {expense.currency !== currency && (
            <p className="text-xs text-muted-foreground">
              {expense.currency} {expense.amount.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function CategoryIcon({ category }: { category: ExpenseCategory }) {
  const icons: Record<ExpenseCategory, React.ReactNode> = {
    FOOD: <UtensilsCrossed className="w-4 h-4" />,
    TRANSPORT: <Car className="w-4 h-4" />,
    ACCOMMODATION: <Hotel className="w-4 h-4" />,
    ACTIVITY: <Ticket className="w-4 h-4" />,
    SHOPPING: <ShoppingBag className="w-4 h-4" />,
    HEALTH: <Heart className="w-4 h-4" />,
    TIPS: <HandCoins className="w-4 h-4" />,
    OTHER: <MoreHorizontal className="w-4 h-4" />,
  };

  return icons[category] || <Receipt className="w-4 h-4" />;
}

function EmptyState({ tripId }: { tripId: string }) {
  return (
    <div className="text-center py-12 bg-white rounded-2xl">
      <Receipt className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold text-navy mb-2">No Expenses Logged</h3>
      <p className="text-muted-foreground mb-4 max-w-md mx-auto">
        Start tracking your spending — add meals, activities, transport, and more.
      </p>
      <Link href={`/trips/${tripId}/expenses/new`}>
        <Button className="bg-teal hover:bg-teal-dark text-white">
          <Plus className="w-4 h-4 mr-2" />
          Log Your First Expense
        </Button>
      </Link>
    </div>
  );
}
