import { plans } from "@/constants/plans";
import { LuCheck } from "react-icons/lu";

export default function PricingPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6">
      {/* Header */}
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Upgrade Your Credits
        </h1>
        <p className="mt-3 text-muted">
          Choose the perfect plan for your needs.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${plan.popular ? "border-blue-500 bg-linear-to-b from-blue-500/10 to-purple-500/10 shadow-lg" : "border-border bg-card"}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white">
                Most Popular
              </div>
            )}
            <h2 className="text-2xl font-bold">{plan.name}</h2>
            <p className="mt-2 text-sm text-muted">{plan.description}</p>

            <div className="mt-6">
              <span className="text-5xl font-bold">{plan.price}</span>
              <span className="text-muted ml-1">/{plan.credits} Credits</span>
            </div>
            <ul className="space-y-4 mt-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <LuCheck className="h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`mt-8 w-full rounded-xl py-3 font-medium transition-colors cursor-pointer ${plan.popular ? "bg-linear-to-r from-blue-600 to-purple-600 text-white hover:opacity-90" : "border border-border hover:bg-muted"}`}
            >
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
