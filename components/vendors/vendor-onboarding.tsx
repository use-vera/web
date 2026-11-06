"use client";

import AuthField from "@/components/auth/auth-field";
import { DESK, NO_SCROLLBAR } from "@/components/organizer/organizer-primitives";
import Button from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/select";
import VendorImageInput from "@/components/vendors/vendor-image-input";
import VendorItemForm from "@/components/vendors/vendor-item-form";
import VendorPayoutStep from "@/components/vendors/vendor-payout-step";
import { formatNairaAmount } from "@/lib/format-currency";
import {
  useCreateVendor,
  useCreateVendorItem,
  useMyVendor,
  useMyVendorMenu,
  useVendorCategories,
} from "@/lib/hooks/use-vendor";
import { type VendorCategoryKey } from "@/lib/types/vendor";
import { cn, ROUTES } from "@/lib/utils";
import { ArrowRight, Check, Plus, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const STEPS = ["Your business", "What you sell", "Get paid"];

const Stepper = ({ current }: { current: number }) => (
  <ol className={cn("flex gap-2 overflow-x-auto pt-[clamp(20px,3vw,40px)]", NO_SCROLLBAR)}>
    {STEPS.map((label, index) => {
      const done = index < current;
      const active = index === current;

      return (
        <li
          key={label}
          aria-current={active ? "step" : undefined}
          className={cn(
            "flex h-10 shrink-0 items-center gap-2 rounded-full border-[1.5px] pr-4 pl-1.5 text-sm font-semibold whitespace-nowrap",
            active ? "border-foreground bg-foreground text-background" : done ? "border-border text-foreground" : "border-border text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold tabular-nums",
              done ? "bg-primary text-primary-foreground" : active ? "bg-background text-foreground" : "bg-secondary",
            )}
          >
            {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
          </span>
          {label}
        </li>
      );
    })}
  </ol>
);

const StepHeading = ({ lead, accent, description }: { lead: string; accent: string; description: string }) => (
  <div className="flex flex-col gap-2.5">
    <h1 style={{ lineHeight: 0.95 }} className="text-[clamp(34px,4.4vw,56px)] font-extrabold tracking-[-0.045em]">
      {lead} <span className="text-primary">{accent}</span>
    </h1>
    <p className="max-w-xl text-[15px] text-muted-foreground">{description}</p>
  </div>
);

/**
 * Vendor sign-up: business, menu, bank account.
 *
 * Step 1 creates the vendor, so a drop-off after it still leaves an account to
 * come back to. Steps 2 and 3 write to that account as they go.
 */
const VendorOnboarding = () => {
  const router = useRouter();
  const vendorQuery = useMyVendor();
  const vendor = vendorQuery.data ?? null;

  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [categories, setCategories] = useState<VendorCategoryKey[]>([]);
  const [addingItem, setAddingItem] = useState(true);

  const categoriesQuery = useVendorCategories();
  const createVendor = useCreateVendor();
  const createItem = useCreateVendorItem();
  const menuQuery = useMyVendorMenu(Boolean(vendor));

  /* Someone who already finished step 1 lands back on the step they left. */
  const activeStep = vendor && step === 0 ? 1 : step;

  const setUpAlready =
    menuQuery.isSuccess &&
    Boolean(vendor?.payoutReady) &&
    (menuQuery.data?.itemCount ?? 0) > 0;

  useEffect(() => {
    /* Coming back to a finished setup is a trip to the menu, not a second
       walk through sign-up. */
    if (setUpAlready) {
      router.replace(ROUTES.VENDOR_MENU);
    }
  }, [setUpAlready, router]);

  const handleCreateVendor = async (event: React.FormEvent) => {
    event.preventDefault();

    if (categories.length === 0) {
      toast.error("Pick at least one thing you sell.");
      return;
    }

    try {
      await createVendor.mutateAsync({
        businessName: businessName.trim(),
        categories,
        logoUrl,
        city: city.trim(),
        contactPhone: contactPhone.trim(),
      });
      setStep(1);
    } catch {
      toast.error("Couldn't create your vendor account. Try again.");
    }
  };

  const items = (menuQuery.data?.sections ?? []).flatMap(
    (section) => section.items,
  );

  return (
    <div className={cn(DESK, "pb-16")}>
      <Stepper current={activeStep} />

      {activeStep === 0 ? (
        <form
          onSubmit={handleCreateVendor}
          className="mt-8 flex max-w-2xl flex-col gap-7"
        >
          <StepHeading lead="tell us about your" accent="business." description="Organizers see this when they look for vendors." />

          <VendorImageInput
            value={logoUrl}
            onChange={setLogoUrl}
            label="Logo or stall photo"
            shape="circle"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AuthField
              label="Business name"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="Mama Put Express"
              required
              minLength={2}
            />
            <AuthField
              label="City"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Lagos"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="vendor-categories"
              className="text-sm font-bold text-foreground"
            >
              What do you sell?
            </label>
            <MultiSelect
              id="vendor-categories"
              value={categories}
              onValueChange={(next) =>
                setCategories(next as VendorCategoryKey[])
              }
              options={(categoriesQuery.data ?? []).map((option) => ({
                value: option.key,
                label: option.label,
              }))}
              placeholder="Pick everything that applies"
            />
            <p className="text-[13px] text-muted-foreground">
              This is how attendees filter, and how organizers find you.
            </p>
          </div>

          <AuthField
            label="Phone for organizers"
            value={contactPhone}
            onChange={(event) => setContactPhone(event.target.value)}
            placeholder="Eg. +234 803 555 4412"
            inputMode="tel"
          />

          <Button
            type="submit"
            size="lg"
            variant="ink"
            loading={createVendor.isPending}
            className="w-fit"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      ) : null}

      {activeStep === 1 ? (
        <div className="mt-8 flex max-w-3xl flex-col gap-7">
          <StepHeading lead="add what you" accent="sell." description="One item is enough to finish. You can build the rest of your menu later." />

          {items.length > 0 ? (
            <ul className="divide-y-[1.5px] divide-border overflow-hidden rounded-[28px] border-[1.5px] border-border">
              {items.map((item) => (
                <li key={item._id} className="flex items-center gap-4 p-3 pr-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-secondary">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Store className="h-4 w-4 text-muted-foreground" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-bold">
                      {item.name}
                    </span>
                    <span className="block text-[13px] text-muted-foreground">
                      {item.categoryLabel}
                    </span>
                  </span>
                  <span className="text-[15px] font-extrabold tabular-nums">
                    {formatNairaAmount(item.priceNaira)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {addingItem ? (
            <div className="rounded-[28px] border-[1.5px] border-border p-5 sm:p-6">
              <VendorItemForm
                sections={vendor?.sections ?? []}
                pending={createItem.isPending}
                submitLabel="Add item"
                onCancel={
                  items.length > 0 ? () => setAddingItem(false) : undefined
                }
                onSubmit={async (payload) => {
                  try {
                    await createItem.mutateAsync(payload);
                    toast.success("Item added");
                    setAddingItem(false);
                  } catch {
                    toast.error("Couldn't add that item. Check the fields.");
                  }
                }}
              />
            </div>
          ) : (
            <Button
              variant="line"
              className="w-fit"
              onClick={() => setAddingItem(true)}
            >
              <Plus className="h-4 w-4" />
              Add another item
            </Button>
          )}

          <div className="flex items-center gap-3">
            <Button
              size="lg"
              variant="ink"
              disabled={items.length === 0}
              onClick={() => setStep(2)}
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
            {items.length === 0 ? (
              <span className="text-sm text-muted-foreground">
                Add one item to continue
              </span>
            ) : null}
          </div>
        </div>
      ) : null}

      {activeStep === 2 ? (
        <div className="mt-8 flex max-w-2xl flex-col gap-7">
          <StepHeading lead="where should we" accent="pay you?" description="Use an account in your name or your business's name." />

          <VendorPayoutStep />

          <div className="flex items-center gap-3">
            <Button size="lg" variant="ink" onClick={() => router.push(ROUTES.VENDOR_MENU)}>
              Finish setup
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Link
              href={ROUTES.VENDOR_MENU}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground"
            >
              I&apos;ll add my bank details later
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default VendorOnboarding;
