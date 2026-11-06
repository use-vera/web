import FaqSection from "@/components/vera/faq-section";
import { ORGANIZER_FAQS } from "@/lib/organizer-content";

const OrganizerFaq = () => <FaqSection lead="everything organizers" accent="ask us." items={ORGANIZER_FAQS} />;

export default OrganizerFaq;
