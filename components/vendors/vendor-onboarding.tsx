"use client";

import AuthField from "@/components/auth/auth-field";
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
  <ol className="flex flex-wrap items-center gap-3">
    {STEPS.map((label, index) => {
      const done = index < current;
      const active = index === current;

      return (
        <li
          key={label}
          className="flex items-center gap-2"
          aria-current={active ? "step" : undefined}
        >
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
              done || active
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground",
            )}
          >
            {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
          </span>
          <span
            className={cn(
              "text-sm font-semibold",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {label}
          </span>
          {index < STEPS.length - 1 ? (
            <span className="ml-1 h-px w-8 bg-border" />
          ) : null}
        </li>
      );
    })}
  </ol>
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
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <Stepper current={activeStep} />

      {activeStep === 0 ? (
        <form
          onSubmit={handleCreateVendor}
          className="mt-10 flex flex-col gap-7 max-w-2xl"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.01em] text-foreground">
              Tell us about your business
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Organizers see this when they look for vendors.
            </p>
          </div>

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
              className="text-sm font-semibold text-foreground"
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
            <p className="text-xs text-muted-foreground">
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
            loading={createVendor.isPending}
            className="w-fit"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
      ) : null}

      {activeStep === 1 ? (
        <div className="mt-10 flex flex-col gap-7 max-w-3xl">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.01em] text-foreground">
              Add what you sell
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground">
              One item is enough to finish. You can build the rest of your menu
              later.
            </p>
          </div>

          {items.length > 0 ? (
            <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
              {items.map((item) => (
                <li key={item._id} className="flex items-center gap-4 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
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
                    <span className="block truncate text-sm font-semibold text-card-foreground">
                      {item.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {item.categoryLabel}
                    </span>
                  </span>
                  <span className="text-sm font-bold tabular-nums text-card-foreground">
                    {formatNairaAmount(item.priceNaira)}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {addingItem ? (
            <div className="rounded-2xl border border-border bg-card p-6">
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
              variant="outline"
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
        <div className="mt-10 flex flex-col gap-7 max-w-2xl">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.01em] text-foreground">
              Where should we pay you?
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Use an account in your name or your business&apos;s name.
            </p>
          </div>

          <VendorPayoutStep />

          <div className="flex items-center gap-3">
            <Button size="lg" onClick={() => router.push(ROUTES.VENDOR_MENU)}>
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
