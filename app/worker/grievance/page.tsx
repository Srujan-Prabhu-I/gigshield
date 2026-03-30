"use client"

import { useState } from "react"
import { jsPDF } from "jspdf"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Download, Scale, AlertTriangle, Mic } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

const PLATFORMS = ["Swiggy", "Zomato", "Ola", "Uber", "Rapido", "Urban Company"]

const ISSUE_TYPES = [
  "Underpayment",
  "Unfair Deactivation",
  "No Accident Insurance",
  "Arbitrary Penalty",
  "Other"
]

type SpeechRecognitionResultEvent = {
  results: Array<Array<{ transcript: string }>>
}

type SpeechRecognitionErrorEvent = {
  error?: string
}

export default function GrievancePage() {
  const [platform, setPlatform] = useState("")
  const [city, setCity] = useState("")
  const [issueType, setIssueType] = useState("")
  const [description, setDescription] = useState("")
  const [userName, setUserName] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  
  const { language } = useLanguage()

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [isListening, setIsListening] = useState(false)

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error("Voice input is not supported in your browser.")
      return
    }

    const SpeechRecognition = (
      window as unknown as {
        webkitSpeechRecognition: new () => {
          lang: string
          continuous: boolean
          interimResults: boolean
          onstart: (() => void) | null
          onresult: ((event: SpeechRecognitionResultEvent) => void) | null
          onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
          onend: (() => void) | null
          start: () => void
        }
      }
    ).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    const langMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      te: "te-IN"
    }
    
    recognition.lang = langMap[language] || "en-IN"
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      toast.success("Listening... Speak your grievance now.", { duration: 4000 })
    }

    recognition.onresult = (event: SpeechRecognitionResultEvent) => {
      const transcript = event.results[0][0].transcript
      setDescription((prev) => prev ? `${prev} ${transcript}` : transcript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech') {
        toast.error("Failed to capture voice. Please try again.")
      }
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!platform || !city || !issueType) {
      toast.error("Please fill all required selections.")
      return
    }
    
    if (description.length < 50) {
      toast.error("Description must be at least 50 characters.")
      return
    }

    setIsGenerating(true)
    setGeneratedLetter("")

    try {
      const res = await fetch("/api/petition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          city,
          issue_type: issueType,
          description,
          language,
          userName,
          address,
          phone,
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate letter")
      }

      setGeneratedLetter(data.letter)
      toast.success("Complaint letter generated successfully!")
      
      // Auto download as requested
      handleDownloadPDF(data.letter)
      
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to generate letter"
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = (letterText: string = generatedLetter) => {
    if (!letterText) return

    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("FORMAL COMPLAINT — TELANGANA GIG WORKERS ACT 2025", 14, 20)
    
    // Line separator
    doc.setLineWidth(0.5)
    doc.line(14, 25, 196, 25)

    // Body text formatting
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    // Word wrap the text for PDF margins
    const splitText = doc.splitTextToSize(letterText, 180)
    doc.text(splitText, 14, 35)

    doc.save("GigShield_Complaint.pdf")
  }

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-4 md:p-8 font-sans pb-24 md:pb-8 selection:bg-red-500/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">File a Grievance</h1>
          <p className="text-neutral-400 font-medium">
            Your complaint will be formatted into an official letter to the Telangana Labour Commissioner
          </p>
        </div>

        {/* FORM */}
        {/* FORM */}
        {!generatedLetter ? (
          <Card className="bg-[#1c1b1b] border-neutral-800 shadow-xl shadow-black/50 overflow-hidden rounded-[28px]">
            <CardHeader className="bg-[#131313] border-b border-neutral-800/50 p-6 md:p-8">
              <CardTitle className="text-white text-xl">Incident Details</CardTitle>
              <CardDescription className="text-neutral-400 font-medium">
                Provide specifics so the AI can draft a strong legal argument.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-300 uppercase tracking-wide">Full Name</label>
                    <input
                      type="text"
                      required
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Srujan Prabhu"
                      className="flex h-12 w-full rounded-xl border border-neutral-800 bg-[#0e0e0e] px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#3ce36a]/30 placeholder:text-neutral-600 transition-shadow"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-300 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="flex h-12 w-full rounded-xl border border-neutral-800 bg-[#0e0e0e] px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#3ce36a]/30 placeholder:text-neutral-600 transition-shadow"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-300 uppercase tracking-wide">Address (optional)</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Jubilee Hills, Hyderabad"
                    className="flex h-12 w-full rounded-xl border border-neutral-800 bg-[#0e0e0e] px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#3ce36a]/30 placeholder:text-neutral-600 transition-shadow"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-300 uppercase tracking-wide">Platform</label>
                    <Select value={platform} onValueChange={(val) => setPlatform(val || "")}>
                      <SelectTrigger className="h-12 bg-[#0e0e0e] border-neutral-800 text-neutral-200 rounded-xl focus:ring-[#3ce36a]/30">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1c1b1b] border-neutral-800 text-white rounded-xl">
                        <SelectGroup>
                          {PLATFORMS.map(p => (
                            <SelectItem key={p} value={p} className="focus:bg-[#131313]! focus:text-[#3ce36a]!">{p}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-neutral-300 uppercase tracking-wide">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Hyderabad"
                      className="flex h-12 w-full rounded-xl border border-neutral-800 bg-[#0e0e0e] px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#3ce36a]/30 placeholder:text-neutral-600 transition-shadow"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-neutral-300 uppercase tracking-wide">Issue Type</label>
                  <Select value={issueType} onValueChange={(val) => setIssueType(val || "")}>
                    <SelectTrigger className="h-12 bg-[#0e0e0e] border-neutral-800 text-neutral-200 rounded-xl focus:ring-[#3ce36a]/30">
                      <SelectValue placeholder="Select type of issue" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1c1b1b] border-neutral-800 text-white rounded-xl">
                      <SelectGroup>
                        {ISSUE_TYPES.map(type => (
                          <SelectItem key={type} value={type} className="focus:bg-[#131313]! focus:text-[#3ce36a]!">{type}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-bold text-neutral-300 uppercase tracking-wide">Description</label>
                      <button
                        type="button"
                        onClick={startListening}
                        className={`px-2.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 border ${
                          isListening 
                          ? "bg-red-500/10 text-red-500 border-red-500/50 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                          : "bg-neutral-800 border-transparent text-neutral-400 hover:text-white hover:bg-neutral-700"
                        }`}
                        title="Use Voice Typing"
                      >
                        {isListening ? (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">Listening...</span>
                          </>
                        ) : (
                          <>
                            <Mic className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-0.5">Voice Type</span>
                          </>
                        )}
                      </button>
                    </div>
                    <span className={`text-xs font-bold ${description.length < 50 ? "text-red-400" : "text-[#3ce36a]"}`}>
                      {description.length}/50 min chars
                    </span>
                  </div>
                  <textarea
                    required
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened in detail (e.g., specific shifts, missing payments, or deactivation details)..."
                    className={`flex w-full rounded-xl border bg-[#0e0e0e] p-4 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-[#3ce36a]/30 placeholder:text-neutral-600 resize-none transition-all ${
                      description.length > 0 && description.length < 50 ? 'border-red-500/50' : 'border-neutral-800'
                    }`}
                  />
                  {description.length > 0 && description.length < 50 && (
                    <p className="text-xs text-red-500 mt-2 font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Please enter at least 50 characters to provide enough context for the legal argument.
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={isGenerating || description.length < 50 || !platform || !city || !issueType}
                  className="w-full bg-[#3fe56c] hover:bg-[#3ce36a] text-[#002108] font-extrabold text-base h-14 rounded-2xl mt-8 disabled:bg-neutral-800 disabled:text-neutral-600 transition-all active:scale-[0.98] shadow-lg shadow-[#3fe56c]/20 disabled:shadow-none"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {language === "hi" ? "Generating in Hindi..." : language === "te" ? "Generating in Telugu..." : "Drafting Legal Petition..."}
                    </>
                  ) : (
                    "Generate Official Complaint Letter"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <Card className="bg-[#1c1b1b] border-neutral-800 shadow-2xl shadow-black/50 rounded-[28px] overflow-hidden">
              <CardHeader className="text-center pb-2 bg-[#131313] border-b border-neutral-800/50 p-8">
                <div className="mx-auto w-14 h-14 bg-[#3ce36a]/10 rounded-full flex items-center justify-center mb-5 border border-[#3ce36a]/20">
                  <Scale className="w-7 h-7 text-[#3ce36a]" />
                </div>
                <CardTitle className="text-2xl text-white">Letter Drafted Successfully</CardTitle>
                <CardDescription className="text-neutral-400 font-medium mt-2">
                  Your official legal complaint is ready for submission to the Labour Commissioner.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-8 p-6 md:p-8 text-center bg-[#1c1b1b]">
                
                <div className="p-6 bg-[#0e0e0e] border border-neutral-800 rounded-2xl text-left text-sm text-neutral-300 h-72 overflow-y-auto font-serif shadow-inner">
                  <p className="whitespace-pre-wrap leading-relaxed text-[15px]">
                    {generatedLetter}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <Button 
                    onClick={() => handleDownloadPDF()} 
                    className="h-14 font-bold text-base bg-white hover:bg-neutral-200 text-black rounded-xl border-none active:scale-[0.98] transition-transform"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setGeneratedLetter("")
                      setDescription("")
                    }} 
                    className="h-14 bg-transparent border-neutral-800 text-neutral-300 hover:bg-[#131313] hover:text-white font-bold rounded-xl active:scale-[0.98] transition-all"
                  >
                    File Another Case
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
