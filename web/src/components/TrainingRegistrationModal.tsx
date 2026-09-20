"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { type Training } from "@/lib/supabase";
import { useToast } from "@/components/ToastNotification";
import {
  Loader2,
  CheckCircle2,
  User,
  Phone,
  Mail,
  MapPin,
  X,
  PhoneCall,
  Smartphone,
  Camera,
  Upload,
  RefreshCw,
  HeartPulse,
  Globe2,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  FileText,
  AlertCircle,
} from "lucide-react";

interface Props {
  training: Training;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DossierData {
  registration_number?: string;
  [key: string]: unknown;
}

export function TrainingRegistrationModal({ training, isOpen, onClose, onSuccess }: Props) {
  const { showLoading, showSuccess, showError, hideToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedDossier, setCompletedDossier] = useState<DossierData | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    last_name: "",
    first_name: "",
    gender: "Femme",
    date_of_birth: "",
    customer_phone: "",
    whatsapp: "",
    customer_email: "",
    address: "",
    city: "Port-au-Prince",
    profession: "",
    education_level: "Secondaire / Bacc",

    // Step 2: Health & Mobility
    has_medical_condition: false,
    medical_condition_details: "",
    is_asthmatic: false,
    has_medical_treatment: false,
    medical_treatment_details: "",
    has_passport: false,
    passport_number: "",
    passport_expiry: "",
    national_mobility: true,
    international_mobility: true,

    // Step 3: ID Photo & Emergency Contact
    id_card_photo: "",
    emergency_contact_name: "",
    emergency_contact_relation: "Parent / Famille",
    emergency_contact_phone: "",

    // Step 4: Training & Agreement
    training_category: "Chimie Industrielle & Formulation",
    training_mode: "Présentiel",
    payment_type: "Comptant",
    payment_method: "moncash",
    photo_permission: true,
    accepted_terms: false,
  });

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  if (!isOpen) return null;

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("L'accès caméra n'est pas pris en charge par votre navigateur.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      mediaStreamRef.current = stream;
      setIsCameraActive(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Impossible d'accéder à la caméra.";
      setCameraError(msg + " Vous pouvez importer une photo depuis vos fichiers.");
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setFormData((prev) => ({ ...prev, id_card_photo: dataUrl }));
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError("Le fichier est trop lourd (maximum 5 Mo).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFormData((prev) => ({ ...prev, id_card_photo: result }));
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!formData.last_name.trim() || !formData.first_name.trim()) {
        showError("Veuillez saisir votre nom et votre prénom.");
        return false;
      }
      if (!formData.customer_phone.trim()) {
        showError("Veuillez saisir votre numéro de téléphone.");
        return false;
      }
      if (!formData.date_of_birth) {
        showError("Veuillez renseigner votre date de naissance.");
        return false;
      }
      if (!formData.address.trim()) {
        showError("Veuillez indiquer votre adresse.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (formData.has_medical_condition && !formData.medical_condition_details.trim()) {
        showError("Veuillez préciser la maladie ou condition médicale.");
        return false;
      }
      if (formData.has_medical_treatment && !formData.medical_treatment_details.trim()) {
        showError("Veuillez préciser votre traitement médical en cours.");
        return false;
      }
      if (formData.has_passport && !formData.passport_number.trim()) {
        showError("Veuillez indiquer votre numéro de passeport.");
        return false;
      }
    }

    if (currentStep === 3) {
      if (!formData.id_card_photo) {
        showError("Veuillez prendre en photo ou importer votre pièce d'identité (CIN, Passeport ou Permis).");
        return false;
      }
      if (!formData.emergency_contact_name.trim() || !formData.emergency_contact_phone.trim()) {
        showError("Veuillez renseigner la personne à contacter en cas d'urgence.");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    }
  };

  const handlePrev = () => {
    setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      return;
    }

    if (!formData.accepted_terms) {
      showError("Veuillez accepter le contrat de formation et le règlement intérieur de NAF.");
      return;
    }

    setIsSubmitting(true);
    const toastId = showLoading("Enregistrement de votre dossier d'inscription NAF...");

    try {
      const payload = {
        training_id: training.id,
        training_title: training.title,
        customer_name: `${formData.last_name.trim().toUpperCase()} ${formData.first_name.trim()}`,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        customer_phone: formData.customer_phone.trim(),
        whatsapp: formData.whatsapp.trim() || formData.customer_phone.trim(),
        customer_email: formData.customer_email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        profession: formData.profession.trim(),
        education_level: formData.education_level,
        has_medical_condition: formData.has_medical_condition,
        medical_condition_details: formData.medical_condition_details,
        is_asthmatic: formData.is_asthmatic,
        has_medical_treatment: formData.has_medical_treatment,
        medical_treatment_details: formData.medical_treatment_details,
        has_passport: formData.has_passport,
        passport_number: formData.passport_number,
        passport_expiry: formData.passport_expiry,
        national_mobility: formData.national_mobility,
        international_mobility: formData.international_mobility,
        id_card_photo: formData.id_card_photo,
        emergency_contact_name: formData.emergency_contact_name.trim(),
        emergency_contact_relation: formData.emergency_contact_relation,
        emergency_contact_phone: formData.emergency_contact_phone.trim(),
        training_category: formData.training_category,
        training_mode: formData.training_mode,
        payment_type: formData.payment_type,
        payment_method: formData.payment_method,
        photo_permission: formData.photo_permission,
        amount: training.price,
      };

      const res = await fetch("/api/trainings/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Erreur lors de l'enregistrement du dossier");
      }

      hideToast(toastId);
      showSuccess("Votre inscription NAF a été enregistrée avec succès !");
      setCompletedDossier(json.data?.dossier || payload);
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      hideToast(toastId);
      const message = err instanceof Error ? err.message : "Impossible de finaliser l'inscription.";
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative border border-border max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => {
            stopCamera();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors cursor-pointer z-10"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4 overflow-y-auto pr-1">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary font-bold rounded-full text-xs">
              <Award className="h-3.5 w-3.5" /> Dossier Étudiant NAF Validé
            </div>
            <h3 className="text-2xl font-bold font-heading text-foreground">
              Félicitations, Inscription Confirmée !
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Bienvenue à <strong>Niky Académie de Formation (NAF)</strong>. Votre dossier pour la formation{" "}
              <span className="font-semibold text-primary">« {training.title} »</span> a été enregistré sous le numéro de référence :
            </p>

            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Numéro de dossier étudiant</div>
              <div className="text-xl font-mono font-extrabold text-primary mt-1">
                {completedDossier?.registration_number || `NAF-${Date.now().toString(36).toUpperCase()}`}
              </div>
            </div>

            <div className="bg-muted/40 p-4 rounded-2xl text-xs text-left space-y-2.5 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Participant :</span>
                <span className="font-bold text-foreground">{formData.first_name} {formData.last_name.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session de formation :</span>
                <span className="font-semibold text-foreground">{training.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mode & Lieu :</span>
                <span className="font-medium text-foreground">{formData.training_mode} • {training.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frais de formation :</span>
                <span className="font-extrabold text-primary">{Number(training.price).toLocaleString()} HTG</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modalité de paiement :</span>
                <span className="font-medium text-foreground capitalize">
                  {formData.payment_type} ({formData.payment_method === "moncash" ? "MonCash Automatique" : "Sur place au centre"})
                </span>
              </div>
            </div>

            {formData.payment_method === "moncash" && (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-xs text-left space-y-1.5 text-red-950">
                <div className="flex items-center gap-1.5 font-bold text-red-700">
                  <Smartphone className="h-4 w-4" /> Règlement MonCash
                </div>
                <p>
                  Votre inscription est réservée. Vous pouvez finaliser le versement de <strong>{Number(training.price).toLocaleString()} HTG</strong> via MonCash au <strong>+509 47 29 76 55</strong> en mentionnant votre nom et le n° de dossier.
                </p>
              </div>
            )}

            <a
              href={`https://wa.me/50947297655?text=Bonjour%20Niky%20Acad%C3%A9mie%20(NAF),%20je%20viens%20de%20remplir%20mon%20formulaire%20d'inscription%20et%20contrat%20pour%20la%20formation%20"${encodeURIComponent(
                training.title
              )}"%20(Nom:%20${encodeURIComponent(formData.first_name + " " + formData.last_name)}%20-%20Dossier:%20${encodeURIComponent(
                completedDossier?.registration_number || ""
              )}).`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm shadow-md transition-all mt-3 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" />
              Confirmer et envoyer mon reçu sur WhatsApp (+509 47 29 76 55)
            </a>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="w-full mt-2 py-3 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Fermer la fenêtre
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Header / Stepper */}
            <div className="pb-4 border-b border-border">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary font-bold rounded-full text-[11px] uppercase tracking-wider">
                  Niky Académie de Formation (NAF)
                </span>
                <span className="text-xs text-muted-foreground font-medium">Contrat d&apos;inscription</span>
              </div>
              <h3 className="text-xl font-bold font-heading text-foreground line-clamp-1">{training.title}</h3>

              {/* Steps Progress */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { num: 1, title: "Identité", icon: User },
                  { num: 2, title: "Santé & Mobilité", icon: HeartPulse },
                  { num: 3, title: "Pièce d'Identité", icon: Camera },
                  { num: 4, title: "Contrat & Paiement", icon: FileText },
                ].map((s) => {
                  const Icon = s.icon;
                  const isActive = step === s.num;
                  const isDone = step > s.num;
                  return (
                    <div
                      key={s.num}
                      onClick={() => {
                        if (isDone) setStep(s.num as 1 | 2 | 3 | 4);
                      }}
                      className={`flex flex-col items-center text-center p-2 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : isDone
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Icon className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Étape</span> {s.num}
                      </div>
                      <span className="text-[10px] truncate max-w-full font-medium mt-0.5">{s.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form Steps Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 px-1 space-y-4">
              {/* STEP 1: Personal Info */}
              {step === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-muted/30 p-3 rounded-2xl border border-border text-xs text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4 text-primary shrink-0" />
                    <span>Renseignez vos coordonnées officielles telles qu&apos;inscrites sur votre pièce d&apos;identité.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Nom de famille *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: JEAN"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Pierre"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Sexe *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {["Femme", "Homme"].map((gender) => (
                          <button
                            type="button"
                            key={gender}
                            onClick={() => setFormData({ ...formData, gender })}
                            className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                              formData.gender === gender
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-white text-muted-foreground hover:bg-muted"
                            }`}
                          >
                            {gender}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Date de Naissance *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="w-full px-3.5 py-2 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Téléphone d&apos;appel *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="tel"
                          required
                          placeholder="+509 3400 0000"
                          value={formData.customer_phone}
                          onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Numéro WhatsApp (si différent)
                      </label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                          type="tel"
                          placeholder="+509 4700 0000"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Adresse complète de résidence *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="Numéro, Rue, Quartier..."
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Ville *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Port-au-Prince, Delmas..."
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Profession
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Étudiant, Commerçant..."
                        value={formData.profession}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Niveau d&apos;étude
                      </label>
                      <select
                        value={formData.education_level}
                        onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                      >
                        <option value="Fondamental">Fondamental (9e AF)</option>
                        <option value="Secondaire / Bacc">Secondaire / Bacc (NS4)</option>
                        <option value="Professionnel / Technique">Technique / Professionnel</option>
                        <option value="Universitaire (Licence/Master)">Universitaire (Licence / Master)</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Courriel / Email (Optionnel)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="exemple@email.com"
                        value={formData.customer_email}
                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-hidden text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Health & Mobility */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-xs text-amber-900 flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Ces informations médicales et de mobilité sont requises pour garantir votre sécurité lors des manipulations de produits chimiques en laboratoire et planifier d&apos;éventuels voyages d&apos;études.
                    </span>
                  </div>

                  {/* Health Section */}
                  <div className="border border-border rounded-2xl p-4 space-y-3 bg-white">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-red-500" />
                      1. Fiche Médicale & Santé
                    </h4>

                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          Souffrez-vous d&apos;une maladie ou affection particulière ?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="has_medical_condition"
                              checked={!formData.has_medical_condition}
                              onChange={() => setFormData({ ...formData, has_medical_condition: false, medical_condition_details: "" })}
                            />
                            <span>Non</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="has_medical_condition"
                              checked={formData.has_medical_condition}
                              onChange={() => setFormData({ ...formData, has_medical_condition: true })}
                            />
                            <span className="font-medium text-amber-700">Oui (Préciser)</span>
                          </label>
                        </div>
                        {formData.has_medical_condition && (
                          <input
                            type="text"
                            placeholder="Précisez la maladie (ex: diabète, hypertension, allergies chimiques...)"
                            value={formData.medical_condition_details}
                            onChange={(e) => setFormData({ ...formData, medical_condition_details: e.target.value })}
                            className="mt-2 w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs focus:border-primary outline-hidden"
                          />
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/60">
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          Êtes-vous asthmatique ou sujet(te) à des difficultés respiratoires ?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="is_asthmatic"
                              checked={!formData.is_asthmatic}
                              onChange={() => setFormData({ ...formData, is_asthmatic: false })}
                            />
                            <span>Non</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="is_asthmatic"
                              checked={formData.is_asthmatic}
                              onChange={() => setFormData({ ...formData, is_asthmatic: true })}
                            />
                            <span className="font-medium text-red-600">Oui</span>
                          </label>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/60">
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          Suivez-vous un traitement médical régulier actuellement ?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="has_medical_treatment"
                              checked={!formData.has_medical_treatment}
                              onChange={() => setFormData({ ...formData, has_medical_treatment: false, medical_treatment_details: "" })}
                            />
                            <span>Non</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="has_medical_treatment"
                              checked={formData.has_medical_treatment}
                              onChange={() => setFormData({ ...formData, has_medical_treatment: true })}
                            />
                            <span className="font-medium text-amber-700">Oui (Préciser)</span>
                          </label>
                        </div>
                        {formData.has_medical_treatment && (
                          <input
                            type="text"
                            placeholder="Précisez les médicaments ou traitement en cours..."
                            value={formData.medical_treatment_details}
                            onChange={(e) => setFormData({ ...formData, medical_treatment_details: e.target.value })}
                            className="mt-2 w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs focus:border-primary outline-hidden"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobility & Passport Section */}
                  <div className="border border-border rounded-2xl p-4 space-y-3 bg-white">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <Globe2 className="h-4 w-4 text-primary" />
                      2. Mobilité & Passeport
                    </h4>

                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          Êtes-vous titulaire d&apos;un passeport valide ?
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="has_passport"
                              checked={!formData.has_passport}
                              onChange={() => setFormData({ ...formData, has_passport: false, passport_number: "", passport_expiry: "" })}
                            />
                            <span>Non</span>
                          </label>
                          <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input
                              type="radio"
                              name="has_passport"
                              checked={formData.has_passport}
                              onChange={() => setFormData({ ...formData, has_passport: true })}
                            />
                            <span className="font-medium text-primary">Oui (Renseigner)</span>
                          </label>
                        </div>

                        {formData.has_passport && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            <div>
                              <input
                                type="text"
                                placeholder="Numéro de passeport"
                                value={formData.passport_number}
                                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs focus:border-primary outline-hidden"
                              />
                            </div>
                            <div>
                              <input
                                type="date"
                                placeholder="Date d'expiration"
                                value={formData.passport_expiry}
                                onChange={(e) => setFormData({ ...formData, passport_expiry: e.target.value })}
                                className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs focus:border-primary outline-hidden"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">
                            Déplacements nationaux possibles ?
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input
                                type="radio"
                                name="national_mobility"
                                checked={formData.national_mobility}
                                onChange={() => setFormData({ ...formData, national_mobility: true })}
                              />
                              <span>Oui</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input
                                type="radio"
                                name="national_mobility"
                                checked={!formData.national_mobility}
                                onChange={() => setFormData({ ...formData, national_mobility: false })}
                              />
                              <span>Non</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1">
                            Déplacements internationaux possibles ?
                          </label>
                          <div className="flex gap-4">
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input
                                type="radio"
                                name="international_mobility"
                                checked={formData.international_mobility}
                                onChange={() => setFormData({ ...formData, international_mobility: true })}
                              />
                              <span>Oui</span>
                            </label>
                            <label className="flex items-center gap-2 text-xs cursor-pointer">
                              <input
                                type="radio"
                                name="international_mobility"
                                checked={!formData.international_mobility}
                                onChange={() => setFormData({ ...formData, international_mobility: false })}
                              />
                              <span>Non</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: ID Photo & Emergency Contact */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="bg-primary/5 p-3 rounded-2xl border border-primary/20 text-xs text-primary flex items-start gap-2">
                    <Camera className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Prise de photo obligatoire :</strong> Prenez en photo directement votre pièce d&apos;identité (CIN / NIF, Passeport ou Permis de conduire) ou importez une photo claire depuis votre appareil.
                    </span>
                  </div>

                  {/* ID Photo Capture Container */}
                  <div className="border border-border rounded-2xl p-4 bg-muted/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                        Photo de votre Pièce d&apos;Identité *
                      </label>
                      {formData.id_card_photo && (
                        <span className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Pièce enregistrée
                        </span>
                      )}
                    </div>

                    {/* Camera Active View */}
                    {isCameraActive && (
                      <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-primary">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/60 m-4 rounded-xl flex items-center justify-center">
                          <span className="bg-black/60 text-white text-[11px] px-2.5 py-1 rounded-full">
                            Cadrez votre pièce d&apos;identité ici
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="py-2 px-5 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer"
                          >
                            <Camera className="h-4 w-4" /> Prendre la photo
                          </button>
                          <button
                            type="button"
                            onClick={stopCamera}
                            className="py-2 px-4 bg-black/60 hover:bg-black/80 text-white font-medium text-xs rounded-xl cursor-pointer"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Preview of captured photo */}
                    {!isCameraActive && formData.id_card_photo && (
                      <div className="relative rounded-2xl overflow-hidden border border-border bg-black/5 aspect-video flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.id_card_photo}
                          alt="Pièce d'identité"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, id_card_photo: "" });
                              startCamera();
                            }}
                            className="p-2 bg-black/70 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Reprendre la photo"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Reprendre
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, id_card_photo: "" })}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                            title="Supprimer la photo"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Camera Trigger & Upload Buttons */}
                    {!isCameraActive && !formData.id_card_photo && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={startCamera}
                          className="py-4 px-4 bg-primary text-white rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
                        >
                          <div className="p-2.5 bg-white/20 rounded-full">
                            <Camera className="h-5 w-5" />
                          </div>
                          <span>Prendre la photo avec la Caméra</span>
                          <span className="text-[10px] text-white/80 font-normal">Webcam ou appareil photo direct</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="py-4 px-4 bg-white border-2 border-dashed border-border rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 text-foreground transition-all cursor-pointer"
                        >
                          <div className="p-2.5 bg-muted rounded-full">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span>Importer une photo depuis l&apos;appareil</span>
                          <span className="text-[10px] text-muted-foreground font-normal">JPG, PNG (Max 5 Mo)</span>
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                    )}

                    {cameraError && (
                      <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{cameraError}</span>
                      </div>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div className="border border-border rounded-2xl p-4 bg-white space-y-3">
                    <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-primary" />
                      Personne à contacter en cas d&apos;urgence
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Nom complet *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Marie Joseph"
                          value={formData.emergency_contact_name}
                          onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                          className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs focus:border-primary outline-hidden"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Lien de parenté *
                        </label>
                        <select
                          value={formData.emergency_contact_relation}
                          onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                          className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs focus:border-primary outline-hidden"
                        >
                          <option value="Parent (Père/Mère)">Parent (Père/Mère)</option>
                          <option value="Conjoint(e) / Époux(se)">Conjoint(e) / Époux(se)</option>
                          <option value="Frère / Sœur">Frère / Sœur</option>
                          <option value="Ami(e) / Collègue">Ami(e) / Collègue</option>
                          <option value="Tuteur légal">Tuteur légal</option>
                        </select>
                      </div>

                      <div className="sm:col-span-1">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          Téléphone d&apos;urgence *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+509 3000 0000"
                          value={formData.emergency_contact_phone}
                          onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                          className="w-full px-3 py-2 bg-muted/20 border border-border rounded-xl text-xs focus:border-primary outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Contract, Options & Payment */}
              {step === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Filière de formation
                      </label>
                      <select
                        value={formData.training_category}
                        onChange={(e) => setFormData({ ...formData, training_category: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary outline-hidden text-xs"
                      >
                        <option value="Chimie Industrielle & Formulation">Chimie Industrielle & Formulation</option>
                        <option value="Fabrication Cosmétiques & Soins">Fabrication Cosmétiques & Soins</option>
                        <option value="Savons, Détergents & Désinfectants">Savons, Détergents & Désinfectants</option>
                        <option value="Shampooings, Revitalisants & Traitements">Shampooings & Soins Capillaires</option>
                        <option value="Parfums, Brumes & Eaux de Toilette">Parfums & Brumes de Corps</option>
                        <option value="Entrepreneuriat & Création d'Entreprise">Entrepreneuriat & Gestion d&apos;Unité</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Mode de participation
                      </label>
                      <select
                        value={formData.training_mode}
                        onChange={(e) => setFormData({ ...formData, training_mode: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary outline-hidden text-xs"
                      >
                        <option value="Présentiel">Présentiel (Laboratoire NCP & Pratique)</option>
                        <option value="En ligne (Hybride)">En ligne / Hybride</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Modalité de règlement
                      </label>
                      <select
                        value={formData.payment_type}
                        onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary outline-hidden text-xs"
                      >
                        <option value="Comptant">Paiement Comptant (100% à l&apos;inscription)</option>
                        <option value="Échelonné (2 tranches)">Échelonné (50% inscription + 50% au cours)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                        Moyen de paiement
                      </label>
                      <select
                        value={formData.payment_method}
                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-muted/20 border border-border rounded-xl focus:border-primary outline-hidden text-xs"
                      >
                        <option value="moncash">MonCash (Paiement Mobile Sécurisé)</option>
                        <option value="sur_place">Paiement au Centre NCP (Espèces)</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-primary/5 p-3.5 rounded-2xl border border-primary/20 flex justify-between items-center text-xs">
                    <div>
                      <div className="text-muted-foreground font-medium">Montant de la formation</div>
                      <div className="text-base font-extrabold text-primary">{Number(training.price).toLocaleString()} HTG</div>
                    </div>
                    <div className="text-right">
                      <div className="text-muted-foreground font-medium">Certification</div>
                      <div className="font-bold text-foreground">Certificat NAF & International</div>
                    </div>
                  </div>

                  {/* NAF Contract Terms */}
                  <div className="border border-border rounded-2xl p-4 bg-muted/20 space-y-2.5 text-xs text-muted-foreground max-h-40 overflow-y-auto">
                    <h5 className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                      Contrat de Formation Professionnelle & Règlement Intérieur NAF
                    </h5>
                    <p>
                      1. <strong>Engagement de l&apos;Académie :</strong> NAF s&apos;engage à dispenser un enseignement combinant théorie, formulation chimique rigoureuse, travaux pratiques en atelier, contrôle qualité et sécurité industrielle.
                    </p>
                    <p>
                      2. <strong>Sécurité & Discipline :</strong> Le participant s&apos;engage à respecter scrupuleusement les consignes de sécurité en laboratoire (port des EPI obligatoires) et les règles de bienséance.
                    </p>
                    <p>
                      3. <strong>Attestation & Certificat :</strong> La délivrance du certificat officiel NAF est conditionnée par l&apos;assiduité aux séances et la validation des travaux pratiques.
                    </p>
                  </div>

                  {/* Permissions & Checkbox */}
                  <div className="space-y-2 pt-1">
                    <label className="flex items-start gap-2.5 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.photo_permission}
                        onChange={(e) => setFormData({ ...formData, photo_permission: e.target.checked })}
                        className="mt-0.5 rounded-sm border-border text-primary focus:ring-primary"
                      />
                      <span>
                        J&apos;autorise Niky Académie de Formation (NAF) à utiliser les photos/vidéos prises durant la formation à des fins pédagogiques et promotionnelles.
                      </span>
                    </label>

                    <label className="flex items-start gap-2.5 text-xs font-semibold text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        required
                        checked={formData.accepted_terms}
                        onChange={(e) => setFormData({ ...formData, accepted_terms: e.target.checked })}
                        className="mt-0.5 rounded-sm border-border text-primary focus:ring-primary"
                      />
                      <span>
                        Je certifie l&apos;exactitude des informations fournies et j&apos;accepte les termes du contrat de formation NAF. *
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </form>

            {/* Stepper Navigation Footer */}
            <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="py-2.5 px-4 bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" /> Précédent
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="py-2.5 px-6 bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ml-auto"
                >
                  Suivant <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="py-3 px-6 bg-accent hover:bg-accent/90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50 ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Inscription en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" /> Valider mon Inscription NAF ({Number(training.price).toLocaleString()} HTG)
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
