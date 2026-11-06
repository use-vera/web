import FaqSection from "@/components/vera/faq-section";
import { VENDOR_FAQS } from "@/lib/vendor-content";

const VendorFaq = () => <FaqSection lead="everything vendors" accent="ask us." items={VENDOR_FAQS} />;

export default VendorFaq;
