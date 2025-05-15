"use client"

import type React from "react"
import { phoneRules } from "@/lib/phoneRules"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { submitForm } from "@/app/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, ArrowLeft, Upload, Check } from "lucide-react"

export default function TypeformClone() {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 40; // Plus vieux = 40 ans
  const maxYear = currentYear - 18; // Plus jeune = 18 ans

  const minDate = `${minYear}-01-01`;
  const maxDate = `${maxYear}-12-31`; // On accepte toute l'année

  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formCompleted, setFormCompleted] = useState(false)
  const [formData, setFormData] = useState({
    nom_complet: "",
    date_naissance: "",
    nationalite: "",
    pays_residence: "",
    email: "",
    telephone: "",
    fonction: "",
    organisation: "",
    site_web_organisation: "",
    site_web_personnel: "",
    nombre_personnes: "",
    presentation_organisation: "",
    nombre_personne_equipe: "",
    contribution_liens_afrique_diaspora: "",
    quattendez_vous_reseau_adinkra: "",
    categorie_distinction: "technologie",
    experience_leadership: "",
    resume_realisation: "",
    impact_communautaire: "",
    leadership_surmonte: "",
    prix_programmes_bourses_leadership: "",
    biographie_courte: "",
    video_motivation: "",
    autre_video: "",
    cv: "",
    photo: "",
    consentement: false,
  })
  const [files, setFiles] = useState<File[]>([])
  const [fileNames, setFileNames] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
      setFileNames((prev) => [...prev, ...newFiles.map((file) => file.name)])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    if (name === "pays_residence") {
      const rule = phoneRules[value as keyof typeof phoneRules]
      const dialcode = rule?.dialcode || ""

      setFormData((prev) => ({
        ...prev,
        pays_residence: value,
        telephone: dialcode, // initialise avec l'indicatif
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const isStepValid = (stepIndex: number, formData: Record<string, any>) => {
    const requiredFieldsPerStep: Record<number, string[]> = {
      1: ["nom_complet", "date_naissance", "nationalite", "pays_residence", "email", "telephone"],
      2: ["categorie_distinction", "fonction", "presentation_organisation"],
      3: ["experience_leadership", "resume_realisation", "impact_communautaire", "leadership_surmonte", "contribution_liens_afrique_diaspora", "quattendez_vous_reseau_adinkra", "prix_programmes_bourses_leadership", "biographie_courte"],
      4: ["video_motivation", "cv", "photo"],
      5: ["consentement"]
    }

    const fields = requiredFieldsPerStep[stepIndex] || []
    return fields.every((field) => {
      const value = formData[field]
      if (typeof value === "boolean") return value
      return value !== undefined && value !== null && value.toString().trim() !== ""
    })
  }

  const isPhoneValid = (country: string, phone: string): boolean => {
    const rule = phoneRules[country]
    if (!rule) return true // Si aucune règle, ne pas bloquer
    const digits = phone.replace(/\D/g, "") // Supprime tout sauf les chiffres
    return digits.length >= rule.min && digits.length <= rule.max
  }

  const handleNext = (currentStep: number, setCurrentStep: (step: number) => void, formData: Record<string, any>, steps: any[],
    toast: Function) => {
    // if (currentStep < steps.length - 1) {
    //   setCurrentStep((prev) => prev + 1)
    //   window.scrollTo(0, 0)
    // }

    const nextStep = currentStep + 1

    if (currentStep === 1) {
      const { pays_residence, telephone } = formData
      if (!isPhoneValid(pays_residence, telephone)) {
        toast({
          title: "Numéro invalide",
          description: `Le numéro de téléphone ne correspond pas au format du pays sélectionné (${pays_residence}).`,
          variant: "destructive",
        })
        return
      }
    }

    if (isStepValid(currentStep, formData)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(nextStep)
        window.scrollTo(0, 0)
      }
    } else {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires avant de continuer.",
        variant: "destructive",
      })
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    if (!isStepValid(5, formData)) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs requis avant de soumettre.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()

      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString())
      })

      // Append files
      files.forEach((file) => {
        formDataToSend.append("files", file)
      })

      const result = await submitForm(formDataToSend)

      if (result.success) {
        setFormCompleted(true)
        toast({
          title: "Formulaire envoyé",
          description: "Vos informations ont été enregistrées avec succès.",
        })
      } else {
        throw new Error(result.error || "Une erreur est survenue")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du formulaire.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    // Étape 1: Introduction
    {
      title: "Bienvenue dans notre formulaire de contact",
      content: (
        <div className="space-y-4">
          <div className="flex justify-center">
            <img src="/logo.webp" alt="Logo Adinkra" className="h-20 w-auto" />
          </div>
          <h2 className="text-2xl font-bold">Adinkra Fellowship</h2>
          <p className="text-gray-400 text-xs text-justify">
            Bienvenue dans le formulaire de candidature au Adinkra Fellowship !
            Nous sommes ravis d’en apprendre davantage sur votre parcours et votre impact en tant que leader.
            Les candidatures sont acceptées uniquement en anglais ou en français.
            Important : Typeform peut mémoriser votre progression si vous utilisez le même appareil et navigateur, ce qui vous permet de reprendre là où vous vous étiez arrêté(e), grâce à un cookie local.
            Si vous souhaitez consulter les questions à l’avance, vous pouvez télécharger le formulaire en version Word (à titre informatif uniquement) : Télécharger la version Word (<a href="https://docs.google.com/document/d/1RgyByqHbx9Uu_jhGedldDkNMAl69Dh4IULEYpUV0lY8/edit?usp=sharing">https://docs.google.com/document/d/1RgyByqHbx9Uu_jhGedldDkNMAl69Dh4IULEYpUV0lY8/edit?usp=sharing</a>)
          </p>
          <Button
            onClick={() => handleNext(currentStep, setCurrentStep, formData, steps, toast)}
            className="mt-4">
            Commencer <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
    },
    // Étape 2: Informations personnelles
    {
      title: "Informations personnelles",
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Informations personnelles</h2>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom_complet">Nom Complet<span className="text-red-500">*</span></Label>
              <Input id="nom_complet" placeholder="Nom Complet" name="nom_complet" value={formData.nom_complet} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_naissance">
                Date de naissance <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date_naissance"
                name="date_naissance" type="date" value={formData.date_naissance}
                onChange={handleInputChange}
                min={minDate} max={maxDate}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationalite">Nationalité <span className="text-red-500">*</span></Label>
              <Input id="nationalite" placeholder="Nationalité" name="nationalite" value={formData.nationalite} onChange={handleInputChange} />
            </div>            
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pays_residence">
                Pays de Résidence <span className="text-red-500">*</span>
              </Label>
              <select
                id="pays_residence"
                name="pays_residence"
                value={formData.pays_residence}
                onChange={handleSelectChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">Sélectionnez un pays</option>
                {[
                  "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola", "Antigua-et-Barbuda",
                  "Arabie Saoudite", "Argentine", "Arménie", "Australie", "Autriche", "Azerbaïdjan", "Bahamas", "Bahreïn", "Bangladesh",
                  "Barbade", "Belgique", "Belize", "Bénin", "Bhoutan", "Biélorussie", "Birmanie", "Bolivie", "Bosnie-Herzégovine",
                  "Botswana", "Brésil", "Brunei", "Bulgarie", "Burkina Faso", "Burundi", "Cambodge", "Cameroun", "Canada", "Cap-Vert",
                  "Chili", "Chine", "Chypre", "Colombie", "Comores", "Congo (Brazzaville)", "Congo (Kinshasa)", "Corée du Nord",
                  "Corée du Sud", "Costa Rica", "Côte d'Ivoire", "Croatie", "Cuba", "Danemark", "Djibouti", "Dominique", "Égypte",
                  "Émirats arabes unis", "Équateur", "Érythrée", "Espagne", "Estonie", "Eswatini", "États-Unis", "Éthiopie", "Fidji",
                  "Finlande", "France", "Gabon", "Gambie", "Géorgie", "Ghana", "Grèce", "Grenade", "Guatemala", "Guinée",
                  "Guinée équatoriale", "Guinée-Bissau", "Guyana", "Haïti", "Honduras", "Hongrie", "Inde", "Indonésie", "Irak",
                  "Iran", "Irlande", "Islande", "Israël", "Italie", "Jamaïque", "Japon", "Jordanie", "Kazakhstan", "Kenya", "Kirghizistan",
                  "Kiribati", "Kosovo", "Koweït", "Laos", "Lesotho", "Lettonie", "Liban", "Libéria", "Libye", "Liechtenstein", "Lituanie",
                  "Luxembourg", "Macédoine du Nord", "Madagascar", "Malaisie", "Malawi", "Maldives", "Mali", "Malte", "Maroc",
                  "Marshall", "Maurice", "Mauritanie", "Mexique", "Micronésie", "Moldavie", "Monaco", "Mongolie", "Monténégro",
                  "Mozambique", "Namibie", "Nauru", "Népal", "Nicaragua", "Niger", "Nigéria", "Norvège", "Nouvelle-Zélande", "Oman",
                  "Ouganda", "Ouzbékistan", "Pakistan", "Palaos", "Palestine", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay",
                  "Pays-Bas", "Pérou", "Philippines", "Pologne", "Portugal", "Qatar", "République centrafricaine", "République tchèque",
                  "Roumanie", "Royaume-Uni", "Russie", "Rwanda", "Saint-Kitts-et-Nevis", "Saint-Marin", "Saint-Vincent-et-les-Grenadines",
                  "Sainte-Lucie", "Salomon", "Salvador", "Samoa", "São Tomé-et-Príncipe", "Sénégal", "Serbie", "Seychelles", "Sierra Leone",
                  "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan", "Soudan du Sud", "Sri Lanka", "Suède", "Suisse", "Suriname",
                  "Syrie", "Tadjikistan", "Tanzanie", "Tchad", "Thaïlande", "Timor oriental", "Togo", "Tonga", "Trinité-et-Tobago",
                  "Tunisie", "Turkménistan", "Turquie", "Tuvalu", "Ukraine", "Uruguay", "Vanuatu", "Vatican", "Venezuela", "Viêt Nam",
                  "Yémen", "Zambie", "Zimbabwe"
                ].map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Adresse email <span className="text-red-500">*</span></Label>
              <Input id="email" placeholder="Adresse email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telephone">
                N° Téléphone (WhatsApp/Telegram) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="telephone"
                placeholder="N° Téléphone (WhatsApp/Telegram)"
                name="telephone"
                type="tel"
                value={formData.telephone}
                onChange={handleInputChange}
                required
                className={`${
                  formData.telephone &&
                  !isPhoneValid(formData.pays_residence, formData.telephone)
                    ? "border-red-500"
                    : ""
                }`}
              />
              {formData.telephone &&
                !isPhoneValid(formData.pays_residence, formData.telephone) && (
                  <p className="text-sm text-red-500">
                    Numéro invalide pour le pays sélectionné ({formData.pays_residence})
                  </p>
                )}
            </div>
          </div>          
          
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button
              onClick={() => handleNext(currentStep, setCurrentStep, formData, steps, toast)}
              className="mt-4">
              Continuer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ),
    },
    // Étape 3: Fonction / Titre Professionnel
    {
      title: "Fonction / Titre Professionnel",
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Fonction / Titre Professionnel</h2>

          <div className="space-y-2">
            <Label>
              Catégorie de distinction <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={["technologie", "finance", "sante", "education"].includes(formData.categorie_distinction) ? formData.categorie_distinction : "autre"}
              onValueChange={(value) => {
                if (value === "autre") {
                  setFormData((prev) => ({ ...prev, categorie_distinction: "" })) // Vide le champ texte si Autre sélectionné
                } else {
                  setFormData((prev) => ({ ...prev, categorie_distinction: value }))
                }
              }}
              required
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="technologie" id="technologie" />
                <Label htmlFor="technologie">Technologie</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="finance" id="finance" />
                <Label htmlFor="finance">Finance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sante" id="sante" />
                <Label htmlFor="sante">Santé</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="education" id="education" />
                <Label htmlFor="education">Éducation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="autre" id="autre" />
                <Label htmlFor="autre">Autre</Label>
              </div>
            </RadioGroup>

            {["technologie", "finance", "sante", "education"].includes(formData.categorie_distinction) === false && (
              <div className="mt-2 space-y-1">
                <Label htmlFor="categorie_distinction">Précisez votre catégorie</Label>
                <Input
                  id="categorie_distinction"
                  name="categorie_distinction"
                  placeholder="Votre catégorie"
                  value={formData.categorie_distinction}
                  onChange={handleInputChange}
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fonction">Fonction actuelle / Titre professionnel <span className="text-red-500">*</span></Label>
            <Input id="fonction" name="fonction" value={formData.fonction} onChange={handleInputChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organisation">Nom de l’organisation (le cas échéant)</Label>
              <Input id="organisation" name="organisation" value={formData.organisation} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_web_organisation">Site web de l’organisation (le cas échéant)</Label>
              <Input id="site_web_organisation" name="site_web_organisation" value={formData.site_web_organisation} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="site_web_personnel">Site Web Personnel (le cas échéant)</Label>
              <Input id="site_web_personnel" name="site_web_personnel" value={formData.site_web_personnel} onChange={handleInputChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_personne_equipe">Nombre de personnes dans votre équipe ou d’employés</Label>
              <Input type="number" id="nombre_personne_equipe" name="nombre_personne_equipe" value={formData.nombre_personne_equipe} onChange={handleInputChange} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="presentation_organisation">Présentation de l’organisation (750 caractères max) <span className="text-red-500">*</span></Label>
            <p className="text-xs italic text-gray-300">Présentez brièvement votre structure : dans quel secteur évoluez-vous et sur quoi vous concentrez-vous ? (bullet points acceptés)</p>
            <Textarea
              id="presentation_organisation"
              name="presentation_organisation"
              value={formData.presentation_organisation}
              onChange={handleInputChange}
              className="min-h-[150px]" 
              required
            />
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button
              onClick={() => handleNext(currentStep, setCurrentStep, formData, steps, toast)}
              className="mt-4">
              Continuer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ),
    },
    // Étape 4: Expériences et Leadership
    {
      title: "Expériences et Leadership",
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Expériences et Leadership</h2>        

          <div className="space-y-2">
            <Label>Expérience en leadership <span className="text-red-500">*</span></Label>
            <RadioGroup
              value={formData.experience_leadership}
              onValueChange={(value) => handleRadioChange("experience_leadership", value)}
             required>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0-2" id="0-2" />
                <Label htmlFor="0-2">0-2 ans</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3-5" id="3-5" />
                <Label htmlFor="3-5">3-5 ans</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="6-10" id="6-10" />
                <Label htmlFor="6-10">6-10 ans</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="10+" id="10+" />
                <Label htmlFor="10+">Plus de 10 ans</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resume_realisation">Résumé de vos réalisations (750 caractères max) <span className="text-red-500">*</span></Label>
            <p className="text-xs italic text-gray-300">Décrivez vos réalisations les plus significatives et leur impact durable. Incluez des résultats mesurables (ex. : personnes touchées, échelle, revenus générés, partenariats, politiques influencées, etc.)</p>
            <Textarea
              id="resume_realisation"
              name="resume_realisation"
              value={formData.resume_realisation}
              onChange={handleInputChange}
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="impact_communautaire">Impact communautaire (500 caractères max) <span className="text-red-500">*</span></Label>
            <p className="text-xs italic text-gray-300">Expliquez comment vos projets ou actions ont eu un impact positif autour de vous</p>
            <Textarea
              id="impact_communautaire"
              name="impact_communautaire"
              value={formData.impact_communautaire}
              onChange={handleInputChange}
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadership_surmonte">Quel défi de leadership avez-vous surmonté et qu’avez-vous appris ? (750 caractères max) <span className="text-red-500">*</span></Label>
            <p className="text-xs italic text-gray-300">Partagez un défi important que vous avez rencontré, la solution que vous avez imaginée, et ce que cette expérience vous a appris.</p>
            <Textarea
              id="leadership_surmonte"
              name="leadership_surmonte"
              value={formData.leadership_surmonte}
              onChange={handleInputChange}
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contribution_liens_afrique_diaspora">Contribution aux liens Afrique–Diaspora (750 caractères max) <span className="text-red-500">*</span></Label>
            <p className="text-xs italic text-gray-300">Expliquez comment votre travail lie ou entend lier l’Afrique à sa diaspora et comment vous comptez contribuer au réseau Adinkra.</p>
            <Textarea
              id="contribution_liens_afrique_diaspora"
              name="contribution_liens_afrique_diaspora"
              value={formData.contribution_liens_afrique_diaspora}
              onChange={handleInputChange}
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quattendez_vous_reseau_adinkra">Qu’attendez-vous du réseau ADINKRA ? (500 caractères max) <span className="text-red-500">*</span></Label>
            <p className="text-xs italic text-gray-300">Partagez ce que vous espérez retirer de cette expérience.</p>
            <Textarea
              id="quattendez_vous_reseau_adinkra"
              name="quattendez_vous_reseau_adinkra"
              value={formData.quattendez_vous_reseau_adinkra}
              onChange={handleInputChange}
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prix_programmes_bourses_leadership">Prix / Programmes de bourses ou de leadership <span className="text-red-500">*</span></Label>
            <p className="text-xs italic text-gray-300">Listez jusqu’à 3 distinctions, bourses ou programmes de leadership auxquels vous avez participé (nom + année).</p>
            <Textarea
              id="prix_programmes_bourses_leadership"
              name="prix_programmes_bourses_leadership"
              value={formData.prix_programmes_bourses_leadership}
              onChange={handleInputChange}
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="biographie_courte">Biographie courte (1000 caractères max) <span className="text-red-500">*</span></Label>
            <p className="text-xs italic text-gray-300">Si vous êtes sélectionné(e) parmi les 20 jeunes leaders, cette biographie pourra être publiée sur notre site ou dans nos supports de communication.</p>
            <Textarea
              id="biographie_courte"
              name="biographie_courte"
              value={formData.biographie_courte}
              onChange={handleInputChange}
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button
              onClick={() => handleNext(currentStep, setCurrentStep, formData, steps, toast)}
              className="mt-4">
              Continuer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ),
    },
    // Étape 5: Pièces jointes
    {
      title: "Pièces jointes",
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Pièces jointes</h2>
          <p className="text-gray-600"></p>

          <div className="space-y-4">
            <Label htmlFor="nom_complet">Vidéo de motivation <span className="text-red-500">*</span></Label>
            <p className="text-gray-300 italic text-xs text-justify">
              Présentez-vous (nom, titre, pays) et répondez aux 4 questions suivantes :
              En tant que leader, comment vivez-vous le leadership responsable ?
              Pourquoi cette opportunité est-elle importante à ce stade de votre parcours ?
              Pourquoi êtes-vous le bon candidat / la bonne candidate pour ADINKRA ?
              Quelle est votre vision personnelle pour renforcer les liens durables entre l’Afrique et sa diaspora ?
              Durée maximale : 2 minutes
            </p>
            <Input id="video_motivation" placeholder="Veuillez partager un lien de votre vidéo (statut public ou non répertorié – ne la rendez pas privée svp). Vous pouvez également utiliser Loom pour enregistrer votre vidéo et coller le lien ici." name="video_motivation" value={formData.video_motivation} onChange={handleInputChange} required />
          </div>

          <div className="space-y-4">
            <Label htmlFor="autre_video">Autres liens vidéo (optionnel)</Label>
            <p className="text-gray-300 italic text-xs">Vimeo / YouTube / autre</p>
            <Input id="autre_video" placeholder="Autres liens vidéo (optionnel)" name="autre_video" value={formData.autre_video} onChange={handleInputChange} />
          </div>

          <div className="space-y-4">
            <Label htmlFor="cv">CV (max. 3 pages) <span className="text-red-500">*</span></Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Input id="cv" type="file" onChange={handleFileChange} className="hidden" required/>
              <Label htmlFor="cv" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Cliquez pour sélectionner des fichiers</span>
                <span className="text-xs text-gray-500 mt-1">ou glissez-déposez vos fichiers ici</span>
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="photo">Photo portrait professionnelle <span className="text-red-500">*</span></Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Input id="photo" type="file" onChange={handleFileChange} className="hidden" required/>
              <Label htmlFor="photo" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900">Cliquez pour sélectionner des fichiers</span>
                <span className="text-xs text-gray-500 mt-1">ou glissez-déposez vos fichiers ici</span>
              </Label>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button
              onClick={() => handleNext(currentStep, setCurrentStep, formData, steps, toast)}
              className="mt-4">
              Continuer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ),
    },
    // Étape 6: Commentaires et consentement
    {
      title: "Déclaration et consentement",
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Déclaration et consentement</h2>
          <p className="text-gray-400 text-sm italic">
            En remplissant cette section, vous confirmez l’exactitude des informations fournies et acceptez les conditions d’évaluation.
          </p>
          <p className="text-gray-500 text-sm">
            "Je certifie que les informations fournies dans ce formulaire sont exactes et véritables à ma connaissance. J’accepte que mes données soient utilisées pour l’évaluation de ma candidature au Adinkra Fellowship."
          </p>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="consentement"
                checked={formData.consentement}
                onCheckedChange={(checked) => handleCheckboxChange("consentement", checked as boolean)}
              />
              <Label htmlFor="consentement" className="text-sm">
                J’accepte les termes et conditions <span className="text-500-red">*</span>
              </Label>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Retour
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !formData.consentement}>
              {isSubmitting ? "Envoi en cours..." : "Envoyer"}
            </Button>
          </div>
        </div>
      ),
    },
    // Étape 8: Confirmation
    {
      title: "Merci!",
      content: (
        <div className="space-y-6 text-center">
          <div className="flex justify-center">
            <img src="/logo.webp" alt="Logo Adinkra" className="h-20 w-auto" />
          </div>

          <h2 className="text-2xl font-bold">Adinkra Fellowship</h2>

          <p className="text-gray-600">
            Merci d’avoir postulé au Adinkra Fellowship ! Vos réponses sont précieuses. Restez engagé(e) et continuez à faire la différence.
          </p>

          <div className="flex justify-center mt-6">
            <Check className="h-16 w-16 text-green-500" />
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {formCompleted ? (
        <div className="p-8">{steps[steps.length - 1].content}</div>
      ) : (
        <div className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                Étape {currentStep + 1} sur {steps.length}
              </span>
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 w-6 rounded-full ${index <= currentStep ? "bg-blue-200" : "bg-gray-200"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
