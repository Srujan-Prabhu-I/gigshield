"use client"

import { useState } from "react"
import { jsPDF } from "jspdf"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Download, Scale } from "lucide-react"

const PLATFORMS = ["Swiggy", "Zomato", "Ola", "Uber", "Rapido"]

const ISSUE_TYPES = [
  "Underpayment",
  "Unfair Deactivation",
  "No Accident Insurance",
  "Arbitrary Penalty",
  "Other"
]

export default function GrievancePage() {
  const [platform, setPlatform] = useState("")
  const [city, setCity] = useState("")
  const [issueType, setIssueType] = useState("")
  const [description, setDescription] = useState("")
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")

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
      
    } catch (error: any) {
      toast.error(error.message)
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
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8 selection:bg-neutral-800">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">File a Grievance</h1>
          <p className="text-neutral-400 font-medium">
            Your complaint will be formatted into an official letter to the Telangana Labour Commissioner
          </p>
        </div>

        {/* FORM */}
        {!generatedLetter ? (
          <Card className="bg-neutral-900 border-neutral-800 shadow-xl shadow-black/50">
            <CardHeader>
              <CardTitle className="text-white">Incident Details</CardTitle>
              <CardDescription className="text-neutral-400">
                Provide specifics so the AI can draft a strong legal argument.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300">Platform</label>
                    <Select value={platform} onValueChange={(val) => setPlatform(val || "")}>
                      <SelectTrigger className="bg-neutral-950 border-neutral-800 text-neutral-200">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                        <SelectGroup>
                          {PLATFORMS.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Hyderabad"
                      className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-700 placeholder:text-neutral-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-300">Issue Type</label>
                  <Select value={issueType} onValueChange={(val) => setIssueType(val || "")}>
                    <SelectTrigger className="bg-neutral-950 border-neutral-800 text-neutral-200">
                      <SelectValue placeholder="Select type of issue" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white">
                      <SelectGroup>
                        {ISSUE_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-semibold text-neutral-300">Description</label>
                    <span className={`text-xs ${description.length < 50 ? "text-red-400" : "text-neutral-500"}`}>
                      {description.length}/50 min chars
                    </span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what happened in detail..."
                    className={`flex w-full rounded-md border bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-700 placeholder:text-neutral-600 resize-none ${description.length > 0 && description.length < 50 ? 'border-red-500/50' : 'border-neutral-800'}`}
                  />
                  {description.length > 0 && description.length < 50 && (
                    <p className="text-xs text-red-500 mt-1">
                      Please enter at least 50 characters to provide enough context.
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={isGenerating || description.length < 50 || !platform || !city || !issueType}
                  className="w-full bg-white hover:bg-neutral-200 text-black font-bold h-12 rounded-xl mt-6 disabled:bg-neutral-800 disabled:text-neutral-600"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating your complaint letter...
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
            <Card className="bg-neutral-900 border-neutral-800 shadow-2xl shadow-black/50">
              <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center mb-4 border border-neutral-700">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-white">Letter Generated</CardTitle>
                <CardDescription className="text-neutral-400">
                  Your official complaint is ready.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6 text-center">
                
                <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-lg text-left text-sm text-neutral-300 h-64 overflow-y-auto font-serif">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {generatedLetter}
                  </p>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={() => handleDownloadPDF()} 
                    className="w-full h-12 font-bold text-lg bg-white hover:bg-neutral-200 text-black rounded-xl border-none"
                  >
                    <Download className="mr-2 h-5 w-5" />
                    Download PDF Letter
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setGeneratedLetter("")
                      setDescription("")
                    }} 
                    className="w-full bg-transparent border-neutral-800 text-neutral-300 hover:bg-neutral-900 hover:text-white"
                  >
                    File Another Grievance
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
