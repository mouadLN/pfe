"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ChevronRight, User, LayoutGrid, Puzzle, ClipboardList } from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Your Info",    subtitle: "Step 1", icon: User },
  { id: 2, label: "Select Plan", subtitle: "Step 2", icon: LayoutGrid },
  { id: 3, label: "Add-Ons",     subtitle: "Step 3", icon: Puzzle },
  { id: 4, label: "Summary",     subtitle: "Step 4", icon: ClipboardList },
];

const PLANS = [
  { id: "starter",    name: "Starter",    monthlyPrice: 9,   yearlyPrice: 90,   description: "Up to 5 users, basic analytics" },
  { id: "pro",        name: "Pro",        monthlyPrice: 29,  yearlyPrice: 290,  description: "Up to 50 users, full analytics" },
  { id: "enterprise", name: "Enterprise", monthlyPrice: 99,  yearlyPrice: 990,  description: "Unlimited users, priority support" },
];

const ADDONS = [
  { id: "analytics",  name: "Advanced Analytics", description: "Deep-dive dashboards & reports",  monthlyPrice: 5,  yearlyPrice: 50  },
  { id: "api",        name: "API Access",          description: "Full REST & GraphQL API access",  monthlyPrice: 10, yearlyPrice: 100 },
  { id: "whitelabel", name: "White Label",         description: "Remove branding, use your own",  monthlyPrice: 20, yearlyPrice: 200 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price, billing) {
  return billing === "monthly" ? `$${price}/mo` : `$${price}/yr`;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function StepSidebar({ current }) {
  return (
    <aside className="flex flex-col gap-2 w-60 shrink-0 rounded-2xl p-8 bg-foreground text-background">
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase opacity-50 mb-1">Onboarding</p>
        <h2 className="text-xl font-bold tracking-tight">Get Started</h2>
      </div>

      <nav className="flex flex-col gap-4">
        {STEPS.map(({ id, label, subtitle, icon: Icon }) => {
          const done   = id < current;
          const active = id === current;
          return (
            <div key={id} className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                active  && "border-background bg-background text-foreground scale-110",
                done    && "border-background/60 bg-background/20 text-background",
                !active && !done && "border-background/30 text-background/40",
              )}>
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <div>
                <p className={cn(
                  "text-[10px] font-semibold tracking-widest uppercase",
                  active ? "opacity-60" : "opacity-30",
                )}>{subtitle}</p>
                <p className={cn(
                  "text-sm font-semibold tracking-tight leading-none mt-0.5",
                  active ? "opacity-100" : "opacity-40",
                )}>{label}</p>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Decorative */}
      <div className="mt-auto pt-8 opacity-10">
        <div className="h-px bg-background mb-4" />
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-background/50" />
          <div className="w-14 h-8 rounded-full bg-background/30" />
          <div className="w-5 h-8 rounded-full bg-background/20" />
        </div>
      </div>
    </aside>
  );
}

// ─── Step 1: Personal Info ────────────────────────────────────────────────────

function StepPersonalInfo({ data, onChange }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Personal info</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Please provide your name, email address, and phone number.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="e.g. Stephen King"
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g. stephenking@lorem.com"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="e.g. +1 234 567 890"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Select Plan ──────────────────────────────────────────────────────

function StepSelectPlan({ data, onChange }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Select your plan</h1>
        <p className="text-sm text-muted-foreground mt-1">
          You have the option of monthly or yearly billing.
        </p>
      </div>

      <RadioGroup
        value={data.plan}
        onValueChange={(v) => onChange({ plan: v })}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {PLANS.map((plan) => (
          <Label
            key={plan.id}
            htmlFor={`plan-${plan.id}`}
            className={cn(
              "flex flex-col gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
              data.plan === plan.id
                ? "border-foreground bg-muted"
                : "border-border hover:border-foreground/40",
            )}
          >
            <RadioGroupItem id={`plan-${plan.id}`} value={plan.id} className="sr-only" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-sm">{plan.name}</span>
              {data.plan === plan.id && (
                <div className="w-4 h-4 rounded-full bg-foreground flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-background" />
                </div>
              )}
            </div>
            <div>
              <p className="text-base font-bold text-foreground">
                {formatPrice(data.billing === "monthly" ? plan.monthlyPrice : plan.yearlyPrice, data.billing)}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
              {data.billing === "yearly" && (
                <Badge variant="secondary" className="mt-2 text-[10px]">2 months free</Badge>
              )}
            </div>
          </Label>
        ))}
      </RadioGroup>

      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-4 rounded-xl bg-muted p-3">
        <span className={cn("text-sm font-medium", data.billing === "monthly" ? "text-foreground" : "text-muted-foreground")}>
          Monthly
        </span>
        <Switch
          checked={data.billing === "yearly"}
          onCheckedChange={(v) => onChange({ billing: v ? "yearly" : "monthly" })}
        />
        <span className={cn("text-sm font-medium", data.billing === "yearly" ? "text-foreground" : "text-muted-foreground")}>
          Yearly
        </span>
      </div>
    </div>
  );
}

// ─── Step 3: Add-Ons ──────────────────────────────────────────────────────────

function StepAddOns({ data, onChange }) {
  const toggle = (id) => {
    const next = data.addons.includes(id)
      ? data.addons.filter((a) => a !== id)
      : [...data.addons, id];
    onChange({ addons: next });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pick add-ons</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add-ons help enhance your experience.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {ADDONS.map((addon) => {
          const checked = data.addons.includes(addon.id);
          return (
            <label
              key={addon.id}
              htmlFor={`addon-${addon.id}`}
              className={cn(
                "flex items-center gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                checked
                  ? "border-foreground bg-muted"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <Checkbox
                id={`addon-${addon.id}`}
                checked={checked}
                onCheckedChange={() => toggle(addon.id)}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{addon.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>
              </div>
              <span className="text-sm font-semibold text-foreground shrink-0">
                +{formatPrice(data.billing === "monthly" ? addon.monthlyPrice : addon.yearlyPrice, data.billing)}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 4: Summary ──────────────────────────────────────────────────────────

function StepSummary({ data, onEdit }) {
  const selectedPlan   = PLANS.find((p) => p.id === data.plan);
  const selectedAddons = ADDONS.filter((a) => data.addons.includes(a.id));

  const planPrice   = data.billing === "monthly" ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
  const addonsTotal = selectedAddons.reduce(
    (sum, a) => sum + (data.billing === "monthly" ? a.monthlyPrice : a.yearlyPrice),
    0,
  );
  const total = planPrice + addonsTotal;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Review your order</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Please verify everything looks good before confirming.
        </p>
      </div>

      <div className="rounded-xl bg-muted p-4 flex flex-col gap-3">
        {/* Plan row */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {selectedPlan.name}{" "}
              <span className="font-normal text-muted-foreground capitalize">({data.billing})</span>
            </p>
            <button
              type="button"
              onClick={() => onEdit(2)}
              className="text-xs text-foreground underline underline-offset-2 hover:opacity-60 transition-opacity mt-0.5"
            >
              Change
            </button>
          </div>
          <span className="text-sm font-bold text-foreground">
            {formatPrice(planPrice, data.billing)}
          </span>
        </div>

        {selectedAddons.length > 0 && (
          <>
            <Separator />
            {selectedAddons.map((addon) => (
              <div key={addon.id} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{addon.name}</span>
                <span className="text-sm text-foreground">
                  +{formatPrice(data.billing === "monthly" ? addon.monthlyPrice : addon.yearlyPrice, data.billing)}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-muted-foreground">
          Total ({data.billing === "monthly" ? "per month" : "per year"})
        </span>
        <span className="text-lg font-bold text-foreground">
          {formatPrice(total, data.billing)}
        </span>
      </div>

      {/* Account details */}
      <div className="rounded-xl border border-border p-4 flex flex-col gap-2 text-sm">
        <p className="font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-1">
          Account details
        </p>
        <p className="text-foreground">{data.name || "—"}</p>
        <p className="text-muted-foreground">{data.email || "—"}</p>
        <p className="text-muted-foreground">{data.phone || "—"}</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    plan: "pro",
    billing: "monthly",
    addons: [],
  });

  const patch = (p) => setFormData((prev) => ({ ...prev, ...p }));

  const handleNext = () => {
    if (step < 4) setStep((s) => s + 1);
    else setSubmitted(true);
  };

  const handleBack = () => setStep((s) => Math.max(1, s - 1));

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center">
            <Check className="w-8 h-8 text-background" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Thank you!</h2>
          <p className="text-sm text-muted-foreground">
            Your subscription is confirmed. We&apos;ll send details to{" "}
            <span className="text-foreground font-medium">{formData.email}</span>.
          </p>
          <Button variant="outline" onClick={() => { setStep(1); setSubmitted(false); }}>
            Start over
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-3xl">
        <div className="flex flex-col sm:flex-row rounded-2xl border border-border bg-card shadow-xl overflow-hidden">

          <StepSidebar current={step} />

          <div className="flex-1 flex flex-col justify-between p-8 min-h-[480px]">
            <div className="flex-1">
              {step === 1 && <StepPersonalInfo data={formData} onChange={patch} />}
              {step === 2 && <StepSelectPlan   data={formData} onChange={patch} />}
              {step === 3 && <StepAddOns       data={formData} onChange={patch} />}
              {step === 4 && <StepSummary      data={formData} onEdit={setStep} />}
            </div>

            <div className={cn(
              "flex mt-8 pt-6 border-t border-border",
              step === 1 ? "justify-end" : "justify-between",
            )}>
              {step > 1 && (
                <Button variant="ghost" onClick={handleBack} className="text-muted-foreground">
                  Go back
                </Button>
              )}
              <Button onClick={handleNext} className="gap-2">
                {step === 4 ? "Confirm" : "Next Step"}
                {step < 4 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}