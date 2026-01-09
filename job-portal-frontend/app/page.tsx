"use client"

import Careerguide from "@/components/carrerguide";
import Hero from "@/components/hero";
import ResumeAnalyzer from "@/components/resume-analyser";
import { useAppData } from "@/context/AppContext";
import Loading from "@/components/loading";
export default function Home() {
  const {loading}=useAppData();
  if(loading) return <Loading/>
  return (
   <>
    <Hero/>
    <Careerguide/>
    <ResumeAnalyzer/>
   </>
  );
}
