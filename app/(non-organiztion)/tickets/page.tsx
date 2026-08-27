import { redirect } from "next/navigation";

/** Tickets now live in the account area, alongside payments and premium. */
const TicketsPage = () => {
  redirect("/account/tickets");
};

export default TicketsPage;
