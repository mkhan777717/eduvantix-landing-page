"use client";

import { useState } from "react";
import JournalHeader from "@/components/journal/layout/JournalHeader";
import Footer from "@/components/Footer";
import GlobalSearchModal from "@/components/journal/search/GlobalSearchModal";

export default function JournalShell({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <JournalHeader onSearchOpen={() => setSearchOpen(true)} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      <GlobalSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
