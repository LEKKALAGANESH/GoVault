"use client";

import { Expense, ExpenseCategory } from "@/lib/types";
import { format } from "date-fns";
import {
  Utensils,
  Car,
  Building2,
  Ticket,
  ShoppingBag,
  Heart,
  Coins,
  MoreHorizontal,
  Receipt
} from "lucide-react";

interface ExpensesSectionProps {
  expenses: Expense[];
  currency?: string;
}

const categoryConfig: Record<ExpenseCategory, { icon: React.ElementType; label: string; color: string }> = {
  FOOD: { icon: Utensils, label: "Food & Dining", color: "text-orange-400 bg-orange-500/20" },
  TRANSPORT: { icon: Car, label: "Transport", color: "text-blue-400 bg-blue-500/20" },
  ACCOMMODATION: { icon: Building2, label: "Accommodation", color: "text-purple-400 bg-purple-500/20" },
  ACTIVITY: { icon: Ticket, label: "Activities", color: "text-pink-400 bg-pink-500/20" },
  SHOPPING: { icon: ShoppingBag, label: "Shopping", color: "text-emerald-400 bg-emerald-500/20" },
  HEALTH: { icon: Heart, label: "Health", color: "text-red-400 bg-red-500/20" },
  TIPS: { icon: Coins, label: "Tips", color: "text-yellow-400 bg-yellow-500/20" },
  OTHER: { icon: MoreHorizontal, label: "Other", color: "text-slate-400 bg-slate-500/20" },
};

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ExpensesSection({ expenses, currency = "INR" }: ExpensesSectionProps) {
  if (!expenses || expenses.length === 0) {
    return null;
  }

  // Calculate totals by category
  const totalsByCategory = expenses.reduce((acc, expense) => {
    const cat = expense.category;
    acc[cat] = (acc[cat] || 0) + (expense.converted_amount || expense.amount);
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const grandTotal = expenses.reduce(
    (sum, exp) => sum + (exp.converted_amount || exp.amount),
    0
  );

  // Group expenses by date
  const expensesByDate = expenses.reduce((acc, expense) => {
    const dateKey = format(new Date(expense.date), "yyyy-MM-dd");
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(expensesByDate).sort();

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="font-playfair text-2xl md:text-3xl text-center text-white mb-8">
          <Receipt className="w-6 h-6 inline-block mr-2 text-emerald-300" />
          Trip <span className="text-emerald-300">Expenses</span>
        </h2>

        {/* Summary Cards */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 mb-8">
          <div className="text-center mb-6">
            <p className="text-white/60 text-sm mb-1">Total Spent</p>
            <p className="text-4xl font-bold text-white">
              {formatCurrency(grandTotal, currency)}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(totalsByCategory)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 4)
              .map(([category, total]) => {
                const config = categoryConfig[category as ExpenseCategory];
                const Icon = config.icon;
                return (
                  <div
                    key={category}
                    className="bg-white/5 rounded-xl p-3 text-center"
                  >
                    <div className={`w-8 h-8 rounded-full ${config.color} flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {formatCurrency(total, currency)}
                    </p>
                    <p className="text-white/50 text-xs">{config.label}</p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Expense List by Date */}
        <div className="space-y-4">
          {sortedDates.map((dateKey) => {
            const dayExpenses = expensesByDate[dateKey];
            const dayTotal = dayExpenses.reduce(
              (sum, exp) => sum + (exp.converted_amount || exp.amount),
              0
            );

            return (
              <div
                key={dateKey}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/10">
                  <span className="text-white font-medium">
                    {format(new Date(dateKey), "EEE, MMM d")}
                  </span>
                  <span className="text-white/70 text-sm">
                    {formatCurrency(dayTotal, currency)}
                  </span>
                </div>
                <div className="divide-y divide-white/10">
                  {dayExpenses.map((expense) => {
                    const config = categoryConfig[expense.category];
                    const Icon = config.icon;
                    return (
                      <div
                        key={expense.id}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {expense.description || config.label}
                          </p>
                          <p className="text-white/50 text-xs">{config.label}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white font-semibold">
                            {formatCurrency(expense.converted_amount || expense.amount, currency)}
                          </p>
                          {expense.currency !== currency && (
                            <p className="text-white/40 text-xs">
                              {formatCurrency(expense.amount, expense.currency)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
