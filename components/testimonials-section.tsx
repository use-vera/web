"use client";

import { TESTIMONIALS } from "@/lib/testimonials-content";
import { motion, type Variants } from "motion/react";

const gridVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const TestimonialsSection = () => {
  return (
    <section className="dark bg-background py-20 text-foreground sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Word on the street
          </span>
          <h2 className="max-w-lg text-3xl font-bold leading-tight sm:text-4xl">
            People keep coming back for the ticket, they stay for the moment.
          </h2>
        </div>

        <motion.div
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={gridVariants}
        >
          {TESTIMONIALS.map((testimonial) => (
            <motion.figure
              key={testimonial.name}
              variants={cardVariants}
              className="flex flex-col justify-between gap-6 rounded-2xl border border-border bg-card p-6"
            >
              <span className="text-4xl font-black leading-none text-primary">
                &ldquo;
              </span>

              <blockquote className="flex-1 text-sm leading-relaxed text-card-foreground">
                {testimonial.quote}
              </blockquote>

              <figcaption className="flex flex-col">
                <span className="text-sm font-bold text-card-foreground">
                  {testimonial.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {testimonial.context}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
