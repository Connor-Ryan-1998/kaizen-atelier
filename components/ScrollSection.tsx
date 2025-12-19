"use client";
import { motion } from "framer-motion";

const SectionWrapper = ({ children, title, subtitle }: any) => (
  <motion.section
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    className="py-24 px-6 max-w-5xl mx-auto"
  >
    <div className="mb-12">
      <h2 className="text-indigo-400 text-sm font-semibold tracking-widest uppercase mb-2">{title}</h2>
      <p className="text-3xl md:text-4xl font-medium text-white tracking-tight">{subtitle}</p>
    </div>
    {children}
  </motion.section>
);

export const ContentSections = () => {
  return (
    <>
      {/* Section 1: Approachability/Mission */}
      <SectionWrapper title="Our Philosophy" subtitle="Your work is like no other!">
        <div className="grid md:grid-cols-2 gap-8 text-gray-400 leading-relaxed">
          <p>
            At Kaizen Atelier, we believe technology shouldn't feel like a burden but rather an accelerator.
            Too many businesses are stuck between legacy 20 year old systems or the choice of overpriced "ERP solutions"
            What if I told you this isn't a binary.
          </p>
          <p>
            We come in to review and really understand your processes
            Then work with you to build a way forward.
            We understand that no one business functions like another, which is why work with you to perscribe processes for YOUR business.
            You shouldn't have to choose between a huge cost centre or brittle systems. Lets worth together and change it
          </p>
        </div>
      </SectionWrapper>

      {/* Section 2: Interactive Process Steps */}
      <SectionWrapper title="The Process" subtitle="">
        <div className="space-y-4">
          {[
            { step: "01", name: "Audit & Analysis", text: "We deep-dive into your current stack to find the friction." },
            { step: "02", name: "Strategic Blueprint", text: "Designing a roadmap that aligns IT with your business goals." },
            { step: "03", name: "Iterative Deployment", text: "Seamless integration with zero downtime and total clarity." }
          ].map((item, idx) => (
            <div key={idx} className="group p-6 rounded-2xl bg-[#1A1D23] border border-white/5 hover:border-indigo-500/30 transition-all flex gap-6 items-start">
              <span className="text-indigo-500 font-mono text-lg">{item.step}</span>
              <div>
                <h4 className="text-white font-semibold text-lg">{item.name}</h4>
                <p className="text-gray-500 text-sm mt-1">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
      {/* Section 3: Services*/}
      <SectionWrapper title="Services" subtitle="Our key areas">
        <div className="space-y-4">
          {[
            { step: "01", name: "Audit & Analysis", text: "We deep-dive into your current stack to find the friction." },
            { step: "02", name: "Strategic Blueprint", text: "Designing a roadmap that aligns IT with your business goals." },
            { step: "03", name: "Iterative Deployment", text: "Seamless integration with zero downtime and total clarity." }
          ].map((item, idx) => (
            <div key={idx} className="group p-6 rounded-2xl bg-[#1A1D23] border border-white/5 hover:border-indigo-500/30 transition-all flex gap-6 items-start">
              <span className="text-indigo-500 font-mono text-lg">{item.step}</span>
              <div>
                <h4 className="text-white font-semibold text-lg">{item.name}</h4>
                <p className="text-gray-500 text-sm mt-1">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>
    </>
  );
};
